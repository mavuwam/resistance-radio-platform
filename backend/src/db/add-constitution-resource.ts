import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

async function addConstitutionResource() {
  const client = await pool.connect();
  
  try {
    console.log('Adding Constitution resource to database...');

    const resource = {
      title: 'Zimbabwe Constitution (Consolidated 2023)',
      slug: 'zimbabwe-constitution-consolidated-2023',
      description: 'The complete consolidated Constitution of Zimbabwe (2023). Essential reading for understanding your constitutional rights, government structure, and civic responsibilities.',
      category: 'constitutional_explainer',
      resource_type: 'pdf',
      file_type: 'pdf',
      file_url: 'https://resistance-radio-media-dev-734110488556.s3.us-east-1.amazonaws.com/resources/constitution-consolidated-2023.pdf',
      file_size_bytes: 2621440, // approximately 2.5 MB
      is_public: true
    };

    const result = await client.query(
      `INSERT INTO resources (title, slug, description, category, resource_type, file_type, file_url, file_size_bytes, is_public, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       ON CONFLICT (slug) DO UPDATE SET
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         file_url = EXCLUDED.file_url,
         file_size_bytes = EXCLUDED.file_size_bytes,
         updated_at = NOW()
       RETURNING id`,
      [
        resource.title,
        resource.slug,
        resource.description,
        resource.category,
        resource.resource_type,
        resource.file_type,
        resource.file_url,
        resource.file_size_bytes,
        resource.is_public
      ]
    );

    console.log('✓ Constitution resource added successfully with ID:', result.rows[0].id);
    console.log('✓ File URL:', resource.file_url);
    console.log('✓ Category: Constitutional Explainers');
    
  } catch (error) {
    console.error('Error adding resource:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addConstitutionResource()
  .then(() => {
    console.log('\nResource added successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to add resource:', error);
    process.exit(1);
  });
