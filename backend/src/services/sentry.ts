import * as Sentry from '@sentry/node';
import logger from '../utils/logger';

const SENTRY_DSN = process.env.SENTRY_DSN || '';
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Initialize Sentry for error tracking
 */
export function initSentry() {
  if (!SENTRY_DSN) {
    logger.warn('Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: NODE_ENV,
    
    // Performance monitoring
    tracesSampleRate: NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Filter sensitive data
    beforeSend(event) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }
      
      // Remove sensitive data from context
      if (event.contexts?.user) {
        delete event.contexts.user.email;
        delete event.contexts.user.ip_address;
      }
      
      return event;
    },
    
    // Ignore certain errors
    ignoreErrors: [
      'Network request failed',
      'Failed to fetch',
      'NetworkError',
      'AbortError'
    ]
  });

  logger.info('Sentry error tracking initialized');
}

/**
 * Capture exception with context
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (context) {
    Sentry.setContext('additional', context);
  }
  Sentry.captureException(error);
  logger.error('Exception captured by Sentry:', error);
}

/**
 * Capture message
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}

/**
 * Set user context
 */
export function setUser(user: { id: string; email?: string; username?: string }) {
  Sentry.setUser({
    id: user.id,
    username: user.username,
    // Don't send email to Sentry for privacy
  });
}

/**
 * Clear user context
 */
export function clearUser() {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb
 */
export function addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info'
  });
}

export default Sentry;
