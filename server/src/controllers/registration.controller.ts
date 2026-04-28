import { Response, NextFunction } from 'express';
import { RegistrationModel } from '../models/registration.model';
import { EventModel } from '../models/event.model';
import { UserModel } from '../models/user.model';
import { AuthRequest, ApiError, RegistrationStatus } from '../types';
import { sendRegistrationConfirmationEmail } from '../services/email.service';

const VALID_STATUSES: RegistrationStatus[] = ['registered', 'cancelled'];

export class RegistrationController {
  // Create registration (any logged-in user)
  static async createRegistration(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { event_id, lunch, dinner } = req.body;

      if (!event_id) {
        throw new ApiError('event_id is required', 400);
      }

      const event = await EventModel.findById(event_id);
      if (!event) {
        throw new ApiError('Event not found', 404);
      }

      // Block registering for past events
      if (new Date(event.event_date) < new Date(new Date().toDateString())) {
        throw new ApiError('Cannot register for a past event', 400);
      }

      const now = new Date();

      if (event.registration_start_date) {
        const start = new Date(event.registration_start_date);
        if (now < start) {
          throw new ApiError('Registration is not yet open', 400);
        }
      }

      if (event.registration_deadline) {
        const deadline = new Date(event.registration_deadline);
        if (now > deadline) {
          throw new ApiError('Registration deadline has passed', 400);
        }
      }

      const existing = await RegistrationModel.findByUserAndEvent(req.user!.id, event_id);
      if (existing) {
        if (existing.status === 'cancelled') {
          // Re-activate the existing registration
          const updated = await RegistrationModel.update(existing.id, {
            status: 'registered',
            lunch: !!lunch,
            dinner: !!dinner,
          });
          // Send confirmation (best effort)
          sendRegistrationConfirmationEmailSafe(req.user!.id, event_id);
          return res.status(200).json({
            success: true,
            message: 'Registration re-activated',
            data: updated,
          });
        }
        throw new ApiError('You are already registered for this event', 400);
      }

      let registration;
      try {
        registration = await RegistrationModel.create({
          user_id: req.user!.id,
          event_id,
          lunch: !!lunch,
          dinner: !!dinner,
        });
      } catch (e: any) {
        // 23505 = PG unique_violation: concurrent duplicate registration race
        if (e?.code === '23505') {
          throw new ApiError('You are already registered for this event', 409);
        }
        throw e;
      }

      sendRegistrationConfirmationEmailSafe(req.user!.id, event_id);

      res.status(201).json({
        success: true,
        message: 'Registration created',
        data: registration,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get current user's registrations
  static async getMyRegistrations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const registrations = await RegistrationModel.findByUser(req.user!.id);
      res.json({ success: true, data: registrations });
    } catch (error) {
      next(error);
    }
  }

  // Get all registrations with pagination (admin)
  static async getAllRegistrations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const eventId = req.query.eventId as string | undefined;
      const status = req.query.status as string | undefined;

      const filters: { eventId?: string; status?: string } = {};
      if (eventId) filters.eventId = eventId;
      if (status) filters.status = status;

      const { registrations, total } = await RegistrationModel.findAll(page, limit, filters);

      res.json({
        success: true,
        data: registrations,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get registrations for an event (admin)
  static async getEventRegistrations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params;
      const registrations = await RegistrationModel.findByEvent(eventId);
      res.json({ success: true, data: registrations });
    } catch (error) {
      next(error);
    }
  }

  // Get single registration (owner or admin)
  static async getRegistration(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const registration = await RegistrationModel.findById(id);
      if (!registration) {
        throw new ApiError('Registration not found', 404);
      }

      const isOwner = registration.user_id === req.user!.id;
      const isAdmin = req.user!.roles.includes('admin');
      if (!isOwner && !isAdmin) {
        throw new ApiError('You do not have permission to view this registration', 403);
      }

      res.json({ success: true, data: registration });
    } catch (error) {
      next(error);
    }
  }

