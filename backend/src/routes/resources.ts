import { Router, Request, Response } from 'express';
import pool from '../db/connection';

const router = Router();

/**
 * GET /api/resources
 * Get all public resources with filtering and pagination
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      category,
      resource_type,
      limit = '20', 
      offset = '0'
    } = req.query;
    
    let query = 'SELECT * FROM resources WHERE is_public = true';
    const params: any[] = [];
    let paramCount = 1;

    if (category) {
      query += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (resource_type) {
      query += ` AND resource_type = $${paramCount}`;
      params.push(resource_type);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM resources WHERE is_public = true';
    const countParams: any[] = [];
    let countParamCount = 1;

    if (category) {
      countQuery += ` AND category = $${countParamCount}`;
      countParams.push(category);
      countParamCount++;
    }

    if (resource_type) {
      countQuery += ` AND resource_type = $${countParamCount}`;
      countParams.push(resource_type);
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      resources: result.rows,
      count: result.rows.length,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch resources',
        code: 'FETCH_ERROR'
      }
    });
  }
});

/**
 * GET /api/resources/:slug
 * Get a single resource by slug
 */
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const result = await pool.query(
      'SELECT * FROM resources WHERE slug = $1 AND is_public = true',
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Resource not found',
          code: 'NOT_FOUND'
        }
      });
    }

    // Increment download count
    await pool.query(
      'UPDATE resources SET download_count = download_count + 1 WHERE slug = $1',
      [slug]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch resource',
        code: 'FETCH_ERROR'
      }
    });
  }
});

export default router;
