import { query } from '../config/database';
import { Registration, RegistrationStatus } from '../types';
import { paginate } from '../utils/pagination';

export interface RegistrationWithDetails extends Registration {
  email: string;
  first_name: string;
  last_name: string;
  preferred_name?: string;
  affiliation?: string;
  event_title: string;
  event_date: Date;
}

const DETAIL_COLUMNS = `
  r.*,
  u.email, u.first_name, u.last_name, u.preferred_name, u.affiliation,
  e.title AS event_title, e.event_date
`;
const DETAIL_FROM = `
  registrations r
  JOIN users u ON r.user_id = u.id
  JOIN events e ON r.event_id = e.id
`;

export class RegistrationModel {
  static async findAll(
    page: number = 1,
    limit: number = 20,
    filters?: { eventId?: string; status?: string }
  ): Promise<{ registrations: RegistrationWithDetails[]; total: number }> {
    const conditions: string[] = [];
    const whereParams: any[] = [];

    if (filters?.eventId) {
      conditions.push(`r.event_id = $${whereParams.length + 1}`);
      whereParams.push(filters.eventId);
    }
    if (filters?.status) {
      conditions.push(`r.status = $${whereParams.length + 1}`);
      whereParams.push(filters.status);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows, total } = await paginate<RegistrationWithDetails>({
      select: DETAIL_COLUMNS,
      from: DETAIL_FROM,
      where,
      whereParams,
      orderBy: 'r.created_at DESC',
      page,
      limit,
    });

    return { registrations: rows, total };
  }

  static async findByUser(userId: string): Promise<RegistrationWithDetails[]> {
    const sql = `
      SELECT ${DETAIL_COLUMNS}
      FROM ${DETAIL_FROM}
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
    `;
    const result = await query(sql, [userId]);
    return result.rows;
  }

  static async findByEvent(eventId: string): Promise<RegistrationWithDetails[]> {
    const sql = `
      SELECT ${DETAIL_COLUMNS}
      FROM ${DETAIL_FROM}
      WHERE r.event_id = $1
      ORDER BY r.created_at DESC
    `;
    const result = await query(sql, [eventId]);
    return result.rows;
  }

  static async findById(id: string): Promise<RegistrationWithDetails | null> {
    const sql = `
      SELECT ${DETAIL_COLUMNS}
      FROM ${DETAIL_FROM}
      WHERE r.id = $1
    `;
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  static async findByUserAndEvent(userId: string, eventId: string): Promise<Registration | null> {
    const sql = `SELECT * FROM registrations WHERE user_id = $1 AND event_id = $2`;
    const result = await query(sql, [userId, eventId]);
    return result.rows[0] || null;
  }

  static async create(data: {
    user_id: string;
    event_id: string;
    lunch?: boolean;
    dinner?: boolean;
  }): Promise<Registration> {
    const sql = `
      INSERT INTO registrations (user_id, event_id, lunch, dinner)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await query(sql, [
      data.user_id,
      data.event_id,
      data.lunch ?? false,
      data.dinner ?? false,
    ]);
    return result.rows[0];
  }

  static async update(
    id: string,
    data: { status?: RegistrationStatus; lunch?: boolean; dinner?: boolean }
  ): Promise<Registration | null> {
    const sql = `
      UPDATE registrations SET
        status = COALESCE($1, status),
        lunch = COALESCE($2, lunch),
        dinner = COALESCE($3, dinner)
      WHERE id = $4
      RETURNING *
    `;
    const result = await query(sql, [
      data.status ?? null,
      data.lunch ?? null,
      data.dinner ?? null,
      id,
    ]);
    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const sql = `DELETE FROM registrations WHERE id = $1`;
    const result = await query(sql, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async getCountsByEvent(eventId: string): Promise<{
    total: number;
    registered: number;
    cancelled: number;
    lunch: number;
    dinner: number;
  }> {
    const sql = `
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'registered') AS registered,
        COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled,
        COUNT(*) FILTER (WHERE status = 'registered' AND lunch = TRUE) AS lunch,
        COUNT(*) FILTER (WHERE status = 'registered' AND dinner = TRUE) AS dinner
      FROM registrations
      WHERE event_id = $1
    `;
    const result = await query(sql, [eventId]);
    const row = result.rows[0];
    return {
      total: parseInt(row.total, 10),
      registered: parseInt(row.registered, 10),
      cancelled: parseInt(row.cancelled, 10),
      lunch: parseInt(row.lunch, 10),
      dinner: parseInt(row.dinner, 10),
    };
  }

  static async getOverallCounts(): Promise<{
    total: number;
    registered: number;
    cancelled: number;
  }> {
    const sql = `
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'registered') AS registered,
        COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled
      FROM registrations
    `;
    const result = await query(sql);
    const row = result.rows[0];
    return {
      total: parseInt(row.total, 10),
      registered: parseInt(row.registered, 10),
      cancelled: parseInt(row.cancelled, 10),
    };
  }
}
