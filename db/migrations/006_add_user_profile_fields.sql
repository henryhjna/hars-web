-- Migration: Add user profile fields
-- Created: 2024-11-15
-- Purpose: Add preferred_name, prefix, academic_title, and photo_url to users table

ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS prefix VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS academic_title VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Create index for prefix and academic_title for filtering/sorting
CREATE INDEX IF NOT EXISTS idx_users_prefix ON users(prefix);
CREATE INDEX IF NOT EXISTS idx_users_academic_title ON users(academic_title);

COMMENT ON COLUMN users.preferred_name IS 'Optional preferred name for display';
COMMENT ON COLUMN users.prefix IS 'Title prefix: Mr., Mrs., Ms., Mx., Dr.';
COMMENT ON COLUMN users.academic_title IS 'Academic position: Professor, Associate Professor, etc.';
COMMENT ON COLUMN users.photo_url IS 'URL to user profile photo (S3 or external)';
