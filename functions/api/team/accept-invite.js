export async function onRequestPost({ env, request }) {
  const db = env.DB;
  const { token, userId } = await request.json();

  const invite = await db.prepare(`
    SELECT * FROM team_invites WHERE token = ?1
  `).bind(token).first();

  if (!invite) {
    return Response.json({ ok: false, error: "Invalid token" });
  }

  if (invite.expires_at < Date.now()) {
    return Response.json({ ok: false, error: "Invite expired" });
  }

  const membershipId = crypto.randomUUID();
  const now = Date.now();

  await db.prepare(`
    INSERT INTO team_members (id, team_id, user_id, role, status, joined_at)
    VALUES (?1, ?2, ?3, ?4, 'active', ?5)
  `).bind(
    membershipId,
    invite.team_id,
    userId,
    invite.role,
    now
  ).run();

  // Optional: delete invite
  await db.prepare(`
    DELETE FROM team_invites WHERE id = ?1
  `).bind(invite.id).run();

  return Response.json({
    ok: true,
    teamId: invite.team_id,
    membershipId
  });
}