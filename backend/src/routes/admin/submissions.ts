import express, { Request, Response } from 'express';
import pool from '../../db/connection';
import { body, query, validationResult } from 'express-validator';
import { authMiddleware, requireRole, AuthRequest } from '../../middleware/auth';
import { sendSubmissionStatusNotification } from '../../services/email';
import logger from '../../utils/logger';

const router = express.Router();

// Apply authentication and role check to all routes
router.use(authMiddleware);
router.use(requireRole('content_manager', 'administrator'));

/**
 * GET /api/admin/submissions - Get all submissions with filtering
 */
router.get('/',
  [
    query('type').optional().isIn(['story', 'volunteer', 'contributor', 'contact']).withMessage('Invalid submission type'),
    query('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { type, status, page = '1', limit = '20' } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      // Build query
      let queryText = 'SELECT * FROM submissions WHERE 1=1';
      const queryParams: any[] = [];
      let paramIndex = 1;

      if (type) {
        queryText += ` AND submission_type = $${paramIndex}`;
        queryParams.push(type);
        paramIndex++;
      }

      if (status) {
        queryText += ` AND status = $${paramIndex}`;
        queryParams.push(status);
        paramIndex++;
      }

      queryText += ' ORDER BY created_at DESC';
      queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      queryParams.push(parseInt(limit as string), offset);

      // Get submissions
      const result = await pool.query(queryText, queryParams);

      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) FROM submissions WHERE 1=1';
      const countParams: any[] = [];
      let countParamIndex = 1;

      if (type) {
        countQuery += ` AND submission_type = $${countParamIndex}`;
        countParams.push(type);
        countParamIndex++;
      }

      if (status) {
        countQuery += ` AND status = $${countParamIndex}`;
        countParams.push(status);
      }

      const countResult = await pool.query(countQuery, countParams);
      const totalCount = parseInt(countResult.rows[0].count);

      res.json({
        submissions: result.rows,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: totalCount,
          totalPages: Math.ceil(totalCount / parseInt(limit as string))
        }
      });
    } catch (error) {
      console.error('Error fetching submissions:', error);
      res.status(500).json({ error: { message: 'Failed to fetch submissions', code: 'SERVER_ERROR' } });
    }
  }
);

/**
 * GET /api/admin/submissions/pending-count - Get pending submissions count
 */
router.get('/pending-count', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) FROM submissions WHERE status = 'pending'`
    );

    res.json({
      pendingCount: parseInt(result.rows[0].count)
    });

  } catch (error) {
    logger.error('Error fetching pending submissions count:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch pending count',
        code: 'DATABASE_ERROR'
      }
    });
  }
});

/**
 * GET /api/admin/submissions/:id - Get single submission by ID
 */
router.get('/:id',
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'SELECT * FROM submissions WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: { message: 'Submission not found', code: 'NOT_FOUND' }
        });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching submission:', error);
      res.status(500).json({ error: { message: 'Failed to fetch submission', code: 'SERVER_ERROR' } });
    }
  }
);

/**
 * PUT /api/admin/submissions/:id/approve - Approve a submission
 */
router.put('/:id/approve',
  [
    body('feedback').optional().trim()
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { feedback } = req.body;

      // Check if submission exists
      const submissionResult = await pool.query(
        'SELECT * FROM submissions WHERE id = $1',
        [id]
      );

      if (submissionResult.rows.length === 0) {
        return res.status(404).json({
          error: { message: 'Submission not found', code: 'NOT_FOUND' }
        });
      }

      const submission = submissionResult.rows[0];

      // Update submission status
      await pool.query(
        `UPDATE submissions 
         SET status = $1, reviewed_by = $2, reviewed_at = NOW(), feedback = $3
         WHERE id = $4`,
        ['approved', req.user?.userId, feedback || null, id]
      );

      // Send email notification to submitter
      try {
        await sendSubmissionStatusNotification(
          submission.submitter_email,
          submission.submitter_name,
          submission.submission_type,
          'approved',
          feedback
        );
      } catch (emailError) {
        logger.error('Failed to send status notification email:', emailError);
        // Don't fail the approval if email fails
      }

      res.json({
        message: 'Submission approved successfully',
        submissionId: id
      });
    } catch (error) {
      console.error('Error approving submission:', error);
      res.status(500).json({ error: { message: 'Failed to approve submission', code: 'SERVER_ERROR' } });
    }
  }
);

/**
 * PUT /api/admin/submissions/:id/reject - Reject a submission
 */
router.put('/:id/reject',
  [
    body('feedback').optional().trim()
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { feedback } = req.body;

      // Check if submission exists
      const submissionResult = await pool.query(
        'SELECT * FROM submissions WHERE id = $1',
        [id]
      );

      if (submissionResult.rows.length === 0) {
        return res.status(404).json({
          error: { message: 'Submission not found', code: 'NOT_FOUND' }
        });
      }

      const submission = submissionResult.rows[0];

      // Update submission status
      await pool.query(
        `UPDATE submissions 
         SET status = $1, reviewed_by = $2, reviewed_at = NOW(), feedback = $3
         WHERE id = $4`,
        ['rejected', req.user?.userId, feedback || null, id]
      );

      // Send email notification to submitter with feedback
      try {
        await sendSubmissionStatusNotification(
          submission.submitter_email,
          submission.submitter_name,
          submission.submission_type,
          'rejected',
          feedback
        );
      } catch (emailError) {
        logger.error('Failed to send status notification email:', emailError);
        // Don't fail the rejection if email fails
      }

      res.json({
        message: 'Submission rejected',
        submissionId: id
      });
    } catch (error) {
      console.error('Error rejecting submission:', error);
      res.status(500).json({ error: { message: 'Failed to reject submission', code: 'SERVER_ERROR' } });
    }
  }
);

/**
 * DELETE /api/admin/submissions/:id - Delete a submission
 */
router.delete('/:id',
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Check if submission exists
      const submissionResult = await pool.query(
        'SELECT id FROM submissions WHERE id = $1',
        [id]
      );

      if (submissionResult.rows.length === 0) {
        return res.status(404).json({
          error: { message: 'Submission not found', code: 'NOT_FOUND' }
        });
      }

      // Delete submission
      await pool.query('DELETE FROM submissions WHERE id = $1', [id]);

      res.json({
        message: 'Submission deleted successfully',
        submissionId: id
      });
    } catch (error) {
      console.error('Error deleting submission:', error);
      res.status(500).json({ error: { message: 'Failed to delete submission', code: 'SERVER_ERROR' } });
    }
  }
);

export default router;
