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
 * GET /api/admin/episodes - Get all episodes with pagination, search, and filtering
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { 
      search,
      show_id,
      limit = '20', 
      offset = '0',
      sort = 'published_at',
      order = 'DESC'
    } = req.query;
    
    let query = `
      SELECT e.*, s.title as show_title 
      FROM episodes e 
      LEFT JOIN shows s ON e.show_id = s.id 
      WHERE e.deleted_at IS NULL AND (s.deleted_at IS NULL OR s.id IS NULL)
    `;
    const params: any[] = [];
    let paramCount = 1;

    // Search by keyword in title or description
    if (search) {
      query += ` AND (e.title ILIKE $${paramCount} OR e.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    // Filter by show
    if (show_id) {
      query += ` AND e.show_id = $${paramCount}`;
      params.push(show_id);
      paramCount++;
    }

    // Validate sort and order
    const validSortFields = ['published_at', 'created_at', 'updated_at', 'title', 'episode_number'];
    const validOrders = ['ASC', 'DESC'];
    const sortField = validSortFields.includes(sort as string) ? sort : 'published_at';
    const sortOrder = validOrders.includes((order as string).toUpperCase()) ? (order as string).toUpperCase() : 'DESC';

    query += ` ORDER BY e.${sortField} ${sortOrder}`;
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const result = await pool.query(query, params);

    // Get total count with same filters
    let countQuery = 'SELECT COUNT(*) FROM episodes e WHERE e.deleted_at IS NULL';
    const countParams: any[] = [];
    let countParamCount = 1;

    if (search) {
      countQuery += ` AND (e.title ILIKE $${countParamCount} OR e.description ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
      countParamCount++;
    }

    if (show_id) {
      countQuery += ` AND e.show_id = $${countParamCount}`;
      countParams.push(show_id);
      countParamCount++;
    }

    const countResult = await pool.query(countQuery, countParams);

    // Map database fields to frontend expected fields
    const episodes = result.rows.map(row => ({
      ...row,
      duration: row.duration_seconds ? `${Math.floor(row.duration_seconds / 60)}:${String(row.duration_seconds % 60).padStart(2, '0')}` : undefined
    }));

    res.json({
      episodes,
      count: episodes.length,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error) {
    console.error('Error fetching episodes:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch episodes',
        code: 'FETCH_ERROR'
      }
    });
  }
});

/**
 * GET /api/admin/episodes/:id - Get a single episode by ID
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT e.*, s.title as show_title 
       FROM episodes e 
       LEFT JOIN shows s ON e.show_id = s.id 
       WHERE e.id = $1 AND e.deleted_at IS NULL AND (s.deleted_at IS NULL OR s.id IS NULL)`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Episode not found',
          code: 'NOT_FOUND'
        }
      });
    }

    // Map database fields to frontend expected fields
    const episode = {
      ...result.rows[0],
      duration: result.rows[0].duration_seconds ? `${Math.floor(result.rows[0].duration_seconds / 60)}:${String(result.rows[0].duration_seconds % 60).padStart(2, '0')}` : undefined
    };

    res.json(episode);
  } catch (error) {
    console.error('Error fetching episode:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch episode',
        code: 'FETCH_ERROR'
      }
    });
  }
});

/**
 * POST /api/admin/episodes - Create a new episode
 */
router.post('/',
  [
    body('show_id').isInt().withMessage('Valid show ID is required'),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('audio_url').trim().notEmpty().withMessage('Audio URL is required'),
    body('duration_seconds').optional().isInt({ min: 0 }).withMessage('Duration must be in seconds'),
    body('published_at').optional().isISO8601().withMessage('Invalid date format')
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { 
        show_id,
        title, 
        description, 
        audio_url,
        duration_seconds,
        published_at
      } = req.body;

      // Check if show exists (excluding soft-deleted)
      const showExists = await pool.query('SELECT id FROM shows WHERE id = $1 AND deleted_at IS NULL', [show_id]);
      if (showExists.rows.length === 0) {
        return res.status(404).json({ 
          error: { 
            message: 'Show not found', 
            code: 'SHOW_NOT_FOUND' 
          } 
        });
      }

      // Generate slug from title
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

      const result = await pool.query(
        `INSERT INTO episodes (
          show_id, title, slug, description, audio_url, 
          duration_seconds, published_at, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING *`,
        [
          show_id,
          title, 
          slug,
          description, 
          audio_url,
          duration_seconds || null,
          published_at || null
        ]
      );

      // Map database fields to frontend expected fields
      const episode = {
        ...result.rows[0],
        duration: result.rows[0].duration_seconds ? `${Math.floor(result.rows[0].duration_seconds / 60)}:${String(result.rows[0].duration_seconds % 60).padStart(2, '0')}` : undefined
      };

      res.status(201).json(episode);
    } catch (error) {
      console.error('Error creating episode:', error);
      res.status(500).json({ 
        error: { 
          message: 'Failed to create episode', 
          code: 'SERVER_ERROR' 
        } 
      });
    }
  }
);

