export async function onRequestGet({ env, request }) {
  const url = new URL(request.url);
  const teamId = url.searchParams.get("teamId");

  const db = env.DB;

  // Validate team exists
  const team = await db.prepare(`
    SELECT * FROM teams WHERE id = ?1
  `).bind(teamId).first();

  if (!team) {
    return Response.json({ ok: false, error: "Team not found" });
  }

  // Get shared sessions for the team
  const sessions = await db.prepare(`
    SELECT s.*, u.name as host_name, u.email as host_email
    FROM shared_sessions s
    LEFT JOIN users u ON s.created_by = u.id
    WHERE s.team_id = ?1
    ORDER BY s.created_at DESC
  `).bind(teamId).all();

  // Get participants count for each session
  const sessionsWithParticipants = await Promise.all(
    sessions.map(async (session) => {
      const participants = await db.prepare(`
        SELECT COUNT(*) as count FROM session_participants WHERE session_id = ?1
      `).bind(session.id).first();

      return {
        ...session,
        participants_count: participants.count
      };
    })
  );

  return Response.json({
    ok: true,
    sessions: sessionsWithParticipants
  });
}