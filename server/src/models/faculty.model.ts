import pool from '../config/database';
import type { FacultyMember, CreateFacultyInput, UpdateFacultyInput } from '../types';

export class FacultyModel {
  static async getAll(activeOnly: boolean = false): Promise<FacultyMember[]> {
    const query = activeOnly
      ? 'SELECT * FROM faculty_members WHERE is_active = true ORDER BY display_order ASC, name ASC'
      : 'SELECT * FROM faculty_members ORDER BY display_order ASC, name ASC';

    const result = await pool.query(query);
    return result.rows;
  }

  static async getById(id: string): Promise<FacultyMember | null> {
    const result = await pool.query(
      'SELECT * FROM faculty_members WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async create(data: CreateFacultyInput): Promise<FacultyMember> {
    const result = await pool.query(
      `INSERT INTO faculty_members (
        name, title, email, phone, office_location, photo_url, bio,
        research_interests, education, profile_url, display_order, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        data.name,
        data.title,
        data.email || null,
        data.phone || null,
        data.office_location || null,
        data.photo_url || null,
        data.bio || null,
        data.research_interests || null,
        data.education ? JSON.stringify(data.education) : null,
        data.profile_url || null,
        data.display_order ?? 0,
        data.is_active ?? true,
      ]
    );
    return result.rows[0];
  }

  static async update(id: string, data: UpdateFacultyInput): Promise<FacultyMember | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(data.title);
    }
    if (data.email !== undefined) {
      fields.push(`email = $${paramCount++}`);
      values.push(data.email || null);
    }
    if (data.phone !== undefined) {
      fields.push(`phone = $${paramCount++}`);
      values.push(data.phone || null);
    }
    if (data.office_location !== undefined) {
      fields.push(`office_location = $${paramCount++}`);
      values.push(data.office_location || null);
    }
    if (data.photo_url !== undefined) {
      fields.push(`photo_url = $${paramCount++}`);
      values.push(data.photo_url || null);
    }
    if (data.bio !== undefined) {
      fields.push(`bio = $${paramCount++}`);
      values.push(data.bio || null);
    }
    if (data.research_interests !== undefined) {
      fields.push(`research_interests = $${paramCount++}`);
      values.push(data.research_interests || null);
    }
    if (data.education !== undefined) {
      fields.push(`education = $${paramCount++}`);
      values.push(data.education ? JSON.stringify(data.education) : null);
    }
    if (data.profile_url !== undefined) {
      fields.push(`profile_url = $${paramCount++}`);
      values.push(data.profile_url || null);
    }
    if (data.display_order !== undefined) {
      fields.push(`display_order = $${paramCount++}`);
      values.push(data.display_order);
    }
    if (data.is_active !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(data.is_active);
    }

    if (fields.length === 0) {
      return this.getById(id);
    }

    values.push(id);
    const query = `
      UPDATE faculty_members
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM faculty_members WHERE id = $1',
      [id]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }
}
