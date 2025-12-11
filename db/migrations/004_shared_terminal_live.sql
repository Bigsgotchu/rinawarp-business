-- Live events (lightweight, fast writes)
CREATE TABLE IF NOT EXISTS session_realtime_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  team_id TEXT,
  user_id TEXT,
  role TEXT CHECK(role IN ('host', 'guest')) NOT NULL,
  event_type TEXT NOT NULL, -- 'pty_out', 'input', 'join', 'leave', 'meta'
  payload TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_session_realtime_events_session
  ON session_realtime_events (session_id, created_at);

-- Replay chunks (compressed logs per session)
CREATE TABLE IF NOT EXISTS session_replay_chunks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  sequence INTEGER NOT NULL,
  chunk JSON NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_session_replay_chunks_session_seq
  ON session_replay_chunks (session_id, sequence);