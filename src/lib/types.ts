export interface Reel {
  id: number;
  ville: string;
  quartier: string;
  prix: string;
  image_facade_url: string;
  image_interieur_url: string;
  contact: string;
  telephone: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  video_916_url: string | null;
  video_1x1_url: string | null;
  created_at: string;
}
