import pool from '../db/connection';

export interface Signature {
  id: string;
  petitionId: string;
  userId: string;
  userName: string;
  createdAt: Date;
}

export class SignatureModel {
  /**
   * Create a signature (sign a petition)
   */
  static async create(petitionId: string, userId: string): Promise<Signature> {
    const result = await pool.query(
      `INSERT INTO signatures (petition_id, user_id) 
       VALUES ($1, $2) 
       ON CONFLICT (petition_id, user_id) DO NOTHING
       RETURNING id, petition_id, user_id, created_at`,
      [petitionId, userId]
    );

    // If no rows returned, signature already exists
    if (result.rows.length === 0) {
      // Get existing signature
      const existing = await pool.query(
        `SELECT s.id, s.petition_id, s.user_id, s.created_at, u.name as user_name
         FROM signatures s
         JOIN users u ON s.user_id = u.id
         WHERE s.petition_id = $1 AND s.user_id = $2`,
        [petitionId, userId]
      );

      return {
        id: existing.rows[0].id,
        petitionId: existing.rows[0].petition_id,
        userId: existing.rows[0].user_id,
        userName: existing.rows[0].user_name,
        createdAt: existing.rows[0].created_at
      };
    }

    // Get user name for new signature
    const userResult = await pool.query(
      `SELECT name FROM users WHERE id = $1`,
      [userId]
    );

    return {
      id: result.rows[0].id,
      petitionId: result.rows[0].petition_id,
      userId: result.rows[0].user_id,
      userName: userResult.rows[0].name,
      createdAt: result.rows[0].created_at
    };
  }

  /**
   * Get signatures for a petition
   */
  static async getByPetitionId(
    petitionId: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<{ signatures: Signature[]; total: number }> {
    const { limit = 50, offset = 0 } = options;

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM signatures WHERE petition_id = $1`,
      [petitionId]
    );
    const total = parseInt(countResult.rows[0].count);

    // Get signatures with user names
    const result = await pool.query(
      `SELECT s.id, s.petition_id, s.user_id, s.created_at, u.name as user_name
       FROM signatures s
       JOIN users u ON s.user_id = u.id
       WHERE s.petition_id = $1
       ORDER BY s.created_at DESC
       LIMIT $2 OFFSET $3`,
      [petitionId, limit, offset]
    );

    const signatures = result.rows.map(row => ({
      id: row.id,
      petitionId: row.petition_id,
      userId: row.user_id,
      userName: row.user_name,
      createdAt: row.created_at
    }));

    return { signatures, total };
  }

  /**
   * Check if user has signed a petition
   */
  static async hasSigned(petitionId: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      `SELECT 1 FROM signatures WHERE petition_id = $1 AND user_id = $2`,
      [petitionId, userId]
    );

    return result.rows.length > 0;
  }

  /**
   * Get signature count for a petition
   */
  static async getCount(petitionId: string): Promise<number> {
    const result = await pool.query(
      `SELECT COUNT(*) FROM signatures WHERE petition_id = $1`,
      [petitionId]
    );

    return parseInt(result.rows[0].count);
  }
}
