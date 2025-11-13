import { query } from '../config/database';
import { Event, EventSession, KeynoteSpeaker } from '../types';

export class EventModel {
  // Get all events
  static async findAll(): Promise<Event[]> {
    const sql = 'SELECT * FROM events ORDER BY event_date DESC';
    const result = await query(sql);
    return result.rows;
  }

  // Get upcoming events (future or ongoing events)
  static async findUpcoming(): Promise<Event[]> {
    const sql = `
      SELECT * FROM events
      WHERE status IN ('upcoming', 'ongoing')
      ORDER BY event_date ASC
    `;
    const result = await query(sql);
    return result.rows;
  }

  // Get past events
  static async findPast(): Promise<Event[]> {
    const sql = `
      SELECT * FROM events
      WHERE status = 'past'
      ORDER BY event_date DESC
    `;
    const result = await query(sql);
    return result.rows;
  }

  // Get event by ID
  static async findById(id: string): Promise<Event | null> {
    const sql = 'SELECT * FROM events WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  // Create new event
  static async create(eventData: Partial<Event>, createdBy: string): Promise<Event> {
    const {
      title,
      description,
      event_date,
      location,
      venue_details,
      submission_start_date,
      submission_end_date,
      review_deadline,
      notification_date,
      theme_color,
      banner_image_url,
      status,
    } = eventData;

    const sql = `
      INSERT INTO events (
        title, description, event_date, location, venue_details,
        submission_start_date, submission_end_date, review_deadline,
        notification_date, theme_color, banner_image_url, status, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const result = await query(sql, [
      title,
      description || null,
      event_date,
      location || null,
      venue_details || null,
      submission_start_date,
      submission_end_date,
      review_deadline || null,
      notification_date || null,
      theme_color || '#1a73e8',
      banner_image_url || null,
      status || 'upcoming',
      createdBy,
    ]);

    return result.rows[0];
  }

  // Update event
  static async update(id: string, eventData: Partial<Event>): Promise<Event | null> {
    const {
      title,
      description,
      event_date,
      location,
      venue_details,
      submission_start_date,
      submission_end_date,
      review_deadline,
      notification_date,
      theme_color,
      banner_image_url,
      status,
    } = eventData;

    const sql = `
      UPDATE events SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        event_date = COALESCE($3, event_date),
        location = COALESCE($4, location),
        venue_details = COALESCE($5, venue_details),
        submission_start_date = COALESCE($6, submission_start_date),
        submission_end_date = COALESCE($7, submission_end_date),
        review_deadline = COALESCE($8, review_deadline),
        notification_date = COALESCE($9, notification_date),
        theme_color = COALESCE($10, theme_color),
        banner_image_url = COALESCE($11, banner_image_url),
        status = COALESCE($12, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
      RETURNING *
    `;

    const result = await query(sql, [
      title,
      description,
      event_date,
      location,
      venue_details,
      submission_start_date,
      submission_end_date,
      review_deadline,
      notification_date,
      theme_color,
      banner_image_url,
      status,
      id,
    ]);

    return result.rows[0] || null;
  }

  // Delete event (change status to 'past')
  static async softDelete(id: string): Promise<boolean> {
    const sql = 'UPDATE events SET status = \'past\', updated_at = CURRENT_TIMESTAMP WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rowCount > 0;
  }

  // Hard delete event
  static async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM events WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rowCount > 0;
  }

  // Get event sessions
  static async getSessions(eventId: string): Promise<EventSession[]> {
    const sql = `
      SELECT * FROM event_sessions
      WHERE event_id = $1
      ORDER BY session_date ASC, start_time ASC
    `;
    const result = await query(sql, [eventId]);
    return result.rows;
  }

  // Get keynote speakers
  static async getKeynoteSpeakers(eventId: string): Promise<KeynoteSpeaker[]> {
    const sql = `
      SELECT * FROM keynote_speakers
      WHERE event_id = $1
      ORDER BY display_order ASC
    `;
    const result = await query(sql, [eventId]);
    return result.rows;
  }

  // Add session to event
  static async addSession(sessionData: Partial<EventSession>): Promise<EventSession> {
    const {
      event_id,
      session_title,
      session_type,
      session_date,
      start_time,
      end_time,
      location,
      description,
    } = sessionData;

    const sql = `
      INSERT INTO event_sessions (
        event_id, session_title, session_type, session_date,
        start_time, end_time, location, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const result = await query(sql, [
      event_id,
      session_title,
      session_type,
      session_date,
      start_time,
      end_time,
      location || null,
      description || null,
    ]);

    return result.rows[0];
  }

  // Add keynote speaker to event
  static async addKeynoteSpeaker(speakerData: Partial<KeynoteSpeaker>): Promise<KeynoteSpeaker> {
    const {
      event_id,
      name,
      title,
      affiliation,
      bio,
      photo_url,
      display_order,
    } = speakerData;

    const sql = `
      INSERT INTO keynote_speakers (
        event_id, name, title, affiliation, bio, photo_url, display_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const result = await query(sql, [
      event_id,
      name,
      title,
      affiliation,
      bio || null,
      photo_url || null,
      display_order || 0,
    ]);

    return result.rows[0];
  }

  // Get submission count for event
  static async getSubmissionCount(eventId: string): Promise<number> {
    const sql = 'SELECT COUNT(*) as count FROM submissions WHERE event_id = $1';
    const result = await query(sql, [eventId]);
    return parseInt(result.rows[0].count, 10);
  }
}
