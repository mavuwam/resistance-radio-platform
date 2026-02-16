import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import sanitizeHtml from 'sanitize-html';

/**
 * HTTPS enforcement middleware
 * Redirects HTTP requests to HTTPS in production
 */
export function httpsEnforcement(req: Request, res: Response, next: NextFunction) {
  // Skip in development or when behind a proxy (CloudFront handles HTTPS)
  if (process.env.NODE_ENV !== 'production' || process.env.BEHIND_PROXY === 'true') {
    return next();
  }

  // Check if request is secure
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  
  if (!isSecure) {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }

  next();
}

/**
 * CSRF protection middleware
 * Generates and validates CSRF tokens for state-changing operations
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF for API endpoints that use JWT authentication
  // JWT tokens provide sufficient protection against CSRF
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return next();
  }

  // For cookie-based sessions, validate CSRF token
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = req.cookies?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({
      error: {
        message: 'Invalid CSRF token',
        code: 'CSRF_INVALID'
      }
    });
  }

  next();
}

/**
 * Generate CSRF token endpoint
 */
export function generateCsrfToken(req: Request, res: Response) {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie('csrfToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });
  res.json({ csrfToken: token });
}

/**
 * Input sanitization middleware
 * Sanitizes all string inputs to prevent XSS attacks
 */
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  // Sanitize body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }

  next();
}

/**
 * Recursively sanitize object properties
 */
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeHtml(obj, {
      allowedTags: [], // Strip all HTML tags
      allowedAttributes: {},
      disallowedTagsMode: 'recursiveEscape'
    });
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
}

/**
 * Security headers middleware
 * Sets various security-related HTTP headers
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self'; " +
    "media-src 'self' https:; " +
    "frame-ancestors 'none';"
  );

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  );

  next();
}

/**
 * Rate limiting configuration for different endpoint types
 */
export const rateLimiters = {
  // General API rate limit: 100 requests per 15 minutes
  general: {
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
      error: {
        message: 'Too many requests. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
      }
    },
    standardHeaders: true,
    legacyHeaders: false
  },

  // Authentication rate limit: 5 attempts per 15 minutes
  auth: {
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
      error: {
        message: 'Too many login attempts. Please try again later.',
        code: 'AUTH_RATE_LIMIT_EXCEEDED'
      }
    },
    standardHeaders: true,
    legacyHeaders: false
  },

  // Form submission rate limit: 5 submissions per hour
  forms: {
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: {
      error: {
        message: 'Too many submissions. Please try again later.',
        code: 'FORM_RATE_LIMIT_EXCEEDED'
      }
    },
    standardHeaders: true,
    legacyHeaders: false
  },

  // Strict rate limit for sensitive operations: 3 per hour
  strict: {
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: {
      error: {
        message: 'Rate limit exceeded. Please try again later.',
        code: 'STRICT_RATE_LIMIT_EXCEEDED'
      }
    },
    standardHeaders: true,
    legacyHeaders: false
  }
};
