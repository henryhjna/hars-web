import { Response } from 'express';
import { FacultyModel } from '../models/faculty.model';
import { uploadFacultyPhotoToS3, deletePhotoFromS3 } from '../utils/s3Upload';
import type { AuthRequest } from '../types';

export class FacultyController {
  // Get all faculty members
  static async getAll(req: AuthRequest, res: Response) {
    try {
      const activeOnly = req.query.active === 'true';
      const faculty = await FacultyModel.getAll(activeOnly);
      res.json({ success: true, data: faculty });
    } catch (error) {
      console.error('Error fetching faculty:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch faculty members' });
    }
  }

  // Get single faculty member
  static async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const faculty = await FacultyModel.getById(id);

      if (!faculty) {
        return res.status(404).json({ success: false, error: 'Faculty member not found' });
      }

      res.json({ success: true, data: faculty });
    } catch (error) {
      console.error('Error fetching faculty:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch faculty member' });
    }
  }

  // Create faculty member (admin only)
  static async create(req: AuthRequest, res: Response) {
    try {
      const faculty = await FacultyModel.create(req.body);
      res.status(201).json({ success: true, data: faculty });
    } catch (error) {
      console.error('Error creating faculty:', error);
      res.status(500).json({ success: false, error: 'Failed to create faculty member' });
    }
  }

  // Update faculty member (admin only)
  static async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const faculty = await FacultyModel.update(id, req.body);

      if (!faculty) {
        return res.status(404).json({ success: false, error: 'Faculty member not found' });
      }

      res.json({ success: true, data: faculty });
    } catch (error) {
      console.error('Error updating faculty:', error);
      res.status(500).json({ success: false, error: 'Failed to update faculty member' });
    }
  }

  // Delete faculty member (admin only)
  static async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const success = await FacultyModel.delete(id);

      if (!success) {
        return res.status(404).json({ success: false, error: 'Faculty member not found' });
      }

      res.json({ success: true, message: 'Faculty member deleted successfully' });
    } catch (error) {
      console.error('Error deleting faculty:', error);
      res.status(500).json({ success: false, error: 'Failed to delete faculty member' });
    }
  }

  // Upload faculty photo (admin only)
  static async uploadPhoto(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!req.file) {
        res.status(400).json({ success: false, error: 'No file uploaded' });
        return;
      }

      // Get current faculty member
      const faculty = await FacultyModel.getById(id);
      if (!faculty) {
        res.status(404).json({ success: false, error: 'Faculty member not found' });
        return;
      }

      // Delete old photo from S3 if exists
      if (faculty.photo_url) {
        try {
          await deletePhotoFromS3(faculty.photo_url);
        } catch (error) {
          console.error('Failed to delete old photo from S3:', error);
          // Continue even if deletion fails
        }
      }

      // Upload new photo to S3
      const photoUrl = await uploadFacultyPhotoToS3(req.file);

      // Update faculty photo URL in database
      const updatedFaculty = await FacultyModel.update(id, {
        photo_url: photoUrl,
      });

      res.json({
        success: true,
        message: 'Faculty photo uploaded successfully',
        data: {
          photo_url: photoUrl,
          faculty: updatedFaculty,
        },
      });
    } catch (error) {
      console.error('Upload photo error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload photo',
      });
    }
  }

  // Delete faculty photo (admin only)
  static async deletePhoto(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Get current faculty member
      const faculty = await FacultyModel.getById(id);
      if (!faculty) {
        res.status(404).json({ success: false, error: 'Faculty member not found' });
        return;
      }

      if (!faculty.photo_url) {
        res.status(400).json({ success: false, error: 'No photo to delete' });
        return;
      }

      // Delete photo from S3
      try {
        await deletePhotoFromS3(faculty.photo_url);
      } catch (error) {
        console.error('Failed to delete photo from S3:', error);
        // Continue to update database even if S3 deletion fails
      }

      // Remove photo URL from database
      const updatedFaculty = await FacultyModel.update(id, {
        photo_url: null,
      });

      res.json({
        success: true,
        message: 'Faculty photo deleted successfully',
        data: updatedFaculty,
      });
    } catch (error) {
      console.error('Delete photo error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete photo',
      });
    }
  }
}
