-- HARS Database Schema
-- PostgreSQL 15+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop tables if exists (for development)
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS event_testimonials CASCADE;
DROP TABLE IF EXISTS event_photos CASCADE;
DROP TABLE IF EXISTS conference_topics CASCADE;
DROP TABLE IF EXISTS review_assignments CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS keynote_speakers CASCADE;
DROP TABLE IF EXISTS event_sessions CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    affiliation VARCHAR(255),
    roles TEXT[] DEFAULT ARRAY['user']::TEXT[],
    is_email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    is_migrated BOOLEAN DEFAULT FALSE,
    must_reset_password BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events Table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    location VARCHAR(255),
    venue_details TEXT,

    -- Submission timeline
    submission_start_date TIMESTAMP NOT NULL,
    submission_end_date TIMESTAMP NOT NULL,
    review_deadline TIMESTAMP,
    notification_date TIMESTAMP,
    program_announcement_date TIMESTAMP,
    registration_deadline TIMESTAMP,

    -- Event customization
    theme_color VARCHAR(7) DEFAULT '#1a73e8',
    banner_image_url TEXT,
    highlight_stats JSONB DEFAULT '{}',

    -- Event content sections (dynamic content)
    event_content JSONB DEFAULT '{
        "overview": "",
        "practitioner_sessions": "",
        "submission_guidelines": "",
        "awards": "",
        "academic_committee": [],
        "organizing_committee": []
        ,"venue_info": {
            "name": "",
            "address": "",
            "accessibility": [],
            "contact": []
        }
    }'::jsonb,

    -- UI customization (what sections to show)
    show_overview BOOLEAN DEFAULT TRUE,
    show_practitioner_sessions BOOLEAN DEFAULT TRUE,
    show_submission_guidelines BOOLEAN DEFAULT TRUE,
    show_awards BOOLEAN DEFAULT TRUE,
    show_committees BOOLEAN DEFAULT TRUE,
    show_venue BOOLEAN DEFAULT TRUE,
    show_keynote BOOLEAN DEFAULT TRUE,
    show_photos BOOLEAN DEFAULT TRUE,
    show_testimonials BOOLEAN DEFAULT FALSE,

    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'past')),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event Sessions (Program Schedule)
CREATE TABLE event_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    session_title VARCHAR(255) NOT NULL,
    session_date DATE,
    start_time TIME,
    end_time TIME,
    session_time VARCHAR(255),
    location VARCHAR(255),
    description TEXT,
    session_description TEXT,
    speaker_name VARCHAR(255),
    session_type VARCHAR(100),
    session_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Keynote Speakers
CREATE TABLE keynote_speakers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    affiliation VARCHAR(255),
    bio TEXT,
    photo_url TEXT,
    topic VARCHAR(500),
    presentation_time VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Submissions Table
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Paper info
    title VARCHAR(500) NOT NULL,
    abstract TEXT NOT NULL,
    keywords TEXT[] NOT NULL,
    corresponding_author VARCHAR(255) NOT NULL,
    co_authors TEXT,

    -- File
    pdf_url TEXT NOT NULL,
    pdf_filename VARCHAR(255) NOT NULL,
    pdf_size INTEGER,

    -- Status tracking
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'accepted', 'rejected', 'revision_requested')),
    submitted_at TIMESTAMP,

    -- Award
    is_best_paper BOOLEAN DEFAULT FALSE,
    award_type VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews Table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Review criteria (1-5 scale)
    originality_score INTEGER CHECK (originality_score >= 1 AND originality_score <= 5),
    methodology_score INTEGER CHECK (methodology_score >= 1 AND methodology_score <= 5),
    clarity_score INTEGER CHECK (clarity_score >= 1 AND clarity_score <= 5),
    contribution_score INTEGER CHECK (contribution_score >= 1 AND contribution_score <= 5),
    overall_score DECIMAL(3,2),

    -- Comments
    strengths TEXT,
    weaknesses TEXT,
    comments_to_authors TEXT,
    comments_to_committee TEXT,

    -- Decision
    recommendation VARCHAR(20) CHECK (recommendation IN ('accept', 'reject', 'major_revision', 'minor_revision')),
    is_completed BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(submission_id, reviewer_id)
);

-- Review Assignments
CREATE TABLE review_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),

    UNIQUE(submission_id, reviewer_id)
);

-- Event Photos
CREATE TABLE event_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    caption TEXT,
    is_highlight BOOLEAN DEFAULT FALSE,
    photo_order INTEGER DEFAULT 0,
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event Testimonials
CREATE TABLE event_testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    author_affiliation VARCHAR(255),
    testimonial_text TEXT NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conference Topics
CREATE TABLE conference_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    topic_name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity Logs
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_roles ON users USING GIN(roles);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(event_date DESC);
CREATE INDEX idx_submissions_user ON submissions(user_id);
CREATE INDEX idx_submissions_event ON submissions(event_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_reviews_submission ON reviews(submission_id);
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX idx_review_assignments_reviewer ON review_assignments(reviewer_id);
CREATE INDEX idx_event_photos_event ON event_photos(event_id);
CREATE INDEX idx_conference_topics_event ON conference_topics(event_id);
CREATE INDEX idx_conference_topics_active ON conference_topics(is_active);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at DESC);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conference_topics_updated_at BEFORE UPDATE ON conference_topics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: Admin123!)
-- Password hash generated with bcrypt rounds=10
INSERT INTO users (email, password_hash, first_name, last_name, affiliation, roles, is_email_verified)
VALUES (
    'admin@hanyanghars.com',
    '$2b$10$Kaey3a8l4ziXyaZzsPwXvewDrRMPuHyIZCS5hmOIGpvZx0U8rZeuK',
    'Admin',
    'User',
    'Hanyang University',
    ARRAY['user', 'admin', 'reviewer']::TEXT[],
    TRUE
);

-- Sample event (for development)
INSERT INTO events (
    title,
    description,
    event_date,
    location,
    venue_details,
    submission_start_date,
    submission_end_date,
    review_deadline,
    notification_date,
    theme_color,
    status,
    created_by
) VALUES (
    '2025 Hanyang Accounting Research Symposium',
    'Annual symposium for accounting research and innovation',
    '2025-06-15',
    'Seoul, South Korea',
    'Hanyang University, Business School Building',
    '2025-01-01 00:00:00',
    '2025-04-30 23:59:59',
    '2025-05-15 23:59:59',
    '2025-05-31 23:59:59',
    '#1a73e8',
    'upcoming',
    (SELECT id FROM users WHERE email = 'admin@hanyanghars.com')
);

COMMENT ON DATABASE hars_db IS 'Hanyang Accounting Research Symposium Database';
