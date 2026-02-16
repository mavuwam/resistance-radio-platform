import bcrypt from 'bcrypt';
import pool from './connection';

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    // Hash the password
    const password = await bcrypt.hash('admin123', 10);
    
    // Create admin user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO UPDATE 
       SET password_hash = $2, role = $4
       RETURNING id, email, full_name, role`,
      ['admin@resistanceradio.org', password, 'Admin User', 'administrator']
    );
    
    if (result.rows.length > 0) {
      console.log('✓ Admin user created/updated successfully');
      console.log('  Email: admin@resistanceradio.org');
      console.log('  Password: admin123');
      console.log('  Role: administrator');
      console.log('\n⚠️  IMPORTANT: Change this password after first login!');
    }
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('✗ Failed to create admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
