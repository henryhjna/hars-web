import { Request, Response } from 'express';
import { conferenceTopicModel } from '../models/conferenceTopic.model';

export const conferenceTopicController = {
  // Get all topics for an event
  async getByEventId(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const topics = await conferenceTopicModel.getByEventId(eventId);
      res.json({ success: true, data: topics });
    } catch (error) {
      console.error('Error fetching conference topics:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch conference topics' });
    }
  },

  // Get all active topics (for submission form dropdown)
  async getAllActive(req: Request, res: Response) {
    try {
      const topics = await conferenceTopicModel.getAllActive();
      res.json({ success: true, data: topics });
    } catch (error) {
      console.error('Error fetching active topics:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch active topics' });
    }
  },

  // Create new topic (admin only)
  async create(req: Request, res: Response) {
    try {
      const topic = await conferenceTopicModel.create(req.body);
      res.status(201).json({ success: true, data: topic });
    } catch (error) {
      console.error('Error creating conference topic:', error);
      res.status(500).json({ success: false, error: 'Failed to create conference topic' });
    }
  },

  // Update topic (admin only)
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const topic = await conferenceTopicModel.update(id, req.body);

      if (!topic) {
        return res.status(404).json({ success: false, error: 'Conference topic not found' });
      }

      res.json({ success: true, data: topic });
    } catch (error) {
      console.error('Error updating conference topic:', error);
      res.status(500).json({ success: false, error: 'Failed to update conference topic' });
    }
  },

  // Delete topic (admin only)
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const success = await conferenceTopicModel.delete(id);

      if (!success) {
        return res.status(404).json({ success: false, error: 'Conference topic not found' });
      }

      res.json({ success: true, message: 'Conference topic deleted successfully' });
    } catch (error) {
      console.error('Error deleting conference topic:', error);
      res.status(500).json({ success: false, error: 'Failed to delete conference topic' });
    }
  }
};
