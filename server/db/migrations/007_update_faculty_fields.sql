-- Migration 007: Update faculty fields
-- Add profile_url field and remove publications field

-- Add profile_url field for external faculty profile pages
ALTER TABLE faculty_members
ADD COLUMN IF NOT EXISTS profile_url TEXT;

-- Remove publications field (data will be lost)
ALTER TABLE faculty_members
DROP COLUMN IF EXISTS publications;

-- Add comment
COMMENT ON COLUMN faculty_members.profile_url IS 'External URL to faculty member''s detailed profile page';
