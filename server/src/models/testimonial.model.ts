import pool from '../config/database';
import { QueryResult } from 'pg';

export interface Testimonial {
  id: string;
  event_id: string;
  author_name: string;
  author_affiliation?: string;
  testimonial_text: string;
  is_featured: boolean;
  created_at: Date;
}

export interface CreateTestimonialDTO {
  event_id: string;
  author_name: string;
  author_affiliation?: string;
  testimonial_text: string;
  is_featured?: boolean;
}

class TestimonialModel {
  async create(data: CreateTestimonialDTO): Promise<Testimonial> {
    const query = `
      INSERT INTO event_testimonials (
        event_id, author_name, author_affiliation, testimonial_text, is_featured
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      data.event_id,
      data.author_name,
      data.author_affiliation || null,
      data.testimonial_text,
      data.is_featured || false,
    ];

    const result: QueryResult<Testimonial> = await pool.query(query, values);
    return result.rows[0];
  }

  async findByEventId(eventId: string): Promise<Testimonial[]> {
    const query = `
      SELECT * FROM event_testimonials
      WHERE event_id = $1
      ORDER BY is_featured DESC, created_at DESC
    `;
    const result: QueryResult<Testimonial> = await pool.query(query, [eventId]);
    return result.rows;
  }

  async findById(id: string): Promise<Testimonial | null> {
    const query = 'SELECT * FROM event_testimonials WHERE id = $1';
    const result: QueryResult<Testimonial> = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async update(id: string, data: Partial<CreateTestimonialDTO>): Promise<Testimonial | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.author_name !== undefined) {
      updates.push(`author_name = $${paramCount++}`);
      values.push(data.author_name);
    }
    if (data.author_affiliation !== undefined) {
      updates.push(`author_affiliation = $${paramCount++}`);
      values.push(data.author_affiliation);
    }
    if (data.testimonial_text !== undefined) {
      updates.push(`testimonial_text = $${paramCount++}`);
      values.push(data.testimonial_text);
    }
    if (data.is_featured !== undefined) {
      updates.push(`is_featured = $${paramCount++}`);
      values.push(data.is_featured);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE event_testimonials
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result: QueryResult<Testimonial> = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM event_testimonials WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async getFeatured(eventId: string): Promise<Testimonial[]> {
    const query = `
      SELECT * FROM event_testimonials
      WHERE event_id = $1 AND is_featured = TRUE
      ORDER BY created_at DESC
    `;
    const result: QueryResult<Testimonial> = await pool.query(query, [eventId]);
    return result.rows;
  }
}

export default new TestimonialModel();
