export async function onRequestGet({ env, request }) {
  const url = new URL(request.url);
  const teamId = url.searchParams.get('teamId');

  const db = env.DB;

  // Get current team seats and usage
  const team = await db
    .prepare(
      `
    SELECT * FROM teams WHERE id = ?1
  `,
    )
    .bind(teamId)
    .first();

  if (!team) {
    return Response.json({ ok: false, error: 'Team not found' });
  }

  // Count active members
  const activeMembers = await db
    .prepare(
      `
    SELECT COUNT(*) as count FROM team_members
    WHERE team_id = ?1 AND status = 'active'
  `,
    )
    .bind(teamId)
    .first();

  return Response.json({
    ok: true,
    teamId,
    maxSeats: team.max_seats || 0,
    usedSeats: activeMembers.count,
    availableSeats: (team.max_seats || 0) - activeMembers.count,
  });
}
