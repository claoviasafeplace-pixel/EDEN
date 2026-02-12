import { NextRequest, NextResponse } from 'next/server';

const GRAPH_API = 'https://graph.facebook.com/v21.0';
const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID || '';
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET || '';
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/instagram/callback`;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Instagram OAuth — Step 2: Exchange code for token, find IG account, store
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const error = req.nextUrl.searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?auth_error=instagram_denied`
    );
  }

  try {
    // Step 1: Exchange code for short-lived token
    const tokenRes = await fetch(
      `${GRAPH_API}/oauth/access_token?client_id=${INSTAGRAM_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&client_secret=${INSTAGRAM_APP_SECRET}&code=${code}`
    );
    const tokenData = await tokenRes.json();
    if (tokenData.error) throw new Error(tokenData.error.message);

    // Step 2: Exchange for long-lived token (60 days)
    const longRes = await fetch(
      `${GRAPH_API}/oauth/access_token?grant_type=fb_exchange_token&client_id=${INSTAGRAM_APP_ID}&client_secret=${INSTAGRAM_APP_SECRET}&fb_exchange_token=${tokenData.access_token}`
    );
    const longData = await longRes.json();
    if (longData.error) throw new Error(longData.error.message);

    const accessToken = longData.access_token;
    const expiresIn = longData.expires_in || 5184000; // 60 days default

    // Step 3: Get Facebook Pages
    const pagesRes = await fetch(`${GRAPH_API}/me/accounts?access_token=${accessToken}`);
    const pagesData = await pagesRes.json();
    if (!pagesData.data?.length) throw new Error('No Facebook Pages found');

    // Step 4: Get Instagram Business Account from first page
    const pageId = pagesData.data[0].id;
    const pageToken = pagesData.data[0].access_token;
    const igRes = await fetch(
      `${GRAPH_API}/${pageId}?fields=instagram_business_account&access_token=${pageToken}`
    );
    const igData = await igRes.json();
    const igUserId = igData.instagram_business_account?.id;
    if (!igUserId) throw new Error('No Instagram Business Account linked to this page');

    // Step 5: Get IG username
    const igProfileRes = await fetch(
      `${GRAPH_API}/${igUserId}?fields=username&access_token=${accessToken}`
    );
    const igProfile = await igProfileRes.json();

    // Step 6: Upsert in social_accounts
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    // Delete existing instagram entry
    await fetch(`${SUPABASE_URL}/rest/v1/social_accounts?platform=eq.instagram`, {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });

    // Insert new
    await fetch(`${SUPABASE_URL}/rest/v1/social_accounts`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        platform: 'instagram',
        access_token: accessToken,
        refresh_token: null,
        account_id: igUserId,
        account_name: igProfile.username || `Page ${pageId}`,
        expires_at: expiresAt,
      }),
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?auth_success=instagram`
    );
  } catch (err) {
    console.error('[Auth Instagram]', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?auth_error=${encodeURIComponent(msg)}`
    );
  }
}
