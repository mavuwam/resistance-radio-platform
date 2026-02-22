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
 * GET /api/admin/events - Get all events with pagination, search, and filtering
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { 
      search,
      start_date,
      end_date,
      limit = '20', 
      offset = '0',
      sort = 'start_time',
      order = 'DESC'
    } = req.query;
    
    let query = 'SELECT * FROM events WHERE deleted_at IS NULL';
    const params: any[] = [];
    let paramCount = 1;

    // Search by keyword in title or description
    if (search) {
      query += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    // Filter by date range
    if (start_date) {
      query += ` AND start_time >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      query += ` AND start_time <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }

    // Validate sort and order
    const validSortFields = ['start_time', 'created_at', 'updated_at', 'title'];
    const validOrders = ['ASC', 'DESC'];
    const sortField = validSortFields.includes(sort as string) ? sort : 'start_time';
    const sortOrder = validOrders.includes((order as string).toUpperCase()) ? (order as string).toUpperCase() : 'DESC';

    query += ` ORDER BY ${sortField} ${sortOrder}`;
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const result = await pool.query(query, params);

    // Get total count with same filters
    let countQuery = 'SELECT COUNT(*) FROM events WHERE deleted_at IS NULL';
    const countParams: any[] = [];
    let countParamCount = 1;

    if (search) {
      countQuery += ` AND (title ILIKE $${countParamCount} OR description ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
      countParamCount++;
    }

    if (start_date) {
      countQuery += ` AND start_time >= $${countParamCount}`;
      countParams.push(start_date);
      countParamCount++;
    }

    if (end_date) {
      countQuery += ` AND start_time <= $${countParamCount}`;
      countParams.push(end_date);
      countParamCount++;
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      events: result.rows,
      count: result.rows.length,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch events',
        code: 'FETCH_ERROR'
      }
    });
  }
});

/**
 * GET /api/admin/events/:id - Get a single event by ID
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM events WHERE id = $1 AND deleted_at IS NULL', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Event not found',
          code: 'NOT_FOUND'
        }
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch event',
        code: 'FETCH_ERROR'
      }
    });
  }
});

/**
 * POST /api/admin/events - Create a new event
 */
router.post('/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('event_type').trim().notEmpty().withMessage('Event type is required'),
    body('start_time').isISO8601().withMessage('Valid start time is required'),
    body('end_time').optional().isISO8601().withMessage('Valid end time required'),
    body('location').optional().trim(),
    body('is_virtual').optional().isBoolean(),
    body('registration_url').optional().trim().isURL().withMessage('Invalid URL'),
    body('max_participants').optional().isInt({ min: 1 }),
    body('status').optional().isIn(['upcoming', 'ongoing', 'completed', 'cancelled'])
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { 
        title, 
        description, 
        event_type,
        start_time, 
        end_time,
        location, 
        is_virtual,
        registration_url,
        max_participants,
        status
      } = req.body;

      // Generate slug from title
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const result = await pool.query(
        `INSERT INTO events (
          title, slug, description, event_type, start_time, end_time,
          location, is_virtual, registration_url, max_participants, 
          status, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
        RETURNING *`,
        [
          title,
          slug,
          description,
          event_type,
          start_time,
          end_time || null,
          location || null,
          is_virtual || false,
          registration_url || null,
          max_participants || null,
          status || 'upcoming'
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ 
        error: { 
          message: 'Failed to create event', 
          code: 'SERVER_ERROR' 
        } 
      });
    }
  }
);

/**
 * PUT /api/admin/events/:id - Update an event
 */
router.put('/:id',
  [
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim().notEmpty(),
    body('event_type').optional().trim().notEmpty(),
    body('start_time').optional().isISO8601(),
    body('end_time').optional().isISO8601(),
    body('location').optional().trim(),
    body('is_virtual').optional().isBoolean(),
    body('registration_url').optional().trim().isURL(),
    body('max_participants').optional().isInt({ min: 1 }),
    body('status').optional().isIn(['upcoming', 'ongoing', 'completed', 'cancelled'])
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const updates = req.body;

      // Check if event exists (excluding soft-deleted)
      const existingEvent = await pool.query('SELECT id FROM events WHERE id = $1 AND deleted_at IS NULL', [id]);
      if (existingEvent.rows.length === 0) {
        return res.status(404).json({ 
          error: { 
            message: 'Event not found', 
            code: 'NOT_FOUND' 
          } 
        });
      }

      // If title is being updated, regenerate slug
      if (updates.title) {
        updates.slug = updates.title.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
      }

      // Build update query dynamically
      const fields = Object.keys(updates);
      const values = Object.values(updates);
      const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');

      const result = await pool.query(
        `UPDATE events SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`,
        [...values, id]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({ 
        error: { 
          message: 'Failed to update event', 
          code: 'SERVER_ERROR' 
        } 
      });
    }
  }
);

/**
 * DELETE /api/admin/events/:id - Soft delete an event
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if event exists and get protection status
    const existingEvent = await pool.query(
      'SELECT id, protected FROM events WHERE id = $1 AND deleted_at IS NULL', 
      [id]
    );
    if (existingEvent.rows.length === 0) {
      return res.status(404).json({ 
        error: { 
          message: 'Event not found', 
          code: 'NOT_FOUND' 
        } 
      });
    }

    const event = existingEvent.rows[0];

    // Check if protected and user is not super admin
    if (event.protected && req.user?.role !== 'administrator') {
      logger.warn('Regular admin attempted to delete protected content', {
        userId: req.user?.userId,
        userEmail: req.user?.email,
        contentType: 'event',
        contentId: id
      });
      return res.status(403).json({ 
        error: { 
          message: 'Cannot delete protected content. Only super admins can delete protected items.', 
          code: 'PROTECTED_CONTENT' 
        } 
      });
    }

    // Soft delete the event
    await pool.query(
      'UPDATE events SET deleted_at = NOW(), deleted_by = $1, updated_at = NOW() WHERE id = $2',
      [req.user?.userId, id]
    );

    // Audit log
    logger.info('Content soft deleted', {
      contentType: 'event',
      contentId: id,
      userId: req.user?.userId,
      userEmail: req.user?.email,
      protected: event.protected
    });

    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting event:', error);
    res.status(500).json({ 
      error: { 
          message: 'Failed to delete event', 
        code: 'SERVER_ERROR' 
      } 
    });
  }
});

export default router;
