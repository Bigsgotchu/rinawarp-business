export async function onRequestPost(context) {
  const { request, env } = context;
  const db = env.RINAWARP_D1;

  const body = await request.json().catch(() => ({}));
  const { teamId, userId, tabId, shell, cwd } = body;

  const sessionId = body.sessionId || crypto.randomUUID().slice(0, 8);
  const now = Date.now();

  await db
    .prepare(
      `INSERT INTO shared_sessions
       (id, team_id, host_user_id, created_at, status, title)
       VALUES (?, ?, ?, ?, 'active', ?)`,
    )
    .bind(sessionId, teamId || null, userId || null, now, body.title || 'Live Shell Session')
    .run()
    .catch(() => {});

  const wsBase = env.RINAWARP_LIVE_WS_URL || 'wss://api.rinawarptech.com/ws/shared-terminal';

  return new Response(
    JSON.stringify({
      ok: true,
      sessionId,
      wsUrl: `${wsBase}/${sessionId}`,
      role: 'host',
      meta: { tabId, shell, cwd },
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  );
}
