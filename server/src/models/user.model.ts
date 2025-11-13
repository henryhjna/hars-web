import { query } from '../config/database';
import { User, UserRole, UserResponse } from '../types';

export class UserModel {
  static async create(data: {
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
    affiliation?: string;
    email_verification_token: string;
  }): Promise<User> {
    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, affiliation, email_verification_token)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.email,
        data.password_hash,
        data.first_name,
        data.last_name,
        data.affiliation,
        data.email_verification_token,
      ]
    );

    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByVerificationToken(token: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE email_verification_token = $1',
      [token]
    );
    return result.rows[0] || null;
  }

  static async findByResetToken(token: string): Promise<User | null> {
    const result = await query(
      `SELECT * FROM users
       WHERE reset_password_token = $1
       AND reset_password_expires > NOW()`,
      [token]
    );
    return result.rows[0] || null;
  }

  static async verifyEmail(userId: string): Promise<void> {
    await query(
      `UPDATE users
       SET is_email_verified = TRUE,
           email_verification_token = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [userId]
    );
  }

  static async setResetPasswordToken(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<void> {
    await query(
      `UPDATE users
       SET reset_password_token = $1,
           reset_password_expires = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [token, expiresAt, userId]
    );
  }

  static async resetPassword(userId: string, passwordHash: string): Promise<void> {
    await query(
      `UPDATE users
       SET password_hash = $1,
           reset_password_token = NULL,
           reset_password_expires = NULL,
           must_reset_password = FALSE,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [passwordHash, userId]
    );
  }

  static async updateProfile(
    userId: string,
    data: {
      first_name?: string;
      last_name?: string;
      affiliation?: string;
    }
  ): Promise<User> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.first_name !== undefined) {
      fields.push(`first_name = $${paramCount}`);
      values.push(data.first_name);
      paramCount++;
    }

    if (data.last_name !== undefined) {
      fields.push(`last_name = $${paramCount}`);
      values.push(data.last_name);
      paramCount++;
    }

    if (data.affiliation !== undefined) {
      fields.push(`affiliation = $${paramCount}`);
      values.push(data.affiliation);
      paramCount++;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0];
  }

  static async addRole(userId: string, role: UserRole): Promise<void> {
    await query(
      `UPDATE users
       SET roles = array_append(roles, $1),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND NOT ($1 = ANY(roles))`,
      [role, userId]
    );
  }

  static async removeRole(userId: string, role: UserRole): Promise<void> {
    await query(
      `UPDATE users
       SET roles = array_remove(roles, $1),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [role, userId]
    );
  }

  static async list(params: {
    page?: number;
    limit?: number;
    role?: UserRole;
  }): Promise<{ users: UserResponse[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;

    let whereClause = '';
    const queryParams: any[] = [];

    if (params.role) {
      whereClause = 'WHERE $1 = ANY(roles)';
      queryParams.push(params.role);
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM users ${whereClause}`,
      queryParams
    );

    const usersResult = await query(
      `SELECT id, email, first_name, last_name, affiliation, roles, is_email_verified, created_at
       FROM users ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`,
      [...queryParams, limit, offset]
    );

    return {
      users: usersResult.rows,
      total: parseInt(countResult.rows[0].count),
    };
  }

  static sanitize(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      affiliation: user.affiliation,
      roles: user.roles,
      is_email_verified: user.is_email_verified,
      created_at: user.created_at,
    };
  }
}
