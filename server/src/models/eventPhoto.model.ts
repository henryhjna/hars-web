import pool from '../config/database';
import { QueryResult } from 'pg';

export interface EventPhoto {
  id: string;
  event_id: string;
  photo_url: string;
  caption?: string;
  is_highlight: boolean;
  photo_order: number;
  uploaded_by?: string;
  uploaded_at: Date;
}

export interface CreateEventPhotoDTO {
  event_id: string;
  photo_url: string;
  caption?: string;
  is_highlight?: boolean;
  photo_order?: number;
  uploaded_by?: string;
}

class EventPhotoModel {
  async create(data: CreateEventPhotoDTO): Promise<EventPhoto> {
    const query = `
      INSERT INTO event_photos (event_id, photo_url, caption, is_highlight, photo_order, uploaded_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      data.event_id,
      data.photo_url,
      data.caption || null,
      data.is_highlight || false,
      data.photo_order || 0,
      data.uploaded_by || null,
    ];

    const result: QueryResult<EventPhoto> = await pool.query(query, values);
    return result.rows[0];
  }

  async findByEventId(eventId: string): Promise<EventPhoto[]> {
    const query = `
      SELECT * FROM event_photos
      WHERE event_id = $1
      ORDER BY photo_order ASC, uploaded_at DESC
    `;
    const result: QueryResult<EventPhoto> = await pool.query(query, [eventId]);
    return result.rows;
  }

  async findById(id: string): Promise<EventPhoto | null> {
    const query = 'SELECT * FROM event_photos WHERE id = $1';
    const result: QueryResult<EventPhoto> = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async update(id: string, data: Partial<CreateEventPhotoDTO>): Promise<EventPhoto | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.photo_url !== undefined) {
      updates.push(`photo_url = $${paramCount++}`);
      values.push(data.photo_url);
    }
    if (data.caption !== undefined) {
      updates.push(`caption = $${paramCount++}`);
      values.push(data.caption);
    }
    if (data.is_highlight !== undefined) {
      updates.push(`is_highlight = $${paramCount++}`);
      values.push(data.is_highlight);
    }
    if (data.photo_order !== undefined) {
      updates.push(`photo_order = $${paramCount++}`);
      values.push(data.photo_order);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE event_photos
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result: QueryResult<EventPhoto> = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM event_photos WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async getHighlights(eventId: string): Promise<EventPhoto[]> {
    const query = `
      SELECT * FROM event_photos
      WHERE event_id = $1 AND is_highlight = TRUE
      ORDER BY photo_order ASC, uploaded_at DESC
    `;
    const result: QueryResult<EventPhoto> = await pool.query(query, [eventId]);
    return result.rows;
  }
}

export default new EventPhotoModel();
