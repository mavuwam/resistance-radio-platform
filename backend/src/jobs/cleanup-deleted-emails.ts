import pool from '../db/connection';
import logger from '../utils/logger';
import cron from 'node-cron';

/**
 * Cleanup job to permanently delete emails that have been in trash for more than 30 days
 * Emails with status='deleted' and deleted_at > 30 days ago are permanently removed
 */
export async function cleanupDeletedEmails() {
  logger.info('Starting deleted emails cleanup job');
  
  try {
    // Delete emails with status='deleted' and deleted_at > 30 days ago
    const result = await pool.query(`
      DELETE FROM admin_emails
      WHERE status = 'deleted'
        AND deleted_at IS NOT NULL
        AND deleted_at < NOW() - INTERVAL '30 days'
    `);
    
    const deletedCount = result.rowCount || 0;
    
    logger.info('Deleted emails cleanup job completed', { 
      emailsDeleted: deletedCount 
    });
    
    return deletedCount;
  } catch (error) {
    logger.error('Error cleaning up deleted emails', { error });
    throw error;
  }
}

/**
 * Schedule email cleanup job to run daily at 2 AM
 */
export function scheduleEmailCleanup() {
  // Run daily at 2 AM (0 2 * * *)
  cron.schedule('0 2 * * *', () => {
    logger.info('Scheduled email cleanup job triggered');
    cleanupDeletedEmails().catch(error => {
      logger.error('Scheduled email cleanup job failed', { error });
    });
  });
  
  logger.info('Email cleanup job scheduled (daily at 2 AM)');
}
