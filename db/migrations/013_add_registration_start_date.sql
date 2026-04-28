-- Adds registration_start_date so admins can schedule when registration opens,
-- mirroring the submission_start_date / submission_end_date pair. NULL means
-- "open as soon as registration_deadline is set" (matches prior behavior so
-- existing events don't change).

ALTER TABLE events
    ADD COLUMN IF NOT EXISTS registration_start_date TIMESTAMP NULL;
