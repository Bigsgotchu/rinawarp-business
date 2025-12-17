-- Live sessions (shared terminals)
CREATE TABLE IF NOT EXISTS live_sessions (
  id TEXT PRIMARY KEY,              -- sessionId (UUID or nanoid)
  team_id TEXT NOT NULL,
  host_user_id TEXT NOT NULL,
  host_name TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- active | ended
  title TEXT,
  description TEXT,
  created_at INTEGER NOT NULL,      -- ms since epoch
  ended_at INTEGER,
  last_activity_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_live_sessions_team
  ON live_sessions(team_id);

CREATE INDEX IF NOT EXISTS idx_live_sessions_status
  ON live_sessions(status);

-- Participants in a session
CREATE TABLE IF NOT EXISTS live_session_participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL,               -- host | guest
  joined_at INTEGER NOT NULL,
  left_at INTEGER,
  last_seen_at INTEGER NOT NULL,
  FOREIGN KEY (session_id) REFERENCES live_sessions(id)
);

CREATE INDEX IF NOT EXISTS idx_live_session_participants_session
  ON live_session_participants(session_id);

CREATE INDEX IF NOT EXISTS idx_live_session_participants_user
  ON live_session_participants(user_id);

-- Event stream for replay + analytics
CREATE TABLE IF NOT EXISTS live_session_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  ts INTEGER NOT NULL,              -- ms since epoch
  actor_user_id TEXT,
  actor_name TEXT,
  kind TEXT NOT NULL,               -- 'pty_output' | 'pty_input' | 'join' | 'leave' | 'meta' | ...
  payload TEXT NOT NULL,            -- JSON string
  FOREIGN KEY (session_id) REFERENCES live_sessions(id)
);

CREATE INDEX IF NOT EXISTS idx_live_session_events_session_ts
  ON live_session_events(session_id, ts);