-- Migration: Add Content Management Fields
-- Date: 2026-02-13
-- Description: Add missing fields for admin content management system

-- Add missing columns to articles table
ALTER TABLE articles 
  ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(500);

-- Add missing columns to events table
ALTER TABLE events 
  ADD COLUMN IF NOT EXISTS image_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(500);

-- Add missing columns to resources table
ALTER TABLE resources 
  ADD COLUMN IF NOT EXISTS file_type VARCHAR(50);

-- Add missing columns to episodes table (already has audio_url and duration_seconds)
-- No changes needed for episodes

-- Add missing columns to shows table (already has cover_image_url)
ALTER TABLE shows
  ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(500);

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_articles_thumbnail ON articles(thumbnail_url);
CREATE INDEX IF NOT EXISTS idx_events_image ON events(image_url);
CREATE INDEX IF NOT EXISTS idx_resources_file_type ON resources(file_type);

-- Update existing data to set default values where needed
UPDATE articles SET thumbnail_url = featured_image_url WHERE thumbnail_url IS NULL AND featured_image_url IS NOT NULL;
UPDATE shows SET thumbnail_url = cover_image_url WHERE thumbnail_url IS NULL AND cover_image_url IS NOT NULL;
