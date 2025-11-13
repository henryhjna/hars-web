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

export interface CommitteeMember {
  name: string;
  affiliation: string;
  area?: string;
  role?: string;
}

export interface VenueInfo {
  name?: string;
  address?: string;
  accessibility?: string[];
  contact?: string[];
}


export interface EventContent {
  overview?: string;
  practitioner_sessions?: string;
  submission_guidelines?: string;
  awards?: string;
  academic_committee?: CommitteeMember[];
  organizing_committee?: CommitteeMember[];
  venue_info?: VenueInfo;
}

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
  program_announcement_date?: string;
  registration_deadline?: string;
  theme_color: string;
  banner_image_url?: string;
  highlight_stats?: Record<string, string | number>;
  event_content?: EventContent;
  show_keynote: boolean;
  show_program: boolean;
  show_testimonials: boolean;
  show_photos: boolean;
  show_best_paper: boolean;
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
  program_announcement_date?: string;
  registration_deadline?: string;
  theme_color?: string;
  banner_image_url?: string;
  highlight_stats?: Record<string, string | number>;
  event_content?: EventContent;
  show_keynote?: boolean;
  show_program?: boolean;
  show_testimonials?: boolean;
  show_photos?: boolean;
  show_best_paper?: boolean;
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

// Past Events Types
export interface EventPhoto {
  id: string;
  event_id: string;
  photo_url: string;
  caption?: string;
  is_highlight: boolean;
  photo_order: number;
  uploaded_by?: string;
  uploaded_at: string;
}

export interface EventPhotoCreateData {
  event_id: string;
  photo_url: string;
  caption?: string;
  is_highlight?: boolean;
  photo_order?: number;
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
  created_at: string;
}

export interface KeynoteSpeakerCreateData {
  event_id: string;
  name: string;
  title?: string;
  affiliation?: string;
  bio?: string;
  photo_url?: string;
  presentation_title?: string;
  speaker_order?: number;
}

export interface Testimonial {
  id: string;
  event_id: string;
  author_name: string;
  author_affiliation?: string;
  testimonial_text: string;
  is_featured: boolean;
  created_at: string;
}

export interface TestimonialCreateData {
  event_id: string;
  author_name: string;
  author_affiliation?: string;
  testimonial_text: string;
  is_featured?: boolean;
}

// Conference Topics Types
export interface ConferenceTopic {
  id: string;
  event_id: string;
  topic_name: string;
  description?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}
