import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

// POST /api/auth/register - Register new user
router.post('/register', AuthController.register);

// POST /api/auth/login - Login user
router.post('/login', AuthController.login);

// POST /api/auth/verify-email - Verify email with token
router.post('/verify-email', AuthController.verifyEmail);

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', AuthController.forgotPassword);

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', AuthController.resetPassword);

// POST /api/auth/resend-verification - Resend verification email
router.post('/resend-verification', AuthController.resendVerification);

export default router;
