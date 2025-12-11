CREATE TABLE IF NOT EXISTS live_sessions (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  host_user_id TEXT NOT NULL,
  host_name TEXT NOT NULL,
  status TEXT NOT NULL,
  title TEXT,
  description TEXT,
  created_at INTEGER NOT NULL,
  last_activity_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_live_sessions_team ON live_sessions(team_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_status ON live_sessions(status);

CREATE TABLE IF NOT EXISTS live_session_participants (
  session_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  joined_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  left_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_participants_session ON live_session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON live_session_participants(user_id);

CREATE TABLE IF NOT EXISTS live_session_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  ts INTEGER NOT NULL,
  actor_user_id TEXT,
  actor_name TEXT,
  kind TEXT NOT NULL,
  payload TEXT
);

CREATE INDEX IF NOT EXISTS idx_events_session ON live_session_events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_ts ON live_session_events(ts DESC);