import type { RoomType, MediaItem } from './types';

const GEMINI_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;

interface AnalysisResult {
  room_type: RoomType;
  description: string;
  suggested_order: number;
}

async function callGeminiWithRetry(body: unknown, retries = 3): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);
      const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await res.json();
      if (data.error) throw new Error(`Gemini: ${data.error.message}`);
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Gemini: no text in response');
      return text;
    } catch (err) {
      if (attempt === retries) throw err;
      console.log(`[AI Analysis] Gemini attempt ${attempt} failed, retrying in 5s...`);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
  throw new Error('Gemini: unreachable');
}

export async function analyzeMediaItems(mediaItems: MediaItem[]): Promise<AnalysisResult[]> {
  // Only analyze photos — videos keep their original order
  const photos = mediaItems.filter(m => m.media_type === 'photo');
  if (photos.length === 0) return [];

  const imageUrls = photos.map(p => p.url);

  const prompt = `Tu es un expert immobilier. Analyse ces ${imageUrls.length} photos d'un bien immobilier.

Pour CHAQUE photo (dans l'ordre), determine:
1. room_type: le type de piece parmi: facade, salon, cuisine, chambre, salle_de_bain, bureau, terrasse, jardin, piscine, garage, entree, couloir, salle_a_manger, dressing, autre
2. description: description courte en francais (20 mots max)
3. suggested_order: l'ordre optimal pour une visite video (0 = premier, facade en premier si presente)

Retourne UNIQUEMENT un JSON valide: un tableau d'objets avec room_type, description, suggested_order.
Exemple: [{"room_type":"facade","description":"Belle facade moderne","suggested_order":0}]`;

  const parts: { text?: string; inlineData?: { mimeType: string; data: string } }[] = [
    { text: prompt },
  ];

  // Add image URLs as references
  for (const url of imageUrls) {
    parts.push({ text: `Image: ${url}` });
  }

  const text = await callGeminiWithRetry({
    contents: [{ role: 'user', parts }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
    },
  });

  try {
    const results: AnalysisResult[] = JSON.parse(text);
    return results;
  } catch {
    // Try to extract JSON from markdown code blocks
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) return JSON.parse(match[1].trim());
    console.error('[AI Analysis] Failed to parse response:', text);
    return [];
  }
}

export async function generateCaptions(
  ville: string, quartier: string, prix: string, roomDescriptions: string[]
): Promise<{ caption_instagram: string; caption_tiktok: string }> {
  const roomContext = roomDescriptions.length > 0
    ? `\nPieces: ${roomDescriptions.join(', ')}`
    : '';

  const text = await callGeminiWithRetry({
    contents: [{
      role: 'user',
      parts: [{
        text: `Tu es Copywriter Expert immobilier pour Instagram Reels et TikTok.

Bien immobilier: ${ville}, quartier ${quartier}, ${prix} euros.${roomContext}

Genere du contenu marketing CONCIS et percutant. Retourne UNIQUEMENT un JSON valide:
{
  "caption_instagram": "caption engageante 150 mots max avec 5 hashtags immobilier",
  "caption_tiktok": "caption 100 chars max avec 3 hashtags"
}`,
      }],
    }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 2048, responseMimeType: 'application/json' },
  });

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    return JSON.parse(match ? match[1].trim() : text);
  }
}
