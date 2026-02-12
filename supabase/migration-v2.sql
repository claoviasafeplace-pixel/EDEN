-- EDEN v2 Migration — Phase 1
-- Run in Supabase SQL Editor
-- Backward compatible: existing reels keep working with defaults

-- ============================================================
-- 1. Add new columns to reels table
-- ============================================================

ALTER TABLE reels
  ADD COLUMN IF NOT EXISTS content_type text NOT NULL DEFAULT 'reel',
  ADD COLUMN IF NOT EXISTS caption_instagram text,
  ADD COLUMN IF NOT EXISTS caption_tiktok text,
  ADD COLUMN IF NOT EXISTS duration_seconds integer NOT NULL DEFAULT 15,
  ADD COLUMN IF NOT EXISTS enable_veo3 boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS enable_staging boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS music_url text,
  ADD COLUMN IF NOT EXISTS pipeline_stage text,
  ADD COLUMN IF NOT EXISTS pipeline_progress integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS error_message text,
  ADD COLUMN IF NOT EXISTS instagram_post_id text,
  ADD COLUMN IF NOT EXISTS tiktok_post_id text;

-- Add check constraint for content_type
ALTER TABLE reels
  ADD CONSTRAINT reels_content_type_check
  CHECK (content_type IN ('reel', 'carousel'));

-- Add check constraint for pipeline_stage
ALTER TABLE reels
  ADD CONSTRAINT reels_pipeline_stage_check
  CHECK (pipeline_stage IS NULL OR pipeline_stage IN (
    'uploading', 'analyzing', 'generating_videos', 'staging', 'rendering', 'writing_captions', 'completed', 'error'
  ));

-- ============================================================
-- 2. Create media_items table
-- ============================================================

CREATE TABLE IF NOT EXISTS media_items (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  reel_id bigint NOT NULL REFERENCES reels(id) ON DELETE CASCADE,
  url text NOT NULL,
  thumbnail_url text,
  media_type text NOT NULL DEFAULT 'photo',
  room_type text,
  sort_order integer NOT NULL DEFAULT 0,
  ai_description text,
  veo3_video_url text,
  staged_url text,
  width integer,
  height integer,
  duration_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE media_items
  ADD CONSTRAINT media_items_type_check
  CHECK (media_type IN ('photo', 'video'));

ALTER TABLE media_items
  ADD CONSTRAINT media_items_room_type_check
  CHECK (room_type IS NULL OR room_type IN (
    'facade', 'salon', 'cuisine', 'chambre', 'salle_de_bain',
    'bureau', 'terrasse', 'jardin', 'piscine', 'garage',
    'entree', 'couloir', 'salle_a_manger', 'dressing', 'autre'
  ));

CREATE INDEX IF NOT EXISTS idx_media_items_reel_id ON media_items(reel_id);
CREATE INDEX IF NOT EXISTS idx_media_items_sort ON media_items(reel_id, sort_order);

-- Enable RLS
ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "media_items_public_read" ON media_items FOR SELECT USING (true);
CREATE POLICY "media_items_public_insert" ON media_items FOR INSERT WITH CHECK (true);
CREATE POLICY "media_items_public_update" ON media_items FOR UPDATE USING (true);
CREATE POLICY "media_items_public_delete" ON media_items FOR DELETE USING (true);

-- ============================================================
-- 3. Create music_tracks table
-- ============================================================

CREATE TABLE IF NOT EXISTS music_tracks (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  url text NOT NULL,
  duration_seconds integer NOT NULL DEFAULT 30,
  genre text,
  mood text,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE music_tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "music_tracks_public_read" ON music_tracks FOR SELECT USING (true);

-- Insert default tracks
INSERT INTO music_tracks (name, url, duration_seconds, genre, mood, is_default) VALUES
  ('Elegant Piano', 'https://res.cloudinary.com/dklgaei0q/video/upload/v1/eden-music/elegant-piano.mp3', 60, 'classique', 'elegant', true),
  ('Modern Beat', 'https://res.cloudinary.com/dklgaei0q/video/upload/v1/eden-music/modern-beat.mp3', 45, 'electronic', 'energique', false),
  ('Soft Acoustic', 'https://res.cloudinary.com/dklgaei0q/video/upload/v1/eden-music/soft-acoustic.mp3', 60, 'acoustic', 'chaleureux', false);

-- ============================================================
-- 4. Create social_accounts table (Phase 3 prep)
-- ============================================================

CREATE TABLE IF NOT EXISTS social_accounts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  platform text NOT NULL,
  access_token text NOT NULL,
  refresh_token text,
  account_id text,
  account_name text,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE social_accounts
  ADD CONSTRAINT social_accounts_platform_check
  CHECK (platform IN ('instagram', 'tiktok'));

ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "social_accounts_public_all" ON social_accounts FOR ALL USING (true);
