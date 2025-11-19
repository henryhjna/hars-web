import type { Response, NextFunction } from 'express';
import { ReviewModel, ReviewAssignmentModel } from '../models/review.model';
import { SubmissionModel } from '../models/submission.model';
import { EventModel } from '../models/event.model';
import { UserModel } from '../models/user.model';
import type { AuthRequest } from '../types';
import { ApiError } from '../types';
import { sendReviewerAssignmentEmail } from '../services/email.service';

export class ReviewController {
  // Get reviewer's assigned submissions
  static async getMyAssignments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reviewerId = req.user!.id;
      const assignments = await ReviewAssignmentModel.findByReviewer(reviewerId);

      res.json({
        success: true,
        data: assignments,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get review by submission (for reviewer)
  static async getMyReviewForSubmission(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { submissionId } = req.params;
      const reviewerId = req.user!.id;

      // Check if reviewer is assigned
      const isAssigned = await ReviewAssignmentModel.isAssigned(submissionId, reviewerId);
      if (!isAssigned) {
        throw new ApiError('You are not assigned to review this submission', 403);
      }

      const reviews = await ReviewModel.findBySubmission(submissionId);
      const myReview = reviews.find((r) => r.reviewer_id === reviewerId);

      res.json({
        success: true,
        data: myReview || null,
      });
    } catch (error) {
      next(error);
    }
  }

  // Submit or update review
  static async submitReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { submissionId } = req.params;
      const reviewerId = req.user!.id;

      // Check if reviewer is assigned
      const isAssigned = await ReviewAssignmentModel.isAssigned(submissionId, reviewerId);
      if (!isAssigned) {
        throw new ApiError('You are not assigned to review this submission', 403);
      }

      const reviewData = {
        submission_id: submissionId,
        reviewer_id: reviewerId,
        ...req.body,
      };

      const review = await ReviewModel.upsert(reviewData);

      // Update assignment status
      if (reviewData.is_completed) {
        const assignments = await ReviewAssignmentModel.findBySubmission(submissionId);
        const myAssignment = assignments.find((a) => a.reviewer_id === reviewerId);
        if (myAssignment) {
          await ReviewAssignmentModel.updateStatus(myAssignment.id, 'completed');
        }

        // Check if all reviewers have completed their reviews
        // After updating current reviewer's status, check if ALL assignments are completed
        const allCompleted = assignments.every((a) =>
          a.reviewer_id === reviewerId ? true : a.status === 'completed'
        );

        const submission = await SubmissionModel.findById(submissionId);
        if (submission) {
          if (allCompleted) {
            // All reviews completed - mark as needing admin decision
            await SubmissionModel.updateStatus(submissionId, 'review_complete');
          } else if (submission.status === 'submitted') {
            // First review submitted - mark as under review
            await SubmissionModel.updateStatus(submissionId, 'under_review');
          }
        }
      }

      res.json({
        success: true,
        data: review,
        message: reviewData.is_completed ? 'Review submitted successfully' : 'Review saved as draft',
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Get all reviews for a submission
  static async getSubmissionReviews(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { submissionId } = req.params;

      const reviews = await ReviewModel.findBySubmission(submissionId);
      const stats = await ReviewModel.getSubmissionStats(submissionId);

      res.json({
        success: true,
        data: {
          reviews,
          stats,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Assign reviewer to submission
  static async assignReviewer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { submissionId } = req.params;
      const { reviewer_id, due_date } = req.body;

      // Check if submission exists
      const submission = await SubmissionModel.findById(submissionId);
      if (!submission) {
        throw new ApiError('Submission not found', 404);
      }

      // Check if already assigned
      const isAssigned = await ReviewAssignmentModel.isAssigned(submissionId, reviewer_id);
      if (isAssigned) {
        throw new ApiError('Reviewer is already assigned to this submission', 400);
      }

      const assignment = await ReviewAssignmentModel.create({
        submission_id: submissionId,
        reviewer_id,
        assigned_by: req.user!.id,
        due_date: due_date ? new Date(due_date) : undefined,
      });

      // Update submission status to 'under_review' when first reviewer is assigned
      if (submission.status === 'submitted') {
        await SubmissionModel.updateStatus(submissionId, 'under_review');
      }

      // Send reviewer assignment email (don't block on failure)
      try {
        const [event, reviewer] = await Promise.all([
          EventModel.findById(submission.event_id),
          UserModel.findById(reviewer_id)
        ]);

        if (event && reviewer) {
          await sendReviewerAssignmentEmail(
            reviewer,
            submission,
            event,
            due_date ? new Date(due_date) : undefined
          );
        }
      } catch (emailError) {
        console.error('Failed to send reviewer assignment email:', emailError);
        // Continue - email failure should not block assignment
      }

      res.json({
        success: true,
        data: assignment,
        message: 'Reviewer assigned successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Remove reviewer assignment
  static async removeReviewerAssignment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { assignmentId } = req.params;

      await ReviewAssignmentModel.delete(assignmentId);

      res.json({
        success: true,
        message: 'Reviewer assignment removed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Get all assignments for a submission
  static async getSubmissionAssignments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { submissionId } = req.params;

      const assignments = await ReviewAssignmentModel.findBySubmission(submissionId);

      res.json({
        success: true,
        data: assignments,
      });
    } catch (error) {
      next(error);
    }
  }
}
