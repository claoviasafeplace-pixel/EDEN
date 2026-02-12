import { NextRequest, NextResponse } from 'next/server';
import type { MediaItem, PipelineStage, RoomType } from '@/lib/types';
import { analyzeMediaItems, generateCaptions } from '@/lib/ai-analysis';
import { generateVeo3Clips } from '@/lib/veo3';
import { buildSceneList } from '@/lib/scene-builder';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const REMOTION_URL = process.env.REMOTION_SERVER_URL || 'http://72.61.109.9:3123';

// ============================================================
// Supabase helpers
// ============================================================

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

async function updateMediaItem(id: number, data: Record<string, unknown>) {
  await fetch(`${SUPABASE_URL}/rest/v1/media_items?id=eq.${id}`, {
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

async function getMediaItems(reelId: string | number): Promise<MediaItem[]> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/media_items?reel_id=eq.${reelId}&order=sort_order`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    }
  );
  return res.json();
}

async function setPipelineStage(id: string | number, stage: PipelineStage, progress: number) {
  await updateReel(id, { pipeline_stage: stage, pipeline_progress: progress });
}

// ============================================================
// Remotion render
// ============================================================

async function renderRemotion(
  props: Record<string, unknown>,
  format: '916' | '1x1'
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 600000);

  const res = await fetch(`${REMOTION_URL}/render`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...props, format, enableStaging: false }),
    signal: controller.signal,
  });
  clearTimeout(timeout);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Remotion ${format}: HTTP ${res.status} - ${text}`);
  }

  const data = await res.json();
  if (data.error) throw new Error(`Remotion ${format}: ${data.error} - ${data.message}`);
  if (!data.url) throw new Error(`Remotion ${format}: no URL in response`);
  return data.url;
}

