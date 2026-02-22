-- Migration: Add soft delete and protection columns to content tables
-- This migration adds support for:
-- 1. Soft deletion (deleted_at, deleted_by)
-- 2. Content protection flags (protected)
-- 3. Partial indexes for efficient queries

-- Add columns to articles table
ALTER TABLE articles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS deleted_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS protected BOOLEAN DEFAULT false NOT NULL;

-- Add columns to shows table
ALTER TABLE shows ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;
ALTER TABLE shows ADD COLUMN IF NOT EXISTS deleted_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE shows ADD COLUMN IF NOT EXISTS protected BOOLEAN DEFAULT false NOT NULL;

-- Add columns to episodes table
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS deleted_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS protected BOOLEAN DEFAULT false NOT NULL;

-- Add columns to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;
ALTER TABLE events ADD COLUMN IF NOT EXISTS deleted_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE events ADD COLUMN IF NOT EXISTS protected BOOLEAN DEFAULT false NOT NULL;

-- Add columns to resources table
ALTER TABLE resources ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS deleted_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS protected BOOLEAN DEFAULT false NOT NULL;

-- Create partial indexes for efficient queries on articles
CREATE INDEX IF NOT EXISTS idx_articles_deleted_at ON articles(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_articles_protected ON articles(protected) WHERE protected = true;

-- Create partial indexes for efficient queries on shows
CREATE INDEX IF NOT EXISTS idx_shows_deleted_at ON shows(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_shows_protected ON shows(protected) WHERE protected = true;

-- Create partial indexes for efficient queries on episodes
CREATE INDEX IF NOT EXISTS idx_episodes_deleted_at ON episodes(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_episodes_protected ON episodes(protected) WHERE protected = true;

-- Create partial indexes for efficient queries on events
CREATE INDEX IF NOT EXISTS idx_events_deleted_at ON events(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_protected ON events(protected) WHERE protected = true;

-- Create partial indexes for efficient queries on resources
CREATE INDEX IF NOT EXISTS idx_resources_deleted_at ON resources(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_resources_protected ON resources(protected) WHERE protected = true;
