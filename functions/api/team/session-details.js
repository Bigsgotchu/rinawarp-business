export async function onRequestGet({ env, request }) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('sessionId');

  const db = env.DB;

  // Get session details
  const session = await db
    .prepare(
      `
    SELECT s.*, u.name as host_name, u.email as host_email
    FROM shared_sessions s
    LEFT JOIN users u ON s.created_by = u.id
    WHERE s.id = ?1
  `,
    )
    .bind(sessionId)
    .first();

  if (!session) {
    return Response.json({ ok: false, error: 'Session not found' });
  }

  // Get participants
  const participants = await db
    .prepare(
      `
    SELECT sp.*, u.name as user_name, u.email as user_email
    FROM session_participants sp
    LEFT JOIN users u ON sp.user_id = u.id
    WHERE sp.session_id = ?1
    ORDER BY sp.joined_at ASC
  `,
    )
    .bind(sessionId)
    .all();

  // Get session events (if available)
  const events = await db
    .prepare(
      `
    SELECT * FROM session_events
    WHERE session_id = ?1
    ORDER BY created_at ASC
  `,
    )
    .bind(sessionId)
    .all();

  return Response.json({
    ok: true,
    session,
    participants,
    events,
  });
}
