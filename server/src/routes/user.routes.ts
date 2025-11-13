import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Protected routes - require authentication
router.use(authenticate);

// GET /api/users/me - Get current user profile
router.get('/me', UserController.getMe);

// PUT /api/users/me - Update current user profile
router.put('/me', UserController.updateMe);

// PUT /api/users/me/password - Change password
router.put('/me/password', UserController.changePassword);

// Admin only routes
router.get('/', authorize('admin'), UserController.listUsers);
router.get('/:id', authorize('admin'), UserController.getUserById);
router.put('/:id/roles', authorize('admin'), UserController.updateUserRoles);

export default router;
