import api from './api';
import type { Review, ReviewAssignment, ReviewSubmitData, ApiResponse, User } from '../types';

class ReviewService {
  // Reviewer: Get my assignments
  async getMyAssignments(): Promise<ApiResponse<ReviewAssignment[]>> {
    const response = await api.get<ApiResponse<ReviewAssignment[]>>('/reviews/my-assignments');
    return response.data;
  }

  // Reviewer: Get my review for a submission
  async getMyReviewForSubmission(submissionId: string): Promise<ApiResponse<Review | null>> {
    const response = await api.get<ApiResponse<Review | null>>(
      `/reviews/submission/${submissionId}/my-review`
    );
    return response.data;
  }

  // Reviewer: Submit or update review
  async submitReview(
    submissionId: string,
    reviewData: ReviewSubmitData
  ): Promise<ApiResponse<Review>> {
    const response = await api.post<ApiResponse<Review>>(
      `/reviews/submission/${submissionId}`,
      reviewData
    );
    return response.data;
  }

  // Admin: Get all reviews for a submission
  async getSubmissionReviews(
    submissionId: string
  ): Promise<ApiResponse<{ reviews: Review[]; stats: any }>> {
    const response = await api.get<ApiResponse<{ reviews: Review[]; stats: any }>>(
      `/reviews/submission/${submissionId}/reviews`
    );
    return response.data;
  }

  // Admin: Get assignments for a submission
  async getSubmissionAssignments(submissionId: string): Promise<ApiResponse<ReviewAssignment[]>> {
    const response = await api.get<ApiResponse<ReviewAssignment[]>>(
      `/reviews/submission/${submissionId}/assignments`
    );
    return response.data;
  }

  // Admin: Assign reviewer to submission
  async assignReviewer(
    submissionId: string,
    reviewerId: string,
    dueDate?: string
  ): Promise<ApiResponse<ReviewAssignment>> {
    const response = await api.post<ApiResponse<ReviewAssignment>>(
      `/reviews/submission/${submissionId}/assign`,
      {
        reviewer_id: reviewerId,
        due_date: dueDate,
      }
    );
    return response.data;
  }

  // Admin: Remove reviewer assignment
  async removeReviewerAssignment(assignmentId: string): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`/reviews/assignment/${assignmentId}`);
    return response.data;
  }

  // Helper: Get reviewers (users with reviewer role)
  async getReviewers(): Promise<ApiResponse<User[]>> {
    const response = await api.get<ApiResponse<User[]>>('/users');
    if (response.data.success && response.data.data) {
      // Filter users with reviewer role
      const reviewers = response.data.data.filter((user: User) =>
        user.roles.includes('reviewer')
      );
      return { ...response.data, data: reviewers };
    }
    return response.data;
  }
}

export default new ReviewService();
