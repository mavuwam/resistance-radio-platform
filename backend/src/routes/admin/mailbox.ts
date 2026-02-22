import express, { Response } from 'express';
import pool from '../../db/connection';
import { authMiddleware, requireRole, AuthRequest } from '../../middleware/auth';
import { body, validationResult } from 'express-validator';
import logger from '../../utils/logger';

const router = express.Router();

// All admin routes require authentication and content_manager or administrator role
router.use(authMiddleware);
router.use(requireRole('content_manager', 'administrator'));

/**
 * GET /api/admin/mailbox - Get emails with pagination, filtering, and search
 * 
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 50)
 * - status: Filter by status (all, unread, read, archived)
 * - search: Search in from_address, subject, body_text
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        error: {
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        }
      });
    }

    const {
      page = '1',
      limit = '50',
      status,
      search
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const offset = (pageNum - 1) * limitNum;

    // Build query with filters
    let query = `
      SELECT 
        id,
        from_address,
        from_name,
        to_address,
        subject,
        SUBSTRING(body_text, 1, 200) as body_preview,
        status,
        is_starred,
        received_at,
        read_at
      FROM admin_emails
      WHERE admin_user_id = $1
        AND status != 'deleted'
    `;
    
    const params: any[] = [userId];
    let paramCount = 2;

    // Status filter
    if (status && status !== 'all') {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    // Search filter (full-text search)
    if (search && typeof search === 'string' && search.trim()) {
      query += ` AND (
        from_address ILIKE $${paramCount} OR
        subject ILIKE $${paramCount} OR
        body_text ILIKE $${paramCount}
      )`;
      params.push(`%${search.trim()}%`);
      paramCount++;
    }

    // Order by newest first
    query += ` ORDER BY received_at DESC`;
    
    // Pagination
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limitNum, offset);

    const result = await pool.query(query, params);

    // Get total count with same filters
    let countQuery = `
      SELECT COUNT(*) 
      FROM admin_emails 
      WHERE admin_user_id = $1
        AND status != 'deleted'
    `;
    const countParams: any[] = [userId];
    let countParamCount = 2;

    if (status && status !== 'all') {
      countQuery += ` AND status = $${countParamCount}`;
      countParams.push(status);
      countParamCount++;
    }

    if (search && typeof search === 'string' && search.trim()) {
      countQuery += ` AND (
        from_address ILIKE $${countParamCount} OR
        subject ILIKE $${countParamCount} OR
        body_text ILIKE $${countParamCount}
      )`;
      countParams.push(`%${search.trim()}%`);
      countParamCount++;
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    // Get unread count
    const unreadResult = await pool.query(
      `SELECT COUNT(*) FROM admin_emails 
       WHERE admin_user_id = $1 AND status = 'unread'`,
      [userId]
    );
    const unreadCount = parseInt(unreadResult.rows[0].count);

    // Format response
    const emails = result.rows.map(row => ({
      id: row.id,
      fromAddress: row.from_address,
      fromName: row.from_name,
      toAddress: row.to_address,
      subject: row.subject,
      bodyPreview: row.body_preview,
      status: row.status,
      isStarred: row.is_starred,
      receivedAt: row.received_at,
      readAt: row.read_at
    }));

    res.json({
      emails,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalCount,
        limit: limitNum
      },
      unreadCount
    });

  } catch (error) {
    logger.error('Error fetching emails:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch emails',
        code: 'DATABASE_ERROR'
      }
    });
  }
});

/**
 * GET /api/admin/mailbox/unread-count - Get unread email count
 */
router.get('/unread-count', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        error: {
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        }
      });
    }

    const result = await pool.query(
      `SELECT COUNT(*) FROM admin_emails 
       WHERE admin_user_id = $1 AND status = 'unread'`,
      [userId]
    );

    res.json({
      unreadCount: parseInt(result.rows[0].count)
    });

  } catch (error) {
    logger.error('Error fetching unread count:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch unread count',
        code: 'DATABASE_ERROR'
      }
    });
  }
});

