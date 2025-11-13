import { Router } from 'express';
import multer from 'multer';
import {
  createPhoto,
  getEventPhotos,
  getHighlightPhotos,
  updatePhoto,
  deletePhoto,
} from '../controllers/eventPhoto.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
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
