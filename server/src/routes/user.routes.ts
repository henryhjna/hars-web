import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';
import { imageUpload } from '../config/upload';

const router = Router();
const upload = imageUpload(2);

// Protected routes - require authentication
router.use(authenticate);

// GET /api/users/me - Get current user profile
router.get('/me', UserController.getMe);

// PUT /api/users/me - Update current user profile
router.put('/me', UserController.updateMe);

// POST /api/users/me/photo - Upload profile photo
router.post('/me/photo', upload.single('photo'), UserController.uploadPhoto);

// DELETE /api/users/me/photo - Delete profile photo
router.delete('/me/photo', UserController.deletePhoto);

// PUT /api/users/me/password - Change password
router.put('/me/password', UserController.changePassword);

// Admin only routes
router.get('/', authorize('admin'), UserController.listUsers);
router.get('/stats', authorize('admin'), UserController.getUserStats);
router.get('/:id', authorize('admin'), UserController.getUserById);
router.put('/:id/verify-email', authorize('admin'), UserController.verifyUserEmail);
router.put('/:id/roles', authorize('admin'), UserController.updateUserRoles);
router.delete('/:id', authorize('admin'), UserController.deleteUser);

export default router;
