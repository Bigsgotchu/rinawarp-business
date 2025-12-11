export async function cleanupStaleSessions(env) {
  const cutoff = Date.now() - 3600_000; // 1 hour stale

  await env.DB.prepare(
    `UPDATE live_sessions SET status='ended'
     WHERE last_activity_at < ? AND status='active'`
  )
    .bind(cutoff)
    .run();
}