/**
 * GET /api/admin/mailbox/addresses - Get user's email addresses
 */
router.get('/addresses', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        error: {
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        }
      });
    }

    const result = await pool.query(
      `SELECT id, email_address, is_primary, is_active, created_at
       FROM admin_email_addresses
       WHERE admin_user_id = $1
       ORDER BY is_primary DESC, created_at ASC`,
      [userId]
    );

    const addresses = result.rows.map(row => ({
      id: row.id,
      emailAddress: row.email_address,
      isPrimary: row.is_primary,
      isActive: row.is_active,
      createdAt: row.created_at
    }));

    res.json({ addresses });

  } catch (error) {
    logger.error('Error fetching email addresses:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch email addresses',
        code: 'DATABASE_ERROR'
      }
    });
  }
});

/**
 * GET /api/admin/mailbox/:id - Get email detail
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const emailId = parseInt(req.params.id);
    
    if (!userId) {
      return res.status(401).json({
        error: {
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        }
      });
    }

    if (isNaN(emailId)) {
      return res.status(400).json({
        error: {
          message: 'Invalid email ID',
          code: 'INVALID_EMAIL_ID'
        }
      });
    }

    // Fetch email and verify ownership
    const result = await pool.query(
      `SELECT * FROM admin_emails WHERE id = $1`,
      [emailId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Email not found',
          code: 'EMAIL_NOT_FOUND'
        }
      });
    }

    const email = result.rows[0];

    // Verify email belongs to authenticated user
    if (email.admin_user_id !== parseInt(userId)) {
      logger.warn(`Unauthorized email access attempt: User ${userId} tried to access email ${emailId} belonging to user ${email.admin_user_id}`);
      return res.status(403).json({
        error: {
          message: 'You do not have permission to access this email',
          code: 'FORBIDDEN'
        }
      });
    }

    // Audit log for email access
    logger.info(`Email accessed: User ${userId} viewed email ${emailId}`, {
      userId,
      emailId,
      action: 'view_email',
      timestamp: new Date().toISOString()
    });

    // Automatically mark as read if currently unread
    if (email.status === 'unread') {
      await pool.query(
        `UPDATE admin_emails 
         SET status = 'read', read_at = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [emailId]
      );
      email.status = 'read';
      email.read_at = new Date();
    }

    // Format response
    res.json({
      id: email.id,
      fromAddress: email.from_address,
      fromName: email.from_name,
      toAddress: email.to_address,
      ccAddresses: email.cc_addresses,
      subject: email.subject,
      bodyText: email.body_text,
      bodyHtml: email.body_html,
      status: email.status,
      isStarred: email.is_starred,
      messageId: email.message_id,
      inReplyTo: email.in_reply_to,
      references: email.references,
      receivedAt: email.received_at,
      readAt: email.read_at,
      createdAt: email.created_at
    });

  } catch (error) {
    logger.error('Error fetching email detail:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch email',
        code: 'DATABASE_ERROR'
      }
    });
  }
});

/**
 * PATCH /api/admin/mailbox/:id/status - Update email status
 */
router.patch('/:id/status', [
  body('status').isIn(['unread', 'read', 'archived', 'deleted']).withMessage('Invalid status value')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          code: 'INVALID_STATUS',
          details: errors.array()
        }
      });
    }

    const userId = req.user?.userId;
    const emailId = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        error: {
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        }
      });
    }

    if (isNaN(emailId)) {
      return res.status(400).json({
        error: {
          message: 'Invalid email ID',
          code: 'INVALID_EMAIL_ID'
        }
      });
    }

    // Verify email belongs to user
    const checkResult = await pool.query(
      `SELECT admin_user_id FROM admin_emails WHERE id = $1`,
      [emailId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Email not found',
          code: 'EMAIL_NOT_FOUND'
        }
      });
    }

    if (checkResult.rows[0].admin_user_id !== parseInt(userId)) {
      return res.status(403).json({
        error: {
          message: 'You do not have permission to modify this email',
          code: 'FORBIDDEN'
        }
      });
    }

    // Update status with appropriate timestamps
    let updateQuery = 'UPDATE admin_emails SET status = $1, updated_at = NOW()';
    const params: any[] = [status, emailId];

    if (status === 'read') {
      updateQuery += ', read_at = COALESCE(read_at, NOW())';
    } else if (status === 'unread') {
      updateQuery += ', read_at = NULL';
    } else if (status === 'deleted') {
      updateQuery += ', deleted_at = NOW()';
    }

    updateQuery += ' WHERE id = $2 RETURNING *';

    const result = await pool.query(updateQuery, params);
    const email = result.rows[0];

    res.json({
      success: true,
      email: {
        id: email.id,
        status: email.status,
        readAt: email.read_at,
        deletedAt: email.deleted_at
      }
    });

  } catch (error) {
    logger.error('Error updating email status:', error);
    res.status(500).json({
      error: {
        message: 'Failed to update email status',
        code: 'DATABASE_ERROR'
      }
    });
  }
});

