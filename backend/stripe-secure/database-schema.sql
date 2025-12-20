-- Secure database schema for Stripe webhook implementation

-- Processed events table (for idempotency)
CREATE TABLE processed_events (
  id SERIAL PRIMARY KEY,
  stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  processed_at TIMESTAMP DEFAULT NOW(),
  
  -- Index for fast lookups
  CONSTRAINT unique_event_id UNIQUE (stripe_event_id)
);

-- Licenses table (with encrypted key storage)
CREATE TABLE licenses (
  id SERIAL PRIMARY KEY,
  
  -- Secure storage
  license_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA-256 hash
  license_key_encrypted TEXT NOT NULL,      -- AES-256-GCM encrypted key
  license_iv VARCHAR(32) NOT NULL,          -- Encryption IV
  license_auth_tag VARCHAR(32) NOT NULL,    -- Auth tag for verification
  
  -- License details
  tier VARCHAR(50) NOT NULL DEFAULT 'pro',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  
  -- Stripe tracking
  stripe_session_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_payment_intent_id VARCHAR(255),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  activated_at TIMESTAMP,
  
  -- Indexes for performance
  INDEX idx_license_hash (license_hash),
  INDEX idx_stripe_session (stripe_session_id),
  INDEX idx_created_at (created_at)
);

-- Optional: User sessions table (if you track users)
CREATE TABLE user_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  user_id VARCHAR(255),
  license_id INTEGER REFERENCES licenses(id),
  created_at TIMESTAMP DEFAULT NOW(),
  last_activity TIMESTAMP DEFAULT NOW()
);

-- Example queries for integration:

-- 1. Check if event was processed
-- SELECT COUNT(*) FROM processed_events WHERE stripe_event_id = $1;

-- 2. Mark event as processed
-- INSERT INTO processed_events (stripe_event_id, event_type) VALUES ($1, $2);

-- 3. Create license
-- INSERT INTO licenses (
--   license_hash, license_key_encrypted, license_iv, license_auth_tag,
--   tier, stripe_session_id, stripe_payment_intent_id
-- ) VALUES ($1, $2, $3, $4, $5, $6, $7);

-- 4. Get license by session ID
-- SELECT license_key_encrypted, license_iv, license_auth_tag, tier 
-- FROM licenses WHERE stripe_session_id = $1;

-- 5. Verify license (hash lookup)
-- SELECT tier, status FROM licenses WHERE license_hash = $1;
