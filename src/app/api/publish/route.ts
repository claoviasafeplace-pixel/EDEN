import { NextRequest, NextResponse } from 'next/server';
import { publishReel, publishCarousel, refreshInstagramToken } from '@/lib/instagram';
import { publishVideoDirect, sendToInbox, refreshTikTokToken } from '@/lib/tiktok';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface SocialAccount {
  id: number;
  platform: string;
  access_token: string;
  refresh_token: string | null;
  account_id: string | null;
  expires_at: string | null;
}

async function getAccount(platform: string): Promise<SocialAccount | null> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/social_accounts?platform=eq.${platform}&limit=1`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    }
  );
  const data = await res.json();
  return data?.[0] || null;
}

async function updateAccount(id: number, data: Record<string, unknown>) {
  await fetch(`${SUPABASE_URL}/rest/v1/social_accounts?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(data),
  });
}

async function getReel(id: string | number) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/reels?id=eq.${id}&select=*,media_items(*)`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    }
  );
  const data = await res.json();
  return data?.[0] || null;
}

async function updateReel(id: string | number, data: Record<string, unknown>) {
  await fetch(`${SUPABASE_URL}/rest/v1/reels?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(data),
  });
}

// Ensure token is fresh, refresh if expired
async function ensureValidToken(account: SocialAccount): Promise<string> {
  if (account.expires_at && new Date(account.expires_at) > new Date()) {
    return account.access_token;
  }

  // Token expired — try refresh
  if (account.platform === 'instagram') {
    const refreshed = await refreshInstagramToken(account.access_token);
    const expiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();
    await updateAccount(account.id, {
      access_token: refreshed.access_token,
      expires_at: expiresAt,
    });
    return refreshed.access_token;
  }

  if (account.platform === 'tiktok' && account.refresh_token) {
    const refreshed = await refreshTikTokToken(account.refresh_token);
    const expiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();
    await updateAccount(account.id, {
      access_token: refreshed.access_token,
      refresh_token: refreshed.refresh_token,
      expires_at: expiresAt,
    });
    return refreshed.access_token;
  }

  throw new Error(`${account.platform}: token expired, please reconnect`);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { reel_id, platforms } = body as {
    reel_id: number;
    platforms: ('instagram' | 'tiktok')[];
  };

  if (!reel_id || !platforms?.length) {
    return NextResponse.json(
      { error: 'reel_id and platforms[] required' },
      { status: 400 }
    );
  }

  const reel = await getReel(reel_id);
  if (!reel) {
    return NextResponse.json({ error: 'Reel not found' }, { status: 404 });
  }
  if (reel.status !== 'completed' || !reel.video_916_url) {
    return NextResponse.json(
      { error: 'Reel must be completed with a video before publishing' },
      { status: 400 }
    );
  }

  const results: Record<string, { success: boolean; postId?: string; error?: string }> = {};

  // Publish to Instagram
  if (platforms.includes('instagram')) {
    try {
      const account = await getAccount('instagram');
      if (!account) throw new Error('Instagram non connecte');

      const token = await ensureValidToken(account);
      const caption = reel.caption_instagram || `${reel.ville} - ${reel.prix}`;

      if (reel.content_type === 'carousel' && reel.media_items?.length > 0) {
        const imageUrls = reel.media_items
          .filter((m: { media_type: string }) => m.media_type === 'photo')
          .map((m: { url: string }) => m.url);
        const result = await publishCarousel(token, account.account_id!, imageUrls, caption);
        await updateReel(reel_id, { instagram_post_id: result.postId });
        results.instagram = { success: true, postId: result.postId };
      } else {
        const result = await publishReel(token, account.account_id!, reel.video_916_url, caption);
        await updateReel(reel_id, { instagram_post_id: result.postId });
        results.instagram = { success: true, postId: result.postId };
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[Publish Instagram]', msg);
      results.instagram = { success: false, error: msg };
    }
  }

  // Publish to TikTok
  if (platforms.includes('tiktok')) {
    try {
      const account = await getAccount('tiktok');
      if (!account) throw new Error('TikTok non connecte');

      const token = await ensureValidToken(account);
      const caption = reel.caption_tiktok || `${reel.ville} - ${reel.prix}`;

      // Try direct publish, fall back to inbox
      try {
        const result = await publishVideoDirect(token, reel.video_916_url, caption);
        await updateReel(reel_id, { tiktok_post_id: result.publishId });
        results.tiktok = { success: true, postId: result.publishId };
      } catch (directErr) {
        console.warn('[Publish TikTok] Direct failed, trying inbox:', directErr);
        const result = await sendToInbox(token, reel.video_916_url, caption);
        await updateReel(reel_id, { tiktok_post_id: result.publishId });
        results.tiktok = { success: true, postId: result.publishId };
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[Publish TikTok]', msg);
      results.tiktok = { success: false, error: msg };
    }
  }

  const allSuccess = Object.values(results).every(r => r.success);
  return NextResponse.json({
    status: allSuccess ? 'published' : 'partial',
    results,
  });
}
