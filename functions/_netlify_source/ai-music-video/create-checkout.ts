const Stripe = await import('stripe');

const stripe = new Stripe.default(process.env.STRIPE_SECRET_KEY!);

function parseMap(raw?: string) {
  return Object.fromEntries(
    (raw || '')
      .split(',')
      .filter(Boolean)
      .map((kv) => kv.split('=')),
  ) as Record<string, string>;
}

const RINA = parseMap(process.env.RINA_PRICE_MAP); // Terminal
const AMVC = parseMap(process.env.RINA_AMVC_PRICE_MAP); // Music Video Creator
const BUND = parseMap(process.env.RINA_BUNDLE_PRICE_MAP); // Bundles

export default async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const { plan, seats = 1, customerEmail } = await req.json();
    const success = `${process.env.SITE_URL}/download?session_id={CHECKOUT_SESSION_ID}`;
    const cancel = `${process.env.SITE_URL}/pricing?canceled=1`;

    // Handle credit packs (one-time payments)
    if (plan.startsWith('amvc_credits_')) {
      const price = AMVC[plan];
      if (!price) {
        return new Response(JSON.stringify({ error: 'Unknown credit pack' }), {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
        });
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{ price, quantity: 1 }],
        success_url: success,
        cancel_url: cancel,
        customer_email: customerEmail,
        metadata: { plan, product: 'amvc_credits' },
      });

      return new Response(
        JSON.stringify({
          success: true,
          sessionId: session.id,
          url: session.url,
        }),
        {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
        },
      );
    }

    // Handle subscriptions (AMVC plans and bundles)
    const table = plan.startsWith('amvc_') ? AMVC : plan.startsWith('bundle_') ? BUND : RINA;

    const price = table[plan];
    if (!price) {
      return new Response(JSON.stringify({ error: 'Unknown plan' }), {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      });
    }

    const isBundle = plan.startsWith('bundle_');
    const isAmvc = plan.startsWith('amvc_');

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price, quantity: plan.startsWith('team_') ? Math.max(1, Number(seats)) : 1 }],
      success_url: success,
      cancel_url: cancel,
      customer_email: customerEmail,
      metadata: { plan, product: isBundle ? 'bundle' : isAmvc ? 'amvc' : 'terminal' },
    });

    return new Response(
      JSON.stringify({
        success: true,
        sessionId: session.id,
        url: session.url,
      }),
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }
};
