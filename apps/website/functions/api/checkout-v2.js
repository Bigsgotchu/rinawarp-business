/**
 * Cloudflare Pages Function for Stripe Checkout Session Creation
 * Uses environment variables for Stripe price IDs
 */

import { Stripe } from 'stripe';

export const onRequestPost = async (context) => {
  try {
    // Get environment variables
    const stripeSecretKey = context.env.STRIPE_SECRET_KEY;
    const domain = context.env.DOMAIN || 'https://rinawarptech.com';
    const priceMapJson = context.env.RINA_PRICE_MAP;

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-11-17.clover',
    });

    // Parse request body
    const requestBody = await context.request.json();
    const { plan, product, successUrl, cancelUrl, email } = requestBody;
    let planId = plan || product;

    if (!planId) {
      return new Response(
        JSON.stringify({ error: 'Plan is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Map legacy product names to canonical plan IDs
    const productMap = {
      'terminal-pro': 'pro_monthly',
      'mvc-monthly': 'creator_monthly',
      'starter_monthly': 'starter-monthly',
      'creator_monthly': 'creator-monthly',
      'pro_monthly': 'pro-monthly',
      'founder_lifetime': 'founder-lifetime',
      'pioneer_lifetime': 'pioneer-lifetime',
      'final_lifetime': 'enterprise-yearly'
    };
    planId = productMap[planId] || planId;

    // Parse RINA_PRICE_MAP environment variable
    let priceMap = {};
    try {
      if (priceMapJson) {
        priceMap = JSON.parse(priceMapJson);
      } else {
        // Fallback price mapping if RINA_PRICE_MAP is not set
        console.warn('RINA_PRICE_MAP environment variable not set, using fallback mapping');
        priceMap = {
          'starter-monthly': 'price_1SVRVJGZrRdZy3W9q6u9L82y',
          'creator-monthly': 'price_1SVRVJGZrRdZy3W9tRX5tsaH',
          'pro-monthly': 'price_1SVRVKGZrRdZy3W9wFO3QPw6',
          'founder-lifetime': 'price_1SVRVLGZrRdZy3W976aXrw0g',
          'pioneer-lifetime': 'price_1SVRVLGZrRdZy3W9LoPVNyem',
          'enterprise-yearly': 'price_1SVRVMGZrRdZy3W9094r1F5B'
        };
      }
    } catch (parseError) {
      console.error('Failed to parse RINA_PRICE_MAP:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid price map configuration' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const priceId = priceMap[planId];

    if (!priceId) {
      return new Response(
        JSON.stringify({
          error: 'Invalid plan selected',
          availablePlans: Object.keys(priceMap),
          receivedPlan: planId
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Use provided URLs or fallback to defaults
    const finalSuccessUrl = successUrl || `${domain}/success.html`;
    const finalCancelUrl = cancelUrl || `${domain}/cancel.html`;

    // Determine checkout mode based on plan
    const isLifetimePlan = planId.includes('lifetime');
    const mode = isLifetimePlan ? 'payment' : 'subscription';

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: `${finalSuccessUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: finalCancelUrl,
      customer_email: email,
      metadata: {
        plan: planId,
        email: email || '',
        plan_type: isLifetimePlan ? 'lifetime' : 'subscription',
      },
    });

    console.log(`✅ Created ${mode} session for ${planId}`);

    // Return session URL for redirect
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
