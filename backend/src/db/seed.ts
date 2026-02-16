import bcrypt from 'bcrypt';
import pool from './connection';

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Create sample users
    const password = await bcrypt.hash('Password123', 10);
    
    const user1Result = await pool.query(
      `INSERT INTO users (email, password_hash, name) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ['demo@example.com', password, 'Demo User']
    );
    
    const user2Result = await pool.query(
      `INSERT INTO users (email, password_hash, name) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ['organizer@example.com', password, 'Organizer User']
    );
    
    if (user1Result.rows.length > 0 && user2Result.rows.length > 0) {
      const user1Id = user1Result.rows[0].id;
      const user2Id = user2Result.rows[0].id;
      
      // Create featured petition about term limits
      const petition1Result = await pool.query(
        `INSERT INTO petitions (title, description, goal_signatures, owner_id, url) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id`,
        [
          'Protect Zimbabwe\'s Constitutional Term Limits',
          'We, the people of Zimbabwe, stand firmly against any attempts to amend our constitution to extend presidential term limits. Our democracy was hard-won, and we must protect it. The constitution clearly states term limits to prevent the concentration of power and ensure democratic transitions. We call on all Zimbabweans, civil society organizations, and international partners to join us in defending our constitutional rights. No individual is above the law, and no leader should seek to change the rules to remain in power indefinitely. Our children deserve a Zimbabwe where democracy thrives and power transitions peacefully.',
          100000,
          user1Id,
          'protect-zimbabwe-constitutional-term-limits'
        ]
      );
      
      const petition2Result = await pool.query(
        `INSERT INTO petitions (title, description, goal_signatures, owner_id, url) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id`,
        [
          'Demand Transparency in Constitutional Amendment Process',
          'Any proposed changes to Zimbabwe\'s constitution must be transparent, inclusive, and reflect the will of the people. We demand that all constitutional amendment discussions be conducted openly, with full public participation and consultation. The people of Zimbabwe have the right to know what changes are being proposed and to have their voices heard. We reject any backroom deals or rushed processes that bypass democratic procedures.',
          50000,
          user2Id,
          'demand-transparency-constitutional-amendment'
        ]
      );
      
      const petition3Result = await pool.query(
        `INSERT INTO petitions (title, description, goal_signatures, owner_id, url) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id`,
        [
          'Support Free and Fair Elections in Zimbabwe',
          'Zimbabwe deserves free, fair, and credible elections. We call for electoral reforms that ensure every vote counts, independent election monitoring, and respect for the democratic process. Our democracy depends on the integrity of our electoral system and the peaceful transfer of power according to the will of the people.',
          75000,
          user1Id,
          'support-free-fair-elections-zimbabwe'
        ]
      );
      
      // Add some signatures to petitions
      if (petition1Result.rows.length > 0) {
        await pool.query(
          `INSERT INTO signatures (petition_id, user_id) 
           VALUES ($1, $2) 
           ON CONFLICT DO NOTHING`,
          [petition1Result.rows[0].id, user2Id]
        );
      }
      
      if (petition2Result.rows.length > 0) {
        await pool.query(
          `INSERT INTO signatures (petition_id, user_id) 
           VALUES ($1, $2) 
           ON CONFLICT DO NOTHING`,
          [petition2Result.rows[0].id, user1Id]
        );
      }

      if (petition3Result.rows.length > 0) {
        await pool.query(
          `INSERT INTO signatures (petition_id, user_id) 
           VALUES ($1, $2) 
           ON CONFLICT DO NOTHING`,
          [petition3Result.rows[0].id, user2Id]
        );
      }
      
      console.log('✓ Database seeded successfully');
      console.log('  Demo accounts:');
      console.log('    - demo@example.com / Password123');
      console.log('    - organizer@example.com / Password123');
    } else {
      console.log('✓ Database already seeded');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Database seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
