import { Request } from 'express';

// User Types
export type UserRole = 'user' | 'admin' | 'reviewer';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  affiliation?: string;
  roles: UserRole[];
  is_email_verified: boolean;
  email_verification_token?: string;
  reset_password_token?: string;
  reset_password_expires?: Date;
  is_migrated: boolean;
  must_reset_password: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  affiliation?: string;
  roles: UserRole[];
  is_email_verified: boolean;
  created_at: Date;
}

// Auth Types
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    roles: UserRole[];
  };
}

export interface RegisterInput {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  affiliation?: string;
}

export interface LoginInput {
  email: string;
  password: string;
  role?: UserRole;
}

export interface JWTPayload {
  id: string;
  email: string;
  roles: UserRole[];
}

// Event Types
export type EventStatus = 'upcoming' | 'ongoing' | 'past';

export interface CommitteeMember {
  name: string;
  affiliation: string;
  area?: string;
  role?: string;
}

export interface EventContent {
  overview?: string;
  practitioner_sessions?: string;
  submission_guidelines?: string;
  awards?: string;
  academic_committee?: CommitteeMember[];
  organizing_committee?: CommitteeMember[];
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  event_date: Date;
  location?: string;
  venue_details?: string;
  submission_start_date: Date;
  submission_end_date: Date;
  review_deadline?: Date;
  notification_date?: Date;
  program_announcement_date?: Date;
  registration_deadline?: Date;
  theme_color: string;
  banner_image_url?: string;
  highlight_stats?: Record<string, any>;
  event_content?: EventContent;
  show_keynote: boolean;
  show_program: boolean;
  show_testimonials: boolean;
  show_photos: boolean;
  show_best_paper: boolean;
  status: EventStatus;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface EventSession {
  id: string;
  event_id: string;
  session_title: string;
  session_time: string;
  session_description?: string;
  speaker_name?: string;
  session_type?: string;
  session_date?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  description?: string;
  created_at: Date;
}

export interface KeynoteSpeaker {
  id: string;
  event_id: string;
  name: string;
  title?: string;
  affiliation?: string;
  bio?: string;
  photo_url?: string;
  topic?: string;
  presentation_time?: string;
  display_order: number;
  created_at: Date;
}

// Submission Types
export type SubmissionStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'accepted'
  | 'rejected'
  | 'revision_requested';

export interface Submission {
  id: string;
  event_id: string;
  user_id: string;
  title: string;
  abstract: string;
  keywords: string[];
  corresponding_author: string;
  co_authors?: string;
  pdf_url: string;
  pdf_filename: string;
  pdf_size?: number;
  status: SubmissionStatus;
  submitted_at?: Date;
  is_best_paper: boolean;
  award_type?: string;
  created_at: Date;
  updated_at: Date;
}

// Review Types
export type ReviewRecommendation =
  | 'accept'
  | 'reject'
  | 'major_revision'
  | 'minor_revision';

export type ReviewAssignmentStatus = 'pending' | 'in_progress' | 'completed';

export interface Review {
  id: string;
  submission_id: string;
  reviewer_id: string;
  originality_score?: number;
  methodology_score?: number;
  clarity_score?: number;
  contribution_score?: number;
  overall_score?: number;
  strengths?: string;
  weaknesses?: string;
  comments_to_authors?: string;
  comments_to_committee?: string;
  recommendation?: ReviewRecommendation;
  is_completed: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ReviewAssignment {
  id: string;
  submission_id: string;
  reviewer_id: string;
  assigned_by: string;
  assigned_at: Date;
  due_date?: Date;
  status: ReviewAssignmentStatus;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error Types
export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}
