/**
 * Cloudflare Pages Function for Stripe Webhook Handling
 * Handles POST requests from Stripe webhooks
 */

import { Stripe } from 'stripe';
import { generateLicenseData } from '../../_license-generator.js';

export const onRequestPost = async (context) => {
  try {
    const stripeSecretKey = context.env.STRIPE_SECRET_KEY;
    const stripeWebhookSecret = context.env.STRIPE_WEBHOOK_SECRET;
    const db = context.env.DB;

    if (!stripeWebhookSecret) {
      return new Response(
        'Stripe webhook secret not configured',
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-11-17.clover',
    });

    // Get raw body for signature verification
    const rawBody = await context.request.text();
    const signature = context.request.headers.get('stripe-signature');

    if (!signature) {
      return new Response(
        'Stripe signature not provided',
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        stripeWebhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response(
        'Webhook signature verification failed',
        { status: 401 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Checkout session completed:', session.id);

        // Generate and store license
        const customerEmail = session.customer_email;
        const plan = session.metadata?.plan || 'professional';

        if (customerEmail) {
          const licenseData = generateLicenseData(
            session.customer,
            customerEmail,
            plan,
            session.id
          );

          // Store in D1 database
          try {
            await db.prepare(
              'INSERT INTO licenses (id, customer_id, email, license_key, plan, status, created_at, expires_at, stripe_session_id, features) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
            )
              .bind(
                licenseData.id,
                licenseData.customer_id,
                licenseData.email,
                licenseData.license_key,
                licenseData.plan,
                licenseData.status,
                licenseData.created_at,
                licenseData.expires_at,
                licenseData.stripe_session_id,
                JSON.stringify(licenseData.features)
              )
              .run();

            console.log('License stored successfully:', licenseData.id);
          } catch (dbError) {
            console.error('Failed to store license:', dbError);
          }
        }

        return new Response(
          JSON.stringify({ received: true }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

      case 'invoice.paid':
        const invoice = event.data.object;
        console.log('Invoice paid:', invoice.id);

        return new Response(
          JSON.stringify({ received: true }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        console.log('Subscription cancelled:', subscription.id);

        // Mark license as inactive
        try {
          await db.prepare(
            'UPDATE licenses SET status = ? WHERE customer_id = ?'
          )
            .bind('inactive', subscription.customer)
            .run();

          console.log('License marked as inactive:', subscription.customer);
        } catch (dbError) {
          console.error('Failed to update license status:', dbError);
        }

        return new Response(
          JSON.stringify({ received: true }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

      default:
        console.log(`Unhandled event type: ${event.type}`);
        return new Response(
          JSON.stringify({ received: true }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Error processing webhook:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to process webhook',
        details: error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};