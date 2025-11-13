import { Router } from 'express';
import { SubmissionController } from '../controllers/submission.controller';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../config/upload';

const router = Router();

// All routes require authentication
router.use(authenticate);

// User routes
router.get('/my-submissions', SubmissionController.getUserSubmissions);
router.get('/:id', SubmissionController.getSubmission);
router.post('/', upload.single('pdf'), SubmissionController.createSubmission);
router.put('/:id', upload.single('pdf'), SubmissionController.updateSubmission);
router.delete('/:id', SubmissionController.deleteSubmission);

// Admin/Reviewer routes
router.get('/', authorize('admin', 'reviewer'), SubmissionController.getAllSubmissions);
router.get('/event/:eventId', authorize('admin', 'reviewer'), SubmissionController.getEventSubmissions);
router.get('/event/:eventId/stats', authorize('admin'), SubmissionController.getEventSubmissionStats);
router.patch('/:id/status', authorize('admin', 'reviewer'), SubmissionController.updateSubmissionStatus);

export default router;