/**
 * PATCH /api/admin/mailbox/:id/star - Toggle star status
 */
router.patch('/:id/star', [
  body('isStarred').isBoolean().withMessage('isStarred must be a boolean')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          code: 'INVALID_INPUT',
          details: errors.array()
        }
      });
    }

    const userId = req.user?.userId;
    const emailId = parseInt(req.params.id);
    const { isStarred } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        error: {
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        }
      });
    }

    if (isNaN(emailId)) {
      return res.status(400).json({
        error: {
          message: 'Invalid email ID',
          code: 'INVALID_EMAIL_ID'
        }
      });
    }

    // Verify email belongs to user
    const checkResult = await pool.query(
      `SELECT admin_user_id FROM admin_emails WHERE id = $1`,
      [emailId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Email not found',
          code: 'EMAIL_NOT_FOUND'
        }
      });
    }

    if (checkResult.rows[0].admin_user_id !== parseInt(userId)) {
      return res.status(403).json({
        error: {
          message: 'You do not have permission to modify this email',
          code: 'FORBIDDEN'
        }
      });
    }

    // Update star status
    const result = await pool.query(
      `UPDATE admin_emails 
       SET is_starred = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, is_starred`,
      [isStarred, emailId]
    );

    res.json({
      success: true,
      email: {
        id: result.rows[0].id,
        isStarred: result.rows[0].is_starred
      }
    });

  } catch (error) {
    logger.error('Error toggling star status:', error);
    res.status(500).json({
      error: {
        message: 'Failed to update star status',
        code: 'DATABASE_ERROR'
      }
    });
  }
});

/**
 * POST /api/admin/mailbox/bulk - Bulk operations on emails
 */
router.post('/bulk', [
  body('emailIds').isArray().withMessage('emailIds must be an array'),
  body('emailIds.*').isInt().withMessage('Each emailId must be an integer'),
  body('action').isIn(['mark_read', 'mark_unread', 'archive', 'delete', 'star', 'unstar'])
    .withMessage('Invalid action')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          code: 'INVALID_INPUT',
          details: errors.array()
        }
      });
    }

    const userId = req.user?.userId;
    const { emailIds, action } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        error: {
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        }
      });
    }

    if (emailIds.length === 0) {
      return res.json({
        success: true,
        updatedCount: 0
      });
    }

    // Verify all emails belong to user
    const checkResult = await pool.query(
      `SELECT id FROM admin_emails 
       WHERE id = ANY($1) AND admin_user_id = $2`,
      [emailIds, userId]
    );

    const validEmailIds = checkResult.rows.map(row => row.id);

    if (validEmailIds.length !== emailIds.length) {
      return res.status(403).json({
        error: {
          message: 'Some emails do not belong to you or do not exist',
          code: 'FORBIDDEN'
        }
      });
    }

    // Perform bulk action
    let updateQuery = 'UPDATE admin_emails SET updated_at = NOW()';
    
    switch (action) {
      case 'mark_read':
        updateQuery += ', status = \'read\', read_at = COALESCE(read_at, NOW())';
        break;
      case 'mark_unread':
        updateQuery += ', status = \'unread\', read_at = NULL';
        break;
      case 'archive':
        updateQuery += ', status = \'archived\'';
        break;
      case 'delete':
        updateQuery += ', status = \'deleted\', deleted_at = NOW()';
        break;
      case 'star':
        updateQuery += ', is_starred = true';
        break;
      case 'unstar':
        updateQuery += ', is_starred = false';
        break;
    }

    updateQuery += ' WHERE id = ANY($1)';

    const result = await pool.query(updateQuery, [validEmailIds]);

    res.json({
      success: true,
      updatedCount: result.rowCount || 0
    });

  } catch (error) {
    logger.error('Error performing bulk operation:', error);
    res.status(500).json({
      error: {
        message: 'Failed to perform bulk operation',
        code: 'DATABASE_ERROR'
      }
    });
  }
});

