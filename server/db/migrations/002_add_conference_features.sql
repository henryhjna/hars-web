-- Migration: Add Conference Features (Topics, Awards, Enhanced Dates)
-- Date: 2024-11-13

-- 1. Add new date columns to events table (skip if already exist)
-- (notification_date, program_announcement_date, registration_deadline already added)

-- 2. Create conference_topics table
CREATE TABLE IF NOT EXISTS conference_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  topic_name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create awards table
CREATE TABLE IF NOT EXISTS awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  award_type VARCHAR(100) NOT NULL, -- 'Best Paper', 'Outstanding Paper'
  submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
  announcement_date DATE,
  prize_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Add session_type to event_sessions table (if it exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'event_sessions'
  ) THEN
    ALTER TABLE event_sessions ADD COLUMN IF NOT EXISTS session_type VARCHAR(50) DEFAULT 'Academic';
    -- session_type values: 'Academic', 'Practitioner', 'Keynote', 'Panel'
  END IF;
END $$;

-- 5. Add research_topic to submissions table
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS research_topic VARCHAR(255);

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conference_topics_event_id ON conference_topics(event_id);
CREATE INDEX IF NOT EXISTS idx_conference_topics_is_active ON conference_topics(is_active);
CREATE INDEX IF NOT EXISTS idx_awards_event_id ON awards(event_id);
CREATE INDEX IF NOT EXISTS idx_awards_submission_id ON awards(submission_id);

-- 7. Insert default conference topics for future events
-- These will be available for all events but can be customized per event
INSERT INTO conference_topics (event_id, topic_name, description, display_order)
SELECT
  e.id,
  t.name,
  t.description,
  t.ord
FROM events e
CROSS JOIN (
  VALUES
    ('AI, Machine Learning, and Big Data in Accounting', 'Research on artificial intelligence, machine learning algorithms, and big data analytics applications in accounting', 1),
    ('Financial Accounting', 'Research on financial reporting, disclosure, earnings quality, and capital markets', 2),
    ('Managerial Accounting', 'Research on cost accounting, budgeting, performance measurement, and management control systems', 3),
    ('Auditing', 'Research on audit quality, audit technology, internal controls, and assurance services', 4),
    ('Taxation', 'Research on tax planning, tax policy, corporate taxation, and international tax', 5),
    ('ESG and Sustainability Reporting', 'Research on environmental, social, and governance reporting and performance', 6),
    ('Accounting Information Systems', 'Research on information systems design, implementation, and security in accounting contexts', 7)
) AS t(name, description, ord)
WHERE e.status IN ('upcoming', 'ongoing')
ON CONFLICT DO NOTHING;

-- 8. Add comments for documentation
COMMENT ON TABLE conference_topics IS 'Research topics available for conference paper submissions';
COMMENT ON TABLE awards IS 'Awards given to outstanding papers at conferences';
COMMENT ON COLUMN event_sessions.session_type IS 'Type of session: Academic, Practitioner, Keynote, or Panel';
COMMENT ON COLUMN submissions.research_topic IS 'Research topic category selected by author during submission';
