export async function onRequestGet({ env, request }) {
  const url = new URL(request.url);
  const teamId = url.searchParams.get("teamId");
  const limit = parseInt(url.searchParams.get("limit")) || 50;

  const db = env.DB;

  // Get recent team activities
  const activities = await db.prepare(`
    SELECT a.*, u.name as user_name, u.email as user_email
    FROM team_activities a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE a.team_id = ?1
    ORDER BY a.created_at DESC
    LIMIT ?2
  `).bind(teamId, limit).all();

  // Get team stats
  const stats = await db.prepare(`
    SELECT
      COUNT(DISTINCT user_id) as active_members,
      COUNT(DISTINCT CASE WHEN type = 'command' THEN id END) as commands_run,
      COUNT(DISTINCT CASE WHEN type = 'session' THEN id END) as sessions_created,
      MAX(created_at) as last_activity
    FROM team_activities
    WHERE team_id = ?1
  `).bind(teamId).first();

  return Response.json({
    ok: true,
    activities,
    stats: stats || {
      active_members: 0,
      commands_run: 0,
      sessions_created: 0,
      last_activity: null
    }
  });
}