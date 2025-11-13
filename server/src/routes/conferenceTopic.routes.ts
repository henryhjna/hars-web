import express from 'express';
import { conferenceTopicController } from '../controllers/conferenceTopic.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/active', conferenceTopicController.getAllActive);
router.get('/event/:eventId', conferenceTopicController.getByEventId);

// Admin routes
router.post('/', authenticate, authorize('admin'), conferenceTopicController.create);
router.put('/:id', authenticate, authorize('admin'), conferenceTopicController.update);
router.delete('/:id', authenticate, authorize('admin'), conferenceTopicController.delete);

export default router;
