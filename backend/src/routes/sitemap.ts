import express, { Request, Response } from 'express';
import pool from '../db/connection';

const router = express.Router();

/**
 * GET /sitemap.xml - Generate XML sitemap
 */
router.get('/sitemap.xml', async (req: Request, res: Response) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'https://resistanceradio.org';
    
    // Static pages
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/about', priority: '0.8', changefreq: 'monthly' },
      { url: '/shows', priority: '0.9', changefreq: 'weekly' },
      { url: '/listen', priority: '0.9', changefreq: 'daily' },
      { url: '/news', priority: '0.9', changefreq: 'daily' },
      { url: '/events', priority: '0.8', changefreq: 'weekly' },
      { url: '/get-involved', priority: '0.7', changefreq: 'monthly' },
      { url: '/resources', priority: '0.7', changefreq: 'weekly' },
      { url: '/contact', priority: '0.6', changefreq: 'monthly' },
      { url: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
      { url: '/terms-of-use', priority: '0.3', changefreq: 'yearly' }
    ];

    // Fetch dynamic content
    const [shows, episodes, articles, events] = await Promise.all([
      pool.query('SELECT slug, updated_at FROM shows WHERE is_active = true ORDER BY updated_at DESC'),
      pool.query('SELECT slug, updated_at FROM episodes WHERE published_at <= NOW() ORDER BY updated_at DESC LIMIT 100'),
      pool.query('SELECT slug, updated_at FROM articles WHERE published_at <= NOW() ORDER BY updated_at DESC LIMIT 100'),
      pool.query('SELECT slug, updated_at FROM events ORDER BY updated_at DESC LIMIT 50')
    ]);

    // Build XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    staticPages.forEach(page => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    });

    // Add shows
    shows.rows.forEach((show: any) => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/shows/${show.slug}</loc>\n`;
      xml += `    <lastmod>${new Date(show.updated_at).toISOString().split('T')[0]}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    });

    // Add episodes
    episodes.rows.forEach((episode: any) => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/episodes/${episode.slug}</loc>\n`;
      xml += `    <lastmod>${new Date(episode.updated_at).toISOString().split('T')[0]}</lastmod>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';
    });

    // Add articles
    articles.rows.forEach((article: any) => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/news/${article.slug}</loc>\n`;
      xml += `    <lastmod>${new Date(article.updated_at).toISOString().split('T')[0]}</lastmod>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';
    });

    // Add events
    events.rows.forEach((event: any) => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/events/${event.slug}</loc>\n`;
      xml += `    <lastmod>${new Date(event.updated_at).toISOString().split('T')[0]}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.6</priority>\n';
      xml += '  </url>\n';
    });

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

export default router;
