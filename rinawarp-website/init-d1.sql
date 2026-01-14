CREATE TABLE licenses (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  plan TEXT NOT NULL,
  seats INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE license_seats (
  id TEXT PRIMARY KEY,
  license_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  last_seen TEXT,
  FOREIGN KEY (license_id) REFERENCES licenses(id)
);

CREATE TABLE usage_events (
  id TEXT PRIMARY KEY,
  license_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  units INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoices (
  id TEXT PRIMARY KEY,
  license_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL,
  due_date TEXT,
  stripe_invoice_id TEXT
);