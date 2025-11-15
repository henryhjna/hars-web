import { Response } from 'express';
import { FacultyModel } from '../models/faculty.model';
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
}
