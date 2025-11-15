import { Router } from 'express';
import multer from 'multer';
import { FacultyController } from '../controllers/faculty.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Multer configuration for photo upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
    }
  },
});

// Public routes
router.get('/', FacultyController.getAll);
router.get('/:id', FacultyController.getById);

// Admin-only routes
router.post('/', authenticate, authorize('admin'), FacultyController.create);
router.put('/:id', authenticate, authorize('admin'), FacultyController.update);
router.delete('/:id', authenticate, authorize('admin'), FacultyController.delete);

// Photo upload routes (admin only)
router.post('/:id/photo', authenticate, authorize('admin'), upload.single('photo'), FacultyController.uploadPhoto);
router.delete('/:id/photo', authenticate, authorize('admin'), FacultyController.deletePhoto);

export default router;
