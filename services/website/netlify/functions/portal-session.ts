import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

export default async (request: Request, context: any) => {
  try {
    const { customerId } = await request.json();

    if (!customerId) {
      return new Response(JSON.stringify({ error: 'Missing customerId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.DOMAIN_URL}/account`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('❌ Portal session error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
