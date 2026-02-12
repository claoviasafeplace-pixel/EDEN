const GRAPH_API = 'https://graph.facebook.com/v21.0';

interface PublishResult {
  postId: string;
  permalink?: string;
}

// Instagram Graph API — Publish a Reel (video)
export async function publishReel(
  accessToken: string,
  igUserId: string,
  videoUrl: string,
  caption: string
): Promise<PublishResult> {
  // Step 1: Create media container
  const createRes = await fetch(`${GRAPH_API}/${igUserId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      media_type: 'REELS',
      video_url: videoUrl,
      caption,
      access_token: accessToken,
    }),
  });
  const createData = await createRes.json();
  if (createData.error) throw new Error(`IG create: ${createData.error.message}`);
  const containerId = createData.id;

  // Step 2: Poll until container is ready
  await pollContainerStatus(accessToken, containerId);

  // Step 3: Publish
  const publishRes = await fetch(`${GRAPH_API}/${igUserId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creation_id: containerId,
      access_token: accessToken,
    }),
  });
  const publishData = await publishRes.json();
  if (publishData.error) throw new Error(`IG publish: ${publishData.error.message}`);

  // Get permalink
  let permalink: string | undefined;
  try {
    const mediaRes = await fetch(
      `${GRAPH_API}/${publishData.id}?fields=permalink&access_token=${accessToken}`
    );
    const mediaData = await mediaRes.json();
    permalink = mediaData.permalink;
  } catch {}

  return { postId: publishData.id, permalink };
}

// Instagram Graph API — Publish a Carousel
export async function publishCarousel(
  accessToken: string,
  igUserId: string,
  imageUrls: string[],
  caption: string
): Promise<PublishResult> {
  // Step 1: Create child containers for each image
  const childIds: string[] = [];
  for (const url of imageUrls.slice(0, 10)) {
    const res = await fetch(`${GRAPH_API}/${igUserId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: url,
        is_carousel_item: true,
        access_token: accessToken,
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(`IG carousel child: ${data.error.message}`);
    childIds.push(data.id);
  }

  // Step 2: Create carousel container
  const carouselRes = await fetch(`${GRAPH_API}/${igUserId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      media_type: 'CAROUSEL',
      children: childIds,
      caption,
      access_token: accessToken,
    }),
  });
  const carouselData = await carouselRes.json();
  if (carouselData.error) throw new Error(`IG carousel: ${carouselData.error.message}`);

  // Step 3: Poll + publish
  await pollContainerStatus(accessToken, carouselData.id);

  const publishRes = await fetch(`${GRAPH_API}/${igUserId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creation_id: carouselData.id,
      access_token: accessToken,
    }),
  });
  const publishData = await publishRes.json();
  if (publishData.error) throw new Error(`IG publish carousel: ${publishData.error.message}`);

  return { postId: publishData.id };
}

// Refresh a long-lived token (valid 60 days, refreshable)
export async function refreshInstagramToken(accessToken: string): Promise<{
  access_token: string;
  expires_in: number;
}> {
  const res = await fetch(
    `${GRAPH_API}/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.INSTAGRAM_APP_ID}&client_secret=${process.env.INSTAGRAM_APP_SECRET}&fb_exchange_token=${accessToken}`
  );
  const data = await res.json();
  if (data.error) throw new Error(`IG refresh: ${data.error.message}`);
  return { access_token: data.access_token, expires_in: data.expires_in };
}

// Poll container status until FINISHED
async function pollContainerStatus(accessToken: string, containerId: string) {
  const maxPolls = 30;
  for (let i = 0; i < maxPolls; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const res = await fetch(
      `${GRAPH_API}/${containerId}?fields=status_code,status&access_token=${accessToken}`
    );
    const data = await res.json();
    if (data.status_code === 'FINISHED') return;
    if (data.status_code === 'ERROR') {
      throw new Error(`IG container error: ${data.status || 'Unknown error'}`);
    }
  }
  throw new Error('IG container: timeout after 2.5 minutes');
}
