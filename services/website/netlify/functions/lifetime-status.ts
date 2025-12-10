import Stripe from 'stripe';
export default async () => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-09-30.clover' });
  // Count all PAID lifetime sessions
  let paid = 0;
  let starting_after: string | undefined;
  do {
    const page = await stripe.checkout.sessions.list({
      limit: 100,
      starting_after: starting_after,
    });
    paid += page.data.filter(
      (s: any) =>
        s.status === 'complete' && s.metadata?.plan === 'lifetime' && s.payment_status === 'paid',
    ).length;
    starting_after =
      page.has_more && page.data.length > 0 ? page.data[page.data.length - 1].id : undefined;
  } while (starting_after && paid < 500);

  const phase = paid < 200 ? '799' : paid < 500 ? '999' : 'soldout';
  const remainingInPhase = phase === '799' ? 200 - paid : phase === '999' ? 500 - paid : 0;
  return new Response(JSON.stringify({ sold: paid, phase, remainingInPhase }), {
    headers: { 'content-type': 'application/json' },
  });
};
