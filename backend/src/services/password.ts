import bcrypt from 'bcrypt';
import crypto from 'crypto';
import pool from '../db/connection';
import { UserModel } from '../models/User';
import { PasswordResetTokenModel } from '../models/PasswordResetToken';
import { rateLimitService } from './rate-limit';
import { sendPasswordResetEmail } from './email';
import logger from '../utils/logger';
import { UnauthorizedError, BadRequestError } from '../utils/errors';

/**
 * Password validation result interface
 */
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Token generation result interface
 */
export interface TokenGenerationResult {
  token: string; // Plain token to send in email
  tokenHash: string; // Hashed token to store in DB
  expiresAt: Date;
}

/**
 * PasswordService handles password validation, hashing, and verification
 * for the admin password management feature.
 * 
 * Requirements validated: 2.1, 2.2, 2.3, 2.4, 2.5, 2.7, 1.4
 */
export class PasswordService {
  private static readonly MIN_LENGTH = 8;
  private static readonly SPECIAL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  private static readonly BCRYPT_SALT_ROUNDS = 10;
  private static readonly TOKEN_BYTES = 32; // 32 bytes = 64 hex characters
  private static readonly TOKEN_EXPIRY_HOURS = 1;

  /**
   * Validate password against security requirements
   * 
   * Requirements:
   * - Minimum 8 characters (2.1)
   * - At least one uppercase letter (2.2)
   * - At least one lowercase letter (2.3)
   * - At least one digit (2.4)
   * - At least one special character from allowed set (2.5)
   * - Must not match user's email address (2.7)
   * 
   * @param password - The password to validate
   * @param email - Optional email to check against password
   * @returns Validation result with isValid flag and error messages
   */
  validatePassword(password: string, email?: string): PasswordValidationResult {
    const errors: string[] = [];

    // Check minimum length (Requirement 2.1)
    if (password.length < PasswordService.MIN_LENGTH) {
      errors.push(`Password must be at least ${PasswordService.MIN_LENGTH} characters long`);
    }

    // Check for uppercase letter (Requirement 2.2)
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    // Check for lowercase letter (Requirement 2.3)
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    // Check for digit (Requirement 2.4)
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one digit');
    }

