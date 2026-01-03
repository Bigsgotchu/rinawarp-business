-- customers: Stripe customer id is primary key
CREATE TABLE IF NOT EXISTS customers (
  stripe_customer_id TEXT PRIMARY KEY,
  email TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS licenses (
  license_key TEXT PRIMARY KEY,
  stripe_customer_id TEXT NOT NULL,
  product TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  entitlement TEXT NOT NULL,
  status TEXT NOT NULL, -- ACTIVE|GRACE|EXPIRED|INVALID|REVOKED
  activation_limit INTEGER NOT NULL DEFAULT 3,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_licenses_customer ON licenses(stripe_customer_id);

CREATE TABLE IF NOT EXISTS activations (
  license_key TEXT NOT NULL,
  machine_hash TEXT NOT NULL,
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  PRIMARY KEY (license_key, machine_hash)
);

CREATE TABLE IF NOT EXISTS stripe_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS downloads_latest (
  product TEXT PRIMARY KEY,
  version TEXT NOT NULL,
  linux_appimage_url TEXT NOT NULL,
  linux_appimage_sha256 TEXT NOT NULL,
  notes_url TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS purchases (
  checkout_session_id TEXT PRIMARY KEY,
  license_key TEXT NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  created_at TEXT NOT NULL
);