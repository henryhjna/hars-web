import { Router } from 'express';
import {
  createSpeaker,
  getEventSpeakers,
  updateSpeaker,
  deleteSpeaker,
} from '../controllers/keynoteSpeaker.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/event/:eventId', getEventSpeakers);

// Admin routes
router.post('/', authenticate, authorize('admin'), createSpeaker);
router.put('/:id', authenticate, authorize('admin'), updateSpeaker);
router.delete('/:id', authenticate, authorize('admin'), deleteSpeaker);

export default router;
