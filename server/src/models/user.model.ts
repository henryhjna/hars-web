import { query } from '../config/database';
import { User, UserRole, UserResponse } from '../types';

export class UserModel {
  static async create(data: {
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
    preferred_name?: string;
    prefix?: string;
    academic_title?: string;
    affiliation?: string;
    email_verification_token: string;
  }): Promise<User> {
    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, preferred_name, prefix, academic_title, affiliation, email_verification_token)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        data.email,
        data.password_hash,
        data.first_name,
        data.last_name,
        data.preferred_name || null,
        data.prefix || null,
        data.academic_title || null,
        data.affiliation || null,
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

  static async setEmailVerificationToken(
    userId: string,
    token: string
  ): Promise<void> {
    await query(
      `UPDATE users
       SET email_verification_token = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [token, userId]
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
      preferred_name?: string;
      prefix?: string;
      academic_title?: string;
      affiliation?: string;
      photo_url?: string;
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

    if (data.preferred_name !== undefined) {
      fields.push(`preferred_name = $${paramCount}`);
      values.push(data.preferred_name || null);
      paramCount++;
    }

    if (data.prefix !== undefined) {
      fields.push(`prefix = $${paramCount}`);
      values.push(data.prefix || null);
      paramCount++;
    }

    if (data.academic_title !== undefined) {
      fields.push(`academic_title = $${paramCount}`);
      values.push(data.academic_title || null);
      paramCount++;
    }

    if (data.affiliation !== undefined) {
      fields.push(`affiliation = $${paramCount}`);
      values.push(data.affiliation || null);
      paramCount++;
    }

    if (data.photo_url !== undefined) {
      fields.push(`photo_url = $${paramCount}`);
      values.push(data.photo_url || null);
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

  static async updateRoles(userId: string, roles: UserRole[]): Promise<void> {
    await query(
      `UPDATE users
       SET roles = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [roles, userId]
    );
  }

  static async deleteUser(userId: string): Promise<void> {
    const deletedUserId = '00000000-0000-0000-0000-000000000000';

    // Use transaction to ensure atomicity
    await query('BEGIN');
    try {
      // 1. Transfer submissions to "Deleted User"
      await query(
        'UPDATE submissions SET user_id = $1 WHERE user_id = $2',
        [deletedUserId, userId]
      );

      // 2. Transfer reviews to "Deleted User"
      await query(
        'UPDATE reviews SET reviewer_id = $1 WHERE reviewer_id = $2',
        [deletedUserId, userId]
      );

      // 3. Transfer review assignments to "Deleted User"
      await query(
        'UPDATE review_assignments SET reviewer_id = $1 WHERE reviewer_id = $2',
        [deletedUserId, userId]
      );

      // 4. Set uploaded_by to NULL for event photos (optional field)
      await query(
        'UPDATE event_photos SET uploaded_by = NULL WHERE uploaded_by = $1',
        [userId]
      );

      // 5. Set user_id to NULL for activity logs (optional field)
      await query(
        'UPDATE activity_logs SET user_id = NULL WHERE user_id = $1',
        [userId]
      );

      // 6. Delete the user
      await query('DELETE FROM users WHERE id = $1', [userId]);

      await query('COMMIT');
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
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
      `SELECT id, email, first_name, last_name, preferred_name, prefix, academic_title, affiliation, photo_url, roles, is_email_verified, created_at
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
      preferred_name: user.preferred_name,
      prefix: user.prefix,
      academic_title: user.academic_title,
      affiliation: user.affiliation,
      photo_url: user.photo_url,
      roles: user.roles,
      is_email_verified: user.is_email_verified,
      created_at: user.created_at,
    };
  }
}
