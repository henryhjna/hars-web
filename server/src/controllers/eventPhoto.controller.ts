import { Request, Response } from 'express';
import EventPhotoModel from '../models/eventPhoto.model';

export const createPhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { event_id, photo_url, caption, is_highlight, photo_order } = req.body;
    const uploaded_by = req.user?.id;

    if (!event_id || !photo_url) {
      res.status(400).json({
        success: false,
        message: 'Event ID and photo URL are required',
      });
      return;
    }

    const photo = await EventPhotoModel.create({
      event_id,
      photo_url,
      caption,
      is_highlight,
      photo_order,
      uploaded_by,
    });

    res.status(201).json({
      success: true,
      data: photo,
    });
  } catch (error) {
    console.error('Create photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create photo',
    });
  }
};

export const getEventPhotos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const photos = await EventPhotoModel.findByEventId(eventId);

    res.json({
      success: true,
      data: photos,
    });
  } catch (error) {
    console.error('Get event photos error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch photos',
    });
  }
};

export const getHighlightPhotos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const photos = await EventPhotoModel.getHighlights(eventId);

    res.json({
      success: true,
      data: photos,
    });
  } catch (error) {
    console.error('Get highlight photos error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch highlight photos',
    });
  }
};

export const updatePhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { photo_url, caption, is_highlight, photo_order } = req.body;

    const photo = await EventPhotoModel.update(id, {
      photo_url,
      caption,
      is_highlight,
      photo_order,
    });

    if (!photo) {
      res.status(404).json({
        success: false,
        message: 'Photo not found',
      });
      return;
    }

    res.json({
      success: true,
      data: photo,
    });
  } catch (error) {
    console.error('Update photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update photo',
    });
  }
};

export const deletePhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await EventPhotoModel.delete(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Photo not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Photo deleted successfully',
    });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete photo',
    });
  }
};
