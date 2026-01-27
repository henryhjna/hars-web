-- Migration: Add new display options and remove old ones
-- Date: 2024-11-13

-- Add new display option columns
ALTER TABLE events ADD COLUMN IF NOT EXISTS show_overview BOOLEAN DEFAULT TRUE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS show_practitioner_sessions BOOLEAN DEFAULT TRUE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS show_submission_guidelines BOOLEAN DEFAULT TRUE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS show_awards BOOLEAN DEFAULT TRUE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS show_committees BOOLEAN DEFAULT TRUE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS show_venue BOOLEAN DEFAULT TRUE;

-- Remove old unused columns
ALTER TABLE events DROP COLUMN IF EXISTS show_program;
ALTER TABLE events DROP COLUMN IF EXISTS show_best_paper;

-- Update existing events to have all new options enabled by default
UPDATE events SET
  show_overview = TRUE,
  show_practitioner_sessions = TRUE,
  show_submission_guidelines = TRUE,
  show_awards = TRUE,
  show_committees = TRUE,
  show_venue = TRUE
WHERE show_overview IS NULL
   OR show_practitioner_sessions IS NULL
   OR show_submission_guidelines IS NULL
   OR show_awards IS NULL
   OR show_committees IS NULL
   OR show_venue IS NULL;
