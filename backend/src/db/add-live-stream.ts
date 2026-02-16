import pool from './connection';
import * as fs from 'fs';
import * as path from 'path';

async function addLiveStream() {
  try {
    console.log('Adding live stream URL to database...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'add-live-stream.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    await pool.query(sql);
    
    console.log('✅ Live stream URL added successfully!');
    console.log('Stream URL: https://s6.citrus3.com/public/resistanceradiostation');
    
    // Verify
    const result = await pool.query(
      'SELECT id, stream_url, is_active FROM live_broadcasts WHERE is_active = true'
    );
    
    if (result.rows.length > 0) {
      console.log('\nActive live stream:');
      console.log(result.rows[0]);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding live stream:', error);
    process.exit(1);
  }
}

addLiveStream();
