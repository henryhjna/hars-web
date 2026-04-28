import { Router } from 'express';
import {
  createPhoto,
  getEventPhotos,
  getHighlightPhotos,
  updatePhoto,
  deletePhoto,
} from '../controllers/eventPhoto.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';
import { imageUpload } from '../config/upload';

const router = Router();
const upload = imageUpload(2);

// Public routes
router.get('/event/:eventId', getEventPhotos);
router.get('/event/:eventId/highlights', getHighlightPhotos);

// Admin routes
router.post(
  '/',
  authenticate,
  authorize('admin' as UserRole),
  upload.single('photo'),
  createPhoto
);
router.put('/:id', authenticate, authorize('admin' as UserRole), updatePhoto);
router.delete('/:id', authenticate, authorize('admin' as UserRole), deletePhoto);

export default router;
