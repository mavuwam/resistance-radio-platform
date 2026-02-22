import { Response } from 'express';
import pool from '../db/connection';
import { AuthRequest } from '../middleware/auth';
import logger from './logger';

/**
 * Helper function to perform soft delete with protection checks
 * @param contentType - Type of content (articles, shows, episodes, events, resources)
 * @param id - Content ID
 * @param req - Express request with auth
 * @param res - Express response
 * @param fileUrlField - Optional field name for file URL (for S3 cleanup)
 */
export async function softDeleteContent(
  contentType: string,
  id: string,
  req: AuthRequest,
  res: Response,
  fileUrlField?: string
): Promise<boolean> {
  try {
    // Build query to check if content exists and get protection status
    const fields = ['id', 'protected'];
    if (fileUrlField) {
      fields.push(fileUrlField);
    }
    
    const existingContent = await pool.query(
      `SELECT ${fields.join(', ')} FROM ${contentType} WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (existingContent.rows.length === 0) {
      res.status(404).json({
        error: {
          message: `${contentType.slice(0, -1)} not found`,
          code: 'NOT_FOUND'
        }
      });
      return false;
    }

    const content = existingContent.rows[0];

    // Check if protected and user is not super admin
    if (content.protected && req.user?.role !== 'administrator') {
      logger.warn('Regular admin attempted to delete protected content', {
        userId: req.user?.userId,
        userEmail: req.user?.email,
        contentType,
        contentId: id
      });
      res.status(403).json({
        error: {
          message: 'Cannot delete protected content. Only super admins can delete protected items.',
          code: 'PROTECTED_CONTENT'
        }
      });
      return false;
    }

    // Soft delete the content
    await pool.query(
      `UPDATE ${contentType} SET deleted_at = NOW(), deleted_by = $1, updated_at = NOW() WHERE id = $2`,
      [req.user?.userId, id]
    );

    // Audit log
    logger.info('Content soft deleted', {
      contentType,
      contentId: id,
      userId: req.user?.userId,
      userEmail: req.user?.email,
      protected: content.protected
    });

    res.status(204).send();
    return true;
  } catch (error) {
    logger.error(`Error deleting ${contentType}:`, error);
    res.status(500).json({
      error: {
        message: `Failed to delete ${contentType.slice(0, -1)}`,
        code: 'SERVER_ERROR'
      }
    });
    return false;
  }
}

/**
 * Add soft delete filter to WHERE clause
 * @param existingWhere - Existing WHERE clause (e.g., "WHERE 1=1" or "WHERE status = 'published'")
 * @returns Updated WHERE clause with soft delete filter
 */
export function addSoftDeleteFilter(existingWhere: string): string {
  if (existingWhere.includes('WHERE')) {
    return `${existingWhere} AND deleted_at IS NULL`;
  }
  return `${existingWhere} WHERE deleted_at IS NULL`;
}
