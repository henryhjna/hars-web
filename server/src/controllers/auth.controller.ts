import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import { hashPassword, comparePassword, validatePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { validateEmail, generateRandomToken } from '../utils/validation';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from '../services/email.service';
import { ApiError, RegisterInput, LoginInput } from '../types';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, first_name, last_name, affiliation }: RegisterInput =
        req.body;

      // Validation
      if (!email || !password || !first_name || !last_name) {
        throw new ApiError('All required fields must be provided', 400);
      }

      if (!validateEmail(email)) {
        throw new ApiError('Invalid email format', 400);
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        throw new ApiError(passwordValidation.message!, 400);
      }

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        throw new ApiError('Email already registered', 409);
      }

      // Hash password and generate verification token
      const password_hash = await hashPassword(password);
      const email_verification_token = generateRandomToken(32);

      // Create user
      const user = await UserModel.create({
        email,
        password_hash,
        first_name,
        last_name,
        affiliation,
        email_verification_token,
      });

      // Send verification email
      try {
        await sendVerificationEmail(user, email_verification_token);
      } catch (error) {
        console.error('Failed to send verification email:', error);
        // Continue even if email fails
      }

      res.status(201).json({
        success: true,
        message:
          'Registration successful. Please check your email to verify your account.',
        data: UserModel.sanitize(user),
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        console.error('Register error:', error);
        res.status(500).json({
          success: false,
          error: 'Registration failed',
        });
      }
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, role }: LoginInput = req.body;

      if (!email || !password) {
        throw new ApiError('Email and password are required', 400);
      }

      // Find user
      const user = await UserModel.findByEmail(email);
      if (!user) {
        throw new ApiError('Invalid email or password', 401);
      }

      // Check password
      const isPasswordValid = await comparePassword(password, user.password_hash);
      if (!isPasswordValid) {
        throw new ApiError('Invalid email or password', 401);
      }

      // Check if email is verified
      if (!user.is_email_verified) {
        throw new ApiError('Please verify your email before logging in', 403);
      }

      // Check if user must reset password (migrated users)
      if (user.must_reset_password) {
        throw new ApiError('You must reset your password before logging in', 403);
      }

      // If role is specified, check if user has that role
      if (role && !user.roles.includes(role)) {
        throw new ApiError(`You do not have ${role} access`, 403);
      }

      // Generate JWT token
      const token = generateToken({
        id: user.id,
        email: user.email,
        roles: user.roles,
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: UserModel.sanitize(user),
        },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        console.error('Login error:', error);
        res.status(500).json({
          success: false,
          error: 'Login failed',
        });
      }
    }
  }

  static async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        throw new ApiError('Verification token is required', 400);
      }

      const user = await UserModel.findByVerificationToken(token);
      if (!user) {
        throw new ApiError('Invalid or expired verification token', 400);
      }

      if (user.is_email_verified) {
        throw new ApiError('Email is already verified', 400);
      }

      // Verify email
      await UserModel.verifyEmail(user.id);

      // Send welcome email
      try {
        await sendWelcomeEmail(user);
      } catch (error) {
        console.error('Failed to send welcome email:', error);
      }

      res.json({
        success: true,
        message: 'Email verified successfully. You can now log in.',
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        console.error('Verify email error:', error);
        res.status(500).json({
          success: false,
          error: 'Email verification failed',
        });
      }
    }
  }

  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        throw new ApiError('Email is required', 400);
      }

      const user = await UserModel.findByEmail(email);
      if (!user) {
        // Don't reveal if user exists
        res.json({
          success: true,
          message: 'If the email exists, a password reset link has been sent.',
        });
        return;
      }

      // Generate reset token (expires in 1 hour)
      const resetToken = generateRandomToken(32);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await UserModel.setResetPasswordToken(user.id, resetToken, expiresAt);

      // Send reset email
      try {
        await sendPasswordResetEmail(user, resetToken);
      } catch (error) {
        console.error('Failed to send password reset email:', error);
        throw new ApiError('Failed to send reset email', 500);
      }

      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent.',
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        console.error('Forgot password error:', error);
        res.status(500).json({
          success: false,
          error: 'Password reset request failed',
        });
      }
    }
  }

  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        throw new ApiError('Token and new password are required', 400);
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        throw new ApiError(passwordValidation.message!, 400);
      }

      const user = await UserModel.findByResetToken(token);
      if (!user) {
        throw new ApiError('Invalid or expired reset token', 400);
      }

      // Hash new password
      const password_hash = await hashPassword(password);

      // Reset password
      await UserModel.resetPassword(user.id, password_hash);

      res.json({
        success: true,
        message: 'Password reset successful. You can now log in with your new password.',
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        console.error('Reset password error:', error);
        res.status(500).json({
          success: false,
          error: 'Password reset failed',
        });
      }
    }
  }

  static async resendVerification(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        throw new ApiError('Email is required', 400);
      }

      const user = await UserModel.findByEmail(email);
      if (!user) {
        // Don't reveal if user exists
        res.json({
          success: true,
          message: 'If the email exists, a verification email has been sent.',
        });
        return;
      }

      if (user.is_email_verified) {
        throw new ApiError('Email is already verified', 400);
      }

      // Generate new verification token if needed
      let token = user.email_verification_token;
      if (!token) {
        token = generateRandomToken(32);
        await UserModel.setResetPasswordToken(
          user.id,
          token,
          new Date(Date.now() + 24 * 60 * 60 * 1000)
        );
      }

      // Send verification email
      try {
        await sendVerificationEmail(user, token);
      } catch (error) {
        console.error('Failed to send verification email:', error);
        throw new ApiError('Failed to send verification email', 500);
      }

      res.json({
        success: true,
        message: 'Verification email sent.',
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        console.error('Resend verification error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to resend verification email',
        });
      }
    }
  }
}
