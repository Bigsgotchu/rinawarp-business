export const onRequestPost = async ({ request, env }) => {
  try {
    const token = request.headers.get('x-smoke-token') || '';
    if (!env.SMOKE_TOKEN || token !== env.SMOKE_TOKEN) {
      return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      });
    }
    const { env: targetEnv = '' } = await request.json().catch(() => ({}));
    const envKey = String(targetEnv || '').toLowerCase();
    if (!['staging', 'prod', 'production'].includes(envKey)) {
      return new Response(JSON.stringify({ ok: false, error: "env must be 'staging' or 'prod'" }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }
    const key = `smoke:${envKey === 'production' ? 'prod' : envKey}:last_success`;
    const now = new Date().toISOString();
    await env.KV_SITE.put(key, now);
    return new Response(JSON.stringify({ ok: true, key, at: now }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || 'mark failed' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};
