import { Router } from 'express';
import multer from 'multer';
import { EventController } from '../controllers/event.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Multer configuration for banner uploads (20MB limit)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  },
});

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
router.get('/:id/sessions', EventController.getSessions);
router.post('/:id/sessions', authenticate, authorize('admin'), EventController.addSession);
router.put('/:id/sessions/:sessionId', authenticate, authorize('admin'), EventController.updateSession);
router.delete('/:id/sessions/:sessionId', authenticate, authorize('admin'), EventController.deleteSession);
router.post('/:id/speakers', authenticate, authorize('admin'), EventController.addKeynoteSpeaker);

// Admin routes - statistics
router.get('/:id/stats', authenticate, authorize('admin'), EventController.getEventStats);

// Admin routes - banner upload
router.post('/:id/banner', authenticate, authorize('admin'), upload.single('banner'), EventController.uploadBanner);

export default router;
