-- Migration: Add faculty_members table
-- Created: 2024-11-15
-- Purpose: Allow admins to manage faculty member profiles for display on About page

CREATE TABLE IF NOT EXISTS faculty_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  office_location VARCHAR(255),
  photo_url TEXT,
  bio TEXT,
  research_interests TEXT[],
  education JSONB, -- Array of {degree, institution, year}
  publications TEXT[],
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for ordering
CREATE INDEX idx_faculty_display_order ON faculty_members(display_order);

-- Create index for active status
CREATE INDEX idx_faculty_is_active ON faculty_members(is_active);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_faculty_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER faculty_updated_at_trigger
BEFORE UPDATE ON faculty_members
FOR EACH ROW
EXECUTE FUNCTION update_faculty_updated_at();

-- Insert sample data
INSERT INTO faculty_members (name, title, email, bio, research_interests, display_order, is_active)
VALUES
  ('Dr. Sample Professor', 'Professor of Accounting', 'sample@hanyang.ac.kr', 'Sample faculty member for demonstration purposes.', ARRAY['Financial Accounting', 'Corporate Governance'], 1, true);
