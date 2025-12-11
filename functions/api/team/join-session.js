export async function onRequestPost({ env, request }) {
  const db = env.DB;
  const { sessionId, userId } = await request.json();

  // Validate session exists
  const session = await db.prepare(`
    SELECT * FROM shared_sessions WHERE id = ?1 AND status = 'active'
  `).bind(sessionId).first();

  if (!session) {
    return Response.json({ ok: false, error: "Session not found or inactive" });
  }

  // Validate team membership
  const member = await db.prepare(`
    SELECT * FROM team_members
    WHERE team_id = ?1 AND user_id = ?2 AND status = 'active'
  `).bind(session.team_id, userId).first();

  if (!member) {
    return Response.json({ ok: false, error: "Not a team member" });
  }

  // Check if already joined
  const existing = await db.prepare(`
    SELECT * FROM session_participants
    WHERE session_id = ?1 AND user_id = ?2
  `).bind(sessionId, userId).first();

  if (existing) {
    return Response.json({
      ok: true,
      sessionId,
      role: existing.role,
      message: "Already joined"
    });
  }

  // Add as participant
  await db.prepare(`
    INSERT INTO session_participants (session_id, user_id, role, joined_at)
    VALUES (?1, ?2, 'participant', ?3)
  `).bind(sessionId, userId, Date.now()).run();

  return Response.json({
    ok: true,
    sessionId,
    role: 'participant'
  });
}