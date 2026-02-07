-- Add last_login_at column to users table
-- Run this SQL directly in your PostgreSQL database if migrations fail

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP NULL;
