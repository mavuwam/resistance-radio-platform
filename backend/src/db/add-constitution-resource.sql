-- Add Zimbabwe Constitution as a downloadable resource
INSERT INTO resources (
  title,
  slug,
  description,
  category,
  resource_type,
  file_url,
  file_size_bytes,
  is_featured,
  created_at,
  updated_at
) VALUES (
  'Zimbabwe Constitution (Consolidated 2023)',
  'zimbabwe-constitution-2023',
  'The complete Constitution of Zimbabwe, consolidated as of 2023. This document outlines the fundamental rights, freedoms, and governance structure of Zimbabwe.',
  'constitutional_explainer',
  'pdf',
  'https://resistance-radio-media-dev-734110488556.s3.us-east-1.amazonaws.com/documents/constitution.pdf',
  1344893,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  file_url = EXCLUDED.file_url,
  file_size_bytes = EXCLUDED.file_size_bytes,
  updated_at = NOW();
