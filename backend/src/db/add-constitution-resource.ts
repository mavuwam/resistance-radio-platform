import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'resistance-radio-db-dev.co5k6sew451g.us-east-1.rds.amazonaws.com',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'resistance_radio_dev',
  user: process.env.DB_USER || 'radio_admin',
  password: process.env.DB_PASSWORD || 'ZiPXyCrvsnZwKZV4q80QyWkiA',
});

async function addConstitutionResource() {
  try {
    const result = await pool.query(`
      INSERT INTO resources (
        title,
        slug,
        description,
        category,
        resource_type,
        file_url,
        file_size_bytes,
        created_at,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
      )
      ON CONFLICT (slug) DO UPDATE SET
        file_url = EXCLUDED.file_url,
        file_size_bytes = EXCLUDED.file_size_bytes,
        updated_at = NOW()
      RETURNING *;
    `, [
      'Zimbabwe Constitution (Consolidated 2023)',
      'zimbabwe-constitution-2023',
      'The complete Constitution of Zimbabwe, consolidated as of 2023. This document outlines the fundamental rights, freedoms, and governance structure of Zimbabwe.',
      'constitutional_explainer',
      'pdf',
      'https://resistance-radio-media-dev-734110488556.s3.us-east-1.amazonaws.com/documents/constitution.pdf',
      1344893
    ]);

    console.log('✅ Constitution resource added successfully!');
    console.log('Resource ID:', result.rows[0].id);
    console.log('Title:', result.rows[0].title);
    console.log('Download URL:', result.rows[0].file_url);
    console.log('\nUsers can now download the constitution from the Resources page.');
  } catch (error) {
    console.error('❌ Error adding constitution resource:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

addConstitutionResource();
