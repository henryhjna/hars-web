import { Response } from 'express';
import { AuthRequest, ApiError } from '../types';
import { UserModel } from '../models/user.model';
import { hashPassword, validatePassword } from '../utils/password';
import { uploadProfilePhotoToS3, deletePhotoFromS3 } from '../utils/s3Upload';

export class UserController {
  // GET /api/users/me - Get current user profile
  static async getMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError('Authentication required', 401);
      }

      const user = await UserModel.findById(req.user.id);
      if (!user) {
        throw new ApiError('User not found', 404);
      }

      res.json({
        success: true,
        data: UserModel.sanitize(user),
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        console.error('Get me error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get user profile',
        });
      }
    }
  }

  // PUT /api/users/me - Update current user profile
  static async updateMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError('Authentication required', 401);
      }

      const {
        first_name,
        last_name,
        preferred_name,
        prefix,
        academic_title,
        affiliation,
        photo_url
      } = req.body;

      const updatedUser = await UserModel.updateProfile(req.user.id, {
        first_name,
        last_name,
        preferred_name,
        prefix,
        academic_title,
        affiliation,
        photo_url,
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: UserModel.sanitize(updatedUser),
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        console.error('Update me error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to update profile',
        });
      }
    }
  }

  // POST /api/users/me/photo - Upload profile photo
  static async uploadPhoto(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError('Authentication required', 401);
      }

      if (!req.file) {
        throw new ApiError('No file uploaded', 400);
      }

      // Get current user
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        throw new ApiError('User not found', 404);
      }

      // Delete old photo from S3 if exists
      if (user.photo_url) {
        try {
          await deletePhotoFromS3(user.photo_url);
        } catch (error) {
          console.error('Failed to delete old photo from S3:', error);
          // Continue even if deletion fails
        }
      }

      // Upload new photo to S3
      const photoUrl = await uploadProfilePhotoToS3(req.file);

      // Update user photo URL in database
      const updatedUser = await UserModel.updateProfile(req.user.id, {
        photo_url: photoUrl,
      });

      res.json({
        success: true,
        message: 'Profile photo uploaded successfully',
        data: {
          photo_url: photoUrl,
          user: UserModel.sanitize(updatedUser),
        },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        console.error('Upload photo error:', error);
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to upload photo',
        });
      }
    }
  }

  // DELETE /api/users/me/photo - Delete profile photo
  static async deletePhoto(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError('Authentication required', 401);
      }

      // Get current user
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        throw new ApiError('User not found', 404);
      }

      if (!user.photo_url) {
        throw new ApiError('No profile photo to delete', 400);
      }

      // Delete photo from S3
      try {
        await deletePhotoFromS3(user.photo_url);
      } catch (error) {
        console.error('Failed to delete photo from S3:', error);
        // Continue to update database even if S3 deletion fails
      }

      // Remove photo URL from database
      const updatedUser = await UserModel.updateProfile(req.user.id, {
        photo_url: null,
      });

      res.json({
        success: true,
        message: 'Profile photo deleted successfully',
        data: UserModel.sanitize(updatedUser),
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        console.error('Delete photo error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to delete photo',
        });
      }
    }
  }

  // PUT /api/users/me/password - Change password
  static async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError('Authentication required', 401);
      }

      const { current_password, new_password } = req.body;

      if (!current_password || !new_password) {
        throw new ApiError('Current and new password are required', 400);
      }

      const passwordValidation = validatePassword(new_password);
      if (!passwordValidation.valid) {
        throw new ApiError(passwordValidation.message!, 400);
      }

      const user = await UserModel.findById(req.user.id);
      if (!user) {
        throw new ApiError('User not found', 404);
      }

      // Verify current password
      const bcrypt = require('bcryptjs');
      const isValid = await bcrypt.compare(current_password, user.password_hash);
      if (!isValid) {
        throw new ApiError('Current password is incorrect', 401);
      }

      // Hash new password
      const password_hash = await hashPassword(new_password);

      // Update password
      await UserModel.resetPassword(user.id, password_hash);

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        console.error('Change password error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to change password',
        });
      }
    }
  }

  // GET /api/users - List all users (admin only)
  static async listUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError('Authentication required', 401);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const role = req.query.role as any;

      const { users, total } = await UserModel.list({ page, limit, role });

      res.json({
        success: true,
        data: users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        console.error('List users error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to list users',
        });
      }
    }
  }

  // GET /api/users/:id - Get user by ID (admin only)
  static async getUserById(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError('Authentication required', 401);
      }

      const { id } = req.params;

      const user = await UserModel.findById(id);
      if (!user) {
        throw new ApiError('User not found', 404);
      }

      res.json({
        success: true,
        data: UserModel.sanitize(user),
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        console.error('Get user error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get user',
        });
      }
    }
  }

  // PUT /api/users/:id/roles - Update user roles (admin only)
  static async updateUserRoles(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError('Authentication required', 401);
      }

      const { id } = req.params;
      const { action, role, roles } = req.body;

      // Support two formats:
      // 1. { action: 'add/remove', role: 'user' } - add/remove single role
      // 2. { roles: ['user', 'admin'] } - replace all roles

      if (roles) {
        // Format 2: Replace all roles
        if (!Array.isArray(roles)) {
          throw new ApiError('Roles must be an array', 400);
        }

        if (roles.length === 0) {
          throw new ApiError('User must have at least one role', 400);
        }

        const validRoles = ['user', 'admin', 'reviewer'];
        const invalidRoles = roles.filter((r: string) => !validRoles.includes(r));
        if (invalidRoles.length > 0) {
          throw new ApiError(`Invalid roles: ${invalidRoles.join(', ')}`, 400);
        }

        const user = await UserModel.findById(id);
        if (!user) {
          throw new ApiError('User not found', 404);
        }

        await UserModel.updateRoles(id, roles);
      } else {
        // Format 1: Add/remove single role
        if (!action || !role) {
          throw new ApiError('Action and role are required', 400);
        }

        if (!['add', 'remove'].includes(action)) {
          throw new ApiError('Action must be either add or remove', 400);
        }

        if (!['user', 'admin', 'reviewer'].includes(role)) {
          throw new ApiError('Invalid role', 400);
        }

        const user = await UserModel.findById(id);
        if (!user) {
          throw new ApiError('User not found', 404);
        }

        if (action === 'add') {
          await UserModel.addRole(id, role);
        } else {
          // Ensure user has at least one role
          if (user.roles.length === 1 && user.roles[0] === role) {
            throw new ApiError('User must have at least one role', 400);
          }
          await UserModel.removeRole(id, role);
        }
      }

      const updatedUser = await UserModel.findById(id);

      res.json({
        success: true,
        message: roles ? 'Roles updated successfully' : `Role ${action === 'add' ? 'added' : 'removed'} successfully`,
        data: UserModel.sanitize(updatedUser!),
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        console.error('Update user roles error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to update user roles',
        });
      }
    }
  }
}
