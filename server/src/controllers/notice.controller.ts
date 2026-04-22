import { Request, Response } from 'express';
import { noticeModel } from '../models/notice.model';

export const noticeController = {
  async getActive(_req: Request, res: Response) {
    try {
      const notice = await noticeModel.getActive();
      res.json({ success: true, data: notice });
    } catch (error) {
      console.error('Error fetching active notice:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch active notice' });
    }
  },

  async getAll(_req: Request, res: Response) {
    try {
      const notices = await noticeModel.getAll();
      res.json({ success: true, data: notices });
    } catch (error) {
      console.error('Error fetching notices:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch notices' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { title, body, severity, is_active } = req.body;
      if (!title || !body) {
        return res.status(400).json({ success: false, error: 'Title and body are required' });
      }
      const notice = await noticeModel.create({ title, body, severity, is_active });
      res.status(201).json({ success: true, data: notice });
    } catch (error) {
      console.error('Error creating notice:', error);
      res.status(500).json({ success: false, error: 'Failed to create notice' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const notice = await noticeModel.update(id, req.body);
      if (!notice) {
        return res.status(404).json({ success: false, error: 'Notice not found' });
      }
      res.json({ success: true, data: notice });
    } catch (error) {
      console.error('Error updating notice:', error);
      res.status(500).json({ success: false, error: 'Failed to update notice' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const ok = await noticeModel.delete(id);
      if (!ok) {
        return res.status(404).json({ success: false, error: 'Notice not found' });
      }
      res.json({ success: true, message: 'Notice deleted' });
    } catch (error) {
      console.error('Error deleting notice:', error);
      res.status(500).json({ success: false, error: 'Failed to delete notice' });
    }
  },
};
