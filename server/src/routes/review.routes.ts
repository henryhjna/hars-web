import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Reviewer routes
router.get('/my-assignments', authorize('reviewer'), ReviewController.getMyAssignments);
router.get('/submission/:submissionId/my-review', authorize('reviewer'), ReviewController.getMyReviewForSubmission);
router.post('/submission/:submissionId', authorize('reviewer'), ReviewController.submitReview);

// Admin routes - view all reviews
router.get('/submission/:submissionId/reviews', authorize('admin'), ReviewController.getSubmissionReviews);
router.get('/submission/:submissionId/assignments', authorize('admin'), ReviewController.getSubmissionAssignments);
router.post('/submission/:submissionId/assign', authorize('admin'), ReviewController.assignReviewer);
router.delete('/assignment/:assignmentId', authorize('admin'), ReviewController.removeReviewerAssignment);

export default router;
