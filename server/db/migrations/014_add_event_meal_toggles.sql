-- Per-event toggles for meal questions on the registration form.
-- Lunch: shown to everyone when enabled.
-- Dinner: shown only after the registrant self-reports eligibility
-- (presenter / discussant / co-author). Admins can override afterwards
-- via the existing PATCH /api/registrations/:id endpoint.

ALTER TABLE events
    ADD COLUMN IF NOT EXISTS show_lunch_question BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE events
    ADD COLUMN IF NOT EXISTS show_dinner_question BOOLEAN NOT NULL DEFAULT TRUE;
