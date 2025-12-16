export async function listRecentLogs(env, sessionId, limit = 200) {
  const result = await env.DB.prepare(
    `SELECT ts, actor_name, kind, payload
     FROM live_session_events
     WHERE session_id = ?
     ORDER BY ts DESC
     LIMIT ?`,
  )
    .bind(sessionId, limit)
    .all();

  return result.results.map((e) => ({
    ts: e.ts,
    actor: e.actor_name,
    kind: e.kind,
    payload: JSON.parse(e.payload || '{}'),
  }));
}
