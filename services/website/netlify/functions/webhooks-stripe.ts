import Stripe from 'stripe';

export default async (req: Request) => {
  try {
    const sig = req.headers.get('stripe-signature');
    if (!sig) {
      return new Response('No signature', { status: 400 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);

    console.log(`Webhook received: ${event.type}`);

    // Handle events
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription') {
          console.log(`Subscription created: ${session.subscription}`);
          // TODO: Begin provisioning - call licensing API
        } else if (session.mode === 'payment') {
          console.log(`Payment completed: ${session.payment_intent}`);
          // Handle credits purchase
          const priceId = session.line_items?.data[0]?.price?.id;
          if (priceId === 'price_1SKyXEGZrRdZy3W97TW7Nuff') {
            console.log('100 credits purchased');
            // TODO: Add 100 credits to customer account
          } else if (priceId === 'price_1SKyXMGZrRdZy3W9GK5nD90a') {
            console.log('500 credits purchased');
            // TODO: Add 500 credits to customer account
          }
        }
        break;
      case 'invoice.paid':
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Invoice paid: ${invoice.id}`);
        // TODO: Issue/refresh license token - call licensing API
        break;
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription updated: ${subscription.id}`);
        // TODO: Adjust entitlements - call licensing API
        break;
      case 'customer.subscription.deleted':
        const deletedSub = event.data.object as Stripe.Subscription;
        console.log(`Subscription deleted: ${deletedSub.id}`);
        // TODO: Revoke license or set to grace - call licensing API
        break;
      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        console.log(`Invoice payment failed: ${failedInvoice.id}`);
        // TODO: Start grace period - call licensing API
        break;
      default:
        console.log(`Unhandled event: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (e: any) {
    console.error(`Webhook error: ${e.message}`);
    return new Response(JSON.stringify({ error: e.message }), { status: 400 });
  }
};
