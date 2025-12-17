import crypto from 'crypto';
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

    const { email, price_id, success_url, cancel_url } = await request.json();

    if (!email || !price_id) {
      return new Response(JSON.stringify({ error: 'Missing email or price_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate a unique license key
    const license_key = 'RW-' + crypto.randomBytes(8).toString('hex').toUpperCase();

    // Create or reuse customer
    const existingCustomers = await stripe.customers.list({ email, limit: 1 });
    const customer =
      existingCustomers.data.length > 0
        ? existingCustomers.data[0]
        : await stripe.customers.create({
            email,
            metadata: { license_key },
          });

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: customer.id,
      line_items: [{ price: price_id, quantity: 1 }],
      success_url: success_url || `${process.env.DOMAIN_URL}/success?license_key=${license_key}`,
      cancel_url: cancel_url || `${process.env.DOMAIN_URL}/cancel`,
      metadata: {
        license_key,
        customer_email: email,
      },
      subscription_data: {
        metadata: {
          license_key,
        },
      },
    });

    return new Response(
      JSON.stringify({
        url: session.url,
        license_key,
        session_id: session.id,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (err: any) {
    console.error('❌ Stripe Checkout error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
