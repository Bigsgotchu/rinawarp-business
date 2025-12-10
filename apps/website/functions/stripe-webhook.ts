import { stripe } from '../utils/stripe';
import Stripe from 'stripe';

export interface Env {
  STRIPE_WEBHOOK_SECRET: string;
  BILLING_KV: any; // KVNamespace type
  STRIPE_SECRET_KEY: string;
}

export async function onRequest(context: any) {
  const { request, env } = context;

  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    // Get the raw body and signature header
    const rawBody = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return new Response('Missing Stripe signature header', { status: 400 });
    }

    // Verify the webhook signature
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        env.STRIPE_WEBHOOK_SECRET || 'whsec_8dd90aa311dce345172987b5c121d74d633985cb55c96d00f5d490037bae8353'
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response('Invalid signature', { status: 401 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session, env);
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent, env);
        break;

      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(failedPaymentIntent, env);
        break;

      case 'charge.succeeded':
        const charge = event.data.object as Stripe.Charge;
        await handleChargeSucceeded(charge, env);
        break;

      case 'invoice.paid':
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice, env);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(failedInvoice, env);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return success response
    return new Response('Webhook received', { status: 200 });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, env: Env) {
  console.log('Checkout session completed:', session.id);

  // Store billing information in KV
  const billingData = {
    sessionId: session.id,
    customerId: session.customer,
    amountTotal: session.amount_total,
    currency: session.currency,
    paymentStatus: session.payment_status,
    metadata: session.metadata,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    await env.BILLING_KV.put(`session_${session.id}`, JSON.stringify(billingData));
    console.log('Billing data stored in KV for session:', session.id);
  } catch (error) {
    console.error('Failed to store billing data in KV:', error);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent, env: Env) {
  console.log('Payment intent succeeded:', paymentIntent.id);

  // Store payment information in KV
  const paymentData = {
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: paymentIntent.status,
    customerId: paymentIntent.customer,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    await env.BILLING_KV.put(`payment_${paymentIntent.id}`, JSON.stringify(paymentData));
    console.log('Payment data stored in KV for payment intent:', paymentIntent.id);
  } catch (error) {
    console.error('Failed to store payment data in KV:', error);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent, env: Env) {
  console.log('Payment failed:', paymentIntent.id);

  // Store failed payment information
  const failedPaymentData = {
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: paymentIntent.status,
    failureReason: paymentIntent.last_payment_error?.message,
    customerId: paymentIntent.customer,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    await env.BILLING_KV.put(`failed_payment_${paymentIntent.id}`, JSON.stringify(failedPaymentData));
    console.log('Failed payment data stored in KV for payment intent:', paymentIntent.id);
  } catch (error) {
    console.error('Failed to store failed payment data in KV:', error);
  }
}

async function handleChargeSucceeded(charge: Stripe.Charge, env: Env) {
  console.log('Charge succeeded:', charge.id);

  // Store charge information
  const chargeData = {
    chargeId: charge.id,
    amount: charge.amount,
    currency: charge.currency,
    status: charge.status,
    customerId: charge.customer,
    paymentIntentId: charge.payment_intent,
    receiptUrl: charge.receipt_url,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    await env.BILLING_KV.put(`charge_${charge.id}`, JSON.stringify(chargeData));
    console.log('Charge data stored in KV for charge:', charge.id);
  } catch (error) {
    console.error('Failed to store charge data in KV:', error);
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice, env: Env) {
  console.log('Invoice paid:', invoice.id);

  // Store invoice information
  const invoiceData = {
    invoiceId: invoice.id,
    amountPaid: invoice.amount_paid,
    currency: invoice.currency,
    status: invoice.status,
    customerId: invoice.customer,
    subscriptionId: (invoice as any).subscription,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    await env.BILLING_KV.put(`invoice_${invoice.id}`, JSON.stringify(invoiceData));
    console.log('Invoice data stored in KV for invoice:', invoice.id);
  } catch (error) {
    console.error('Failed to store invoice data in KV:', error);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, env: Env) {
  console.log('Invoice payment failed:', invoice.id);

  // Store failed invoice information
  const failedInvoiceData = {
    invoiceId: invoice.id,
    amountDue: invoice.amount_due,
    currency: invoice.currency,
    status: invoice.status,
    customerId: invoice.customer,
    subscriptionId: (invoice as any).subscription,
    failureReason: 'Payment failed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    await env.BILLING_KV.put(`failed_invoice_${invoice.id}`, JSON.stringify(failedInvoiceData));
    console.log('Failed invoice data stored in KV for invoice:', invoice.id);
  } catch (error) {
    console.error('Failed to store failed invoice data in KV:', error);
  }
}