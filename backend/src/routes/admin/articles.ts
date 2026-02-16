import express, { Response } from 'express';
import pool from '../../db/connection';
import { authMiddleware, requireRole, AuthRequest } from '../../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// All admin routes require authentication and content_manager or administrator role
router.use(authMiddleware);
router.use(requireRole('content_manager', 'administrator'));

/**
 * GET /api/admin/articles - Get all articles with pagination, search, and filtering
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { 
      search,
      status,
      category,
      limit = '20', 
      offset = '0',
      sort = 'created_at',
      order = 'DESC'
    } = req.query;
    
    let query = 'SELECT * FROM articles WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    // Search by keyword in title or content
    if (search) {
      query += ` AND (title ILIKE $${paramCount} OR content ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    // Filter by status
    if (status) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    // Filter by category
    if (category) {
      query += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    // Validate sort and order
    const validSortFields = ['created_at', 'updated_at', 'published_at', 'title'];
    const validOrders = ['ASC', 'DESC'];
    const sortField = validSortFields.includes(sort as string) ? sort : 'created_at';
    const sortOrder = validOrders.includes((order as string).toUpperCase()) ? (order as string).toUpperCase() : 'DESC';

    query += ` ORDER BY ${sortField} ${sortOrder}`;
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const result = await pool.query(query, params);

    // Get total count with same filters
    let countQuery = 'SELECT COUNT(*) FROM articles WHERE 1=1';
    const countParams: any[] = [];
    let countParamCount = 1;

    if (search) {
      countQuery += ` AND (title ILIKE $${countParamCount} OR content ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
      countParamCount++;
    }

    if (status) {
      countQuery += ` AND status = $${countParamCount}`;
      countParams.push(status);
      countParamCount++;
    }

    if (category) {
      countQuery += ` AND category = $${countParamCount}`;
      countParams.push(category);
      countParamCount++;
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
 * GET /api/admin/articles/:id - Get a single article by ID
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM articles WHERE id = $1', [id]);

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

/**
 * POST /api/admin/articles - Create a new article
 */
router.post('/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('slug').trim().notEmpty().withMessage('Slug is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('excerpt').optional().trim(),
    body('author').trim().notEmpty().withMessage('Author is required'),
    body('category').optional().trim(),
    body('status').isIn(['draft', 'published']).withMessage('Invalid status'),
    body('published_at').optional().isISO8601().withMessage('Invalid date format'),
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
        slug, 
        content, 
        excerpt, 
        author, 
        category, 
        status, 
        published_at,
        image_url,
        thumbnail_url
      } = req.body;

      // Check if slug already exists
      const existingArticle = await pool.query('SELECT id FROM articles WHERE slug = $1', [slug]);
      if (existingArticle.rows.length > 0) {
        return res.status(409).json({ 
          error: { 
            message: 'Article with this slug already exists', 
            code: 'DUPLICATE_SLUG' 
          } 
        });
      }

      const result = await pool.query(
        `INSERT INTO articles (
          title, slug, content, excerpt, author, category, status, 
          published_at, image_url, thumbnail_url, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
        RETURNING *`,
        [
          title, 
          slug, 
          content, 
          excerpt || null, 
          author, 
          category || null, 
          status || 'draft',
          published_at || null,
          image_url || null,
          thumbnail_url || null
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating article:', error);
      res.status(500).json({ 
        error: { 
          message: 'Failed to create article', 
          code: 'SERVER_ERROR' 
        } 
      });
    }
  }
);

/**
 * PUT /api/admin/articles/:id - Update an article
 */
router.put('/:id',
  [
    body('title').optional().trim().notEmpty(),
    body('slug').optional().trim().notEmpty(),
    body('content').optional().trim().notEmpty(),
    body('excerpt').optional().trim(),
    body('author').optional().trim().notEmpty(),
    body('category').optional().trim(),
    body('status').optional().isIn(['draft', 'published']),
    body('published_at').optional().isISO8601(),
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

      // Check if article exists
      const existingArticle = await pool.query('SELECT id, created_at FROM articles WHERE id = $1', [id]);
      if (existingArticle.rows.length === 0) {
        return res.status(404).json({ 
          error: { 
            message: 'Article not found', 
            code: 'NOT_FOUND' 
          } 
        });
      }

      // If slug is being updated, check for duplicates
      if (updates.slug) {
        const duplicateSlug = await pool.query(
          'SELECT id FROM articles WHERE slug = $1 AND id != $2', 
          [updates.slug, id]
        );
        if (duplicateSlug.rows.length > 0) {
          return res.status(409).json({ 
            error: { 
              message: 'Article with this slug already exists', 
              code: 'DUPLICATE_SLUG' 
            } 
          });
        }
      }

      // Build update query dynamically
      const fields = Object.keys(updates);
      const values = Object.values(updates);
      const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');

      const result = await pool.query(
        `UPDATE articles SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`,
        [...values, id]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating article:', error);
      res.status(500).json({ 
        error: { 
          message: 'Failed to update article', 
          code: 'SERVER_ERROR' 
        } 
      });
    }
  }
);