async function renderDynamic(
  scenes: ReturnType<typeof buildSceneList>,
  musicUrl?: string
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 600000);

  const res = await fetch(`${REMOTION_URL}/render-dynamic`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenes, musicUrl: musicUrl || '', format: '916' }),
    signal: controller.signal,
  });
  clearTimeout(timeout);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Remotion dynamic: HTTP ${res.status} - ${text}`);
  }

  const data = await res.json();
  if (data.error) throw new Error(`Remotion dynamic: ${data.error} - ${data.message}`);
  if (!data.url) throw new Error(`Remotion dynamic: no URL in response`);
  return data.url;
}

async function renderLegacy(
  finalMedia: MediaItem[],
  options: PipelineOptions,
  ville: string, quartier: string, prix: string,
  contact: string, telephone: string
): Promise<string> {
  const facadeUrl = finalMedia.find(m => m.room_type === 'facade')?.url
    || finalMedia.find(m => m.media_type === 'photo')?.url
    || finalMedia[0]?.url;
  const interiorUrl = finalMedia.find(m => m.media_type === 'photo' && m.room_type !== 'facade')?.url
    || finalMedia[1]?.url
    || facadeUrl;

  return renderRemotion({
    facadeUrl: facadeUrl || '',
    interiorUrl: interiorUrl || facadeUrl || '',
    stagedUrl: options.enableStaging ? (interiorUrl || '') : '',
    ville, quartier, prix, contact, telephone,
  }, '916');
}

// ============================================================
// Main pipeline
// ============================================================

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    record_id,
    ville, quartier, prix, contact, telephone,
    enable_veo3 = false,
    enable_staging = true,
    duration_seconds = 30,
  } = body;

  if (!record_id) return NextResponse.json({ error: 'record_id required' }, { status: 400 });

  const promise = processReel(
    record_id, ville, quartier, prix, contact || 'Eden - ERA Immobilier', telephone || '',
    { enableVeo3: enable_veo3, enableStaging: enable_staging, durationSeconds: duration_seconds }
  );
  promise.catch(err => console.error('[Pipeline] Fatal:', err));

  return NextResponse.json({ status: 'started', record_id });
}

interface PipelineOptions {
  enableVeo3: boolean;
  enableStaging: boolean;
  durationSeconds: number;
}

async function processReel(
  recordId: string | number,
  ville: string, quartier: string, prix: string,
  contact: string, telephone: string,
  options: PipelineOptions
) {
  try {
    await updateReel(recordId, { status: 'processing' });

    // ─── Stage 1: AI Vision Analysis ───────────────────────
    console.log(`[Pipeline] Reel ${recordId}: Stage 1 — AI Analysis`);
    await setPipelineStage(recordId, 'analyzing', 10);

    const mediaItems = await getMediaItems(recordId);
    console.log(`[Pipeline] Reel ${recordId}: ${mediaItems.length} media items found`);

    if (mediaItems.length > 0) {
      try {
        const analysis = await analyzeMediaItems(mediaItems);
        // Update media_items with AI results
        for (let i = 0; i < analysis.length && i < mediaItems.length; i++) {
          const photos = mediaItems.filter(m => m.media_type === 'photo');
          if (i < photos.length) {
            await updateMediaItem(photos[i].id, {
              room_type: analysis[i].room_type,
              ai_description: analysis[i].description,
              sort_order: analysis[i].suggested_order,
            });
          }
        }
        console.log(`[Pipeline] Reel ${recordId}: AI analysis complete`);
      } catch (err) {
        console.error(`[Pipeline] Reel ${recordId}: AI analysis failed, continuing...`, err);
      }
    }
    await setPipelineStage(recordId, 'analyzing', 25);

    // ─── Stage 2: Veo 3 (if enabled) ─────────────────────
    if (options.enableVeo3 && mediaItems.length > 0) {
      console.log(`[Pipeline] Reel ${recordId}: Stage 2 — Veo 3 Generation`);
      await setPipelineStage(recordId, 'generating_videos', 30);

      // Re-fetch media items with AI-assigned room types
      const updatedItems = await getMediaItems(recordId);
      const photosForVeo3 = updatedItems
        .filter(m => m.media_type === 'photo' && m.room_type !== 'facade') // Skip facade (hook scene)
        .map(m => ({
          id: m.id,
          url: m.url,
          roomType: (m.room_type || 'autre') as RoomType,
          description: m.ai_description || undefined,
        }));

      if (photosForVeo3.length > 0) {
        const clips = await generateVeo3Clips(photosForVeo3, (done, total) => {
          const progress = 30 + Math.round((done / total) * 20);
          setPipelineStage(recordId, 'generating_videos', progress).catch(() => {});
        });

        // Update media_items with Veo 3 URLs
        for (const clip of clips) {
          await updateMediaItem(clip.mediaItemId, { veo3_video_url: clip.videoUrl });
        }
        console.log(`[Pipeline] Reel ${recordId}: ${clips.length} Veo 3 clips generated`);
      }
    }
    await setPipelineStage(recordId, 'generating_videos', 50);

    // ─── Stage 3: Remotion Render ─────────────────────────
    console.log(`[Pipeline] Reel ${recordId}: Stage 3 — Remotion Render`);
    await setPipelineStage(recordId, 'rendering', 55);

    // Re-fetch final media state
    const finalMedia = await getMediaItems(recordId);

    // Build scene list for DynamicReel
    const scenes = buildSceneList(finalMedia, {
      ville, quartier, prix, contact, telephone,
      targetDurationSeconds: options.durationSeconds,
    });
    console.log(`[Pipeline] Reel ${recordId}: ${scenes.length} scenes built`);

    let video916Url: string;

    // Try dynamic render first (multiple scenes), fall back to legacy
    if (scenes.length >= 3) {
      try {
        console.log(`[Pipeline] Reel ${recordId}: Using /render-dynamic with ${scenes.length} scenes`);
        video916Url = await renderDynamic(scenes);
        console.log(`[Pipeline] Reel ${recordId}: Dynamic render complete: ${video916Url}`);
      } catch (dynamicErr) {
        console.warn(`[Pipeline] Reel ${recordId}: Dynamic render failed, falling back to legacy:`, dynamicErr);
        // Fall back to legacy render
        video916Url = await renderLegacy(finalMedia, options, ville, quartier, prix, contact, telephone);
        console.log(`[Pipeline] Reel ${recordId}: Legacy render complete: ${video916Url}`);
      }
    } else {
      video916Url = await renderLegacy(finalMedia, options, ville, quartier, prix, contact, telephone);
      console.log(`[Pipeline] Reel ${recordId}: Legacy render complete: ${video916Url}`);
    }

    await setPipelineStage(recordId, 'rendering', 80);

    // ─── Stage 4: Captions ────────────────────────────────
    console.log(`[Pipeline] Reel ${recordId}: Stage 4 — Captions`);
    await setPipelineStage(recordId, 'writing_captions', 85);

    let captionInstagram = '';
    let captionTiktok = '';
    try {
      const descriptions = finalMedia
        .filter(m => m.ai_description)
        .map(m => m.ai_description!);
      const captions = await generateCaptions(ville, quartier, prix, descriptions);
      captionInstagram = captions.caption_instagram;
      captionTiktok = captions.caption_tiktok;
      console.log(`[Pipeline] Reel ${recordId}: Captions generated`);
    } catch (err) {
      console.error(`[Pipeline] Reel ${recordId}: Caption generation failed, continuing...`, err);
    }
    await setPipelineStage(recordId, 'writing_captions', 95);

    // ─── Stage 5: Complete ────────────────────────────────
    console.log(`[Pipeline] Reel ${recordId}: Stage 5 — Finalizing`);
    await updateReel(recordId, {
      status: 'completed',
      video_916_url: video916Url,
      video_1x1_url: video916Url,
      caption_instagram: captionInstagram || null,
      caption_tiktok: captionTiktok || null,
      pipeline_stage: 'completed',
      pipeline_progress: 100,
    });

    console.log(`[Pipeline] Reel ${recordId}: COMPLETE!`);

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[Pipeline] Reel ${recordId}: ERROR: ${msg}`);
    await updateReel(recordId, {
      status: 'error',
      pipeline_stage: 'error',
      error_message: msg,
    }).catch(() => {});
  }
}
