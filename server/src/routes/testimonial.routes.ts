import { Router } from 'express';
import {
  createTestimonial,
  getEventTestimonials,
  getFeaturedTestimonials,
  updateTestimonial,
  deleteTestimonial,
} from '../controllers/testimonial.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/event/:eventId', getEventTestimonials);
router.get('/event/:eventId/featured', getFeaturedTestimonials);

// Admin routes
router.post('/', authenticate, authorize('admin'), createTestimonial);
router.put('/:id', authenticate, authorize('admin'), updateTestimonial);
router.delete('/:id', authenticate, authorize('admin'), deleteTestimonial);

export default router;
