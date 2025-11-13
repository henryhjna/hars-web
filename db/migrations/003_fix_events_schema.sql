-- Migration: Fix Events Schema - Add Missing Columns
-- Date: 2024-11-13
-- Description: Add program_announcement_date and registration_deadline to events table

-- Add missing date columns to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS program_announcement_date DATE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_deadline DATE;

-- Fix keynote_speakers column name inconsistency
-- Rename speaker_order to display_order to match model
ALTER TABLE keynote_speakers RENAME COLUMN speaker_order TO display_order;

-- Add comment for documentation
COMMENT ON COLUMN events.program_announcement_date IS 'Date when the conference program will be announced';
COMMENT ON COLUMN events.registration_deadline IS 'Last date for conference registration';
