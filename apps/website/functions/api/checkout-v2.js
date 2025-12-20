/**
 * Cloudflare Pages Function for Stripe Checkout Session Creation
 * Updated to use pricing.json as single source of truth
 */

import { Stripe } from 'stripe';

export const onRequestPost = async (context) => {
  try {
    // Get environment variables
    const stripeSecretKey = context.env.STRIPE_SECRET_KEY;
    const domain = context.env.DOMAIN || 'https://rinawarptech.com';

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-11-17.clover',
    });

    // Parse request body
    const requestBody = await context.request.json();
    const { plan, successUrl, cancelUrl, email } = requestBody;

    if (!plan) {
      return new Response(
        JSON.stringify({ error: 'Plan is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Load pricing.json as single source of truth
    let pricing;
    try {
      const pricingResponse = await fetch(`${domain}/pricing.json`);
      if (!pricingResponse.ok) {
        throw new Error('Failed to load pricing.json');
      }
      pricing = await pricingResponse.json();
    } catch (error) {
      console.error('Failed to load pricing.json:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to load pricing configuration' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Find the plan in pricing.json
    const planKey = plan.replace('-monthly', '').replace('-lifetime', '');
    const planData = pricing.plans[planKey];

    if (!planData) {
      return new Response(
        JSON.stringify({
          error: 'Invalid plan selected',
          availablePlans: Object.keys(pricing.plans),
          receivedPlan: plan
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!planData.stripe_price_id) {
      return new Response(
        JSON.stringify({
          error: 'Plan configuration incomplete',
          plan: planKey,
          message: 'Missing stripe_price_id in pricing.json'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const priceId = planData.stripe_price_id;

    // Use provided URLs or fallback to defaults
    const finalSuccessUrl = successUrl || `${domain}/success.html`;
    const finalCancelUrl = cancelUrl || `${domain}/cancel.html`;

    // Determine checkout mode based on plan interval
    const isLifetimePlan = planData.interval === 'one_time';
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
        plan: planKey,
        plan_display: planData.name,
        price: planData.price,
        interval: planData.interval,
        email: email || '',
        plan_type: isLifetimePlan ? 'lifetime' : 'subscription',
      },
    });

    console.log(`✅ Created ${mode} session for ${planKey} (${planData.name}) - $${planData.price}`);

    // Return session ID for Stripe.js redirect
    return new Response(
      JSON.stringify({ sessionId: session.id }),
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