/**
 * POST /api/admin/mailbox/addresses - Add new email address
 */
router.post('/addresses', [
  body('emailAddress').isEmail().withMessage('Invalid email address'),
  body('isPrimary').optional().isBoolean().withMessage('isPrimary must be a boolean')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          code: 'INVALID_EMAIL_ADDRESS',
          details: errors.array()
        }
      });
    }

    const userId = req.user?.userId;
    const { emailAddress, isPrimary = false } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        error: {
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        }
      });
    }

    // Check if email address already exists
    const existingResult = await pool.query(
      `SELECT id FROM admin_email_addresses WHERE email_address = $1`,
      [emailAddress.toLowerCase()]
    );

    if (existingResult.rows.length > 0) {
      return res.status(400).json({
        error: {
          message: 'Email address already exists',
          code: 'EMAIL_EXISTS'
        }
      });
    }

    // If setting as primary, unset other primary addresses for this user
    if (isPrimary) {
      await pool.query(
        `UPDATE admin_email_addresses 
         SET is_primary = false 
         WHERE admin_user_id = $1`,
        [userId]
      );
    }

    // Insert new email address
    const result = await pool.query(
      `INSERT INTO admin_email_addresses 
       (admin_user_id, email_address, is_primary, is_active, created_at)
       VALUES ($1, $2, $3, true, NOW())
       RETURNING *`,
      [userId, emailAddress.toLowerCase(), isPrimary]
    );

    const address = result.rows[0];

    res.status(201).json({
      id: address.id,
      emailAddress: address.email_address,
      isPrimary: address.is_primary,
      isActive: address.is_active,
      createdAt: address.created_at
    });

  } catch (error) {
    logger.error('Error adding email address:', error);
    res.status(500).json({
      error: {
        message: 'Failed to add email address',
        code: 'DATABASE_ERROR'
      }
    });
  }
});

/**
 * DELETE /api/admin/mailbox/addresses/:id - Remove email address
 */
router.delete('/addresses/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const addressId = parseInt(req.params.id);
    
    if (!userId) {
      return res.status(401).json({
        error: {
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        }
      });
    }

    if (isNaN(addressId)) {
      return res.status(400).json({
        error: {
          message: 'Invalid address ID',
          code: 'INVALID_ADDRESS_ID'
        }
      });
    }

    // Verify address belongs to user
    const checkResult = await pool.query(
      `SELECT admin_user_id FROM admin_email_addresses WHERE id = $1`,
      [addressId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Email address not found',
          code: 'ADDRESS_NOT_FOUND'
        }
      });
    }

    if (checkResult.rows[0].admin_user_id !== parseInt(userId)) {
      return res.status(403).json({
        error: {
          message: 'You do not have permission to delete this email address',
          code: 'FORBIDDEN'
        }
      });
    }

    // Delete address
    await pool.query(
      `DELETE FROM admin_email_addresses WHERE id = $1`,
      [addressId]
    );

    res.json({
      success: true,
      message: 'Email address removed successfully'
    });

  } catch (error) {
    logger.error('Error removing email address:', error);
    res.status(500).json({
      error: {
        message: 'Failed to remove email address',
        code: 'DATABASE_ERROR'
      }
    });
  }
});

export default router;
