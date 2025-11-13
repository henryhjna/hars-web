import { Router } from 'express';
import { EventController } from '../controllers/event.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', EventController.getAllEvents);
router.get('/upcoming', EventController.getUpcomingEvents);
router.get('/past', EventController.getPastEvents);
router.get('/:idOrSlug', EventController.getEvent);

// Admin routes
router.post('/', authenticate, authorize('admin'), EventController.createEvent);
router.put('/:id', authenticate, authorize('admin'), EventController.updateEvent);
router.delete('/:id', authenticate, authorize('admin'), EventController.deleteEvent);

// Admin routes - sessions and speakers
router.post('/:id/sessions', authenticate, authorize('admin'), EventController.addSession);
router.post('/:id/speakers', authenticate, authorize('admin'), EventController.addKeynoteSpeaker);

// Admin routes - statistics
router.get('/:id/stats', authenticate, authorize('admin'), EventController.getEventStats);

export default router;
