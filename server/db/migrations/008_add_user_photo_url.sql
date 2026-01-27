-- Migration 008: Add photo_url to users table
-- Add photo_url field for user profile photos

-- Add photo_url field for user profile pictures
ALTER TABLE users
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Add comment
COMMENT ON COLUMN users.photo_url IS 'URL to user profile photo stored in S3';
