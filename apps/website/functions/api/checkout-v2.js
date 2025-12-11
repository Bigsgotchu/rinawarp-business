/**
 * Cloudflare Pages Function for Stripe Checkout Session Creation
 * Handles POST requests to create Stripe Checkout Sessions
 */

import { Stripe } from 'stripe';

export const onRequestPost = async (context) => {
  try {
    // Get environment variables
    const stripeSecretKey = context.env.STRIPE_SECRET_KEY;
    const stripeWebhookSecret = context.env.STRIPE_WEBHOOK_SECRET;
    const domain = context.env.DOMAIN || 'https://rinawarptech.com';

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-11-17.clover',
    });

    // Parse request body
    const { plan, email } = await context.request.json();

    if (!plan || !email) {
      return new Response(
        JSON.stringify({ error: 'Plan and email are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Map plan names to Stripe price IDs
    const priceMap = {
      student: 'price_1SVRVMGZrRdZy3W9094r1F5B',
      professional: 'price_1SKxFDGZrRdZy3W9eqTQCKXd',
      enterprise: 'price_1SKxF5GZrRdZy3W9Ck4Z8AJ2',
    };

    const priceId = priceMap[plan];

    if (!priceId) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan selected' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${domain}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domain}/cancel`,
      customer_email: email,
      metadata: {
        plan: plan,
        email: email,
      },
    });

    // Return session URL
    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to create checkout session',
        details: error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};