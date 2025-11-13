import { Request, Response } from 'express';
import KeynoteSpeakerModel from '../models/keynoteSpeaker.model';

export const createSpeaker = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      event_id,
      name,
      title,
      affiliation,
      bio,
      photo_url,
      presentation_title,
      speaker_order,
    } = req.body;

    if (!event_id || !name) {
      res.status(400).json({
        success: false,
        message: 'Event ID and speaker name are required',
      });
      return;
    }

    const speaker = await KeynoteSpeakerModel.create({
      event_id,
      name,
      title,
      affiliation,
      bio,
      photo_url,
      presentation_title,
      speaker_order,
    });

    res.status(201).json({
      success: true,
      data: speaker,
    });
  } catch (error) {
    console.error('Create speaker error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create speaker',
    });
  }
};

export const getEventSpeakers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const speakers = await KeynoteSpeakerModel.findByEventId(eventId);

    res.json({
      success: true,
      data: speakers,
    });
  } catch (error) {
    console.error('Get event speakers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch speakers',
    });
  }
};

export const updateSpeaker = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      title,
      affiliation,
      bio,
      photo_url,
      presentation_title,
      speaker_order,
    } = req.body;

    const speaker = await KeynoteSpeakerModel.update(id, {
      name,
      title,
      affiliation,
      bio,
      photo_url,
      presentation_title,
      speaker_order,
    });

    if (!speaker) {
      res.status(404).json({
        success: false,
        message: 'Speaker not found',
      });
      return;
    }

    res.json({
      success: true,
      data: speaker,
    });
  } catch (error) {
    console.error('Update speaker error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update speaker',
    });
  }
};

export const deleteSpeaker = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await KeynoteSpeakerModel.delete(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Speaker not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Speaker deleted successfully',
    });
  } catch (error) {
    console.error('Delete speaker error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete speaker',
    });
  }
};
