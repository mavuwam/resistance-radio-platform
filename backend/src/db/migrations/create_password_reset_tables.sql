-- Password Reset Tables Migration
-- Creates tables for admin password reset and rate limiting

-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for password_reset_tokens
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- Partial unique index to ensure only one active (unused and not expired) token per user
-- This enforces the constraint at the application level with database support
CREATE UNIQUE INDEX idx_password_reset_tokens_active_per_user 
  ON password_reset_tokens(user_id) 
  WHERE (used_at IS NULL);

-- Create password_reset_rate_limits table
CREATE TABLE IF NOT EXISTS password_reset_rate_limits (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(email)
);

-- Indexes for password_reset_rate_limits
CREATE INDEX idx_password_reset_rate_limits_email ON password_reset_rate_limits(email);
CREATE INDEX idx_password_reset_rate_limits_window_start ON password_reset_rate_limits(window_start);
