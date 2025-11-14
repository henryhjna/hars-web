import { query } from '../config/database';
import { Submission, SubmissionStatus } from '../types';

export class SubmissionModel {
  // Get all submissions (admin/reviewer)
  static async findAll(): Promise<Submission[]> {
    const sql = 'SELECT * FROM submissions ORDER BY created_at DESC';
    const result = await query(sql);
    return result.rows;
  }

  // Get submissions by event
  static async findByEvent(eventId: string): Promise<Submission[]> {
    const sql = `
      SELECT s.*, u.email, u.first_name, u.last_name
      FROM submissions s
      JOIN users u ON s.user_id = u.id
      WHERE s.event_id = $1
      ORDER BY s.created_at DESC
    `;
    const result = await query(sql, [eventId]);
    return result.rows;
  }

  // Get submissions by user
  static async findByUser(userId: string): Promise<Submission[]> {
    const sql = `
      SELECT s.*, e.title as event_title, e.event_date
      FROM submissions s
      JOIN events e ON s.event_id = e.id
      WHERE s.user_id = $1
      ORDER BY s.created_at DESC
    `;
    const result = await query(sql, [userId]);
    return result.rows;
  }

  // Get submissions assigned to a reviewer
  static async findByReviewer(reviewerId: string): Promise<Submission[]> {
    const sql = `
      SELECT DISTINCT s.*, u.email, u.first_name, u.last_name
      FROM submissions s
      JOIN users u ON s.user_id = u.id
      JOIN review_assignments ra ON s.id = ra.submission_id
      WHERE ra.reviewer_id = $1
      ORDER BY s.created_at DESC
    `;
    const result = await query(sql, [reviewerId]);
    return result.rows;
  }

  // Get submission by ID
  static async findById(id: string): Promise<Submission | null> {
    const sql = 'SELECT * FROM submissions WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  // Get submission with details
  static async findByIdWithDetails(id: string): Promise<any | null> {
    const sql = `
      SELECT
        s.*,
        e.title as event_title,
        e.event_date,
        u.email,
        u.first_name,
        u.last_name,
        u.affiliation
      FROM submissions s
      JOIN events e ON s.event_id = e.id
      JOIN users u ON s.user_id = u.id
      WHERE s.id = $1
    `;
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  // Create submission
  static async create(submissionData: Partial<Submission>): Promise<Submission> {
    const {
      event_id,
      user_id,
      title,
      abstract,
      keywords,
      corresponding_author,
      co_authors,
      pdf_url,
      pdf_filename,
      pdf_size,
      status,
    } = submissionData;

    const sql = `
      INSERT INTO submissions (
        event_id, user_id, title, abstract, keywords,
        corresponding_author, co_authors, pdf_url, pdf_filename,
        pdf_size, status, submitted_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const submittedAt = status === 'submitted' ? new Date() : null;

    const result = await query(sql, [
      event_id,
      user_id,
      title,
      abstract,
      keywords || [],
      corresponding_author,
      co_authors || null,
      pdf_url,
      pdf_filename,
      pdf_size || null,
      status || 'draft',
      submittedAt,
    ]);

    return result.rows[0];
  }

  // Update submission
  static async update(id: string, submissionData: Partial<Submission>): Promise<Submission | null> {
    const {
      title,
      abstract,
      keywords,
      corresponding_author,
      co_authors,
      pdf_url,
      pdf_filename,
      pdf_size,
      status,
    } = submissionData;

    // If status is being changed to 'submitted', update submitted_at
    let submittedAtClause = '';
    const params: any[] = [
      title,
      abstract,
      keywords,
      corresponding_author,
      co_authors,
      pdf_url,
      pdf_filename,
      pdf_size,
      status,
    ];

    if (status === 'submitted') {
      submittedAtClause = ', submitted_at = CURRENT_TIMESTAMP';
    }

    const sql = `
      UPDATE submissions SET
        title = COALESCE($1, title),
        abstract = COALESCE($2, abstract),
        keywords = COALESCE($3, keywords),
        corresponding_author = COALESCE($4, corresponding_author),
        co_authors = COALESCE($5, co_authors),
        pdf_url = COALESCE($6, pdf_url),
        pdf_filename = COALESCE($7, pdf_filename),
        pdf_size = COALESCE($8, pdf_size),
        status = COALESCE($9, status),
        updated_at = CURRENT_TIMESTAMP
        ${submittedAtClause}
      WHERE id = $10
      RETURNING *
    `;

    params.push(id);
    const result = await query(sql, params);
    return result.rows[0] || null;
  }

  // Update submission status (for admin/reviewer)
  static async updateStatus(id: string, status: SubmissionStatus): Promise<Submission | null> {
    const sql = `
      UPDATE submissions SET
        status = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await query(sql, [status, id]);
    return result.rows[0] || null;
  }

  // Delete submission
  static async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM submissions WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rowCount > 0;
  }

  // Check if user can submit to event
  static async canUserSubmit(userId: string, eventId: string): Promise<boolean> {
    // Check if event accepts submissions
    const eventSql = `
      SELECT submission_start_date, submission_end_date, status, event_date
      FROM events
      WHERE id = $1
    `;
    const eventResult = await query(eventSql, [eventId]);

    if (eventResult.rows.length === 0) {
      return false;
    }

    const event = eventResult.rows[0];
    const now = new Date();
    const startDate = new Date(event.submission_start_date);
    const endDate = new Date(event.submission_end_date);
    const eventDate = new Date(event.event_date);

    // Block submissions to past events (event has already occurred)
    if (now > eventDate) {
      return false;
    }

    // Check submission period
    if (now < startDate || now > endDate) {
      return false;
    }

    // Check if user already has a submission for this event
    const submissionSql = `
      SELECT id FROM submissions
      WHERE user_id = $1 AND event_id = $2
      LIMIT 1
    `;
    const submissionResult = await query(submissionSql, [userId, eventId]);

    return submissionResult.rows.length === 0;
  }

  // Get submission count by status for an event
  static async getCountByStatus(eventId: string): Promise<Record<string, number>> {
    const sql = `
      SELECT status, COUNT(*) as count
      FROM submissions
      WHERE event_id = $1
      GROUP BY status
    `;
    const result = await query(sql, [eventId]);

    const counts: Record<string, number> = {
      draft: 0,
      submitted: 0,
      under_review: 0,
      accepted: 0,
      rejected: 0,
      revision_requested: 0,
    };

    result.rows.forEach((row) => {
      counts[row.status] = parseInt(row.count, 10);
    });

    return counts;
  }
}
