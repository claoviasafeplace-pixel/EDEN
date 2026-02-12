// ============================================================
// Pipeline & Classification types
// ============================================================

export type PipelineStage =
  | 'uploading'
  | 'analyzing'
  | 'generating_videos'
  | 'staging'
  | 'rendering'
  | 'writing_captions'
  | 'completed'
  | 'error';

export type ContentType = 'reel' | 'carousel';

export type RoomType =
  | 'facade'
  | 'salon'
  | 'cuisine'
  | 'chambre'
  | 'salle_de_bain'
  | 'bureau'
  | 'terrasse'
  | 'jardin'
  | 'piscine'
  | 'garage'
  | 'entree'
  | 'couloir'
  | 'salle_a_manger'
  | 'dressing'
  | 'autre';

export type MediaType = 'photo' | 'video';

export const ROOM_LABELS: Record<RoomType, string> = {
  facade: 'Facade',
  salon: 'Salon',
  cuisine: 'Cuisine',
  chambre: 'Chambre',
  salle_de_bain: 'Salle de bain',
  bureau: 'Bureau',
  terrasse: 'Terrasse',
  jardin: 'Jardin',
  piscine: 'Piscine',
  garage: 'Garage',
  entree: 'Entree',
  couloir: 'Couloir',
  salle_a_manger: 'Salle a manger',
  dressing: 'Dressing',
  autre: 'Autre',
};

export const PIPELINE_LABELS: Record<PipelineStage, string> = {
  uploading: 'Upload des medias',
  analyzing: 'Analyse IA',
  generating_videos: 'Generation Veo 3',
  staging: 'Staging virtuel',
  rendering: 'Rendu video',
  writing_captions: 'Redaction captions',
  completed: 'Termine',
  error: 'Erreur',
};

// ============================================================
// Database models
// ============================================================

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
  // v2 fields
  content_type: ContentType;
  caption_instagram: string | null;
  caption_tiktok: string | null;
  duration_seconds: number;
  enable_veo3: boolean;
  enable_staging: boolean;
  music_url: string | null;
  pipeline_stage: PipelineStage | null;
  pipeline_progress: number;
  error_message: string | null;
  instagram_post_id: string | null;
  tiktok_post_id: string | null;
  // joined
  media_items?: MediaItem[];
}

export interface MediaItem {
  id: number;
  reel_id: number;
  url: string;
  thumbnail_url: string | null;
  media_type: MediaType;
  room_type: RoomType | null;
  sort_order: number;
  ai_description: string | null;
  veo3_video_url: string | null;
  staged_url: string | null;
  width: number | null;
  height: number | null;
  duration_ms: number | null;
  created_at: string;
}

export interface MusicTrack {
  id: number;
  name: string;
  url: string;
  duration_seconds: number;
  genre: string | null;
  mood: string | null;
  is_default: boolean;
}

export interface SocialAccount {
  id: number;
  platform: 'instagram' | 'tiktok';
  access_token: string;
  refresh_token: string | null;
  account_id: string | null;
  account_name: string | null;
  expires_at: string | null;
}

// ============================================================
// Client-side form state
// ============================================================

export interface UploadedMedia {
  id: string; // client-generated uuid
  file: File;
  previewUrl: string; // data URL or object URL for thumbnail
  cloudinaryUrl: string | null; // null until upload completes
  thumbnailUrl: string | null;
  mediaType: MediaType;
  uploadProgress: number; // 0-100
  width: number | null;
  height: number | null;
  durationMs: number | null;
}

export interface CreateReelFormData {
  contentType: ContentType;
  ville: string;
  quartier: string;
  prix: string;
  contact: string;
  telephone: string;
  enableVeo3: boolean;
  enableStaging: boolean;
  durationSeconds: number;
  musicTrackId: number | null;
}
