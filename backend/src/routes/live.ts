import { Router, Request, Response } from 'express';
import pool from '../db/connection';

const router = Router();

/**
 * GET /api/live-status
 * Get current live broadcast status
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT lb.*, s.title as show_title, s.slug as show_slug, s.host_name, s.cover_image_url
       FROM live_broadcasts lb
       LEFT JOIN shows s ON lb.show_id = s.id
       WHERE lb.is_active = true
       ORDER BY lb.started_at DESC
       LIMIT 1`
    );

    if (result.rows.length === 0) {
      return res.json({
        isLive: false,
        message: 'No live broadcast currently active'
      });
    }

    const broadcast = result.rows[0];

    res.json({
      isLive: true,
      broadcast: {
        id: broadcast.id,
        streamUrl: broadcast.stream_url,
        startedAt: broadcast.started_at,
        listenerCount: broadcast.listener_count,
        show: broadcast.show_id ? {
          id: broadcast.show_id,
          title: broadcast.show_title,
          slug: broadcast.show_slug,
          hostName: broadcast.host_name,
          coverImageUrl: broadcast.cover_image_url
        } : null
      }
    });
  } catch (error) {
    console.error('Error fetching live status:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch live status',
        code: 'FETCH_ERROR'
      }
    });
  }
});

export default router;
