import { Response, NextFunction } from 'express';
import { SubmissionModel } from '../models/submission.model';
import { EventModel } from '../models/event.model';
import { AuthRequest } from '../types';
import { ApiError } from '../types';
import path from 'path';
import { deleteFile } from '../config/upload';

export class SubmissionController {
  // Get all submissions (admin/reviewer only)
  static async getAllSubmissions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const submissions = await SubmissionModel.findAll();
      res.json({ success: true, data: submissions });
    } catch (error) {
      next(error);
    }
  }

  // Get submissions by event
  static async getEventSubmissions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params;

      const submissions = await SubmissionModel.findByEvent(eventId);
      res.json({ success: true, data: submissions });
    } catch (error) {
      next(error);
    }
  }

  // Get user's own submissions
  static async getUserSubmissions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const submissions = await SubmissionModel.findByUser(userId);
      res.json({ success: true, data: submissions });
    } catch (error) {
      next(error);
    }
  }

  // Get submission by ID
  static async getSubmission(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const submission = await SubmissionModel.findByIdWithDetails(id);

      if (!submission) {
        throw new ApiError(404, 'Submission not found');
      }

      // Check permissions: owner, admin, or reviewer can view
      const isOwner = submission.user_id === req.user!.id;
      const isAdmin = req.user!.roles.includes('admin');
      const isReviewer = req.user!.roles.includes('reviewer');

      if (!isOwner && !isAdmin && !isReviewer) {
        throw new ApiError(403, 'You do not have permission to view this submission');
      }

      res.json({ success: true, data: submission });
    } catch (error) {
      next(error);
    }
  }

  // Create submission with file upload
  static async createSubmission(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const {
        event_id,
        title,
        abstract,
        keywords,
        corresponding_author,
        co_authors,
        status,
      } = req.body;

      // Validate required fields
      if (!event_id || !title || !abstract || !corresponding_author) {
        throw new ApiError(400, 'Missing required fields');
      }

      // Check if file was uploaded
      if (!req.file) {
        throw new ApiError(400, 'PDF file is required');
      }

      // Check if event exists and is accepting submissions
      const event = await EventModel.findById(event_id);
      if (!event) {
        throw new ApiError(404, 'Event not found');
      }

      // Check if user can submit
      const canSubmit = await SubmissionModel.canUserSubmit(req.user!.id, event_id);
      if (!canSubmit) {
        // Delete uploaded file
        deleteFile(req.file.path);
        throw new ApiError(400, 'You cannot submit to this event at this time');
      }

      // Parse keywords if it's a string
      let keywordsArray = keywords;
      if (typeof keywords === 'string') {
        keywordsArray = keywords.split(',').map((k: string) => k.trim());
      }

      // Create submission
      const submission = await SubmissionModel.create({
        event_id,
        user_id: req.user!.id,
        title,
        abstract,
        keywords: keywordsArray,
        corresponding_author,
        co_authors: co_authors || null,
        pdf_url: `/uploads/${req.file.filename}`,
        pdf_filename: req.file.originalname,
        pdf_size: req.file.size,
        status: status || 'submitted',
      });

      res.status(201).json({
        success: true,
        message: 'Submission created successfully',
        data: submission,
      });
    } catch (error) {
      // Delete uploaded file if submission creation failed
      if (req.file) {
        deleteFile(req.file.path);
      }
      next(error);
    }
  }

  // Update submission
  static async updateSubmission(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const {
        title,
        abstract,
        keywords,
        corresponding_author,
        co_authors,
        status,
      } = req.body;

      // Check if submission exists
      const existingSubmission = await SubmissionModel.findById(id);
      if (!existingSubmission) {
        if (req.file) {
          deleteFile(req.file.path);
        }
        throw new ApiError(404, 'Submission not found');
      }

      // Check permissions: only owner can update (unless admin)
      const isOwner = existingSubmission.user_id === req.user!.id;
      const isAdmin = req.user!.roles.includes('admin');

      if (!isOwner && !isAdmin) {
        if (req.file) {
          deleteFile(req.file.path);
        }
        throw new ApiError(403, 'You do not have permission to update this submission');
      }

      // Prepare update data
      const updateData: any = {
        title,
        abstract,
        keywords: typeof keywords === 'string' ? keywords.split(',').map((k: string) => k.trim()) : keywords,
        corresponding_author,
        co_authors,
        status,
      };

      // If new file uploaded, update file info
      if (req.file) {
        // Delete old file
        const oldFilePath = path.join(__dirname, '../../', existingSubmission.pdf_url);
        deleteFile(oldFilePath);

        updateData.pdf_url = `/uploads/${req.file.filename}`;
        updateData.pdf_filename = req.file.originalname;
        updateData.pdf_size = req.file.size;
      }

      const updatedSubmission = await SubmissionModel.update(id, updateData);

      res.json({
        success: true,
        message: 'Submission updated successfully',
        data: updatedSubmission,
      });
    } catch (error) {
      if (req.file) {
        deleteFile(req.file.path);
      }
      next(error);
    }
  }

  // Update submission status (admin/reviewer only)
  static async updateSubmissionStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        throw new ApiError(400, 'Status is required');
      }

      const submission = await SubmissionModel.findById(id);
      if (!submission) {
        throw new ApiError(404, 'Submission not found');
      }

      const updatedSubmission = await SubmissionModel.updateStatus(id, status);

      res.json({
        success: true,
        message: 'Submission status updated successfully',
        data: updatedSubmission,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete submission
  static async deleteSubmission(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const submission = await SubmissionModel.findById(id);
      if (!submission) {
        throw new ApiError(404, 'Submission not found');
      }

      // Check permissions
      const isOwner = submission.user_id === req.user!.id;
      const isAdmin = req.user!.roles.includes('admin');

      if (!isOwner && !isAdmin) {
        throw new ApiError(403, 'You do not have permission to delete this submission');
      }

      // Delete file
      const filePath = path.join(__dirname, '../../', submission.pdf_url);
      deleteFile(filePath);

      // Delete submission
      await SubmissionModel.delete(id);

      res.json({
        success: true,
        message: 'Submission deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Get submission statistics for an event (admin only)
  static async getEventSubmissionStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params;

      const event = await EventModel.findById(eventId);
      if (!event) {
        throw new ApiError(404, 'Event not found');
      }

      const counts = await SubmissionModel.getCountByStatus(eventId);
      const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

      res.json({
        success: true,
        data: {
          event_id: eventId,
          event_title: event.title,
          total_submissions: total,
          by_status: counts,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
