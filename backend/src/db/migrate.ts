import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env.dev') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('Starting database migrations...');
    
    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await client.query(schema);
    console.log('✓ Schema created successfully');
    
    // Check if we need to seed data
    const { rows } = await client.query('SELECT COUNT(*) FROM shows');
    const showCount = parseInt(rows[0].count);
    
    if (showCount === 0) {
      console.log('Seeding initial data...');
      await seedData(client);
      console.log('✓ Seed data inserted successfully');
    } else {
      console.log('Database already contains data, skipping seed');
    }
    
    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

async function seedData(client: any) {
  // Insert sample shows
  await client.query(`
    INSERT INTO shows (title, slug, description, host_name, host_bio, category, broadcast_schedule, is_active)
    VALUES 
    ('The Citizen''s Bench', 'the-citizens-bench', 
     'A weekly deep dive into constitutional issues, public accountability, and the ethics of leadership.',
     'Gerrard Anko Ged Belts', 
     'Gerrard is a constitutional lawyer and civic educator passionate about empowering citizens through knowledge.',
     'Politics & Governance', 'Every Wednesday at 7:00 PM', true),
    
    ('Youth Voices', 'youth-voices',
     'Amplifying the perspectives and concerns of young citizens across Zimbabwe.',
     'Community Leaders',
     'A collective of young activists and thought leaders from across the country.',
     'Youth Voices', 'Every Friday at 6:00 PM', true),
    
    ('Diaspora Reflections', 'diaspora-reflections',
     'Connecting Zimbabweans abroad with conversations that matter back home.',
     'Various Contributors',
     'Voices from the diaspora sharing their experiences and perspectives.',
     'Diaspora Reflections', 'Every Sunday at 8:00 PM', true),
    
    ('Constitutional Literacy Hour', 'constitutional-literacy-hour',
     'Breaking down complex constitutional concepts into accessible knowledge for all citizens.',
     'Dr. Tendai Moyo',
     'Dr. Moyo is a professor of constitutional law with 20 years of experience in civic education.',
     'Constitutional Literacy', 'Every Tuesday at 5:00 PM', true)
  `);
  
  // Insert sample articles
  await client.query(`
    INSERT INTO articles (title, slug, content, excerpt, author_name, category, status, published_at)
    VALUES 
    ('Understanding Your Constitutional Rights', 'understanding-your-constitutional-rights',
     'Every citizen has fundamental rights enshrined in the constitution. This article breaks down what these rights mean and how to exercise them...',
     'A comprehensive guide to constitutional rights for every Zimbabwean citizen.',
     'Resistance Radio Team', 'Constitutional Literacy', 'published', NOW()),
    
    ('The Power of Civic Engagement', 'the-power-of-civic-engagement',
     'Civic engagement is more than just voting. It''s about active participation in shaping our society...',
     'Exploring the many ways citizens can engage with governance and community building.',
     'Gerrard Anko Ged Belts', 'Politics & Governance', 'published', NOW() - INTERVAL '2 days'),
    
    ('Youth Leadership in Modern Zimbabwe', 'youth-leadership-in-modern-zimbabwe',
     'Young people are not just the leaders of tomorrow - they are leaders today. This piece explores...',
     'How young Zimbabweans are taking charge and driving change in their communities.',
     'Youth Voices Team', 'Youth Voices', 'published', NOW() - INTERVAL '5 days')
  `);
  
  // Insert sample events
  await client.query(`
    INSERT INTO events (title, slug, description, event_type, start_time, location, is_virtual, status)
    VALUES 
    ('Community Dialogue: The Future of Civic Education', 'community-dialogue-civic-education',
     'Join us for an open dialogue about the role of civic education in building a just society.',
     'Community Dialogues', NOW() + INTERVAL '7 days', 'Harare Community Center', false, 'upcoming'),
    
    ('Live Twitter Space: Youth and Governance', 'live-space-youth-governance',
     'A live discussion on how young people can participate more effectively in governance.',
     'Live Spaces', NOW() + INTERVAL '3 days', 'Twitter/X', true, 'upcoming'),
    
    ('Workshop: Understanding Your Rights', 'workshop-understanding-rights',
     'An interactive workshop on constitutional rights and how to exercise them.',
     'Workshops', NOW() + INTERVAL '14 days', 'Bulawayo', false, 'upcoming')
  `);
  
  // Insert sample resources
  await client.query(`
    INSERT INTO resources (title, slug, description, resource_type, category, is_public)
    VALUES 
    ('Citizen Rights Guide', 'citizen-rights-guide',
     'A comprehensive PDF guide to understanding your constitutional rights.',
     'PDF', 'Constitutional Literacy', true),
    
    ('Debate Toolkit', 'debate-toolkit',
     'Tools and frameworks for conducting constructive civic debates.',
     'Toolkit', 'Civic Education', true),
    
    ('Audio Clips for Educators', 'audio-clips-educators',
     'A collection of short audio clips that educators can use in civic education.',
     'Audio', 'Educational Resources', true)
  `);
  
  // Insert admin user (password: admin123 - should be changed in production)
  await client.query(`
    INSERT INTO users (email, password_hash, full_name, role)
    VALUES 
    ('admin@resistanceradio.org', '$2b$10$rKvVPZqGvXQJxH8uE7K5.OYxQxQxQxQxQxQxQxQxQxQxQxQxQxQ', 'Admin User', 'administrator')
  `);
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { runMigrations };
