export async function onRequestGet({ env, request }) {
  const url = new URL(request.url);
  const teamId = url.searchParams.get("teamId");

  const db = env.DB;

  const team = await db.prepare(`
    SELECT * FROM teams WHERE id = ?1
  `).bind(teamId).first();

  if (!team) {
    return Response.json({ ok: false, error: "Team not found" });
  }

  const members = await db.prepare(`
    SELECT * FROM team_members WHERE team_id = ?1
  `).bind(teamId).all();

  return Response.json({
    ok: true,
    team,
    members
  });
}