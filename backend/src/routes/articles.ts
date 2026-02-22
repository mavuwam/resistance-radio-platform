import { Router, Request, Response } from 'express';
import pool from '../db/connection';

const router = Router();

/**
 * GET /api/articles
 * Get all published articles with filtering, sorting, and pagination
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      category, 
      limit = '20', 
      offset = '0',
      sort = 'published_at',
      order = 'DESC'
    } = req.query;
    
    let query = "SELECT * FROM articles WHERE status = 'published' AND published_at <= NOW() AND deleted_at IS NULL";
    const params: any[] = [];
    let paramCount = 1;

    if (category) {
      query += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    // Validate sort and order
    const validSortFields = ['published_at', 'title'];
    const validOrders = ['ASC', 'DESC'];
    const sortField = validSortFields.includes(sort as string) ? sort : 'published_at';
    const sortOrder = validOrders.includes((order as string).toUpperCase()) ? (order as string).toUpperCase() : 'DESC';

    query += ` ORDER BY ${sortField} ${sortOrder}`;
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = "SELECT COUNT(*) FROM articles WHERE status = 'published' AND published_at <= NOW() AND deleted_at IS NULL";
    const countParams: any[] = [];
    let countParamCount = 1;

    if (category) {
      countQuery += ` AND category = $${countParamCount}`;
      countParams.push(category);
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      articles: result.rows,
      count: result.rows.length,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch articles',
        code: 'FETCH_ERROR'
      }
    });
  }
});

/**
 * GET /api/articles/:slug
 * Get a single article by slug
 */
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const result = await pool.query(
      "SELECT * FROM articles WHERE slug = $1 AND status = 'published' AND published_at <= NOW() AND deleted_at IS NULL",
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Article not found',
          code: 'NOT_FOUND'
        }
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch article',
        code: 'FETCH_ERROR'
      }
    });
  }
});

export default router;
