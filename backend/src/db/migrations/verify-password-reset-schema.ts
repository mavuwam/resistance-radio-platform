import { Pool } from 'pg';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../../.env.dev') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function verifySchema() {
  const client = await pool.connect();
  
  try {
    console.log('Verifying password reset tables schema...\n');
    
    // Check password_reset_tokens table
    console.log('=== password_reset_tokens table ===');
    const tokensTableQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'password_reset_tokens'
      ORDER BY ordinal_position;
    `;
    const tokensResult = await client.query(tokensTableQuery);
    console.table(tokensResult.rows);
    
    // Check indexes on password_reset_tokens
    console.log('\n=== password_reset_tokens indexes ===');
    const tokensIndexQuery = `
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'password_reset_tokens';
    `;
    const tokensIndexResult = await client.query(tokensIndexQuery);
    console.table(tokensIndexResult.rows);
    
    // Check password_reset_rate_limits table
    console.log('\n=== password_reset_rate_limits table ===');
    const rateLimitsTableQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'password_reset_rate_limits'
      ORDER BY ordinal_position;
    `;
    const rateLimitsResult = await client.query(rateLimitsTableQuery);
    console.table(rateLimitsResult.rows);
    
    // Check indexes on password_reset_rate_limits
    console.log('\n=== password_reset_rate_limits indexes ===');
    const rateLimitsIndexQuery = `
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'password_reset_rate_limits';
    `;
    const rateLimitsIndexResult = await client.query(rateLimitsIndexQuery);
    console.table(rateLimitsIndexResult.rows);
    
    // Check foreign key constraints
    console.log('\n=== Foreign key constraints ===');
    const fkQuery = `
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name IN ('password_reset_tokens', 'password_reset_rate_limits');
    `;
    const fkResult = await client.query(fkQuery);
    console.table(fkResult.rows);
    
    console.log('\n✓ Schema verification completed successfully!');
  } catch (error) {
    console.error('Schema verification failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run verification if this file is executed directly
if (require.main === module) {
  verifySchema()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { verifySchema };
