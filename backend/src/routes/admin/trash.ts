import express, { Response } from 'express';
import pool from '../../db/connection';
import { authMiddleware, requireRole, AuthRequest } from '../../middleware/auth';
import { param, validationResult } from 'express-validator';
import logger from '../../utils/logger';

const router = express.Router();

// All admin routes require authentication and content_manager or administrator role
router.use(authMiddleware);
router.use(requireRole('content_manager', 'administrator'));

/**
 * GET /api/admin/trash - Get soft-deleted items across all content types
 * Returns the last 5 deleted items per content type
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const contentTypes = ['articles', 'shows', 'episodes', 'events', 'resources'];
    const trash: any = {};
    
    for (const type of contentTypes) {
      const result = await pool.query(`
        SELECT t.*, u.email as deleted_by_email
        FROM ${type} t
        LEFT JOIN users u ON t.deleted_by = u.id
        WHERE t.deleted_at IS NOT NULL
        ORDER BY t.deleted_at DESC
        LIMIT 5
      `);
      trash[type] = result.rows;
    }
    
    res.json(trash);
  } catch (error) {
    logger.error('Error fetching trash:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch trash',
        code: 'FETCH_ERROR'
      }
    });
  }
});

/**
 * POST /api/admin/:contentType/:id/restore - Restore a soft-deleted item
 */
router.post('/:contentType/:id/restore',
  [
    param('contentType').isIn(['articles', 'shows', 'episodes', 'events', 'resources'])
      .withMessage('Invalid content type'),
    param('id').isInt().withMessage('ID must be an integer')
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { contentType, id } = req.params;
      
      // Check if item exists and is deleted
      const item = await pool.query(
        `SELECT * FROM ${contentType} WHERE id = $1 AND deleted_at IS NOT NULL`,
        [id]
      );
      
      if (item.rows.length === 0) {
        return res.status(404).json({ 
          error: { 
            message: 'Deleted item not found', 
            code: 'NOT_FOUND' 
          } 
        });
      }
      
      // Restore the item
      const result = await pool.query(
        `UPDATE ${contentType} SET deleted_at = NULL, deleted_by = NULL, updated_at = NOW() WHERE id = $1 RETURNING *`,
        [id]
      );
      
      // Audit log
      logger.info('Content restored', {
        contentType,
        contentId: id,
        userId: req.user?.userId,
        userEmail: req.user?.email
      });
      
      res.json(result.rows[0]);
    } catch (error) {
      logger.error('Error restoring content:', error);
      res.status(500).json({ 
        error: { 
          message: 'Failed to restore content', 
          code: 'SERVER_ERROR' 
        } 
      });
    }
  }
);

/**
 * PATCH /api/admin/:contentType/:id/protect - Mark content as protected (super admin only)
 */
router.patch('/:contentType/:id/protect',
  [
    param('contentType').isIn(['articles', 'shows', 'episodes', 'events', 'resources'])
      .withMessage('Invalid content type'),
    param('id').isInt().withMessage('ID must be an integer')
  ],
  requireRole('administrator'),
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { contentType, id } = req.params;
      
      // Check if item exists and is not deleted
      const item = await pool.query(
        `SELECT * FROM ${contentType} WHERE id = $1 AND deleted_at IS NULL`,
        [id]
      );
      
      if (item.rows.length === 0) {
        return res.status(404).json({ 
          error: { 
            message: 'Content not found', 
            code: 'NOT_FOUND' 
          } 
        });
      }
      
      // Mark as protected
      const result = await pool.query(
        `UPDATE ${contentType} SET protected = true, updated_at = NOW() WHERE id = $1 RETURNING *`,
        [id]
      );
      
      // Audit log
      logger.info('Content protected', {
        contentType,
        contentId: id,
        userId: req.user?.userId,
        userEmail: req.user?.email
      });
      
      res.json(result.rows[0]);
    } catch (error) {
      logger.error('Error protecting content:', error);
      res.status(500).json({ 
        error: { 
          message: 'Failed to protect content', 
          code: 'SERVER_ERROR' 
        } 
      });
    }
  }
);

/**
 * PATCH /api/admin/:contentType/:id/unprotect - Remove protection from content (super admin only)
 */
router.patch('/:contentType/:id/unprotect',
  [
    param('contentType').isIn(['articles', 'shows', 'episodes', 'events', 'resources'])
      .withMessage('Invalid content type'),
    param('id').isInt().withMessage('ID must be an integer')
  ],
  requireRole('administrator'),
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { contentType, id } = req.params;
      
      // Check if item exists and is not deleted
      const item = await pool.query(
        `SELECT * FROM ${contentType} WHERE id = $1 AND deleted_at IS NULL`,
        [id]
      );
      
      if (item.rows.length === 0) {
        return res.status(404).json({ 
          error: { 
            message: 'Content not found', 
            code: 'NOT_FOUND' 
          } 
        });
      }
      
      // Remove protection
      const result = await pool.query(
        `UPDATE ${contentType} SET protected = false, updated_at = NOW() WHERE id = $1 RETURNING *`,
        [id]
      );
      
      // Audit log
      logger.info('Content unprotected', {
        contentType,
        contentId: id,
        userId: req.user?.userId,
        userEmail: req.user?.email
      });
      
      res.json(result.rows[0]);
    } catch (error) {
      logger.error('Error unprotecting content:', error);
      res.status(500).json({ 
        error: { 
          message: 'Failed to unprotect content', 
          code: 'SERVER_ERROR' 
        } 
      });
    }
  }
);

export default router;
