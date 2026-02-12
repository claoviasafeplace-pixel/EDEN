const TIKTOK_API = 'https://open.tiktokapis.com/v2';

interface PublishResult {
  publishId: string;
}

// TikTok Content Posting API — Direct post (requires approved app)
export async function publishVideoDirect(
  accessToken: string,
  videoUrl: string,
  caption: string
): Promise<PublishResult> {
  // Step 1: Initialize upload via pull (from URL)
  const initRes = await fetch(`${TIKTOK_API}/post/publish/video/init/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({
      post_info: {
        title: caption.slice(0, 150),
        privacy_level: 'SELF_ONLY', // Start as private, user can change
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
        video_cover_timestamp_ms: 1000,
      },
      source_info: {
        source: 'PULL_FROM_URL',
        video_url: videoUrl,
      },
    }),
  });
  const initData = await initRes.json();
  if (initData.error?.code !== 'ok' && initData.error?.code) {
    throw new Error(`TikTok init: ${initData.error.message || initData.error.code}`);
  }
  const publishId = initData.data?.publish_id;
  if (!publishId) throw new Error('TikTok: no publish_id returned');

  // Step 2: Poll publish status
  await pollTikTokStatus(accessToken, publishId);

  return { publishId };
}

// TikTok — Inbox mode (sends to user's TikTok app for manual publish)
// This doesn't require content posting audit
export async function sendToInbox(
  accessToken: string,
  videoUrl: string,
  caption: string
): Promise<PublishResult> {
  const res = await fetch(`${TIKTOK_API}/post/publish/inbox/video/init/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({
      source_info: {
        source: 'PULL_FROM_URL',
        video_url: videoUrl,
      },
    }),
  });
  const data = await res.json();
  if (data.error?.code !== 'ok' && data.error?.code) {
    throw new Error(`TikTok inbox: ${data.error.message || data.error.code}`);
  }
  return { publishId: data.data?.publish_id || 'inbox' };
}

// Refresh TikTok access token
export async function refreshTikTokToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const res = await fetch(`${TIKTOK_API}/oauth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY || '',
      client_secret: process.env.TIKTOK_CLIENT_SECRET || '',
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`TikTok refresh: ${data.error_description || data.error}`);
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
  };
}

// Poll TikTok publish status
async function pollTikTokStatus(accessToken: string, publishId: string) {
  const maxPolls = 30;
  for (let i = 0; i < maxPolls; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const res = await fetch(`${TIKTOK_API}/post/publish/status/fetch/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({ publish_id: publishId }),
    });
    const data = await res.json();
    const status = data.data?.status;
    if (status === 'PUBLISH_COMPLETE') return;
    if (status === 'FAILED') {
      throw new Error(`TikTok publish failed: ${data.data?.fail_reason || 'unknown'}`);
    }
  }
  throw new Error('TikTok publish: timeout after 2.5 minutes');
}