  // Cancel own registration (owner or admin)
  static async cancelRegistration(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const registration = await RegistrationModel.findById(id);
      if (!registration) {
        throw new ApiError('Registration not found', 404);
      }

      const isOwner = registration.user_id === req.user!.id;
      const isAdmin = req.user!.roles.includes('admin');
      if (!isOwner && !isAdmin) {
        throw new ApiError('You do not have permission to cancel this registration', 403);
      }

      const updated = await RegistrationModel.update(id, { status: 'cancelled' });
      res.json({ success: true, message: 'Registration cancelled', data: updated });
    } catch (error) {
      next(error);
    }
  }

  // Update registration (admin)
  static async updateRegistration(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, lunch, dinner } = req.body;

      if (status !== undefined && !VALID_STATUSES.includes(status)) {
        throw new ApiError(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, 400);
      }

      const existing = await RegistrationModel.findById(id);
      if (!existing) {
        throw new ApiError('Registration not found', 404);
      }

      const updated = await RegistrationModel.update(id, {
        status,
        lunch: typeof lunch === 'boolean' ? lunch : undefined,
        dinner: typeof dinner === 'boolean' ? dinner : undefined,
      });

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  // Hard delete (admin)
  static async deleteRegistration(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const ok = await RegistrationModel.delete(id);
      if (!ok) {
        throw new ApiError('Registration not found', 404);
      }
      res.json({ success: true, message: 'Registration deleted' });
    } catch (error) {
      next(error);
    }
  }

  // Resend confirmation email (admin)
  static async resendConfirmation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const registration = await RegistrationModel.findById(id);
      if (!registration) {
        throw new ApiError('Registration not found', 404);
      }

      // The email template says "Registration Confirmed" — sending it on a
      // cancelled row would mislead the recipient.
      if (registration.status === 'cancelled') {
        throw new ApiError(
          'Cannot resend confirmation for a cancelled registration. Re-activate it first.',
          400,
        );
      }

      const [user, event] = await Promise.all([
        UserModel.findById(registration.user_id),
        EventModel.findById(registration.event_id),
      ]);
      if (!user || !event) {
        throw new ApiError('User or event no longer exists', 404);
      }

      await sendRegistrationConfirmationEmail(
        user,
        event.title,
        event.event_date,
        registration.lunch,
        registration.dinner,
      );

      res.json({ success: true, message: 'Confirmation email resent' });
    } catch (error) {
      next(error);
    }
  }

  // CSV export for an event (admin)
  static async exportEventCsv(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params;
      const event = await EventModel.findById(eventId);
      if (!event) {
        throw new ApiError('Event not found', 404);
      }

      const rows = await RegistrationModel.findByEvent(eventId);

      const header = [
        'First Name', 'Last Name', 'Preferred Name', 'Email', 'Affiliation',
        'Status', 'Lunch', 'Dinner', 'Registered At',
      ];
      const csvRows = [header.join(',')];
      for (const r of rows) {
        const cells = [
          r.first_name,
          r.last_name,
          r.preferred_name ?? '',
          r.email,
          r.affiliation ?? '',
          r.status,
          r.lunch ? 'yes' : 'no',
          r.dinner ? 'yes' : 'no',
          new Date(r.created_at).toISOString(),
        ].map(escapeCsvCell);
        csvRows.push(cells.join(','));
      }

      const safeTitle = event.title.replace(/[^a-z0-9]+/gi, '_');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="registrations_${safeTitle}.csv"`
      );
      res.send('﻿' + csvRows.join('\r\n'));
    } catch (error) {
      next(error);
    }
  }

  // Stats overall (admin)
  static async getOverallStats(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await RegistrationModel.getOverallCounts();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  // Stats for a specific event, including lunch/dinner counts (admin)
  static async getEventStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params;
      const stats = await RegistrationModel.getCountsByEvent(eventId);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }
}

function escapeCsvCell(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// Best-effort email send; never throw
async function sendRegistrationConfirmationEmailSafe(userId: string, eventId: string) {
  try {
    const [user, event] = await Promise.all([
      UserModel.findById(userId),
      EventModel.findById(eventId),
    ]);
    if (!user || !event) return;
    const reg = await RegistrationModel.findByUserAndEvent(userId, eventId);
    await sendRegistrationConfirmationEmail(
      user,
      event.title,
      event.event_date,
      reg?.lunch ?? false,
      reg?.dinner ?? false,
    );
  } catch (e) {
    console.error('Failed to send registration confirmation email:', e);
  }
}
