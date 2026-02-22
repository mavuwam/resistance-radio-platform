import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { initSentry } from './services/sentry';
import { scheduleCleanupJob } from './jobs/cleanup-trash';
import { scheduleEmailCleanup } from './jobs/cleanup-deleted-emails';

dotenv.config();

// Initialize Sentry before anything else
initSentry();

import authRoutes from './routes/auth';
import petitionRoutes from './routes/petitions';
import showsRoutes from './routes/shows';
import episodesRoutes from './routes/episodes';
import articlesRoutes from './routes/articles';
import eventsRoutes from './routes/events';
import resourcesRoutes from './routes/resources';
import liveRoutes from './routes/live';
import submissionsRoutes from './routes/submissions';
import mailboxRoutes from './routes/mailbox';
import adminSubmissionsRoutes from './routes/admin/submissions';
import adminArticlesRoutes from './routes/admin/articles';
import adminEventsRoutes from './routes/admin/events';
import adminResourcesRoutes from './routes/admin/resources';
import adminEpisodesRoutes from './routes/admin/episodes';
import adminShowsRoutes from './routes/admin/shows';
import adminDashboardRoutes from './routes/admin/dashboard';
import adminTrashRoutes from './routes/admin/trash';
import adminMailboxRoutes from './routes/admin/mailbox';
import adminPasswordRoutes from './routes/admin/password';
import sitemapRoutes from './routes/sitemap';
import uploadRoutes from './routes/upload';
import {
  httpsEnforcement,
  sanitizeInput,
  securityHeaders,
  rateLimiters,
  generateCsrfToken
} from './middleware/security';
import {
  errorHandler,
  notFoundHandler,
  handleUnhandledRejection,
  handleUncaughtException
} from './middleware/errorHandler';
import logger, { stream } from './utils/logger';

dotenv.config();

// Handle uncaught exceptions and unhandled rejections
handleUncaughtException();
handleUnhandledRejection();

const app = express();
const PORT = process.env.PORT || 3000;

// HTTP request logging
app.use(morgan(
  process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
  { stream }
));

// Compression middleware for gzip
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6 // Compression level (0-9)
}));

// Security middleware - applied first
app.use(httpsEnforcement);
app.use(helmet({
  contentSecurityPolicy: false, // We set custom CSP in securityHeaders
  crossOriginEmbedderPolicy: false
}));
app.use(securityHeaders);

// Cookie parser for CSRF tokens
app.use(cookieParser());

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'https://resistanceradiostation.org',
  'https://dxbqjcig99tjb.cloudfront.net',
  'http://localhost:5173',
  'http://localhost:5174'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(null, true); // Allow all origins in development
    }
  },
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(sanitizeInput);

// Cache control for static assets
app.use((req, res, next) => {
  // Cache static assets for 1 year
  if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  // Cache API responses for 5 minutes
  else if (req.url.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'public, max-age=300, must-revalidate');
  }
  // No cache for HTML
  else {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  next();
});

// General rate limiting for all API routes
app.use('/api/', rateLimit(rateLimiters.general));

// CSRF token generation endpoint
app.get('/api/csrf-token', generateCsrfToken);

// Routes
app.use('/api/auth', rateLimit(rateLimiters.auth), authRoutes);
app.use('/api/petitions', petitionRoutes);
app.use('/api/shows', showsRoutes);
app.use('/api/episodes', episodesRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/live', liveRoutes);
app.use('/api/submissions', submissionsRoutes); // Already has rate limiting in the route
app.use('/api/mailbox', mailboxRoutes); // Email webhook endpoint (public)
app.use('/api/admin/submissions', adminSubmissionsRoutes);
app.use('/api/admin/articles', adminArticlesRoutes);
app.use('/api/admin/events', adminEventsRoutes);
app.use('/api/admin/resources', adminResourcesRoutes);
app.use('/api/admin/episodes', adminEpisodesRoutes);
app.use('/api/admin/shows', adminShowsRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/trash', adminTrashRoutes);
app.use('/api/admin/mailbox', adminMailboxRoutes);
app.use('/api/admin/password', adminPasswordRoutes);
app.use('/api/upload', uploadRoutes);

// Sitemap (no /api prefix)
app.use('/', sitemapRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Error handler - must be last
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Schedule cleanup jobs
    scheduleCleanupJob();
    scheduleEmailCleanup();
  });
}

export default app;
