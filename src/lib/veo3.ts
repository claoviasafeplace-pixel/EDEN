import type { RoomType } from './types';

const GEMINI_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;

const ROOM_PROMPTS: Record<RoomType, string> = {
  facade: 'Smooth cinematic dolly forward toward the front entrance of this house, golden hour lighting, real estate showcase',
  salon: 'Gentle cinematic pan across this living room, warm natural light streaming in, interior design showcase',
  cuisine: 'Slow tracking shot through this kitchen, morning light, modern real estate video style',
  chambre: 'Soft dolly in toward this bedroom, cozy ambient light, real estate interior tour',
  salle_de_bain: 'Elegant slow pan across this bathroom, clean bright lighting, luxury real estate',
  bureau: 'Gentle crane down revealing this home office space, natural daylight, modern living',
  terrasse: 'Cinematic aerial-style reveal of this terrace, blue sky, outdoor living showcase',
  jardin: 'Wide establishing shot slowly pushing into this garden, sunny day, property showcase',
  piscine: 'Smooth tracking shot across this pool area, sparkling water reflections, luxury property',
  garage: 'Clean dolly shot into this garage space, well-lit, modern property tour',
  entree: 'Elegant push-in through this entryway, inviting warm light, real estate tour',
  couloir: 'Steady tracking shot down this hallway, architectural perspective, interior showcase',
  salle_a_manger: 'Gentle orbit around this dining area, warm evening light, lifestyle real estate',
  dressing: 'Slow reveal of this walk-in closet, organized luxury, interior design',
  autre: 'Smooth cinematic camera movement through this space, natural lighting, real estate showcase',
};

const MAX_CLIPS = 4;
const COST_PER_CLIP = 1.20;

interface Veo3Result {
  videoUrl: string;
  mediaItemId: number;
}

export function estimateVeo3Cost(photoCount: number): number {
  return Math.min(photoCount, MAX_CLIPS) * COST_PER_CLIP;
}

export function buildVeo3Prompt(roomType: RoomType, description?: string): string {
  const base = ROOM_PROMPTS[roomType] || ROOM_PROMPTS.autre;
  return description ? `${base}. ${description}` : base;
}

export async function generateVeo3Clip(
  imageUrl: string,
  prompt: string
): Promise<string> {
  // Veo 3 via Gemini API — generate video from image
  const generateUrl = `https://generativelanguage.googleapis.com/v1beta/models/veo-2:predictLongRunning?key=${GEMINI_KEY}`;

  const res = await fetch(generateUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{
        prompt,
        image: { gcsUri: imageUrl },
      }],
      parameters: {
        aspectRatio: '9:16',
        durationSeconds: 8,
        personGeneration: 'dont_allow',
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Veo 3 generation failed: ${res.status} - ${text}`);
  }

  const operation = await res.json();
  const operationName = operation.name;

  if (!operationName) {
    // Direct response (if available)
    const uri = operation.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
    if (uri) return `${uri}&key=${GEMINI_KEY}`;
    throw new Error('Veo 3: no operation name or direct response');
  }

  // Poll for completion
  const pollUrl = `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${GEMINI_KEY}`;
  const maxPolls = 60; // ~5 minutes at 5s intervals

  for (let i = 0; i < maxPolls; i++) {
    await new Promise(r => setTimeout(r, 5000));

    const pollRes = await fetch(pollUrl);
    const pollData = await pollRes.json();

    if (pollData.done) {
      const uri = pollData.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
      if (uri) return `${uri}&key=${GEMINI_KEY}`;
      throw new Error('Veo 3: operation done but no video URI');
    }
  }

  throw new Error('Veo 3: timeout after 5 minutes');
}

export async function generateVeo3Clips(
  items: { id: number; url: string; roomType: RoomType; description?: string }[],
  onProgress?: (completed: number, total: number) => void
): Promise<Veo3Result[]> {
  // Budget cap: max 4 clips
  const selected = items.slice(0, MAX_CLIPS);
  const results: Veo3Result[] = [];

  for (let i = 0; i < selected.length; i++) {
    const item = selected[i];
    const prompt = buildVeo3Prompt(item.roomType, item.description);

    try {
      console.log(`[Veo3] Generating clip ${i + 1}/${selected.length} for ${item.roomType}...`);
      const videoUrl = await generateVeo3Clip(item.url, prompt);
      results.push({ videoUrl, mediaItemId: item.id });
      console.log(`[Veo3] Clip ${i + 1} done: ${videoUrl.slice(0, 80)}...`);
    } catch (err) {
      console.error(`[Veo3] Clip ${i + 1} failed:`, err);
      // Continue with other clips
    }

    onProgress?.(i + 1, selected.length);
  }

  return results;
}
