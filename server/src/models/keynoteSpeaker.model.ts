import pool from '../config/database';
import { QueryResult } from 'pg';

export interface KeynoteSpeaker {
  id: string;
  event_id: string;
  name: string;
  title?: string;
  affiliation?: string;
  bio?: string;
  photo_url?: string;
  topic?: string;
  presentation_time?: string;
  display_order: number;
  created_at: Date;
}

export interface CreateKeynoteSpeakerDTO {
  event_id: string;
  name: string;
  title?: string;
  affiliation?: string;
  bio?: string;
  photo_url?: string;
  topic?: string;
  presentation_time?: string;
  display_order?: number;
}

class KeynoteSpeakerModel {
  async create(data: CreateKeynoteSpeakerDTO): Promise<KeynoteSpeaker> {
    const query = `
      INSERT INTO keynote_speakers (
        event_id, name, title, affiliation, bio, photo_url, topic, presentation_time, display_order
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      data.event_id,
      data.name,
      data.title || null,
      data.affiliation || null,
      data.bio || null,
      data.photo_url || null,
      data.topic || null,
      data.presentation_time || null,
      data.display_order || 0,
    ];

    const result: QueryResult<KeynoteSpeaker> = await pool.query(query, values);
    return result.rows[0];
  }

  async findByEventId(eventId: string): Promise<KeynoteSpeaker[]> {
    const query = `
      SELECT * FROM keynote_speakers
      WHERE event_id = $1
      ORDER BY display_order ASC, created_at ASC
    `;
    const result: QueryResult<KeynoteSpeaker> = await pool.query(query, [eventId]);
    return result.rows;
  }

  async findById(id: string): Promise<KeynoteSpeaker | null> {
    const query = 'SELECT * FROM keynote_speakers WHERE id = $1';
    const result: QueryResult<KeynoteSpeaker> = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async update(id: string, data: Partial<CreateKeynoteSpeakerDTO>): Promise<KeynoteSpeaker | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(data.title);
    }
    if (data.affiliation !== undefined) {
      updates.push(`affiliation = $${paramCount++}`);
      values.push(data.affiliation);
    }
    if (data.bio !== undefined) {
      updates.push(`bio = $${paramCount++}`);
      values.push(data.bio);
    }
    if (data.photo_url !== undefined) {
      updates.push(`photo_url = $${paramCount++}`);
      values.push(data.photo_url);
    }
    if (data.topic !== undefined) {
      updates.push(`topic = $${paramCount++}`);
      values.push(data.topic);
    }
    if (data.presentation_time !== undefined) {
      updates.push(`presentation_time = $${paramCount++}`);
      values.push(data.presentation_time);
    }
    if (data.display_order !== undefined) {
      updates.push(`display_order = $${paramCount++}`);
      values.push(data.display_order);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE keynote_speakers
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result: QueryResult<KeynoteSpeaker> = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM keynote_speakers WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}

export default new KeynoteSpeakerModel();
