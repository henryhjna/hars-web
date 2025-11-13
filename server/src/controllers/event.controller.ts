import { Response, NextFunction } from 'express';
import { EventModel } from '../models/event.model';
import { AuthRequest } from '../types';
import { ApiError } from '../types';

export class EventController {
  // Get all events (public)
  static async getAllEvents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const events = await EventModel.findAll();
      res.json({ success: true, data: events });
    } catch (error) {
      next(error);
    }
  }

  // Get upcoming events (public)
  static async getUpcomingEvents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const events = await EventModel.findUpcoming();
      res.json({ success: true, data: events });
    } catch (error) {
      next(error);
    }
  }

  // Get past events (public)
  static async getPastEvents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const events = await EventModel.findPast();
      res.json({ success: true, data: events });
    } catch (error) {
      next(error);
    }
  }

  // Get event by ID (public)
  static async getEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { idOrSlug } = req.params;

      const event = await EventModel.findById(idOrSlug);

      if (!event) {
        throw new ApiError('Event not found', 404);
      }

      // Get sessions and speakers
      const [sessions, speakers, submissionCount] = await Promise.all([
        EventModel.getSessions(event.id),
        EventModel.getKeynoteSpeakers(event.id),
        EventModel.getSubmissionCount(event.id),
      ]);

      res.json({
        success: true,
        data: {
          ...event,
          sessions,
          speakers,
          submission_count: submissionCount,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Create event (admin only)
  static async createEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const eventData = req.body;

      // Validate required fields
      if (!eventData.title || !eventData.event_date || !eventData.submission_start_date || !eventData.submission_end_date) {
        throw new ApiError('Missing required fields: title, event_date, submission_start_date, submission_end_date', 400);
      }

      const event = await EventModel.create(eventData, req.user!.id);

      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: event,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update event (admin only)
  static async updateEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const eventData = req.body;

      // Check if event exists
      const existingEvent = await EventModel.findById(id);
      if (!existingEvent) {
        throw new ApiError('Event not found', 404);
      }

      const updatedEvent = await EventModel.update(id, eventData);

      res.json({
        success: true,
        message: 'Event updated successfully',
        data: updatedEvent,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete event (admin only) - soft delete
  static async deleteEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const hardDelete = req.query.hard === 'true';

      const event = await EventModel.findById(id);
      if (!event) {
        throw new ApiError('Event not found', 404);
      }

      if (hardDelete) {
        await EventModel.delete(id);
      } else {
        await EventModel.softDelete(id);
      }

      res.json({
        success: true,
        message: hardDelete ? 'Event deleted permanently' : 'Event status changed to past',
      });
    } catch (error) {
      next(error);
    }
  }

  // Add session to event (admin only)
  static async addSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const sessionData = req.body;

      const event = await EventModel.findById(id);
      if (!event) {
        throw new ApiError('Event not found', 404);
      }

      const session = await EventModel.addSession({
        ...sessionData,
        event_id: id,
      });

      res.status(201).json({
        success: true,
        message: 'Session added successfully',
        data: session,
      });
    } catch (error) {
      next(error);
    }
  }

  // Add keynote speaker to event (admin only)
  static async addKeynoteSpeaker(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const speakerData = req.body;

      const event = await EventModel.findById(id);
      if (!event) {
        throw new ApiError('Event not found', 404);
      }

      const speaker = await EventModel.addKeynoteSpeaker({
        ...speakerData,
        event_id: id,
      });

      res.status(201).json({
        success: true,
        message: 'Keynote speaker added successfully',
        data: speaker,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get event statistics (admin only)
  static async getEventStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const event = await EventModel.findById(id);
      if (!event) {
        throw new ApiError('Event not found', 404);
      }

      const [sessions, speakers, submissionCount] = await Promise.all([
        EventModel.getSessions(id),
        EventModel.getKeynoteSpeakers(id),
        EventModel.getSubmissionCount(id),
      ]);

      res.json({
        success: true,
        data: {
          event_id: id,
          title: event.title,
          total_sessions: sessions.length,
          total_speakers: speakers.length,
          total_submissions: submissionCount,
          submission_end_date: event.submission_end_date,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
