import pool from '../db/connection';

export interface PasswordResetToken {
  id: number;
  userId: number;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
}

export class PasswordResetTokenModel {
  /**
   * Create new reset token
   */
  static async create(userId: number, tokenHash: string, expiresAt: Date): Promise<PasswordResetToken> {
    const result = await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) 
       VALUES ($1, $2, $3) 
       RETURNING id, user_id, token_hash, expires_at, used_at, created_at`,
      [userId, tokenHash, expiresAt]
    );
    
    return {
      id: result.rows[0].id,
      userId: result.rows[0].user_id,
      tokenHash: result.rows[0].token_hash,
      expiresAt: result.rows[0].expires_at,
      usedAt: result.rows[0].used_at,
      createdAt: result.rows[0].created_at
    };
  }

  /**
   * Find token by hash
   */
  static async findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null> {
    const result = await pool.query(
      `SELECT id, user_id, token_hash, expires_at, used_at, created_at 
       FROM password_reset_tokens 
       WHERE token_hash = $1`,
      [tokenHash]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return {
      id: result.rows[0].id,
      userId: result.rows[0].user_id,
      tokenHash: result.rows[0].token_hash,
      expiresAt: result.rows[0].expires_at,
      usedAt: result.rows[0].used_at,
      createdAt: result.rows[0].created_at
    };
  }

  /**
   * Mark token as used
   */
  static async markAsUsed(tokenId: number): Promise<void> {
    await pool.query(
      `UPDATE password_reset_tokens 
       SET used_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [tokenId]
    );
  }

  /**
   * Invalidate all tokens for user
   */
  static async invalidateUserTokens(userId: number): Promise<void> {
    await pool.query(
      `UPDATE password_reset_tokens 
       SET used_at = CURRENT_TIMESTAMP 
       WHERE user_id = $1 AND used_at IS NULL`,
      [userId]
    );
  }

  /**
   * Clean up expired tokens
   */
  static async cleanupExpired(): Promise<void> {
    await pool.query(
      `DELETE FROM password_reset_tokens 
       WHERE expires_at < CURRENT_TIMESTAMP`
    );
  }
}