    // Check for special character (Requirement 2.5)
    const hasSpecialChar = PasswordService.SPECIAL_CHARS.split('').some(char => password.includes(char));
    if (!hasSpecialChar) {
      errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)');
    }

    // Check password doesn't match email (Requirement 2.7)
    if (email && password.toLowerCase() === email.toLowerCase()) {
      errors.push('Password must not match your email address');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Hash password using bcrypt with salt factor 10+
   * 
   * Requirement 1.4: Hash passwords with bcrypt salt factor 10 or higher
   * 
   * @param password - The plain text password to hash
   * @returns Promise resolving to the bcrypt hash
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, PasswordService.BCRYPT_SALT_ROUNDS);
  }

  /**
   * Verify password against bcrypt hash
   * 
   * Used for authenticating users and verifying current password during password changes
   * 
   * @param password - The plain text password to verify
   * @param hash - The bcrypt hash to compare against
   * @returns Promise resolving to true if password matches, false otherwise
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate secure reset token
   * 
   * Requirements:
   * - Use crypto.randomBytes() with at least 32 bytes (3.2, 6.1)
   * - Encode as hex string (results in 64+ character token) (6.6)
   * - Hash the token with bcrypt before storing (6.2)
   * - Set expiration to exactly 1 hour from generation (3.4)
   * 
   * @returns Promise resolving to token generation result with plain token, hash, and expiration
   */
  async generateResetToken(): Promise<TokenGenerationResult> {
    // Generate cryptographically secure random token (Requirement 3.2, 6.1)
    const tokenBuffer = crypto.randomBytes(PasswordService.TOKEN_BYTES);
    const token = tokenBuffer.toString('hex'); // 64 character hex string (Requirement 6.6)

    // Hash the token before storage (Requirement 6.2)
    const tokenHash = await bcrypt.hash(token, PasswordService.BCRYPT_SALT_ROUNDS);

    // Set expiration to exactly 1 hour from now (Requirement 3.4)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + PasswordService.TOKEN_EXPIRY_HOURS);

    return {
      token, // Plain token to send in email
      tokenHash, // Hashed token to store in DB
      expiresAt
    };
  }

  /**
   * Verify reset token and return user ID if valid
   * 
   * Requirements:
   * - Check token exists in database (5.1)
   * - Check token hasn't expired (5.2)
   * - Check token hasn't been used (5.3)
   * - Return user ID if valid, null otherwise
   * 
   * @param token - The plain text token from the reset link
   * @returns Promise resolving to user ID if token is valid, null otherwise
   */
  async verifyResetToken(token: string): Promise<number | null> {
    // Query all active (unused) tokens that haven't expired
    const result = await pool.query(
      `SELECT id, user_id, token_hash, expires_at, used_at
       FROM password_reset_tokens
       WHERE used_at IS NULL AND expires_at > NOW()`,
      []
    );

    // Check each token hash to find a match
    for (const row of result.rows) {
      const isMatch = await bcrypt.compare(token, row.token_hash);
      
      if (isMatch) {
        // Token exists, hasn't been used, and hasn't expired
        return row.user_id;
      }
    }

    // Token not found, expired, or already used
    return null;
  }

  /**
   * Change password for authenticated user
   * 
   * Requirements:
   * - Verify current password against stored hash (1.1, 1.2)
   * - Validate new password against security requirements (1.3)
   * - Hash new password with bcrypt (1.4)
   * - Update user record with new password hash (1.5)
   * - Trigger email notification (1.6)
   * - Add audit logging (8.1)
   * 
   * @param userId - ID of the user changing their password
   * @param currentPassword - Current password for verification
   * @param newPassword - New password to set
   * @throws UnauthorizedError if current password is incorrect
   * @throws BadRequestError if new password fails validation
   */
  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Get user from database
      const user = await UserModel.findById(userId.toString());
      
      if (!user) {
        logger.error('Password change failed: user not found', { userId });
        throw new UnauthorizedError('User not found');
      }

      // Get full user with password hash
      const userWithPassword = await UserModel.findByEmail(user.email);
      
      if (!userWithPassword) {
        logger.error('Password change failed: user not found', { userId });
        throw new UnauthorizedError('User not found');
      }

      // Verify current password (Requirement 1.1, 1.2)
      const isCurrentPasswordValid = await this.verifyPassword(currentPassword, userWithPassword.passwordHash);
      
      if (!isCurrentPasswordValid) {
        logger.warn('Password change failed: incorrect current password', { userId, email: user.email });
        throw new UnauthorizedError('Current password is incorrect', 'INVALID_CURRENT_PASSWORD');
      }

      // Validate new password (Requirement 1.3)
      const validation = this.validatePassword(newPassword, user.email);
      
      if (!validation.isValid) {
        logger.warn('Password change failed: validation errors', { 
          userId, 
          email: user.email,
          errors: validation.errors 
        });
        throw new BadRequestError('Password validation failed', 'VALIDATION_ERROR');
      }

      // Hash new password (Requirement 1.4)
      const newPasswordHash = await this.hashPassword(newPassword);

      // Update user record (Requirement 1.5)
      await UserModel.updatePassword(userId, newPasswordHash);

      const duration = Date.now() - startTime;

      // Audit logging (Requirement 8.1)
      logger.info('Password changed successfully', {
        userId,
        email: user.email,
        timestamp: new Date().toISOString(),
        duration
      });

      // Note: Email notification will be handled by the route handler
      // to allow graceful degradation if email fails (Requirement 7.6)
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Audit logging for failures (Requirement 8.1)
      logger.error('Password change failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        duration
      });
      
      throw error;
    }
  }

  /**
   * Initiate password reset
   * 
   * Requirements:
   * - Check rate limit before processing (4.1, 4.2, 4.3)
   * - Verify email exists in admin users table (3.1)
   * - Generate secure reset token (3.2)
   * - Store token hash with 1-hour expiration (3.3, 3.4)
   * - Invalidate any existing tokens for user (6.4, 6.5)
   * - Send reset email with token link (3.5)
   * - Return generic success message (prevent email enumeration) (3.6)
   * - Add audit logging (8.2)
   * 
   * @param email - Email address to send reset link to
   * @throws Error if rate limit exceeded
   */
  async initiatePasswordReset(email: string): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Check rate limit (Requirement 4.1, 4.2, 4.3)
      const rateLimit = await rateLimitService.checkRateLimit(email);
      
      if (!rateLimit.allowed) {
        logger.warn('Password reset blocked by rate limit', {
          email,
          retryAfter: rateLimit.retryAfter
        });
        
        const error = new Error('Too many password reset requests') as any;
        error.code = 'RATE_LIMIT_EXCEEDED';
        error.retryAfter = rateLimit.retryAfter;
        throw error;
      }

      // Record the attempt
      await rateLimitService.recordAttempt(email);

      // Verify email exists in admin users table (Requirement 3.1)
      const user = await UserModel.findAdminByEmail(email);
      
      const duration = Date.now() - startTime;

      if (user) {
        // Generate secure reset token (Requirement 3.2)
        const tokenResult = await this.generateResetToken();

        // Invalidate any existing tokens for user (Requirement 6.4, 6.5)
        await PasswordResetTokenModel.invalidateUserTokens(parseInt(user.id));

        // Store token hash with expiration (Requirement 3.3, 3.4)
        await PasswordResetTokenModel.create(
          parseInt(user.id),
          tokenResult.tokenHash,
          tokenResult.expiresAt
        );

        // Send reset email (Requirement 3.5)
        // Note: Email failures are handled gracefully in the route handler
        await sendPasswordResetEmail(email, tokenResult.token);

        // Audit logging (Requirement 8.2)
        logger.info('Password reset initiated', {
          email,
          userId: user.id,
          emailExists: true,
          timestamp: new Date().toISOString(),
          duration
        });
      } else {
        // Email doesn't exist - still log but don't reveal this (Requirement 3.6, 8.2)
        logger.info('Password reset requested for non-existent email', {
          email,
          emailExists: false,
          timestamp: new Date().toISOString(),
          duration
        });
      }

      // Always return success to prevent email enumeration (Requirement 3.6)
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Audit logging for failures (Requirement 8.2)
      logger.error('Password reset initiation failed', {
        email,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        duration
      });
      
      throw error;
    }
  }

  /**
   * Complete password reset
   * 
   * Requirements:
   * - Verify token exists, not expired, and not used (5.1, 5.2, 5.3)
   * - Validate new password against security requirements (5.4)
   * - Hash new password with bcrypt (5.5)
   * - Update user record with new password hash and invalidate token (5.6)
   * - Send confirmation email (5.7)
   * - Add audit logging (8.3)
   * 
   * @param token - Reset token from email link
   * @param newPassword - New password to set
   * @throws BadRequestError if token is invalid/expired or password fails validation
   */
  async completePasswordReset(token: string, newPassword: string): Promise<void> {
    const startTime = Date.now();
    let userId: number | null = null;
    
    try {
      // Verify token (Requirement 5.1, 5.2, 5.3)
      userId = await this.verifyResetToken(token);
      
      if (!userId) {
        logger.warn('Password reset failed: invalid or expired token');
        throw new BadRequestError('Invalid or expired reset token', 'INVALID_TOKEN');
      }

      // Get user
      const user = await UserModel.findById(userId.toString());
      
      if (!user) {
        logger.error('Password reset failed: user not found', { userId });
        throw new BadRequestError('Invalid or expired reset token', 'INVALID_TOKEN');
      }

      // Validate new password (Requirement 5.4)
      const validation = this.validatePassword(newPassword, user.email);
      
      if (!validation.isValid) {
        logger.warn('Password reset failed: validation errors', { 
          userId, 
          email: user.email,
          errors: validation.errors 
        });
        throw new BadRequestError('Password validation failed', 'VALIDATION_ERROR');
      }

      // Hash new password (Requirement 5.5)
      const newPasswordHash = await this.hashPassword(newPassword);

      // Update user record (Requirement 5.6)
      await UserModel.updatePassword(userId, newPasswordHash);

      // Mark token as used (Requirement 5.6, 6.3)
      // Find the token ID by comparing hashes
      const tokenResult = await pool.query(
        `SELECT id FROM password_reset_tokens 
         WHERE user_id = $1 AND used_at IS NULL AND expires_at > NOW()`,
        [userId]
      );

      for (const row of tokenResult.rows) {
        const tokenRecord = await PasswordResetTokenModel.findByTokenHash(row.token_hash);
        if (tokenRecord) {
          const isMatch = await bcrypt.compare(token, tokenRecord.tokenHash);
          if (isMatch) {
            await PasswordResetTokenModel.markAsUsed(tokenRecord.id);
            break;
          }
        }
      }

      const duration = Date.now() - startTime;

      // Audit logging (Requirement 8.3)
      logger.info('Password reset completed successfully', {
        userId,
        email: user.email,
        timestamp: new Date().toISOString(),
        duration
      });

      // Note: Email notification will be handled by the route handler
      // to allow graceful degradation if email fails (Requirement 7.6)
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Audit logging for failures (Requirement 8.3)
      logger.error('Password reset completion failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        duration
      });
      
      throw error;
    }
  }
}

// Export singleton instance
export const passwordService = new PasswordService();
