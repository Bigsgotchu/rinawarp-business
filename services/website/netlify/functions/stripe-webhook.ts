import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

// Webhook secret from your Stripe Dashboard
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default async (request: Request, context: any) => {
  const sig = request.headers.get('stripe-signature');
  const body = await request.text();

  if (!sig) {
    return new Response(JSON.stringify({ error: 'Missing signature' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let stripeEvent: Stripe.Event;

  try {
    stripeEvent = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), {
      status: 400,
    });
  }

  try {
    switch (stripeEvent.type) {
      // Successful Checkout
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;

        const customerId = session.customer as string;
        const licenseKey = session.metadata?.license_key || 'UNKNOWN';

        console.log(`✅ Checkout complete for license ${licenseKey}`);

        // Update customer metadata
        if (customerId) {
          await stripe.customers.update(customerId, {
            metadata: {
              license_key: licenseKey,
              license_status: 'active',
              last_payment: new Date().toISOString(),
            },
          });
        }
        break;
      }

      // Subscription renewed or updated
      case 'invoice.payment_succeeded': {
        const invoice = stripeEvent.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        await stripe.customers.update(customerId, {
          metadata: { license_status: 'active' },
        });
        break;
      }

      // Subscription canceled
      case 'customer.subscription.deleted': {
        const subscription = stripeEvent.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await stripe.customers.update(customerId, {
          metadata: { license_status: 'inactive' },
        });
        break;
      }

      // Payment failed
      case 'invoice.payment_failed': {
        const invoice = stripeEvent.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        await stripe.customers.update(customerId, {
          metadata: { license_status: 'suspended' },
        });
        break;
      }

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('❌ Webhook processing failed:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
