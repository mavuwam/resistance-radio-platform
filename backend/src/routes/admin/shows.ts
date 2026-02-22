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
 * GET /api/admin/shows - Get all shows with pagination and search
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { 
      search,
      is_active,
      limit = '20', 
      offset = '0',
      sort = 'created_at',
      order = 'DESC'
    } = req.query;
    
    let query = `
      SELECT s.*, COUNT(e.id) as episode_count 
      FROM shows s 
      LEFT JOIN episodes e ON s.id = e.show_id AND e.deleted_at IS NULL
      WHERE s.deleted_at IS NULL
    `;
    const params: any[] = [];
    let paramCount = 1;

    // Search by keyword in title or description
    if (search) {
      query += ` AND (s.title ILIKE $${paramCount} OR s.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    // Filter by active status
    if (is_active !== undefined) {
      query += ` AND s.is_active = $${paramCount}`;
      params.push(is_active === 'true');
      paramCount++;
    }

    query += ' GROUP BY s.id';

    // Validate sort and order
    const validSortFields = ['created_at', 'updated_at', 'title'];
    const validOrders = ['ASC', 'DESC'];
    const sortField = validSortFields.includes(sort as string) ? sort : 'created_at';
    const sortOrder = validOrders.includes((order as string).toUpperCase()) ? (order as string).toUpperCase() : 'DESC';

    query += ` ORDER BY s.${sortField} ${sortOrder}`;
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const result = await pool.query(query, params);

    // Get total count with same filters
    let countQuery = 'SELECT COUNT(*) FROM shows s WHERE s.deleted_at IS NULL';
    const countParams: any[] = [];
    let countParamCount = 1;

    if (search) {
      countQuery += ` AND (s.title ILIKE $${countParamCount} OR s.description ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
      countParamCount++;
    }

    if (is_active !== undefined) {
      countQuery += ` AND s.is_active = $${countParamCount}`;
      countParams.push(is_active === 'true');
      countParamCount++;
    }

    const countResult = await pool.query(countQuery, countParams);

    // Map database fields to frontend expected fields
    const shows = result.rows.map(row => ({
      ...row,
      image_url: row.cover_image_url
    }));

    res.json({
      shows,
      count: shows.length,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error) {
    console.error('Error fetching shows:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch shows',
        code: 'FETCH_ERROR'
      }
    });
  }
});

/**
 * GET /api/admin/shows/:id - Get a single show by ID
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT s.*, COUNT(e.id) as episode_count 
       FROM shows s 
       LEFT JOIN episodes e ON s.id = e.show_id AND e.deleted_at IS NULL
       WHERE s.id = $1 AND s.deleted_at IS NULL
       GROUP BY s.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Show not found',
          code: 'NOT_FOUND'
        }
      });
    }

    // Map database fields to frontend expected fields
    const show = {
      ...result.rows[0],
      image_url: result.rows[0].cover_image_url
    };

    res.json(show);
  } catch (error) {
    console.error('Error fetching show:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch show',
        code: 'FETCH_ERROR'
      }
    });
  }
});

/**
 * POST /api/admin/shows - Create a new show
 */
router.post('/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('slug').trim().notEmpty().withMessage('Slug is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('host_name').trim().notEmpty().withMessage('Host name is required'),
    body('category').optional().trim(),
    body('broadcast_schedule').trim().notEmpty().withMessage('Broadcast schedule is required'),
    body('is_active').optional().isBoolean()
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, slug, description, host_name, category, broadcast_schedule, image_url, is_active } = req.body;

      // Check if slug already exists (excluding soft-deleted)
      const existingShow = await pool.query('SELECT id FROM shows WHERE slug = $1 AND deleted_at IS NULL', [slug]);
      if (existingShow.rows.length > 0) {
        return res.status(409).json({ error: { message: 'Show with this slug already exists', code: 'DUPLICATE_SLUG' } });
      }

      const result = await pool.query(
        `INSERT INTO shows (title, slug, description, host_name, category, broadcast_schedule, cover_image_url, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         RETURNING *`,
        [title, slug, description, host_name, category || null, broadcast_schedule, image_url || null, is_active !== false]
      );

      // Map database fields to frontend expected fields
      const show = {
        ...result.rows[0],
        image_url: result.rows[0].cover_image_url
      };

      res.status(201).json(show);
    } catch (error) {
      console.error('Error creating show:', error);
      res.status(500).json({ error: { message: 'Failed to create show', code: 'SERVER_ERROR' } });
    }
  }
);

