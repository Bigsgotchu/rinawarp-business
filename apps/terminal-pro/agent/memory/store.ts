import { db } from "./db";

export function kvGet(key: string): string | null {
  const row = db.prepare("SELECT value FROM kv WHERE key = ?").get(key) as any;
  return row?.value ?? null;
}

export function kvSet(key: string, value: string) {
  db.prepare(
    "INSERT INTO kv(key,value,updated_at) VALUES(?,?,?) " +
    "ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at"
  ).run(key, value, Date.now());
}

export function logEvent(kind: string, payload: any) {
  db.prepare("INSERT INTO events(ts,kind,payload) VALUES(?,?,?)")
    .run(Date.now(), kind, JSON.stringify(payload));
}

export function upsertConversation(convoId: string, title?: string) {
  const now = Date.now();
  db.prepare(
    "INSERT INTO conversations(id,created_at,updated_at,title) VALUES(?,?,?,?) " +
    "ON CONFLICT(id) DO UPDATE SET updated_at=excluded.updated_at, title=COALESCE(excluded.title, conversations.title)"
  ).run(convoId, now, now, title ?? null);
}

export function addMessage(convoId: string, role: string, content: string, meta?: any) {
  upsertConversation(convoId);
  db.prepare("INSERT INTO messages(convo_id,ts,role,content,meta) VALUES(?,?,?,?,?)")
    .run(convoId, Date.now(), role, content, JSON.stringify(meta ?? null));
}

export function getRecentMessages(convoId: string, limit = 30) {
  return db.prepare(
    "SELECT ts, role, content, meta FROM messages WHERE convo_id=? ORDER BY ts DESC LIMIT ?"
  ).all(convoId, limit).reverse();
}
