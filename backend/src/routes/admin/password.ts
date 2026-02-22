import { Router, Response } from 'express';
import { AuthRequest, authMiddleware } from '../../middleware/auth';
import { passwordService } from '../../services/password';
import { sendPasswordChangeConfirmation, sendPasswordResetConfirmation } from '../../services/email';
import { UserModel } from '../../models/User';
import logger from '../../utils/logger';

const router = Router();

/**
 * POST /api/admin/password/change
 * Change password for authenticated admin user
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7
 */
router.post('/change', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate request body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: {
          message: 'Current password and new password are required',
          code: 'MISSING_FIELDS'
        }
      });
    }

    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        }
      });
    }

    const userId = parseInt(req.user.userId);

    // Change password
    await passwordService.changePassword(userId, currentPassword, newPassword);

    // Send confirmation email (graceful degradation if email fails)
    try {
      const user = await UserModel.findById(req.user.userId);
      if (user) {
        await sendPasswordChangeConfirmation(user.email, user.name);
      }
    } catch (emailError) {
      // Log email failure but don't fail the request (Requirement 7.6)
      logger.error('Failed to send password change confirmation email', {
        userId,
        error: emailError
      });
    }

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error: any) {
    // Handle specific error types
    if (error.code === 'INVALID_CURRENT_PASSWORD') {
      return res.status(401).json({
        error: {
          message: error.message,
          code: error.code
        }
      });
    }

    if (error.code === 'VALIDATION_ERROR') {
      const validation = passwordService.validatePassword(req.body.newPassword, req.user?.email);
      return res.status(400).json({
        error: {
          message: 'Password validation failed',
          code: 'VALIDATION_ERROR',
          details: validation.errors
        }
      });
    }

    logger.error('Password change error', { error, userId: req.user?.userId });
    res.status(500).json({
      error: {
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      }
    });
  }
});

/**
 * POST /api/admin/password/reset/request
 * Initiate password reset process (unauthenticated)
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.1, 4.2, 4.3
 */
router.post('/reset/request', async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;

    // Validate request body
    if (!email) {
      return res.status(400).json({
        error: {
          message: 'Email is required',
          code: 'MISSING_EMAIL'
        }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: {
          message: 'Invalid email format',
          code: 'INVALID_EMAIL'
        }
      });
    }

    // Initiate password reset
    await passwordService.initiatePasswordReset(email);

    // Always return generic success message (Requirement 3.6)
    res.json({
      message: 'If an account exists with this email, a password reset link has been sent'
    });
  } catch (error: any) {
    // Handle rate limit errors
    if (error.code === 'RATE_LIMIT_EXCEEDED') {
      return res.status(429).json({
        error: {
          message: error.message,
          code: error.code,
          retryAfter: error.retryAfter
        }
      });
    }

    logger.error('Password reset request error', { error, email: req.body.email });
    
    // Still return success to prevent email enumeration (Requirement 3.6)
    res.json({
      message: 'If an account exists with this email, a password reset link has been sent'
    });
  }
});

/**
 * POST /api/admin/password/reset/complete
 * Complete password reset with token (unauthenticated)
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8
 */
router.post('/reset/complete', async (req: AuthRequest, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    // Validate request body
    if (!token || !newPassword) {
      return res.status(400).json({
        error: {
          message: 'Token and new password are required',
          code: 'MISSING_FIELDS'
        }
      });
    }

    // Complete password reset
    await passwordService.completePasswordReset(token, newPassword);

    // Get user to send confirmation email
    const userId = await passwordService.verifyResetToken(token);
    if (userId) {
      try {
        const user = await UserModel.findById(userId.toString());
        if (user) {
          await sendPasswordResetConfirmation(user.email, user.name);
        }
      } catch (emailError) {
        // Log email failure but don't fail the request (Requirement 7.6)
        logger.error('Failed to send password reset confirmation email', {
          userId,
          error: emailError
        });
      }
    }

    res.json({
      message: 'Password reset successfully'
    });
  } catch (error: any) {
    // Handle specific error types
    if (error.code === 'INVALID_TOKEN') {
      return res.status(400).json({
        error: {
          message: error.message,
          code: error.code
        }
      });
    }

    if (error.code === 'VALIDATION_ERROR') {
      const validation = passwordService.validatePassword(req.body.newPassword);
      return res.status(400).json({
        error: {
          message: 'Password validation failed',
          code: 'VALIDATION_ERROR',
          details: validation.errors
        }
      });
    }

    logger.error('Password reset completion error', { error });
    res.status(500).json({
      error: {
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      }
    });
  }
});

export default router;
