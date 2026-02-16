import express, { Response } from 'express';
import pool from '../../db/connection';
import { authMiddleware, requireRole, AuthRequest } from '../../middleware/auth';
import { body, validationResult } from 'express-validator';

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
      sort = 'event_date',
      order = 'DESC'
    } = req.query;
    
    let query = 'SELECT * FROM events WHERE 1=1';
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
      query += ` AND event_date >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      query += ` AND event_date <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }

    // Validate sort and order
    const validSortFields = ['event_date', 'created_at', 'updated_at', 'title'];
    const validOrders = ['ASC', 'DESC'];
    const sortField = validSortFields.includes(sort as string) ? sort : 'event_date';
    const sortOrder = validOrders.includes((order as string).toUpperCase()) ? (order as string).toUpperCase() : 'DESC';

    query += ` ORDER BY ${sortField} ${sortOrder}`;
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const result = await pool.query(query, params);

    // Get total count with same filters
    let countQuery = 'SELECT COUNT(*) FROM events WHERE 1=1';
    const countParams: any[] = [];
    let countParamCount = 1;

    if (search) {
      countQuery += ` AND (title ILIKE $${countParamCount} OR description ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
      countParamCount++;
    }

    if (start_date) {
      countQuery += ` AND event_date >= $${countParamCount}`;
      countParams.push(start_date);
      countParamCount++;
    }

    if (end_date) {
      countQuery += ` AND event_date <= $${countParamCount}`;
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

    const result = await pool.query('SELECT * FROM events WHERE id = $1', [id]);

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
    body('event_date').isISO8601().withMessage('Valid event date is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('organizer').optional().trim(),
    body('registration_url').optional().trim().isURL().withMessage('Invalid URL'),
    body('image_url').optional().trim(),
    body('thumbnail_url').optional().trim()
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
        event_date, 
        location, 
        organizer,
        registration_url,
        image_url,
        thumbnail_url
      } = req.body;

      const result = await pool.query(
        `INSERT INTO events (
          title, description, event_date, location, organizer, 
          registration_url, image_url, thumbnail_url, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING *`,
        [
          title, 
          description, 
          event_date, 
          location, 
          organizer || null,
          registration_url || null,
          image_url || null,
          thumbnail_url || null
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
    body('event_date').optional().isISO8601(),
    body('location').optional().trim().notEmpty(),
    body('organizer').optional().trim(),
    body('registration_url').optional().trim().isURL(),
    body('image_url').optional().trim(),
    body('thumbnail_url').optional().trim()
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const updates = req.body;

      // Check if event exists
      const existingEvent = await pool.query('SELECT id FROM events WHERE id = $1', [id]);
      if (existingEvent.rows.length === 0) {
        return res.status(404).json({ 
          error: { 
            message: 'Event not found', 
            code: 'NOT_FOUND' 
          } 
        });
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
 * DELETE /api/admin/events/:id - Delete an event
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if event exists
    const existingEvent = await pool.query(
      'SELECT id, image_url, thumbnail_url FROM events WHERE id = $1', 
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

    // TODO: Delete associated files from S3 if they exist
    // const event = existingEvent.rows[0];
    // if (event.image_url) await deleteFromS3(event.image_url);
    // if (event.thumbnail_url) await deleteFromS3(event.thumbnail_url);

    // Delete the event
    await pool.query('DELETE FROM events WHERE id = $1', [id]);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ 
      error: { 
        message: 'Failed to delete event', 
        code: 'SERVER_ERROR' 
      } 
    });
  }
});

export default router;
