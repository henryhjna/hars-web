import { Router } from 'express';
import multer from 'multer';
import { UserController } from '../controllers/user.controller';
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
router.get('/:id', authorize('admin'), UserController.getUserById);
router.put('/:id/verify-email', authorize('admin'), UserController.verifyUserEmail);
router.put('/:id/roles', authorize('admin'), UserController.updateUserRoles);
router.delete('/:id', authorize('admin'), UserController.deleteUser);

export default router;
