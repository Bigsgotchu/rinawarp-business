export async function onRequestPost({ env, request }) {
  const db = env.DB;
  const { teamId, userId, sessionName } = await request.json();

  // Validate team membership
  const member = await db.prepare(`
    SELECT * FROM team_members
    WHERE team_id = ?1 AND user_id = ?2 AND status = 'active'
  `).bind(teamId, userId).first();

  if (!member) {
    return Response.json({ ok: false, error: "Not a team member" });
  }

  // Create shared session
  const sessionId = crypto.randomUUID();
  const now = Date.now();

  await db.prepare(`
    INSERT INTO shared_sessions (id, team_id, created_by, name, status, created_at)
    VALUES (?1, ?2, ?3, ?4, 'active', ?5)
  `).bind(sessionId, teamId, userId, sessionName, now).run();

  // Add creator as participant
  await db.prepare(`
    INSERT INTO session_participants (session_id, user_id, role, joined_at)
    VALUES (?1, ?2, 'host', ?3)
  `).bind(sessionId, userId, now).run();

  return Response.json({
    ok: true,
    sessionId,
    sessionName,
    teamId
  });
}