export async function onRequestGet({ env, request }) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  const key = url.searchParams.get('key');

  const value = await env.USER_SYNC.get(`${userId}:${key}`);

  return Response.json({ ok: true, value: JSON.parse(value || 'null') });
}