/**
 * PUT /api/admin/shows/:id - Update a show
 */
router.put('/:id',
  [
    body('title').optional().trim().notEmpty(),
    body('slug').optional().trim().notEmpty(),
    body('description').optional().trim().notEmpty(),
    body('host_name').optional().trim().notEmpty(),
    body('category').optional().trim(),
    body('broadcast_schedule').optional().trim().notEmpty(),
    body('is_active').optional().isBoolean()
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const updates = req.body;

      // Check if show exists (excluding soft-deleted)
      const existingShow = await pool.query('SELECT id FROM shows WHERE id = $1 AND deleted_at IS NULL', [id]);
      if (existingShow.rows.length === 0) {
        return res.status(404).json({ error: { message: 'Show not found', code: 'NOT_FOUND' } });
      }

      // If slug is being updated, check for duplicates (excluding soft-deleted)
      if (updates.slug) {
        const duplicateSlug = await pool.query('SELECT id FROM shows WHERE slug = $1 AND id != $2 AND deleted_at IS NULL', [updates.slug, id]);
        if (duplicateSlug.rows.length > 0) {
          return res.status(409).json({ error: { message: 'Show with this slug already exists', code: 'DUPLICATE_SLUG' } });
        }
      }

      // Build update query dynamically
      const fields = Object.keys(updates);
      const values = Object.values(updates);
      
      // Map 'image_url' to 'cover_image_url'
      const mappedFields = fields.map(field => {
        if (field === 'image_url') return 'cover_image_url';
        return field;
      });
      const setClause = mappedFields.map((field, index) => `${field} = $${index + 1}`).join(', ');

      const result = await pool.query(
        `UPDATE shows SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`,
        [...values, id]
      );


      // Map database fields to frontend expected fields
      const show = {
        ...result.rows[0],
        image_url: result.rows[0].cover_image_url
      };

      res.json(show);
    } catch (error) {
      console.error('Error updating show:', error);
      res.status(500).json({ error: { message: 'Failed to update show', code: 'SERVER_ERROR' } });
    }
  }
);

/**
 * DELETE /api/admin/shows/:id - Soft delete a show
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if show exists and get protection status
    const existingShow = await pool.query(
      `SELECT s.id, s.protected, s.cover_image_url, COUNT(e.id) as episode_count 
       FROM shows s 
       LEFT JOIN episodes e ON s.id = e.show_id AND e.deleted_at IS NULL
       WHERE s.id = $1 AND s.deleted_at IS NULL
       GROUP BY s.id, s.protected, s.cover_image_url`,
      [id]
    );
    
    if (existingShow.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Show not found', code: 'NOT_FOUND' } });
    }

    const show = existingShow.rows[0];
    const episodeCount = parseInt(show.episode_count);

    // Prevent deletion if show has episodes (referential integrity protection)
    if (episodeCount > 0) {
      return res.status(409).json({ 
        error: { 
          message: `Cannot delete show with ${episodeCount} episode(s). Delete episodes first.`, 
          code: 'HAS_EPISODES',
          episode_count: episodeCount
        } 
      });
    }

    // Check if protected and user is not super admin
    if (show.protected && req.user?.role !== 'administrator') {
      logger.warn('Regular admin attempted to delete protected content', {
        userId: req.user?.userId,
        userEmail: req.user?.email,
        contentType: 'show',
        contentId: id
      });
      return res.status(403).json({ 
        error: { 
          message: 'Cannot delete protected content. Only super admins can delete protected items.', 
          code: 'PROTECTED_CONTENT' 
        } 
      });
    }

    // Soft delete the show
    await pool.query(
      'UPDATE shows SET deleted_at = NOW(), deleted_by = $1, updated_at = NOW() WHERE id = $2',
      [req.user?.userId, id]
    );

    // Audit log
    logger.info('Content soft deleted', {
      contentType: 'show',
      contentId: id,
      userId: req.user?.userId,
      userEmail: req.user?.email,
      protected: show.protected
    });

    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting show:', error);
    res.status(500).json({ error: { message: 'Failed to delete show', code: 'SERVER_ERROR' } });
  }
});

export default router;
