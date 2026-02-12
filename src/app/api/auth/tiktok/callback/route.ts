import { NextRequest, NextResponse } from 'next/server';

const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY || '';
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET || '';
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/tiktok/callback`;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// TikTok OAuth — Step 2: Exchange code for token, store
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const error = req.nextUrl.searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?auth_error=tiktok_denied`
    );
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: TIKTOK_CLIENT_KEY,
        client_secret: TIKTOK_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      }),
    });
    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error);
    }

    const {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiresIn,
      open_id: openId,
    } = tokenData;

    // Get user info for display name
    let accountName = openId || 'TikTok';
    try {
      const userRes = await fetch(
        'https://open.tiktokapis.com/v2/user/info/?fields=display_name,avatar_url',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const userData = await userRes.json();
      if (userData.data?.user?.display_name) {
        accountName = userData.data.user.display_name;
      }
    } catch {}

    // Upsert in social_accounts
    const expiresAt = new Date(Date.now() + (expiresIn || 86400) * 1000).toISOString();

    // Delete existing tiktok entry
    await fetch(`${SUPABASE_URL}/rest/v1/social_accounts?platform=eq.tiktok`, {
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
        platform: 'tiktok',
        access_token: accessToken,
        refresh_token: refreshToken || null,
        account_id: openId || null,
        account_name: accountName,
        expires_at: expiresAt,
      }),
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?auth_success=tiktok`
    );
  } catch (err) {
    console.error('[Auth TikTok]', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?auth_error=${encodeURIComponent(msg)}`
    );
  }
}
