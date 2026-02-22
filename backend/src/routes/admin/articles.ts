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
    
    let query = 'SELECT * FROM articles WHERE deleted_at IS NULL';
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
    let countQuery = 'SELECT COUNT(*) FROM articles WHERE deleted_at IS NULL';
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

    // Map database fields to frontend expected fields
    const articles = result.rows.map(row => ({
      ...row,
      author: row.author_name,
      image_url: row.featured_image_url
    }));

    res.json({
      articles,
      count: articles.length,
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

    const result = await pool.query('SELECT * FROM articles WHERE id = $1 AND deleted_at IS NULL', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'Article not found',
          code: 'NOT_FOUND'
        }
      });
    }

    // Map database fields to frontend expected fields
    const article = {
      ...result.rows[0],
      author: result.rows[0].author_name,
      image_url: result.rows[0].featured_image_url
    };

    res.json(article);
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
    body('image_url').optional().trim()
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
        image_url
      } = req.body;

      // Check if slug already exists (excluding soft-deleted articles)
      const existingArticle = await pool.query('SELECT id FROM articles WHERE slug = $1 AND deleted_at IS NULL', [slug]);
      if (existingArticle.rows.length > 0) {
        return res.status(409).json({ 
          error: { 
            message: 'Article with this slug already exists', 
            code: 'DUPLICATE_SLUG' 
          } 
        });
      }

      // Auto-set published_at if status is 'published' and no published_at provided
      const finalPublishedAt = (status === 'published' && !published_at) 
        ? new Date().toISOString() 
        : (published_at || null);

      const result = await pool.query(
        `INSERT INTO articles (
          title, slug, content, excerpt, author_name, category, status, 
          published_at, featured_image_url, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        RETURNING *`,
        [
          title, 
          slug, 
          content, 
          excerpt || null, 
          author, 
          category || null, 
          status || 'draft',
          finalPublishedAt,
          image_url || null
        ]
      );

      // Map database fields to frontend expected fields
      const article = {
        ...result.rows[0],
        author: result.rows[0].author_name,
        image_url: result.rows[0].featured_image_url
      };

      res.status(201).json(article);
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
    body('image_url').optional().trim()
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const updates = req.body;

      // Check if article exists (excluding soft-deleted)
      const existingArticle = await pool.query('SELECT id, created_at FROM articles WHERE id = $1 AND deleted_at IS NULL', [id]);
      if (existingArticle.rows.length === 0) {
        return res.status(404).json({ 
          error: { 
            message: 'Article not found', 
            code: 'NOT_FOUND' 
          } 
        });
      }

      // If slug is being updated, check for duplicates (excluding soft-deleted)
      if (updates.slug) {
        const duplicateSlug = await pool.query(
          'SELECT id FROM articles WHERE slug = $1 AND id != $2 AND deleted_at IS NULL', 
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
      
      // Auto-set published_at if status is being changed to 'published' and no published_at provided
      if (updates.status === 'published' && !updates.published_at) {
        // Check if article already has a published_at
        const currentArticle = await pool.query('SELECT published_at FROM articles WHERE id = $1', [id]);
        if (currentArticle.rows.length > 0 && !currentArticle.rows[0].published_at) {
          // Add published_at to updates if not already present
          fields.push('published_at');
          values.push(new Date().toISOString());
        }
      }
      
      // Map 'author' to 'author_name' and 'image_url' to 'featured_image_url'
      const mappedFields = fields.map(field => {
        if (field === 'author') return 'author_name';
        if (field === 'image_url') return 'featured_image_url';
        return field;
      });
      
      const setClause = mappedFields.map((field, index) => `${field} = $${index + 1}`).join(', ');

      const result = await pool.query(
        `UPDATE articles SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`,
        [...values, id]
      );

      // Map database fields to frontend expected fields
      const article = {
        ...result.rows[0],
        author: result.rows[0].author_name,
        image_url: result.rows[0].featured_image_url
      };

      res.json(article);
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
 * DELETE /api/admin/articles/:id - Soft delete an article
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if article exists and get protection status
    const existingArticle = await pool.query(
      'SELECT id, protected, featured_image_url FROM articles WHERE id = $1 AND deleted_at IS NULL', 
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

    const article = existingArticle.rows[0];

    // Check if protected and user is not super admin
    if (article.protected && req.user?.role !== 'administrator') {
      logger.warn('Regular admin attempted to delete protected content', {
        userId: req.user?.userId,
        userEmail: req.user?.email,
        contentType: 'article',
        contentId: id
      });
      return res.status(403).json({ 
        error: { 
          message: 'Cannot delete protected content. Only super admins can delete protected items.', 
          code: 'PROTECTED_CONTENT' 
        } 
      });
    }

    // Soft delete the article
    await pool.query(
      'UPDATE articles SET deleted_at = NOW(), deleted_by = $1, updated_at = NOW() WHERE id = $2',
      [req.user?.userId, id]
    );

    // Audit log
    logger.info('Content soft deleted', {
      contentType: 'article',
      contentId: id,
      userId: req.user?.userId,
      userEmail: req.user?.email,
      protected: article.protected
    });

    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting article:', error);
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

    // Check if article exists (excluding soft-deleted)
    const existingArticle = await pool.query('SELECT id FROM articles WHERE id = $1 AND deleted_at IS NULL', [id]);
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

    // Map database fields to frontend expected fields
    const article = {
      ...result.rows[0],
      author: result.rows[0].author_name,
      image_url: result.rows[0].featured_image_url
    };

    res.json(article);
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

    // Check if article exists (excluding soft-deleted)
    const existingArticle = await pool.query('SELECT id FROM articles WHERE id = $1 AND deleted_at IS NULL', [id]);
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

    // Map database fields to frontend expected fields
    const article = {
      ...result.rows[0],
      author: result.rows[0].author_name,
      image_url: result.rows[0].featured_image_url
    };

    res.json(article);
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
         WHERE id IN (${placeholders}) AND deleted_at IS NULL
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
         WHERE id IN (${placeholders}) AND deleted_at IS NULL
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
