export const onRequestGet = async ({ env }) => {
  const headers = { 'content-type': 'application/json', 'cache-control': 'no-store' };
  try {
    const secret = env.STRIPE_SECRET_KEY || env.STRIPE_SECRET || '';
    const mode = secret.startsWith('sk_test_')
      ? 'test'
      : secret.startsWith('sk_live_')
        ? 'live'
        : 'unknown';
    const keys = (env.PRICE_LOOKUP_KEYS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const nameFilter = env.PRODUCT_NAME_FILTER || 'RinaWarp|Terminal';

    // Ping Stripe to count active prices (sanity)
    let count = null;
    if (secret) {
      const r = await fetch('https://api.stripe.com/v1/prices?active=true&limit=1', {
        headers: { authorization: `Bearer ${secret}` },
      });
      count = r.ok ? 'ok' : `stripe ${r.status}`;
    }

    return new Response(
      JSON.stringify({
        ok: true,
        mode, // test/live
        hasSecret: !!secret,
        lookupKeys: keys,
        nameFilter,
        stripePricesList: count,
      }),
      { headers },
    );
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message || 'debug failed' }), {
      status: 500,
      headers,
    });
  }
};
