-- Migration: Update Submission Status Types
-- Remove 'draft' and 'revision_requested' statuses
-- Add 'review_complete' status

-- Update existing records
-- Convert any 'draft' to 'submitted'
UPDATE submissions
SET status = 'submitted'
WHERE status = 'draft';

-- Convert any 'revision_requested' to 'review_complete'
UPDATE submissions
SET status = 'review_complete'
WHERE status = 'revision_requested';

-- Update the CHECK constraint
ALTER TABLE submissions
DROP CONSTRAINT IF EXISTS submissions_status_check;

ALTER TABLE submissions
ADD CONSTRAINT submissions_status_check
CHECK (status IN ('submitted', 'under_review', 'review_complete', 'accepted', 'rejected'));

-- Update default value
ALTER TABLE submissions
ALTER COLUMN status SET DEFAULT 'submitted';
