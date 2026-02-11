-- EDEN Reels - Table setup
-- Execute this SQL in Supabase SQL Editor: https://supabase.com/dashboard/project/gjndjutzpumdzkqwkzny/sql

-- Create the reels table
CREATE TABLE IF NOT EXISTS reels (
  id BIGSERIAL PRIMARY KEY,
  ville TEXT NOT NULL,
  quartier TEXT NOT NULL,
  prix TEXT NOT NULL,
  image_facade_url TEXT NOT NULL,
  image_interieur_url TEXT NOT NULL,
  contact TEXT DEFAULT 'Eden - ERA Immobilier',
  telephone TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  video_916_url TEXT,
  video_1x1_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS with permissive policy (no auth needed for this app)
ALTER TABLE reels ENABLE ROW LEVEL SECURITY;

-- Allow all operations from anon key (internal app, no auth)
CREATE POLICY "Allow all reads" ON reels FOR SELECT USING (true);
CREATE POLICY "Allow all inserts" ON reels FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all updates" ON reels FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all deletes" ON reels FOR DELETE USING (true);
