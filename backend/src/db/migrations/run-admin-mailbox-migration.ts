import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../../.env.dev') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runAdminMailboxMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Starting admin mailbox migration...');
    
    // Read and execute the migration SQL
    const migrationPath = path.join(__dirname, 'create_admin_mailbox_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await client.query(migrationSQL);
    console.log('✓ Admin mailbox tables created successfully');
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  runAdminMailboxMigration()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { runAdminMailboxMigration };
