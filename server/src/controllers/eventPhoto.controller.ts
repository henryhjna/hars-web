import { Response } from 'express';
import { AuthRequest } from '../types';
import EventPhotoModel from '../models/eventPhoto.model';
import { uploadPhotoToS3, deletePhotoFromS3 } from '../utils/s3Upload';

export const createPhoto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { event_id, caption, is_highlight, photo_order } = req.body;
    const uploaded_by = req.user?.id;
    const file = req.file;

    if (!event_id) {
      res.status(400).json({
        success: false,
        message: 'Event ID is required',
      });
      return;
    }

    if (!file) {
      res.status(400).json({
        success: false,
        message: 'Photo file is required',
      });
      return;
    }

    // Upload photo to S3
    const photo_url = await uploadPhotoToS3(file, 'event-photos');

    const photo = await EventPhotoModel.create({
      event_id,
      photo_url,
      caption,
      is_highlight: is_highlight === 'true' || is_highlight === true,
      photo_order: photo_order ? parseInt(photo_order) : undefined,
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
      message: error instanceof Error ? error.message : 'Failed to create photo',
    });
  }
};

export const getEventPhotos = async (req: AuthRequest, res: Response): Promise<void> => {
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

export const getHighlightPhotos = async (req: AuthRequest, res: Response): Promise<void> => {
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

export const updatePhoto = async (req: AuthRequest, res: Response): Promise<void> => {
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

export const deletePhoto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Get photo to retrieve S3 URL before deleting
    const photo = await EventPhotoModel.findById(id);

    if (!photo) {
      res.status(404).json({
        success: false,
        message: 'Photo not found',
      });
      return;
    }

    // Delete from database
    const deleted = await EventPhotoModel.delete(id);

    // Delete from S3 (don't fail if S3 delete fails)
    if (photo.photo_url) {
      await deletePhotoFromS3(photo.photo_url);
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
