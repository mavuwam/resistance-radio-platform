import pool from '../connection';
import fs from 'fs';
import path from 'path';
import logger from '../../utils/logger';

async function runMigration() {
  try {
    logger.info('Starting soft delete and protection migration...');

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'add_soft_delete_and_protection.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute the migration
    await pool.query(sql);

    logger.info('Migration completed successfully');
    logger.info('Added columns: deleted_at, deleted_by, protected to all content tables');
    logger.info('Created partial indexes for efficient queries');

    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
