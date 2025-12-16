export async function onRequestPost({ env, request }) {
  const { userId, key, value } = await request.json();

  await env.USER_SYNC.put(`${userId}:${key}`, JSON.stringify(value));

  return Response.json({ ok: true });
}
