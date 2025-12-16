export const onRequestGet = async ({ env }) => {
  try {
    let prod = null,
      staging = null;
    if (env.KV_SITE) {
      [prod, staging] = await Promise.all([
        env.KV_SITE.get('smoke:prod:last_success'),
        env.KV_SITE.get('smoke:staging:last_success'),
      ]);
    }
    const out = {
      ok: true,
      prod: prod || null,
      staging: staging || null,
      now: new Date().toISOString(),
    };
    return new Response(JSON.stringify(out), {
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || 'status failed' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};
