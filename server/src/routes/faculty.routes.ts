import { Router } from 'express';
import { FacultyController } from '../controllers/faculty.controller';
import { authenticate, authorize } from '../middleware/auth';
import { imageUpload } from '../config/upload';

const router = Router();
const upload = imageUpload(2);

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
