export async function onRequestGet({ env, request }) {
  const url = new URL(request.url);
  const teamId = url.searchParams.get("teamId");
  const query = url.searchParams.get("query") || "";
  const memoryType = url.searchParams.get("type") || "all";
  const limit = parseInt(url.searchParams.get("limit")) || 20;

  const db = env.DB;

  let sql = `
    SELECT * FROM team_ai_memory
    WHERE team_id = ?1
  `;
  let params = [teamId];

  if (memoryType !== "all") {
    sql += ` AND memory_type = ?${params.length + 1}`;
    params.push(memoryType);
  }

  if (query) {
    sql += ` AND (content LIKE ?${params.length + 1} OR tags LIKE ?${params.length + 2})`;
    const searchParam = `%${query}%`;
    params.push(searchParam, searchParam);
  }

  sql += ` ORDER BY created_at DESC LIMIT ?${params.length + 1}`;
  params.push(limit);

  const memories = await db.prepare(sql).bind(...params).all();

  return Response.json({
    ok: true,
    memories,
    count: memories.length
  });
}