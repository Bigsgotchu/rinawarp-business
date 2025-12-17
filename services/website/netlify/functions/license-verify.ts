import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

export default async (request: Request, context: any) => {
  try {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { license_key } = await request.json();

    if (!license_key) {
      return new Response(JSON.stringify({ error: 'license_key is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check against static valid keys first (for testing)
    const validKeys = (process.env.VALID_LICENSE_KEYS || '').split(',');
    const isValid = validKeys.includes(license_key.trim());

    if (isValid) {
      return new Response(
        JSON.stringify({
          valid: true,
          license_key,
          plan: 'Professional',
          status: 'active',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Fallback: check Stripe customers
    try {
      const customers = await stripe.customers.search({
        query: `metadata['license_key']:'${license_key}'`,
        limit: 1,
      });

      if (!customers.data.length) {
        return new Response(JSON.stringify({ error: 'Invalid license key' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const customer = customers.data[0];
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'active',
        limit: 1,
      });

      if (!subscriptions.data.length) {
        return new Response(JSON.stringify({ error: 'License inactive or expired' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const subscription = subscriptions.data[0];
      const planName = subscription.items.data[0].plan.nickname || 'Standard';

      return new Response(
        JSON.stringify({
          valid: true,
          customer_email: customer.email,
          license_key,
          plan: planName,
          subscription_id: subscription.id,
          product_id: subscription.items.data[0].plan.product,
          status: subscription.status,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    } catch (stripeErr) {
      console.error('Stripe error:', stripeErr);
      return new Response(JSON.stringify({ error: 'License verification service unavailable' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (err: any) {
    console.error('❌ License check failed:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
