export async function onRequestPost({ env, request }) {
  const db = env.DB;
  const { memberId } = await request.json();

  await db
    .prepare(
      `
    UPDATE team_members
    SET status = 'removed'
    WHERE id = ?1
  `,
    )
    .bind(memberId)
    .run();

  return Response.json({ ok: true });
}
