export const onRequestGet = async ({ env, request }) => {
  const headers = {
    'content-type': 'application/json',
    'cache-control': 'public, max-age=30, s-maxage=60',
  };
  try {
    const secret = env.STRIPE_SECRET_KEY || env.STRIPE_SECRET;
    if (!secret) {
      return new Response(JSON.stringify({ ok: false, error: 'STRIPE_SECRET_KEY missing' }), {
        status: 500,
        headers,
      });
    }
    const url = new URL(request.url);
    const keys = (url.searchParams.get('keys') || env.PRICE_LOOKUP_KEYS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const nameFilter =
      url.searchParams.get('name') || env.PRODUCT_NAME_FILTER || 'RinaWarp|Terminal';

    const auth = { headers: { authorization: `Bearer ${secret}` } };

    // Helper: normalize minimal fields for UI
    const pick = (p) => ({
      id: p.id,
      active: p.active,
      currency: p.currency,
      unit_amount: p.unit_amount,
      type: p.type,
      recurring: p.recurring ? { interval: p.recurring.interval } : null,
      lookup_key: p.lookup_key || null,
      product: p.product ? { id: p.product.id, name: p.product.name || null } : null,
    });

    // 1) lookup_keys exact
    let found = [];
    if (keys.length) {
      for (const k of keys) {
        const r = await fetch(
          `https://api.stripe.com/v1/prices?active=true&lookup_keys[]=${encodeURIComponent(k)}&expand[]=data.product`,
          auth,
        );
        if (!r.ok)
          return new Response(JSON.stringify({ ok: false, error: `stripe ${r.status}` }), {
            status: 502,
            headers,
          });
        const j = await r.json();
        found.push(...(j.data || []));
      }
    }

    // 2) product-name filter (if none found)
    if (found.length === 0) {
      const r = await fetch(
        `https://api.stripe.com/v1/prices?active=true&limit=100&expand[]=data.product`,
        auth,
      );
      if (!r.ok)
        return new Response(JSON.stringify({ ok: false, error: `stripe ${r.status}` }), {
          status: 502,
          headers,
        });
      const j = await r.json();
      const all = j.data || [];
      const re = new RegExp(nameFilter, 'i');
      found = all.filter((p) => re.test(p.product?.name || ''));
    }

    // 3) fallback: any active recurring prices (last resort)
    if (found.length === 0) {
      const r = await fetch(
        `https://api.stripe.com/v1/prices?active=true&limit=100&expand[]=data.product`,
        auth,
      );
      if (!r.ok)
        return new Response(JSON.stringify({ ok: false, error: `stripe ${r.status}` }), {
          status: 502,
          headers,
        });
      const j = await r.json();
      const all = j.data || [];
      found = all.filter((p) => p.type === 'recurring');
    }

    // Prefer monthly + annual if multiple found
    const monthly = found.find((p) => p.recurring?.interval === 'month');
    const annual = found.find((p) => p.recurring?.interval === 'year');
    const dedupMap = new Map();
    for (const p of [monthly, annual, ...found]) if (p) dedupMap.set(p.id, p);
    const out = Array.from(dedupMap.values()).map(pick);

    return new Response(JSON.stringify({ ok: true, data: out }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message || 'prices failed' }), {
      status: 500,
      headers,
    });
  }
};
// Force functions rebuild Mon Dec 15 12:32:30 AM MST 2025
