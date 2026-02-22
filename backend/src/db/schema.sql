-- Resistance Radio Station Database Schema

-- Users table (for authentication and authorization)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'content_manager',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Shows table
CREATE TABLE IF NOT EXISTS shows (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  host_name VARCHAR(255) NOT NULL,
  host_bio TEXT,
  host_image_url VARCHAR(500),
  cover_image_url VARCHAR(500),
  category VARCHAR(100),
  broadcast_schedule VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shows_slug ON shows(slug);
CREATE INDEX idx_shows_category ON shows(category);
CREATE INDEX idx_shows_active ON shows(is_active);

-- Episodes table
CREATE TABLE IF NOT EXISTS episodes (
  id SERIAL PRIMARY KEY,
  show_id INTEGER REFERENCES shows(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  audio_url VARCHAR(500) NOT NULL,
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  published_at TIMESTAMP NOT NULL,
  category VARCHAR(100),
  tags TEXT[],
  play_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_episodes_show_id ON episodes(show_id);
CREATE INDEX idx_episodes_slug ON episodes(slug);
CREATE INDEX idx_episodes_published_at ON episodes(published_at DESC);
CREATE INDEX idx_episodes_category ON episodes(category);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author_name VARCHAR(255) NOT NULL,
  author_bio TEXT,
  featured_image_url VARCHAR(500),
  category VARCHAR(100),
  tags TEXT[],
  status VARCHAR(50) DEFAULT 'draft',
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_category ON articles(category);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  location VARCHAR(255),
  is_virtual BOOLEAN DEFAULT false,
  registration_url VARCHAR(500),
  max_participants INTEGER,
  status VARCHAR(50) DEFAULT 'upcoming',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_type ON events(event_type);

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  resource_type VARCHAR(100) NOT NULL,
  category VARCHAR(100),
  file_url VARCHAR(500),
  file_size_bytes BIGINT,
  download_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_resources_slug ON resources(slug);
CREATE INDEX idx_resources_category ON resources(category);
CREATE INDEX idx_resources_type ON resources(resource_type);

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id SERIAL PRIMARY KEY,
  submission_type VARCHAR(50) NOT NULL,
  submitter_name VARCHAR(255) NOT NULL,
  submitter_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  content TEXT NOT NULL,
  metadata JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TIMESTAMP,
  feedback TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_submissions_type ON submissions(submission_type);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_created_at ON submissions(created_at DESC);

-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  is_confirmed BOOLEAN DEFAULT false,
  confirmation_token VARCHAR(255),
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  unsubscribed_at TIMESTAMP
);

CREATE INDEX idx_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX idx_subscribers_confirmed ON newsletter_subscribers(is_confirmed);

-- Live broadcasts table
CREATE TABLE IF NOT EXISTS live_broadcasts (
  id SERIAL PRIMARY KEY,
  show_id INTEGER REFERENCES shows(id),
  stream_url VARCHAR(500) NOT NULL,
  is_active BOOLEAN DEFAULT false,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  listener_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_broadcasts_active ON live_broadcasts(is_active);
CREATE INDEX idx_broadcasts_show_id ON live_broadcasts(show_id);

-- Admin mailbox tables
CREATE TABLE IF NOT EXISTS admin_emails (
  id SERIAL PRIMARY KEY,
  admin_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Email metadata
  from_address VARCHAR(255) NOT NULL,
  from_name VARCHAR(255),
  to_address VARCHAR(255) NOT NULL,
  cc_addresses TEXT[],
  subject VARCHAR(500) NOT NULL,
  
  -- Email content
  body_text TEXT,
  body_html TEXT,
  
  -- Status and flags
  status VARCHAR(50) NOT NULL DEFAULT 'unread',
  is_starred BOOLEAN DEFAULT false,
  
  -- Metadata
  message_id VARCHAR(255),
  in_reply_to VARCHAR(255),
  "references" TEXT[],
  
  -- Timestamps
  received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_admin_emails_user_id ON admin_emails(admin_user_id);
CREATE INDEX idx_admin_emails_status ON admin_emails(status);
CREATE INDEX idx_admin_emails_received_at ON admin_emails(received_at DESC);
CREATE INDEX idx_admin_emails_from_address ON admin_emails(from_address);
CREATE INDEX idx_admin_emails_subject ON admin_emails USING gin(to_tsvector('english', subject));
CREATE INDEX idx_admin_emails_body_text ON admin_emails USING gin(to_tsvector('english', body_text));

-- Composite index for common queries
CREATE INDEX idx_admin_emails_user_status_received ON admin_emails(admin_user_id, status, received_at DESC);

-- Admin email addresses table
CREATE TABLE IF NOT EXISTS admin_email_addresses (
  id SERIAL PRIMARY KEY,
  admin_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_address VARCHAR(255) NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(email_address)
);

CREATE INDEX idx_admin_email_addresses_user_id ON admin_email_addresses(admin_user_id);
CREATE INDEX idx_admin_email_addresses_email ON admin_email_addresses(email_address);

-- Insert default admin email addresses from existing users
INSERT INTO admin_email_addresses (admin_user_id, email_address, is_primary, is_active)
SELECT id, email, true, true
FROM users
WHERE role = 'administrator'
ON CONFLICT (email_address) DO NOTHING;
