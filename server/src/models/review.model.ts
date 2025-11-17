import { query } from '../config/database';
import type { Review, ReviewAssignment } from '../types';

export class ReviewModel {
  // Get review by ID
  static async findById(id: string): Promise<Review | null> {
    const result = await query(
      `SELECT r.*,
              s.title as submission_title,
              u.first_name || ' ' || u.last_name as reviewer_name
       FROM reviews r
       LEFT JOIN submissions s ON r.submission_id = s.id
       LEFT JOIN users u ON r.reviewer_id = u.id
       WHERE r.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  // Get reviews for a submission
  static async findBySubmission(submissionId: string): Promise<Review[]> {
    const result = await query(
      `SELECT r.*,
              u.first_name || ' ' || u.last_name as reviewer_name,
              u.affiliation as reviewer_affiliation
       FROM reviews r
       LEFT JOIN users u ON r.reviewer_id = u.id
       WHERE r.submission_id = $1
       ORDER BY r.created_at DESC`,
      [submissionId]
    );
    return result.rows;
  }

  // Get reviews by reviewer
  static async findByReviewer(reviewerId: string): Promise<Review[]> {
    const result = await query(
      `SELECT r.*,
              s.title as submission_title,
              s.abstract as submission_abstract,
              s.corresponding_author,
              e.title as event_title,
              e.event_date
       FROM reviews r
       LEFT JOIN submissions s ON r.submission_id = s.id
       LEFT JOIN events e ON s.event_id = e.id
       WHERE r.reviewer_id = $1
       ORDER BY r.created_at DESC`,
      [reviewerId]
    );
    return result.rows;
  }

  // Create or update review
  static async upsert(reviewData: Partial<Review>): Promise<Review> {
    const {
      submission_id,
      reviewer_id,
      originality_score,
      methodology_score,
      clarity_score,
      contribution_score,
      strengths,
      weaknesses,
      comments_to_authors,
      comments_to_committee,
      recommendation,
      is_completed,
    } = reviewData;

    // Calculate overall score
    const scores = [originality_score, methodology_score, clarity_score, contribution_score].filter(
      (s) => s !== undefined
    );
    const overall_score = scores.length > 0 ? scores.reduce((a, b) => a! + b!, 0)! / scores.length : null;

    const result = await query(
      `INSERT INTO reviews (
        submission_id, reviewer_id, originality_score, methodology_score,
        clarity_score, contribution_score, overall_score, strengths, weaknesses,
        comments_to_authors, comments_to_committee, recommendation, is_completed, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      ON CONFLICT (submission_id, reviewer_id)
      DO UPDATE SET
        originality_score = COALESCE($3, reviews.originality_score),
        methodology_score = COALESCE($4, reviews.methodology_score),
        clarity_score = COALESCE($5, reviews.clarity_score),
        contribution_score = COALESCE($6, reviews.contribution_score),
        overall_score = COALESCE($7, reviews.overall_score),
        strengths = COALESCE($8, reviews.strengths),
        weaknesses = COALESCE($9, reviews.weaknesses),
        comments_to_authors = COALESCE($10, reviews.comments_to_authors),
        comments_to_committee = COALESCE($11, reviews.comments_to_committee),
        recommendation = COALESCE($12, reviews.recommendation),
        is_completed = COALESCE($13, reviews.is_completed),
        updated_at = NOW()
      RETURNING *`,
      [
        submission_id,
        reviewer_id,
        originality_score,
        methodology_score,
        clarity_score,
        contribution_score,
        overall_score,
        strengths,
        weaknesses,
        comments_to_authors,
        comments_to_committee,
        recommendation,
        is_completed,
      ]
    );

    return result.rows[0];
  }

  // Delete review
  static async delete(id: string): Promise<void> {
    await query('DELETE FROM reviews WHERE id = $1', [id]);
  }

  // Get review statistics for a submission
  static async getSubmissionStats(submissionId: string): Promise<any> {
    const result = await query(
      `SELECT
        COUNT(*) as total_reviews,
        AVG(overall_score) as avg_score,
        COUNT(CASE WHEN is_completed = true THEN 1 END) as completed_reviews,
        COUNT(CASE WHEN recommendation = 'accept' THEN 1 END) as accept_count,
        COUNT(CASE WHEN recommendation = 'reject' THEN 1 END) as reject_count
       FROM reviews
       WHERE submission_id = $1`,
      [submissionId]
    );
    return result.rows[0];
  }
}

export class ReviewAssignmentModel {
  // Get assignment by ID
  static async findById(id: string): Promise<ReviewAssignment | null> {
    const result = await query(
      `SELECT ra.*,
              s.title as submission_title,
              u.first_name || ' ' || u.last_name as reviewer_name,
              u.email as reviewer_email
       FROM review_assignments ra
       LEFT JOIN submissions s ON ra.submission_id = s.id
       LEFT JOIN users u ON ra.reviewer_id = u.id
       WHERE ra.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  // Get assignments for a submission
  static async findBySubmission(submissionId: string): Promise<ReviewAssignment[]> {
    const result = await query(
      `SELECT ra.*,
              u.first_name || ' ' || u.last_name as reviewer_name,
              u.email as reviewer_email,
              u.affiliation as reviewer_affiliation,
              r.is_completed as review_completed,
              r.recommendation as review_recommendation
       FROM review_assignments ra
       LEFT JOIN users u ON ra.reviewer_id = u.id
       LEFT JOIN reviews r ON ra.submission_id = r.submission_id AND ra.reviewer_id = r.reviewer_id
       WHERE ra.submission_id = $1
       ORDER BY ra.assigned_at DESC`,
      [submissionId]
    );
    return result.rows;
  }

  // Get assignments for a reviewer
  static async findByReviewer(reviewerId: string): Promise<ReviewAssignment[]> {
    const result = await query(
      `SELECT ra.*,
              s.title as submission_title,
              s.abstract as submission_abstract,
              s.pdf_url,
              e.title as event_title,
              e.event_date,
              r.is_completed as review_completed,
              r.overall_score as review_score
       FROM review_assignments ra
       LEFT JOIN submissions s ON ra.submission_id = s.id
       LEFT JOIN events e ON s.event_id = e.id
       LEFT JOIN reviews r ON ra.submission_id = r.submission_id AND ra.reviewer_id = r.reviewer_id
       WHERE ra.reviewer_id = $1
       ORDER BY ra.due_date ASC, ra.assigned_at DESC`,
      [reviewerId]
    );
    return result.rows;
  }

  // Create assignment
  static async create(assignmentData: Partial<ReviewAssignment>): Promise<ReviewAssignment> {
    const { submission_id, reviewer_id, assigned_by, due_date } = assignmentData;

    const result = await query(
      `INSERT INTO review_assignments (submission_id, reviewer_id, assigned_by, due_date)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [submission_id, reviewer_id, assigned_by, due_date]
    );

    return result.rows[0];
  }

  // Update assignment status
  static async updateStatus(id: string, status: string): Promise<ReviewAssignment> {
    const result = await query(
      `UPDATE review_assignments
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    return result.rows[0];
  }

  // Delete assignment
  static async delete(id: string): Promise<void> {
    await query('DELETE FROM review_assignments WHERE id = $1', [id]);
  }

  // Check if reviewer is already assigned
  static async isAssigned(submissionId: string, reviewerId: string): Promise<boolean> {
    const result = await query(
      `SELECT id FROM review_assignments
       WHERE submission_id = $1 AND reviewer_id = $2`,
      [submissionId, reviewerId]
    );
    return result.rows.length > 0;
  }
}
