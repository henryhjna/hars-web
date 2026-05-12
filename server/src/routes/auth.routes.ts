import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

// Registration is dimensioned for group sign-ups: a hundred attendees from the
// same university often share a NAT IP during a session. The verify-email step
// + unique email constraint are the real abuse gates, not this limiter.
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 300,
  message: 'Too many registration attempts from this network. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Login stays strict — this is the real brute-force surface.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// Email-sending endpoints: the concern is mail flooding, not credential abuse.
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many password reset requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const resendVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many verification email requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Reset-password consumes a one-time token, so a loose limiter is fine.
const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many password reset attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/register - Register new user
router.post('/register', registerLimiter, AuthController.register);

// POST /api/auth/login - Login user
router.post('/login', loginLimiter, AuthController.login);

// POST /api/auth/verify-email - Verify email with token
router.post('/verify-email', AuthController.verifyEmail);

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', forgotPasswordLimiter, AuthController.forgotPassword);

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', resetPasswordLimiter, AuthController.resetPassword);

// POST /api/auth/resend-verification - Resend verification email
router.post('/resend-verification', resendVerificationLimiter, AuthController.resendVerification);

export default router;
