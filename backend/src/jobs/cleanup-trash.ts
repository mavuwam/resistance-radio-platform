import pool from '../db/connection';
import logger from '../utils/logger';
import { deleteFromS3 } from '../services/s3';
import cron from 'node-cron';

/**
 * Cleanup job to permanently delete expired trash items
 * - Regular items: 30 days retention
 * - Protected items: 60 days retention
 */
export async function cleanupTrash() {
  logger.info('Starting trash cleanup job');
  
  const contentTypes = ['articles', 'shows', 'episodes', 'events', 'resources'];
  let totalDeleted = 0;
  
  for (const type of contentTypes) {
    try {
      // Determine file URL column based on content type
      let fileUrlColumn = 'NULL';
      if (type === 'episodes') fileUrlColumn = 'audio_url';
      else if (type === 'articles') fileUrlColumn = 'featured_image_url';
      else if (type === 'shows') fileUrlColumn = 'cover_image_url';
      else if (type === 'resources') fileUrlColumn = 'file_url';
      
      // Find expired items (30 days for regular, 60 days for protected)
      const expiredItems = await pool.query(`
        SELECT id, protected, ${fileUrlColumn} as file_url, deleted_at
        FROM ${type}
        WHERE deleted_at IS NOT NULL
          AND (
            (protected = false AND deleted_at < NOW() - INTERVAL '30 days')
            OR
            (protected = true AND deleted_at < NOW() - INTERVAL '60 days')
          )
      `);
      
      for (const item of expiredItems.rows) {
        // Delete associated S3 files
        if (item.file_url) {
          try {
            await deleteFromS3(item.file_url);
            logger.info('Deleted S3 file', { 
              url: item.file_url,
              contentType: type,
              contentId: item.id
            });
          } catch (error) {
            logger.error('Failed to delete S3 file', { 
              url: item.file_url, 
              contentType: type,
              contentId: item.id,
              error,
              note: 'Database record will still be deleted, S3 file may be orphaned'
            });
          }
        }
        
        // Permanently delete from database
        await pool.query(`DELETE FROM ${type} WHERE id = $1`, [item.id]);
        
        logger.info('Permanently deleted content', {
          contentType: type,
          contentId: item.id,
          protected: item.protected,
          deletedAt: item.deleted_at
        });
        
        totalDeleted++;
      }
    } catch (error) {
      logger.error('Error cleaning up trash for content type', { type, error });
    }
  }
  
  logger.info('Trash cleanup job completed', { totalDeleted });
}

/**
 * Schedule cleanup job to run daily at 2 AM
 */
export function scheduleCleanupJob() {
  // Run daily at 2 AM (0 2 * * *)
  cron.schedule('0 2 * * *', () => {
    logger.info('Scheduled trash cleanup job triggered');
    cleanupTrash().catch(error => {
      logger.error('Scheduled cleanup job failed', { error });
    });
  });
  
  logger.info('Trash cleanup job scheduled (daily at 2 AM)');
}
