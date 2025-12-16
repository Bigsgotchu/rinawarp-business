import Database from 'better-sqlite3';
import path from 'path';
import os from 'os';
import fs from 'fs';

const dir = path.join(os.homedir(), '.rinawarp', 'terminal-pro');
fs.mkdirSync(dir, { recursive: true });

export const db = new Database(path.join(dir, 'rina-agent.sqlite'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS kv (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ts INTEGER NOT NULL,
    kind TEXT NOT NULL,
    payload TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    title TEXT
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    convo_id TEXT NOT NULL,
    ts INTEGER NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    meta TEXT,
    FOREIGN KEY(convo_id) REFERENCES conversations(id)
  );

  CREATE INDEX IF NOT EXISTS idx_messages_convo_ts ON messages(convo_id, ts);
`);
