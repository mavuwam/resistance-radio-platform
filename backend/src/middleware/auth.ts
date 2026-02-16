import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db/connection';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: 'user' | 'content_manager' | 'administrator';
  };
}

/**
 * Middleware to verify JWT token and attach user data to request
 */
export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        error: {
          message: 'No authorization token provided',
          code: 'NO_TOKEN'
        }
      });
    }

    // Check if token starts with 'Bearer '
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          message: 'Invalid authorization format. Use: Bearer <token>',
          code: 'INVALID_TOKEN_FORMAT'
        }
      });
    }

    // Extract token
    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { 
      userId: string; 
      email: string; 
      role: string;
      iat: number;
    };

    // Check if token is expired (24 hour session)
    const tokenAge = Date.now() - (decoded.iat * 1000);
    if (tokenAge > SESSION_DURATION) {
      return res.status(401).json({
        error: {
          message: 'Session expired. Please login again.',
          code: 'SESSION_EXPIRED'
        }
      });
    }

    // Verify user still exists and get current role
    const userResult = await pool.query(
      'SELECT id, email, role FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    const user = userResult.rows[0];

    // Attach user data to request
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: {
          message: 'Invalid token',
          code: 'INVALID_TOKEN'
        }
      });
    }

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: {
          message: 'Token expired',
          code: 'TOKEN_EXPIRED'
        }
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      error: {
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      }
    });
  }
}

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
export async function optionalAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user data
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { 
      userId: string; 
      email: string; 
      role: string;
      iat: number;
    };

    // Check session expiration
    const tokenAge = Date.now() - (decoded.iat * 1000);
    if (tokenAge > SESSION_DURATION) {
      return next(); // Continue without user data
    }

    // Get user from database
    const userResult = await pool.query(
      'SELECT id, email, role FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role
      };
    }

    next();
  } catch (error) {
    // Token invalid, continue without user data
    next();
  }
}

/**
 * Middleware to check if user has required role
 */
export function requireRole(...allowedRoles: Array<'user' | 'content_manager' | 'administrator'>) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          message: 'Insufficient permissions',
          code: 'FORBIDDEN',
          requiredRole: allowedRoles
        }
      });
    }

    next();
  };
}

/**
 * Generate JWT token for user
 */
export function generateToken(userId: string, email: string, role: string): string {
  return jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}
