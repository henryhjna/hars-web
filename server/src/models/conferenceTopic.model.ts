import pool from '../config/database';

export interface ConferenceTopic {
  id: string;
  event_id: string;
  topic_name: string;
  description?: string;
  is_active: boolean;
  display_order: number;
  created_at: Date;
  updated_at: Date;
}

export const conferenceTopicModel = {
  // Get all topics for an event
  async getByEventId(eventId: string): Promise<ConferenceTopic[]> {
    const query = `
      SELECT * FROM conference_topics
      WHERE event_id = $1 AND is_active = true
      ORDER BY display_order ASC, topic_name ASC
    `;
    const result = await pool.query(query, [eventId]);
    return result.rows;
  },

  // Get all active topics (for dropdown)
  async getAllActive(): Promise<ConferenceTopic[]> {
    const query = `
      SELECT DISTINCT ON (topic_name)
        id, topic_name, description, display_order
      FROM conference_topics
      WHERE is_active = true
      ORDER BY topic_name, display_order ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  // Create new topic
  async create(topic: Omit<ConferenceTopic, 'id' | 'created_at' | 'updated_at'>): Promise<ConferenceTopic> {
    const query = `
      INSERT INTO conference_topics (event_id, topic_name, description, is_active, display_order)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      topic.event_id,
      topic.topic_name,
      topic.description || null,
      topic.is_active !== undefined ? topic.is_active : true,
      topic.display_order || 0
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Update topic
  async update(id: string, updates: Partial<ConferenceTopic>): Promise<ConferenceTopic | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.topic_name !== undefined) {
      fields.push(`topic_name = $${paramCount++}`);
      values.push(updates.topic_name);
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }
    if (updates.is_active !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(updates.is_active);
    }
    if (updates.display_order !== undefined) {
      fields.push(`display_order = $${paramCount++}`);
      values.push(updates.display_order);
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE conference_topics
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  },

  // Delete topic (soft delete by setting is_active = false)
  async delete(id: string): Promise<boolean> {
    const query = `
      UPDATE conference_topics
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
    `;
    const result = await pool.query(query, [id]);
    return result.rowCount! > 0;
  },

  // Hard delete (for admin)
  async hardDelete(id: string): Promise<boolean> {
    const query = `DELETE FROM conference_topics WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rowCount! > 0;
  }
};
