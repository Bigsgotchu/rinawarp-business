export async function onRequestPost({ env, request }) {
  const db = env.DB;
  const { teamId, email, role = 'member' } = await request.json();

  const id = crypto.randomUUID();
  const token = crypto.randomUUID();
  const now = Date.now();
  const expiresAt = now + 1000 * 60 * 60 * 24 * 7; // 7 days

  await db
    .prepare(
      `
    INSERT INTO team_invites (id, team_id, email, role, token, created_at, expires_at)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
  `,
    )
    .bind(id, teamId, email, role, token, now, expiresAt)
    .run();

  return Response.json({
    ok: true,
    inviteId: id,
    token,
  });
}
