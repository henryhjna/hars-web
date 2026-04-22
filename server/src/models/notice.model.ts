import pool from '../config/database';

export type NoticeSeverity = 'info' | 'warning' | 'critical';

export interface SiteNotice {
  id: string;
  title: string;
  body: string;
  severity: NoticeSeverity;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export const noticeModel = {
  async getAll(): Promise<SiteNotice[]> {
    const result = await pool.query(
      `SELECT * FROM site_notices ORDER BY created_at DESC`
    );
    return result.rows;
  },

  async getActive(): Promise<SiteNotice | null> {
    const result = await pool.query(
      `SELECT * FROM site_notices WHERE is_active = true ORDER BY updated_at DESC LIMIT 1`
    );
    return result.rows[0] || null;
  },

  async getById(id: string): Promise<SiteNotice | null> {
    const result = await pool.query(`SELECT * FROM site_notices WHERE id = $1`, [id]);
    return result.rows[0] || null;
  },

  async create(data: { title: string; body: string; severity?: NoticeSeverity; is_active?: boolean }): Promise<SiteNotice> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      if (data.is_active) {
        await client.query(`UPDATE site_notices SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE is_active = true`);
      }
      const result = await client.query(
        `INSERT INTO site_notices (title, body, severity, is_active)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [data.title, data.body, data.severity || 'info', data.is_active ?? false]
      );
      await client.query('COMMIT');
      return result.rows[0];
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  async update(id: string, updates: Partial<Pick<SiteNotice, 'title' | 'body' | 'severity' | 'is_active'>>): Promise<SiteNotice | null> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      if (updates.is_active === true) {
        await client.query(
          `UPDATE site_notices SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE is_active = true AND id <> $1`,
          [id]
        );
      }

      const fields: string[] = [];
      const values: any[] = [];
      let i = 1;
      if (updates.title !== undefined) { fields.push(`title = $${i++}`); values.push(updates.title); }
      if (updates.body !== undefined) { fields.push(`body = $${i++}`); values.push(updates.body); }
      if (updates.severity !== undefined) { fields.push(`severity = $${i++}`); values.push(updates.severity); }
      if (updates.is_active !== undefined) { fields.push(`is_active = $${i++}`); values.push(updates.is_active); }

      if (fields.length === 0) {
        await client.query('ROLLBACK');
        return await this.getById(id);
      }

      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await client.query(
        `UPDATE site_notices SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
        values
      );
      await client.query('COMMIT');
      return result.rows[0] || null;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  async delete(id: string): Promise<boolean> {
    const result = await pool.query(`DELETE FROM site_notices WHERE id = $1`, [id]);
    return (result.rowCount ?? 0) > 0;
  },
};
