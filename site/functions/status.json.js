export const onRequestGet = async ({ request }) => {
  const base = new URL(request.url).origin;
  const headers = {
    'content-type': 'application/json',
    // short browser cache, longer edge cache
    'cache-control': 'public, max-age=30, s-maxage=60',
  };
  try {
    const [metaRes, healthRes] = await Promise.allSettled([
      fetch(`${base}/api/latest/meta`, { cf: { cacheTtl: 60, cacheEverything: true } }),
      fetch(`${base}/api/health/downloads`, { cf: { cacheTtl: 30, cacheEverything: true } }),
    ]);

    let meta = null,
      health = null;
    if (metaRes.status === 'fulfilled' && metaRes.value.ok) meta = await metaRes.value.json();
    if (healthRes.status === 'fulfilled' && healthRes.value.ok)
      health = await healthRes.value.json();

    const ok = Boolean(health?.ok) && Boolean(meta?.version);
    const out = {
      ok,
      version: meta?.version ?? null,
      date: meta?.date ?? null,
      notes: meta?.notes ?? null,
      results: health?.results ?? [],
      checksums: meta?.assets?.checksums ?? null,
      generatedAt: new Date().toISOString(),
      sources: { meta: '/api/latest/meta', health: '/api/health/downloads' },
    };

    return new Response(JSON.stringify(out), { status: ok ? 200 : 502, headers });
  } catch (e) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: e?.message || 'status merge failed',
        generatedAt: new Date().toISOString(),
      }),
      { status: 500, headers },
    );
  }
};
