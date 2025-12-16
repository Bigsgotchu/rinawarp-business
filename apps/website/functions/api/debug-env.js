export const onRequestGet = async (context) => {
  try {
    const priceMapJson = context.env.RINA_PRICE_MAP;
    const stripeSecretKey = context.env.STRIPE_SECRET_KEY;
    const domain = context.env.DOMAIN;

    let priceMap = {};
    let parsed = false;

    try {
      if (priceMapJson) {
        priceMap = JSON.parse(priceMapJson);
        parsed = true;
      }
    } catch (e) {
      console.error('Failed to parse RINA_PRICE_MAP:', e);
    }

    return new Response(
      JSON.stringify(
        {
          status: 'Environment Variable Debug',
          hasPriceMap: !!priceMapJson,
          parsedSuccessfully: parsed,
          priceMapKeys: Object.keys(priceMap),
          priceMapSample: Object.keys(priceMap)
            .slice(0, 3)
            .reduce((obj, key) => {
              obj[key] = priceMap[key];
              return obj;
            }, {}),
          hasStripeKey: !!stripeSecretKey,
          stripeKeyPrefix: stripeSecretKey ? stripeSecretKey.substring(0, 10) + '...' : 'none',
          domain: domain,
          timestamp: new Date().toISOString(),
        },
        null,
        2,
      ),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
