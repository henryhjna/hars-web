import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

// Rate limiter for auth endpoints - 5 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for login - stricter limit
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per window
  message: 'Too many login attempts. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

// POST /api/auth/register - Register new user
router.post('/register', authLimiter, AuthController.register);

// POST /api/auth/login - Login user
router.post('/login', loginLimiter, AuthController.login);

// POST /api/auth/verify-email - Verify email with token
router.post('/verify-email', AuthController.verifyEmail);

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', authLimiter, AuthController.forgotPassword);

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', authLimiter, AuthController.resetPassword);

// POST /api/auth/resend-verification - Resend verification email
router.post('/resend-verification', authLimiter, AuthController.resendVerification);

export default router;
