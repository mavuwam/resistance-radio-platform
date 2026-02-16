import pool from './connection';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.dev' });

async function addFeedbackColumn() {
  try {
    console.log('Adding feedback column to submissions table...');
    
    await pool.query(`
      ALTER TABLE submissions 
      ADD COLUMN IF NOT EXISTS feedback TEXT;
    `);
    
    console.log('✓ Feedback column added successfully');
    
    // Also update newsletter_subscribers if needed
    await pool.query(`
      ALTER TABLE newsletter_subscribers 
      ADD COLUMN IF NOT EXISTS name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS is_confirmed BOOLEAN DEFAULT false;
    `);
    
    console.log('✓ Newsletter subscribers table updated');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    await pool.end();
    process.exit(1);
  }
}

addFeedbackColumn();
