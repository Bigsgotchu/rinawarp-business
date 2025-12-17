-- D1 Database Schema for RinaWarp Licenses
-- This schema defines the structure for storing customer licenses

CREATE TABLE licenses (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  email TEXT NOT NULL,
  license_key TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  stripe_session_id TEXT,
  features TEXT,
  UNIQUE(email, plan)
);

-- Indexes for better query performance
CREATE INDEX idx_licenses_email ON licenses(email);
CREATE INDEX idx_licenses_license_key ON licenses(license_key);
CREATE INDEX idx_licenses_status ON licenses(status);
CREATE INDEX idx_licenses_expires ON licenses(expires_at);

-- Create a view for active licenses
CREATE VIEW active_licenses AS
SELECT * FROM licenses
WHERE status = 'active' AND expires_at > datetime('now');

-- Create a view for expired licenses
CREATE VIEW expired_licenses AS
SELECT * FROM licenses
WHERE status = 'active' AND expires_at <= datetime('now');