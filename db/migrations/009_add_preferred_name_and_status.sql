-- Migration: Add preferred_name to users and status to events
-- Date: 2025-01-17

-- Add preferred_name to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_name VARCHAR(100);
COMMENT ON COLUMN users.preferred_name IS 'User preferred display name';

-- Add status to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'upcoming';
COMMENT ON COLUMN events.status IS 'Event status: upcoming, ongoing, past';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
