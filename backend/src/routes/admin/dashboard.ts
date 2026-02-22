import { Router, Request, Response } from 'express';
import pool from '../../db/connection';

const router = Router();

// GET /api/admin/dashboard/stats - Get dashboard statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    // Get counts for all content types
    const [
      showsResult,
      episodesResult,
      articlesResult,
      eventsResult,
      resourcesResult,
      submissionsResult,
      recentArticlesResult,
      recentEpisodesResult,
      recentEventsResult
    ] = await Promise.all([
      // Shows
      pool.query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE is_active = true) as active FROM shows'),
      
      // Episodes
      pool.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE published_at >= NOW() - INTERVAL '30 days') as recent
        FROM episodes
      `),
      
      // Articles
      pool.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'published') as published,
          COUNT(*) FILTER (WHERE status = 'draft') as drafts
        FROM articles
      `),
      
      // Events
      pool.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE start_time >= NOW()) as upcoming
        FROM events
      `),
      
      // Resources
      pool.query(`
        SELECT 
          COUNT(*) as total,
          COALESCE(SUM(download_count), 0) as downloads
        FROM resources
      `),
      
      // Submissions
      pool.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'pending') as pending,
          COUNT(*) FILTER (WHERE status = 'approved') as approved,
          COUNT(*) FILTER (WHERE status = 'rejected') as rejected
        FROM submissions
      `),
      
      // Recent articles (last 7 days)
      pool.query(`
        SELECT id, title, slug, published_at
        FROM articles
        WHERE status = 'published' AND published_at >= NOW() - INTERVAL '7 days'
        ORDER BY published_at DESC
        LIMIT 5
      `),
      
      // Recent episodes (last 7 days)
      pool.query(`
        SELECT id, title, slug, published_at
        FROM episodes
        WHERE published_at >= NOW() - INTERVAL '7 days'
        ORDER BY published_at DESC
        LIMIT 5
      `),
      
      // Recent events (upcoming)
      pool.query(`
        SELECT id, title, slug, start_time
        FROM events
        WHERE start_time >= NOW()
        ORDER BY start_time ASC
        LIMIT 5
      `)
    ]);

    const stats = {
      shows: {
        total: parseInt(showsResult.rows[0].total),
        active: parseInt(showsResult.rows[0].active)
      },
      episodes: {
        total: parseInt(episodesResult.rows[0].total),
        recent: parseInt(episodesResult.rows[0].recent)
      },
      articles: {
        total: parseInt(articlesResult.rows[0].total),
        published: parseInt(articlesResult.rows[0].published),
        drafts: parseInt(articlesResult.rows[0].drafts)
      },
      events: {
        total: parseInt(eventsResult.rows[0].total),
        upcoming: parseInt(eventsResult.rows[0].upcoming)
      },
      resources: {
        total: parseInt(resourcesResult.rows[0].total),
        downloads: parseInt(resourcesResult.rows[0].downloads)
      },
      submissions: {
        total: parseInt(submissionsResult.rows[0].total),
        pending: parseInt(submissionsResult.rows[0].pending),
        approved: parseInt(submissionsResult.rows[0].approved),
        rejected: parseInt(submissionsResult.rows[0].rejected)
      },
      recentActivity: [
        ...recentArticlesResult.rows.map(row => ({
          type: 'article' as const,
          title: row.title,
          slug: row.slug,
          published_at: row.published_at,
          url: `/articles/${row.slug}`
        })),
        ...recentEpisodesResult.rows.map(row => ({
          type: 'episode' as const,
          title: row.title,
          slug: row.slug,
          published_at: row.published_at,
          url: `/episodes/${row.slug}`
        })),
        ...recentEventsResult.rows.map(row => ({
          type: 'event' as const,
          title: row.title,
          slug: row.slug,
          published_at: row.start_time,
          url: `/events/${row.slug}`
        }))
      ].sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()).slice(0, 10)
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      message: 'Failed to fetch dashboard statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
