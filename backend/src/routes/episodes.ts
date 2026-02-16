import { Router, Request, Response } from 'express';
import pool from '../db/connection';

const router = Router();

/**
 * GET /api/episodes
 * Get all episodes with filtering, sorting, and pagination
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      category, 
      show_id,
      limit = '20', 
      offset = '0',
      sort = 'published_at',
      order = 'DESC'
    } = req.query;
    
    let query = 'SELECT e.*, s.title as show_title, s.slug as show_slug FROM episodes e LEFT JOIN shows s ON e.show_id = s.id WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (category) {
      query += ` AND e.category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (show_id) {
      query += ` AND e.show_id = $${paramCount}`;
      params.push(parseInt(show_id as string));
      paramCount++;
    }

    // Validate sort and order to prevent SQL injection
    const validSortFields = ['published_at', 'title', 'play_count'];
    const validOrders = ['ASC', 'DESC'];
    const sortField = validSortFields.includes(sort as string) ? sort : 'published_at';
    const sortOrder = validOrders.includes((order as string).toUpperCase()) ? (order as string).toUpperCase() : 'DESC';

    query += ` ORDER BY e.${sortField} ${sortOrder}`;
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM episodes WHERE 1=1';
    const countParams: any[] = [];
    let countParamCount = 1;

    if (category) {
      countQuery += ` AND category = $${countParamCount}`;
      countParams.push(category);
      countParamCount++;
    }

    if (show_id) {
      countQuery += ` AND show_id = $${countParamCount}`;
      countParams.push(parseInt(show_id as string));
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      episodes: result.rows,
      count: result.rows.length,
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
 * GET /api/episodes/:slug
 * Get a single episode by slug
 */
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const result = await pool.query(
      `SELECT e.*, s.title as show_title, s.slug as show_slug, s.host_name 
       FROM episodes e 
       LEFT JOIN shows s ON e.show_id = s.id 
       WHERE e.slug = $1`,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Episode not found',
          code: 'NOT_FOUND'
        }
      });
    }

    // Increment play count
    await pool.query(
      'UPDATE episodes SET play_count = play_count + 1 WHERE slug = $1',
      [slug]
    );

    res.json(result.rows[0]);
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

export default router;