/**
 * DELETE /api/admin/articles/:id - Delete an article
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if article exists
    const existingArticle = await pool.query(
      'SELECT id, image_url, thumbnail_url FROM articles WHERE id = $1', 
      [id]
    );
    if (existingArticle.rows.length === 0) {
      return res.status(404).json({ 
        error: { 
          message: 'Article not found', 
          code: 'NOT_FOUND' 
        } 
      });
    }

    // TODO: Delete associated files from S3 if they exist
    // const article = existingArticle.rows[0];
    // if (article.image_url) await deleteFromS3(article.image_url);
    // if (article.thumbnail_url) await deleteFromS3(article.thumbnail_url);

    // Delete the article
    await pool.query('DELETE FROM articles WHERE id = $1', [id]);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ 
      error: { 
        message: 'Failed to delete article', 
        code: 'SERVER_ERROR' 
        } 
    });
  }
});

/**
 * POST /api/admin/articles/:id/publish - Publish an article
 */
router.post('/:id/publish', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if article exists
    const existingArticle = await pool.query('SELECT id FROM articles WHERE id = $1', [id]);
    if (existingArticle.rows.length === 0) {
      return res.status(404).json({ 
        error: { 
          message: 'Article not found', 
          code: 'NOT_FOUND' 
        } 
      });
    }

    const result = await pool.query(
      `UPDATE articles 
       SET status = 'published', published_at = COALESCE(published_at, NOW()), updated_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error publishing article:', error);
    res.status(500).json({ 
      error: { 
        message: 'Failed to publish article', 
        code: 'SERVER_ERROR' 
      } 
    });
  }
});

/**
 * POST /api/admin/articles/:id/unpublish - Unpublish an article
 */
router.post('/:id/unpublish', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if article exists
    const existingArticle = await pool.query('SELECT id FROM articles WHERE id = $1', [id]);
    if (existingArticle.rows.length === 0) {
      return res.status(404).json({ 
        error: { 
          message: 'Article not found', 
          code: 'NOT_FOUND' 
        } 
      });
    }

    const result = await pool.query(
      `UPDATE articles 
       SET status = 'draft', updated_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error unpublishing article:', error);
    res.status(500).json({ 
      error: { 
        message: 'Failed to unpublish article', 
        code: 'SERVER_ERROR' 
      } 
    });
  }
});

/**
 * POST /api/admin/articles/bulk/publish - Bulk publish articles
 */
router.post('/bulk/publish', 
  [
    body('ids').isArray().withMessage('IDs must be an array'),
    body('ids.*').isInt().withMessage('Each ID must be an integer')
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { ids } = req.body;

      if (ids.length === 0) {
        return res.status(400).json({ 
          error: { 
            message: 'No article IDs provided', 
            code: 'INVALID_INPUT' 
          } 
        });
      }

      const placeholders = ids.map((_: any, index: number) => `$${index + 1}`).join(',');
      
      const result = await pool.query(
        `UPDATE articles 
         SET status = 'published', published_at = COALESCE(published_at, NOW()), updated_at = NOW() 
         WHERE id IN (${placeholders})
         RETURNING id`,
        ids
      );

      res.json({
        message: `${result.rows.length} articles published`,
        updated: result.rows.length
      });
    } catch (error) {
      console.error('Error bulk publishing articles:', error);
      res.status(500).json({ 
        error: { 
          message: 'Failed to bulk publish articles', 
          code: 'SERVER_ERROR' 
        } 
      });
    }
  }
);

/**
 * POST /api/admin/articles/bulk/unpublish - Bulk unpublish articles
 */
router.post('/bulk/unpublish', 
  [
    body('ids').isArray().withMessage('IDs must be an array'),
    body('ids.*').isInt().withMessage('Each ID must be an integer')
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { ids } = req.body;

      if (ids.length === 0) {
        return res.status(400).json({ 
          error: { 
            message: 'No article IDs provided', 
            code: 'INVALID_INPUT' 
          } 
        });
      }

      const placeholders = ids.map((_: any, index: number) => `$${index + 1}`).join(',');
      
      const result = await pool.query(
        `UPDATE articles 
         SET status = 'draft', updated_at = NOW() 
         WHERE id IN (${placeholders})
         RETURNING id`,
        ids
      );

      res.json({
        message: `${result.rows.length} articles unpublished`,
        updated: result.rows.length
      });
    } catch (error) {
      console.error('Error bulk unpublishing articles:', error);
      res.status(500).json({ 
        error: { 
          message: 'Failed to bulk unpublish articles', 
          code: 'SERVER_ERROR' 
        } 
      });
    }
  }
);

export default router;
