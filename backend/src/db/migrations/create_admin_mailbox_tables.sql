-- Admin Mailbox Tables Migration
-- Creates tables for admin email management system

-- Create admin_emails table
CREATE TABLE IF NOT EXISTS admin_emails (
  id SERIAL PRIMARY KEY,
  admin_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Email metadata
  from_address VARCHAR(255) NOT NULL,
  from_name VARCHAR(255),
  to_address VARCHAR(255) NOT NULL,
  cc_addresses TEXT[], -- Array of CC recipients
  subject VARCHAR(500) NOT NULL,
  
  -- Email content
  body_text TEXT, -- Plain text version
  body_html TEXT, -- HTML version
  
  -- Status and flags
  status VARCHAR(50) NOT NULL DEFAULT 'unread', -- unread, read, archived, deleted
  is_starred BOOLEAN DEFAULT false,
  
  -- Metadata
  message_id VARCHAR(255), -- Original email message ID
  in_reply_to VARCHAR(255), -- For threading
  "references" TEXT[], -- Email thread references
  
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

-- Create admin_email_addresses table
CREATE TABLE IF NOT EXISTS admin_email_addresses (
  id SERIAL PRIMARY KEY,
  admin_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_address VARCHAR(255) NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(email_address)
);

-- Indexes for admin_email_addresses
CREATE INDEX idx_admin_email_addresses_user_id ON admin_email_addresses(admin_user_id);
CREATE INDEX idx_admin_email_addresses_email ON admin_email_addresses(email_address);

-- Insert default admin email addresses from existing users table
-- This creates email addresses for all existing admin users
INSERT INTO admin_email_addresses (admin_user_id, email_address, is_primary, is_active)
SELECT id, email, true, true
FROM users
WHERE role = 'administrator'
ON CONFLICT (email_address) DO NOTHING;
