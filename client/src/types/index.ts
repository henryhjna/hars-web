export type UserRole = 'user' | 'admin' | 'reviewer';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  affiliation?: string;
  roles: UserRole[];
  is_email_verified: boolean;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role?: UserRole;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  affiliation?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    user: User;
  };
  error?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Event Types
export type EventStatus = 'upcoming' | 'ongoing' | 'past';

export interface Event {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  location?: string;
  venue_details?: string;
  submission_start_date: string;
  submission_end_date: string;
  review_deadline?: string;
  notification_date?: string;
  theme_color: string;
  banner_image_url?: string;
  status: EventStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EventCreateData {
  title: string;
  description?: string;
  event_date: string;
  location?: string;
  venue_details?: string;
  submission_start_date: string;
  submission_end_date: string;
  review_deadline?: string;
  notification_date?: string;
  theme_color?: string;
  banner_image_url?: string;
  status?: EventStatus;
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
  submitted_at?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  event_title?: string;
  event_date?: string;
}

export interface SubmissionCreateData {
  event_id: string;
  title: string;
  abstract: string;
  keywords: string[];
  corresponding_author: string;
  co_authors?: string;
  pdf: File;
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
  created_at: string;
  updated_at: string;
  // Joined fields
  reviewer_name?: string;
  submission_title?: string;
}

export interface ReviewAssignment {
  id: string;
  submission_id: string;
  reviewer_id: string;
  assigned_by: string;
  assigned_at: string;
  due_date?: string;
  status: ReviewAssignmentStatus;
  // Joined fields
  submission_title?: string;
  submission_abstract?: string;
  pdf_url?: string;
  event_title?: string;
  event_date?: string;
  review_completed?: boolean;
  review_score?: number;
  reviewer_name?: string;
  reviewer_email?: string;
}

export interface ReviewSubmitData {
  originality_score?: number;
  methodology_score?: number;
  clarity_score?: number;
  contribution_score?: number;
  strengths?: string;
  weaknesses?: string;
  comments_to_authors?: string;
  comments_to_committee?: string;
  recommendation?: ReviewRecommendation;
  is_completed: boolean;
}
