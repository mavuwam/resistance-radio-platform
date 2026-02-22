import { Router, Request, Response } from 'express';
import pool from '../db/connection';

const router = Router();

/**
 * GET /api/shows
 * Get all shows with optional filtering
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, is_active } = req.query;
    
    let query = 'SELECT * FROM shows WHERE deleted_at IS NULL';
    const params: any[] = [];
    let paramCount = 1;

    if (category) {
      query += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (is_active !== undefined) {
      query += ` AND is_active = $${paramCount}`;
      params.push(is_active === 'true');
      paramCount++;
    }

    query += ' ORDER BY title ASC';

    const result = await pool.query(query, params);

    res.json({
      shows: result.rows,
      count: result.rows.length
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
 * GET /api/shows/:slug
 * Get a single show by slug
 */
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const result = await pool.query(
      'SELECT * FROM shows WHERE slug = $1 AND deleted_at IS NULL',
      [slug]
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
 * GET /api/shows/:slug/episodes
 * Get all episodes for a specific show
 */
router.get('/:slug/episodes', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { limit = '10', offset = '0' } = req.query;

    // First, get the show ID
    const showResult = await pool.query(
      'SELECT id FROM shows WHERE slug = $1 AND deleted_at IS NULL',
      [slug]
    );

    if (showResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Show not found',
          code: 'NOT_FOUND'
        }
      });
    }

    const showId = showResult.rows[0].id;

    // Get episodes for this show
    const episodesResult = await pool.query(
      `SELECT * FROM episodes 
       WHERE show_id = $1 AND deleted_at IS NULL
       ORDER BY published_at DESC 
       LIMIT $2 OFFSET $3`,
      [showId, parseInt(limit as string), parseInt(offset as string)]
    );

    // Get total count
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM episodes WHERE show_id = $1 AND deleted_at IS NULL',
      [showId]
    );

    res.json({
      episodes: episodesResult.rows,
      count: episodesResult.rows.length,
      total: parseInt(countResult.rows[0].count)
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

export default router;
