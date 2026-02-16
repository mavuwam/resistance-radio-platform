import express, { Response } from 'express';
import pool from '../../db/connection';
import { authMiddleware, requireRole, AuthRequest } from '../../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// All admin routes require authentication and content_manager or administrator role
router.use(authMiddleware);
router.use(requireRole('content_manager', 'administrator'));

/**
 * GET /api/admin/resources - Get all resources with pagination and search
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { 
      search,
      file_type,
      limit = '20', 
      offset = '0',
      sort = 'created_at',
      order = 'DESC'
    } = req.query;
    
    let query = 'SELECT * FROM resources WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    // Search by keyword in title or description
    if (search) {
      query += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    // Filter by file type
    if (file_type) {
      query += ` AND file_type = $${paramCount}`;
      params.push(file_type);
      paramCount++;
    }

    // Validate sort and order
    const validSortFields = ['created_at', 'updated_at', 'title', 'file_type'];
    const validOrders = ['ASC', 'DESC'];
    const sortField = validSortFields.includes(sort as string) ? sort : 'created_at';
    const sortOrder = validOrders.includes((order as string).toUpperCase()) ? (order as string).toUpperCase() : 'DESC';

    query += ` ORDER BY ${sortField} ${sortOrder}`;
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const result = await pool.query(query, params);

    // Get total count with same filters
    let countQuery = 'SELECT COUNT(*) FROM resources WHERE 1=1';
    const countParams: any[] = [];
    let countParamCount = 1;

    if (search) {
      countQuery += ` AND (title ILIKE $${countParamCount} OR description ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
      countParamCount++;
    }

    if (file_type) {
      countQuery += ` AND file_type = $${countParamCount}`;
      countParams.push(file_type);
      countParamCount++;
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
 * GET /api/admin/resources/:id - Get a single resource by ID
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM resources WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Resource not found',
          code: 'NOT_FOUND'
        }
      });
    }

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

/**
 * POST /api/admin/resources - Create a new resource
 */
router.post('/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('file_url').trim().notEmpty().withMessage('File URL is required'),
    body('file_type').isIn(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'zip', 'other']).withMessage('Invalid file type'),
    body('file_size').optional().isInt({ min: 0 }).withMessage('File size must be a positive integer'),
    body('category').optional().trim()
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
        file_url, 
        file_type,
        file_size,
        category
      } = req.body;

      const result = await pool.query(
        `INSERT INTO resources (
          title, description, file_url, file_type, file_size, category, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING *`,
        [
          title, 
          description, 
          file_url, 
          file_type,
          file_size || null,
          category || null
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating resource:', error);
      res.status(500).json({ 
        error: { 
          message: 'Failed to create resource', 
          code: 'SERVER_ERROR' 
        } 
      });
    }
  }
);

/**
 * PUT /api/admin/resources/:id - Update a resource
 */
router.put('/:id',
  [
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim().notEmpty(),
    body('file_url').optional().trim().notEmpty(),
    body('file_type').optional().isIn(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'zip', 'other']),
    body('file_size').optional().isInt({ min: 0 }),
    body('category').optional().trim()
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const updates = req.body;

      // Check if resource exists
      const existingResource = await pool.query('SELECT id, file_url FROM resources WHERE id = $1', [id]);
      if (existingResource.rows.length === 0) {
        return res.status(404).json({ 
          error: { 
            message: 'Resource not found', 
            code: 'NOT_FOUND' 
          } 
        });
      }

      // If file_url is being updated, we should delete the old file from S3
      // TODO: Implement S3 file deletion
      // if (updates.file_url && updates.file_url !== existingResource.rows[0].file_url) {
      //   await deleteFromS3(existingResource.rows[0].file_url);
      // }

      // Build update query dynamically
      const fields = Object.keys(updates);
      const values = Object.values(updates);
      const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');

      const result = await pool.query(
        `UPDATE resources SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`,
        [...values, id]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating resource:', error);
      res.status(500).json({ 
        error: { 
          message: 'Failed to update resource', 
          code: 'SERVER_ERROR' 
        } 
      });
    }
  }
);

/**
 * DELETE /api/admin/resources/:id - Delete a resource
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if resource exists
    const existingResource = await pool.query(
      'SELECT id, file_url FROM resources WHERE id = $1', 
      [id]
    );
    if (existingResource.rows.length === 0) {
      return res.status(404).json({ 
        error: { 
          message: 'Resource not found', 
          code: 'NOT_FOUND' 
        } 
      });
    }

    // TODO: Delete associated file from S3
    // const resource = existingResource.rows[0];
    // if (resource.file_url) await deleteFromS3(resource.file_url);

    // Delete the resource
    await pool.query('DELETE FROM resources WHERE id = $1', [id]);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ 
      error: { 
        message: 'Failed to delete resource', 
        code: 'SERVER_ERROR' 
      } 
    });
  }
});

export default router;
