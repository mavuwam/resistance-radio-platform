import * as Sentry from '@sentry/react';
import { browserTracingIntegration, replayIntegration } from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || '';
const ENVIRONMENT = import.meta.env.MODE || 'development';

/**
 * Initialize Sentry for frontend error tracking
 */
export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    
    // Performance monitoring
    integrations: [
      browserTracingIntegration(),
      replayIntegration({
        // Session replay for debugging
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Performance monitoring sample rate
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,
    
    // Session replay sample rate
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Filter sensitive data
    beforeSend(event) {
      // Remove sensitive data from breadcrumbs
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
          if (breadcrumb.data) {
            delete breadcrumb.data.password;
            delete breadcrumb.data.token;
            delete breadcrumb.data.authorization;
          }
          return breadcrumb;
        });
      }
      
      // Remove user email for privacy
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }
      
      return event;
    },
    
    // Ignore certain errors
    ignoreErrors: [
      'Network request failed',
      'Failed to fetch',
      'NetworkError',
      'AbortError',
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured'
    ]
  });

  console.log('Sentry error tracking initialized');
}

/**
 * Capture exception with context
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (context) {
    Sentry.setContext('additional', context);
  }
  Sentry.captureException(error);
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
export function setUser(user: { id: string; username?: string }) {
  Sentry.setUser({
    id: user.id,
    username: user.username
  });
}

/**
 * Clear user context
 */
export function clearUser() {
  Sentry.setUser(null);
}

export default Sentry;
