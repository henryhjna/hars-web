import { Router } from 'express';
import { FacultyController } from '../controllers/faculty.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', FacultyController.getAll);
router.get('/:id', FacultyController.getById);

// Admin-only routes
router.post('/', authenticate, authorize(['admin']), FacultyController.create);
router.put('/:id', authenticate, authorize(['admin']), FacultyController.update);
router.delete('/:id', authenticate, authorize(['admin']), FacultyController.delete);

export default router;
