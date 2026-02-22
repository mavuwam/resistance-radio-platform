import pool from '../db/connection';

export interface RateLimitRecord {
  id: number;
  email: string;
  attemptCount: number;
  windowStart: Date;
  createdAt: Date;
}

export class RateLimitRecordModel {
  /**
   * Get or create rate limit record
   */
  static async getOrCreate(email: string): Promise<RateLimitRecord> {
    // Try to get existing record
    const existingResult = await pool.query(
      `SELECT id, email, attempt_count, window_start, created_at 
       FROM password_reset_rate_limits 
       WHERE email = $1`,
      [email]
    );
    
    if (existingResult.rows.length > 0) {
      return {
        id: existingResult.rows[0].id,
        email: existingResult.rows[0].email,
        attemptCount: existingResult.rows[0].attempt_count,
        windowStart: existingResult.rows[0].window_start,
        createdAt: existingResult.rows[0].created_at
      };
    }
    
    // Create new record if doesn't exist
    const createResult = await pool.query(
      `INSERT INTO password_reset_rate_limits (email, attempt_count, window_start) 
       VALUES ($1, 1, CURRENT_TIMESTAMP) 
       RETURNING id, email, attempt_count, window_start, created_at`,
      [email]
    );
    
    return {
      id: createResult.rows[0].id,
      email: createResult.rows[0].email,
      attemptCount: createResult.rows[0].attempt_count,
      windowStart: createResult.rows[0].window_start,
      createdAt: createResult.rows[0].created_at
    };
  }

  /**
   * Increment attempt count
   */
  static async incrementAttempts(email: string): Promise<RateLimitRecord> {
    const result = await pool.query(
      `UPDATE password_reset_rate_limits 
       SET attempt_count = attempt_count + 1 
       WHERE email = $1 
       RETURNING id, email, attempt_count, window_start, created_at`,
      [email]
    );
    
    return {
      id: result.rows[0].id,
      email: result.rows[0].email,
      attemptCount: result.rows[0].attempt_count,
      windowStart: result.rows[0].window_start,
      createdAt: result.rows[0].created_at
    };
  }

  /**
   * Reset rate limit for email
   */
  static async reset(email: string): Promise<void> {
    await pool.query(
      `UPDATE password_reset_rate_limits 
       SET attempt_count = 1, window_start = CURRENT_TIMESTAMP 
       WHERE email = $1`,
      [email]
    );
  }

  /**
   * Clean up expired records
   */
  static async cleanupExpired(): Promise<void> {
    // Clean up records older than 15 minutes
    await pool.query(
      `DELETE FROM password_reset_rate_limits 
       WHERE window_start < CURRENT_TIMESTAMP - INTERVAL '15 minutes'`
    );
  }
}
