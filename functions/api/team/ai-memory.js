export async function onRequestPost({ env, request }) {
  const db = env.DB;
  const { teamId, userId, memoryType, content, tags = [] } = await request.json();

  // Validate team membership
  const member = await db.prepare(`
    SELECT * FROM team_members
    WHERE team_id = ?1 AND user_id = ?2 AND status = 'active'
  `).bind(teamId, userId).first();

  if (!member) {
    return Response.json({ ok: false, error: "Not a team member" });
  }

  // Store AI memory
  const memoryId = crypto.randomUUID();
  const now = Date.now();

  await db.prepare(`
    INSERT INTO team_ai_memory (id, team_id, user_id, memory_type, content, tags, created_at)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
  `).bind(memoryId, teamId, userId, memoryType, content, JSON.stringify(tags), now).run();

  return Response.json({
    ok: true,
    memoryId,
    message: "AI memory stored successfully"
  });
}