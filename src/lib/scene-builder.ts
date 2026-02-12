import type { MediaItem } from './types';

// Scene descriptor types for Remotion DynamicReel (Phase 2)
export type SceneDescriptor =
  | { type: 'hook_photo'; imageUrl: string; ville: string; quartier: string; prix: string; durationFrames: number }
  | { type: 'photo_scene'; imageUrl: string; label?: string; animation: string; durationFrames: number }
  | { type: 'video_scene'; videoUrl: string; label?: string; durationFrames: number }
  | { type: 'staging_scene'; beforeUrl: string; afterUrl: string; durationFrames: number }
  | { type: 'end_card'; contact: string; telephone: string; durationFrames: number };

const FPS = 30;
const ANIMATIONS = ['zoom_in', 'zoom_out', 'pan_left', 'pan_right', 'ken_burns'];

interface BuildOptions {
  ville: string;
  quartier: string;
  prix: string;
  contact: string;
  telephone: string;
  targetDurationSeconds: number;
}

export function buildSceneList(mediaItems: MediaItem[], options: BuildOptions): SceneDescriptor[] {
  const scenes: SceneDescriptor[] = [];

  // Sort by sort_order (AI-suggested order)
  const sorted = [...mediaItems].sort((a, b) => a.sort_order - b.sort_order);

  // Find facade for hook
  const facadeItem = sorted.find(m => m.room_type === 'facade' && m.media_type === 'photo');
  const remaining = sorted.filter(m => m !== facadeItem);

  // Hook: facade always first (5s)
  if (facadeItem) {
    scenes.push({
      type: 'hook_photo',
      imageUrl: facadeItem.veo3_video_url || facadeItem.url,
      ville: options.ville,
      quartier: options.quartier,
      prix: options.prix,
      durationFrames: 5 * FPS,
    });
  }

  // Main content
  let animIndex = 0;
  for (const item of remaining) {
    if (item.media_type === 'video' || item.veo3_video_url) {
      // Video clip (original video or Veo 3 generated)
      const videoUrl = item.veo3_video_url || item.url;
      const durationSec = item.veo3_video_url ? 8 : Math.min((item.duration_ms || 8000) / 1000, 8);
      scenes.push({
        type: 'video_scene',
        videoUrl,
        label: item.ai_description || undefined,
        durationFrames: Math.round(durationSec * FPS),
      });
    } else if (item.staged_url) {
      // Before/after staging scene (6s)
      scenes.push({
        type: 'staging_scene',
        beforeUrl: item.url,
        afterUrl: item.staged_url,
        durationFrames: 6 * FPS,
      });
    } else {
      // Static photo with Ken Burns animation (4s)
      scenes.push({
        type: 'photo_scene',
        imageUrl: item.url,
        label: item.ai_description || undefined,
        animation: ANIMATIONS[animIndex % ANIMATIONS.length],
        durationFrames: 4 * FPS,
      });
      animIndex++;
    }
  }

  // End card always last (3s)
  scenes.push({
    type: 'end_card',
    contact: options.contact,
    telephone: options.telephone,
    durationFrames: 3 * FPS,
  });

  // Adjust durations to match target
  adjustDurations(scenes, options.targetDurationSeconds * FPS);

  return scenes;
}

function adjustDurations(scenes: SceneDescriptor[], targetFrames: number): void {
  const totalFrames = scenes.reduce((sum, s) => sum + s.durationFrames, 0);
  if (totalFrames === 0 || scenes.length <= 2) return;

  const diff = targetFrames - totalFrames;
  if (Math.abs(diff) < FPS) return; // Close enough (within 1s)

  // Distribute difference across non-fixed scenes (skip hook + end_card)
  const adjustable = scenes.filter(s => s.type !== 'hook_photo' && s.type !== 'end_card');
  if (adjustable.length === 0) return;

  const perScene = Math.round(diff / adjustable.length);
  for (const scene of adjustable) {
    scene.durationFrames = Math.max(2 * FPS, scene.durationFrames + perScene);
  }
}