/**
 * PUT /api/admin/episodes/:id - Update an episode
 */
router.put('/:id',
  [
    body('show_id').optional().isInt(),
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim().notEmpty(),
    body('audio_url').optional().trim().notEmpty(),
    body('duration_seconds').optional().isInt({ min: 0 }),
    body('published_at').optional().isISO8601()
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const updates = req.body;

      // Check if episode exists (excluding soft-deleted)
      const existingEpisode = await pool.query(
        'SELECT id, audio_url, thumbnail_url FROM episodes WHERE id = $1 AND deleted_at IS NULL', 
        [id]
      );
      if (existingEpisode.rows.length === 0) {
        return res.status(404).json({ 
          error: { 
            message: 'Episode not found', 
            code: 'NOT_FOUND' 
          } 
        });
      }

      // If show_id is being updated, check if new show exists (excluding soft-deleted)
      if (updates.show_id) {
        const showExists = await pool.query('SELECT id FROM shows WHERE id = $1 AND deleted_at IS NULL', [updates.show_id]);
        if (showExists.rows.length === 0) {
          return res.status(404).json({ 
            error: { 
              message: 'Show not found', 
              code: 'SHOW_NOT_FOUND' 
            } 
          });
        }
      }

      // If title is being updated, regenerate slug
      if (updates.title) {
        updates.slug = updates.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      }

      // If audio_url is being updated, we should delete the old file from S3
      // TODO: Implement S3 file deletion
      // if (updates.audio_url && updates.audio_url !== existingEpisode.rows[0].audio_url) {
      //   await deleteFromS3(existingEpisode.rows[0].audio_url);
      // }

      // Build update query dynamically
      const fields = Object.keys(updates);
      const values = Object.values(updates);
      const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');

      const result = await pool.query(
        `UPDATE episodes SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`,
        [...values, id]
      );


      // Map database fields to frontend expected fields
      const episode = {
        ...result.rows[0],
        duration: result.rows[0].duration_seconds ? `${Math.floor(result.rows[0].duration_seconds / 60)}:${String(result.rows[0].duration_seconds % 60).padStart(2, "0")}` : undefined
      };
      res.json(episode);
    } catch (error) {
      console.error('Error updating episode:', error);
      res.status(500).json({ 
        error: { 
          message: 'Failed to update episode', 
          code: 'SERVER_ERROR' 
        } 
      });
    }
  }
);

/**
 * DELETE /api/admin/episodes/:id - Soft delete an episode
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if episode exists and get protection status
    const existingEpisode = await pool.query(
      'SELECT id, protected, audio_url FROM episodes WHERE id = $1 AND deleted_at IS NULL', 
      [id]
    );
    if (existingEpisode.rows.length === 0) {
      return res.status(404).json({ 
        error: { 
          message: 'Episode not found', 
          code: 'NOT_FOUND' 
        } 
      });
    }

    const episode = existingEpisode.rows[0];

    // Check if protected and user is not super admin
    if (episode.protected && req.user?.role !== 'administrator') {
      logger.warn('Regular admin attempted to delete protected content', {
        userId: req.user?.userId,
        userEmail: req.user?.email,
        contentType: 'episode',
        contentId: id
      });
      return res.status(403).json({ 
        error: { 
          message: 'Cannot delete protected content. Only super admins can delete protected items.', 
          code: 'PROTECTED_CONTENT' 
        } 
      });
    }

    // Soft delete the episode
    await pool.query(
      'UPDATE episodes SET deleted_at = NOW(), deleted_by = $1, updated_at = NOW() WHERE id = $2',
      [req.user?.userId, id]
    );

    // Audit log
    logger.info('Content soft deleted', {
      contentType: 'episode',
      contentId: id,
      userId: req.user?.userId,
      userEmail: req.user?.email,
      protected: episode.protected
    });

    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting episode:', error);
    res.status(500).json({ 
      error: { 
        message: 'Failed to delete episode', 
        code: 'SERVER_ERROR' 
      } 
    });
  }
});

export default router;
