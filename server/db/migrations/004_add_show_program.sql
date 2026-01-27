-- Migration: Add show_program display option to events table
-- Date: 2024-11-13
-- Description: Add show_program column to control visibility of Program Schedule section

-- Add show_program column to events table (defaults to TRUE)
ALTER TABLE events ADD COLUMN IF NOT EXISTS show_program BOOLEAN DEFAULT TRUE;

-- Update existing events to show program by default
UPDATE events SET show_program = TRUE WHERE show_program IS NULL;

-- Verify migration
SELECT id, title, show_program FROM events ORDER BY created_at DESC LIMIT 5;
