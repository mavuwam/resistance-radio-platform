import express, { Response } from 'express';
import pool from '../../db/connection';
import { authMiddleware, requireRole, AuthRequest } from '../../middleware/auth';
import { body, validationResult } from 'express-validator';

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
      LEFT JOIN episodes e ON s.id = e.show_id 
      WHERE 1=1
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
    let countQuery = 'SELECT COUNT(*) FROM shows s WHERE 1=1';
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

    res.json({
      shows: result.rows,
      count: result.rows.length,
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
       LEFT JOIN episodes e ON s.id = e.show_id 
       WHERE s.id = $1
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

    res.json(result.rows[0]);
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
    body('host').trim().notEmpty().withMessage('Host is required'),
    body('category').isIn(['civic_education', 'youth_voices', 'diaspora', 'constitutional_literacy', 'investigative', 'community_stories']).withMessage('Invalid category'),
    body('broadcast_schedule').trim().notEmpty().withMessage('Broadcast schedule is required'),
    body('is_active').optional().isBoolean()
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, slug, description, host, category, broadcast_schedule, image_url, thumbnail_url, is_active } = req.body;

      // Check if slug already exists
      const existingShow = await pool.query('SELECT id FROM shows WHERE slug = $1', [slug]);
      if (existingShow.rows.length > 0) {
        return res.status(409).json({ error: { message: 'Show with this slug already exists', code: 'DUPLICATE_SLUG' } });
      }

      const result = await pool.query(
        `INSERT INTO shows (title, slug, description, host, category, broadcast_schedule, image_url, thumbnail_url, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
         RETURNING *`,
        [title, slug, description, host, category, broadcast_schedule, image_url || null, thumbnail_url || null, is_active !== false]
      );

      res.status(201).json(result.rows[0]);
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
    body('host').optional().trim().notEmpty(),
    body('category').optional().isIn(['civic_education', 'youth_voices', 'diaspora', 'constitutional_literacy', 'investigative', 'community_stories']),
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

      // Check if show exists
      const existingShow = await pool.query('SELECT id FROM shows WHERE id = $1', [id]);
      if (existingShow.rows.length === 0) {
        return res.status(404).json({ error: { message: 'Show not found', code: 'NOT_FOUND' } });
      }

      // If slug is being updated, check for duplicates
      if (updates.slug) {
        const duplicateSlug = await pool.query('SELECT id FROM shows WHERE slug = $1 AND id != $2', [updates.slug, id]);
        if (duplicateSlug.rows.length > 0) {
          return res.status(409).json({ error: { message: 'Show with this slug already exists', code: 'DUPLICATE_SLUG' } });
        }
      }

      // Build update query dynamically
      const fields = Object.keys(updates);
      const values = Object.values(updates);
      const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');

      const result = await pool.query(
        `UPDATE shows SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`,
        [...values, id]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating show:', error);
      res.status(500).json({ error: { message: 'Failed to update show', code: 'SERVER_ERROR' } });
    }
  }
);

/**
 * DELETE /api/admin/shows/:id - Delete a show
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if show exists and get episode count
    const existingShow = await pool.query(
      `SELECT s.id, s.image_url, s.thumbnail_url, COUNT(e.id) as episode_count 
       FROM shows s 
       LEFT JOIN episodes e ON s.id = e.show_id 
       WHERE s.id = $1 
       GROUP BY s.id, s.image_url, s.thumbnail_url`,
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

    // TODO: Delete associated files from S3 if they exist
    // if (show.image_url) await deleteFromS3(show.image_url);
    // if (show.thumbnail_url) await deleteFromS3(show.thumbnail_url);

    // Delete the show
    await pool.query('DELETE FROM shows WHERE id = $1', [id]);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting show:', error);
    res.status(500).json({ error: { message: 'Failed to delete show', code: 'SERVER_ERROR' } });
  }
});

export default router;
