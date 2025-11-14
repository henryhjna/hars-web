import { Response, NextFunction } from 'express';
import { SubmissionModel } from '../models/submission.model';
import { EventModel } from '../models/event.model';
import { AuthRequest } from '../types';
import { ApiError } from '../types';
import { uploadPdfToS3, deletePhotoFromS3 } from '../utils/s3Upload';

export class SubmissionController {
  // Get all submissions with pagination (admin/reviewer only)
  static async getAllSubmissions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const isAdmin = req.user!.roles.includes('admin');
      const isReviewer = req.user!.roles.includes('reviewer');

      if (!isAdmin && !isReviewer) {
        throw new ApiError('Unauthorized access', 403);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      // Admins see all submissions with pagination
      if (isAdmin) {
        const { submissions, total } = await SubmissionModel.findAll(page, limit);
        return res.json({
          success: true,
          data: submissions,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        });
      }

      // Reviewers only see submissions they're assigned to (no pagination for now)
      const submissions = await SubmissionModel.findByReviewer(req.user!.id);
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
        throw new ApiError('Submission not found', 404);
      }

      // Check permissions: owner, admin, or reviewer can view
      const isOwner = submission.user_id === req.user!.id;
      const isAdmin = req.user!.roles.includes('admin');
      const isReviewer = req.user!.roles.includes('reviewer');

      if (!isOwner && !isAdmin && !isReviewer) {
        throw new ApiError('You do not have permission to view this submission', 403);
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
        throw new ApiError('Missing required fields', 400);
      }

      // Check if file was uploaded
      if (!req.file) {
        throw new ApiError('PDF file is required', 400);
      }

      // Check if event exists and is accepting submissions
      const event = await EventModel.findById(event_id);
      if (!event) {
        throw new ApiError('Event not found', 404);
      }

      // Check if user can submit
      const canSubmit = await SubmissionModel.canUserSubmit(req.user!.id, event_id);
      if (!canSubmit) {
        throw new ApiError('You cannot submit to this event at this time', 400);
      }

      // Parse keywords if it's a string
      let keywordsArray = keywords;
      if (typeof keywords === 'string') {
        keywordsArray = keywords.split(',').map((k: string) => k.trim());
      }

      // Upload PDF to S3
      const pdfUrl = await uploadPdfToS3(req.file);

      // Create submission
      const submission = await SubmissionModel.create({
        event_id,
        user_id: req.user!.id,
        title,
        abstract,
        keywords: keywordsArray,
        corresponding_author,
        co_authors: co_authors || null,
        pdf_url: pdfUrl,
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
        throw new ApiError('Submission not found', 404);
      }

      // Check permissions: only owner can update (unless admin)
      const isOwner = existingSubmission.user_id === req.user!.id;
      const isAdmin = req.user!.roles.includes('admin');

      if (!isOwner && !isAdmin) {
        throw new ApiError('You do not have permission to update this submission', 403);
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
        // Delete old PDF from S3
        if (existingSubmission.pdf_url.startsWith('https://')) {
          await deletePhotoFromS3(existingSubmission.pdf_url);
        }

        // Upload new PDF to S3
        const pdfUrl = await uploadPdfToS3(req.file);
        updateData.pdf_url = pdfUrl;
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
      next(error);
    }
  }

  // Update submission status (admin/reviewer only)
  static async updateSubmissionStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        throw new ApiError('Status is required', 400);
      }

      const submission = await SubmissionModel.findById(id);
      if (!submission) {
        throw new ApiError('Submission not found', 404);
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
        throw new ApiError('Submission not found', 404);
      }

      // Check permissions
      const isOwner = submission.user_id === req.user!.id;
      const isAdmin = req.user!.roles.includes('admin');

      if (!isOwner && !isAdmin) {
        throw new ApiError('You do not have permission to delete this submission', 403);
      }

      // Delete PDF from S3
      if (submission.pdf_url.startsWith('https://')) {
        await deletePhotoFromS3(submission.pdf_url);
      }

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
        throw new ApiError('Event not found', 404);
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
