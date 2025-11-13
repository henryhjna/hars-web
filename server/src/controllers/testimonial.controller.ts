import { Request, Response } from 'express';
import TestimonialModel from '../models/testimonial.model';

export const createTestimonial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { event_id, author_name, author_affiliation, testimonial_text, is_featured } = req.body;

    if (!event_id || !author_name || !testimonial_text) {
      res.status(400).json({
        success: false,
        message: 'Event ID, author name, and testimonial text are required',
      });
      return;
    }

    const testimonial = await TestimonialModel.create({
      event_id,
      author_name,
      author_affiliation,
      testimonial_text,
      is_featured,
    });

    res.status(201).json({
      success: true,
      data: testimonial,
    });
  } catch (error) {
    console.error('Create testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create testimonial',
    });
  }
};

export const getEventTestimonials = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const testimonials = await TestimonialModel.findByEventId(eventId);

    res.json({
      success: true,
      data: testimonials,
    });
  } catch (error) {
    console.error('Get event testimonials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch testimonials',
    });
  }
};

export const getFeaturedTestimonials = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const testimonials = await TestimonialModel.getFeatured(eventId);

    res.json({
      success: true,
      data: testimonials,
    });
  } catch (error) {
    console.error('Get featured testimonials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured testimonials',
    });
  }
};

export const updateTestimonial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { author_name, author_affiliation, testimonial_text, is_featured } = req.body;

    const testimonial = await TestimonialModel.update(id, {
      author_name,
      author_affiliation,
      testimonial_text,
      is_featured,
    });

    if (!testimonial) {
      res.status(404).json({
        success: false,
        message: 'Testimonial not found',
      });
      return;
    }

    res.json({
      success: true,
      data: testimonial,
    });
  } catch (error) {
    console.error('Update testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update testimonial',
    });
  }
};

export const deleteTestimonial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await TestimonialModel.delete(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Testimonial not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Testimonial deleted successfully',
    });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete testimonial',
    });
  }
};
