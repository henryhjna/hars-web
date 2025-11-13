import pool from '../config/database';

export interface Award {
  id: string;
  event_id: string;
  award_type: string; // 'Best Paper', 'Outstanding Paper'
  submission_id?: string;
  announcement_date?: Date;
  prize_description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface AwardWithDetails extends Award {
  paper_title?: string;
  authors?: string;
  co_authors?: string;
}

export const awardModel = {
  // Get all awards for an event
  async getByEventId(eventId: string): Promise<AwardWithDetails[]> {
    const query = `
      SELECT
        a.*,
        s.title as paper_title,
        s.authors,
        s.co_authors
      FROM awards a
      LEFT JOIN submissions s ON a.submission_id = s.id
      WHERE a.event_id = $1
      ORDER BY
        CASE a.award_type
          WHEN 'Best Paper' THEN 1
          WHEN 'Outstanding Paper' THEN 2
          ELSE 3
        END,
        a.created_at DESC
    `;
    const result = await pool.query(query, [eventId]);
    return result.rows;
  },

  // Get award by ID
  async getById(id: string): Promise<AwardWithDetails | null> {
    const query = `
      SELECT
        a.*,
        s.title as paper_title,
        s.authors,
        s.co_authors
      FROM awards a
      LEFT JOIN submissions s ON a.submission_id = s.id
      WHERE a.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  },

  // Create award
  async create(award: Omit<Award, 'id' | 'created_at' | 'updated_at'>): Promise<Award> {
    const query = `
      INSERT INTO awards (event_id, award_type, submission_id, announcement_date, prize_description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      award.event_id,
      award.award_type,
      award.submission_id || null,
      award.announcement_date || null,
      award.prize_description || null
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Update award
  async update(id: string, updates: Partial<Award>): Promise<Award | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.award_type !== undefined) {
      fields.push(`award_type = $${paramCount++}`);
      values.push(updates.award_type);
    }
    if (updates.submission_id !== undefined) {
      fields.push(`submission_id = $${paramCount++}`);
      values.push(updates.submission_id);
    }
    if (updates.announcement_date !== undefined) {
      fields.push(`announcement_date = $${paramCount++}`);
      values.push(updates.announcement_date);
    }
    if (updates.prize_description !== undefined) {
      fields.push(`prize_description = $${paramCount++}`);
      values.push(updates.prize_description);
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE awards
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  },

  // Delete award
  async delete(id: string): Promise<boolean> {
    const query = `DELETE FROM awards WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rowCount! > 0;
  },

  // Get all awards (for past events archive)
  async getAll(): Promise<AwardWithDetails[]> {
    const query = `
      SELECT
        a.*,
        s.title as paper_title,
        s.authors,
        s.co_authors,
        e.title as event_title,
        e.event_date
      FROM awards a
      LEFT JOIN submissions s ON a.submission_id = s.id
      LEFT JOIN events e ON a.event_id = e.id
      ORDER BY e.event_date DESC, a.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }
};
