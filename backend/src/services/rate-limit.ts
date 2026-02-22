import { RateLimitRecordModel } from '../models/RateLimitRecord';
import logger from '../utils/logger';

/**
 * Rate limit result interface
 */
export interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number; // seconds until next attempt allowed
}

/**
 * RateLimitService handles rate limiting for password reset requests
 * 
 * Requirements:
 * - Limit to 3 attempts per 15-minute window per email (4.1)
 * - Return error with retry-after time when limit exceeded (4.2, 4.3)
 * - Track rate limits using email address as key (4.4)
 * - Reset counter after 15-minute window expires (4.5)
 */
export class RateLimitService {
  private static readonly MAX_ATTEMPTS = 3;
  private static readonly WINDOW_MINUTES = 15;

  /**
   * Check if request is within rate limit
   * 
   * @param email - Email address to check rate limit for
   * @returns Rate limit result with allowed flag and optional retryAfter time
   */
  async checkRateLimit(email: string): Promise<RateLimitResult> {
    try {
      // Get or create rate limit record
      const record = await RateLimitRecordModel.getOrCreate(email);
      
      // Calculate window expiration time
      const windowStart = new Date(record.windowStart);
      const windowEnd = new Date(windowStart.getTime() + RateLimitService.WINDOW_MINUTES * 60 * 1000);
      const now = new Date();
      
      // Check if window has expired
      if (now >= windowEnd) {
        // Window expired, reset the rate limit
        await RateLimitRecordModel.reset(email);
        
        logger.info('Rate limit window expired, reset counter', {
          email,
          previousAttempts: record.attemptCount
        });
        
        return { allowed: true };
      }
      
      // Check if within rate limit
      if (record.attemptCount < RateLimitService.MAX_ATTEMPTS) {
        return { allowed: true };
      }
      
      // Rate limit exceeded, calculate retry-after time
      const retryAfter = Math.ceil((windowEnd.getTime() - now.getTime()) / 1000);
      
      logger.warn('Rate limit exceeded', {
        email,
        attempts: record.attemptCount,
        retryAfter
      });
      
      return {
        allowed: false,
        retryAfter
      };
    } catch (error) {
      logger.error('Error checking rate limit', { email, error });
      // On error, allow the request (fail open for better UX)
      return { allowed: true };
    }
  }

  /**
   * Record a rate limit attempt
   * 
   * @param email - Email address to record attempt for
   */
  async recordAttempt(email: string): Promise<void> {
    try {
      const record = await RateLimitRecordModel.getOrCreate(email);
      
      // Check if window has expired
      const windowStart = new Date(record.windowStart);
      const windowEnd = new Date(windowStart.getTime() + RateLimitService.WINDOW_MINUTES * 60 * 1000);
      const now = new Date();
      
      if (now >= windowEnd) {
        // Window expired, reset instead of increment
        await RateLimitRecordModel.reset(email);
      } else {
        // Window still active, increment attempt count
        await RateLimitRecordModel.incrementAttempts(email);
      }
      
      logger.info('Rate limit attempt recorded', { email });
    } catch (error) {
      logger.error('Error recording rate limit attempt', { email, error });
      // Don't throw - rate limiting is not critical enough to block operations
    }
  }

  /**
   * Clean up expired rate limit records
   * 
   * This should be called periodically (e.g., via cron job) to clean up old records
   */
  async cleanupExpiredRecords(): Promise<void> {
    try {
      await RateLimitRecordModel.cleanupExpired();
      logger.info('Cleaned up expired rate limit records');
    } catch (error) {
      logger.error('Error cleaning up expired rate limit records', { error });
    }
  }
}

// Export singleton instance
export const rateLimitService = new RateLimitService();
