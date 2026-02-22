import { Router, Request, Response } from 'express';
import pool from '../db/connection';

const router = Router();

/**
 * GET /api/events
 * Get all events with filtering and pagination
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      event_type,
      status = 'upcoming',
      limit = '20', 
      offset = '0'
    } = req.query;
    
    let query = 'SELECT * FROM events WHERE deleted_at IS NULL';
    const params: any[] = [];
    let paramCount = 1;

    if (event_type) {
      query += ` AND event_type = $${paramCount}`;
      params.push(event_type);
      paramCount++;
    }

    // Filter by upcoming/past based on start_time, not status column
    if (status === 'upcoming') {
      query += ` AND start_time >= NOW()`;
    } else if (status === 'past') {
      query += ` AND start_time < NOW()`;
    }

    // Sort upcoming events by start_time ASC, past events by start_time DESC
    if (status === 'upcoming') {
      query += ' ORDER BY start_time ASC';
    } else {
      query += ' ORDER BY start_time DESC';
    }

    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const result = await pool.query(query, params);

    // Get total count with same filters
    let countQuery = 'SELECT COUNT(*) FROM events WHERE deleted_at IS NULL';
    const countParams: any[] = [];
    let countParamCount = 1;

    if (event_type) {
      countQuery += ` AND event_type = $${countParamCount}`;
      countParams.push(event_type);
      countParamCount++;
    }

    // Filter by upcoming/past based on start_time
    if (status === 'upcoming') {
      countQuery += ` AND start_time >= NOW()`;
    } else if (status === 'past') {
      countQuery += ` AND start_time < NOW()`;
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
 * GET /api/events/:slug
 * Get a single event by slug
 */
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const result = await pool.query(
      'SELECT * FROM events WHERE slug = $1 AND deleted_at IS NULL',
      [slug]
    );

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

export default router;
