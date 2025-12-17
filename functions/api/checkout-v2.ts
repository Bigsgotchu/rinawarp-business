/// <reference types="@cloudflare/workers-types" />

// functions/api/checkout-v2.ts
import Stripe from 'stripe';

export interface Env {
  STRIPE_SECRET_KEY: string;
  RINA_PRICE_MAP: string; // JSON string mapping plan names to price IDs
  DOMAIN: string;
  STRIPE_WEBHOOK_SECRET?: string;
}

/* ==============================
   Utility Helpers
=============================== */

const ALLOWED_ORIGINS = [
  'https://rinawarptech.com',
  'https://www.rinawarptech.com',
];

const SUBSCRIPTION_PLANS = new Set([
  'starter-monthly',
  'pro-monthly',
  'enterprise-yearly',
]);

function safeUrl(url: string | undefined, fallback: string) {
  try {
    const parsed = new URL(url || fallback);
    return parsed.origin === new URL(fallback).origin ? parsed.toString() : fallback;
  } catch {
    return fallback;
  }
}

function json(body: unknown, status = 200, request?: Request): Response {
  const origin = request?.headers.get('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : 'https://rinawarptech.com';

  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'OPTIONS, POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

/* ==============================
   Main Entry
=============================== */

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  console.log("ENV KEYS:", Object.keys(env));

  let payload: {
    plan: string;
    successUrl?: string;
    cancelUrl?: string;
  };

  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Invalid JSON payload' }, 400, request);
  }

  // Validate required fields
  if (!payload.plan) {
    return json({ error: 'Plan is required' }, 400, request);
  }

  // Limit plan string size
  if (payload.plan.length > 64) {
    return json({ error: 'Invalid plan' }, 400, request);
  }

  // Parse price mapping from environment
  let priceMap: Record<string, string>;
  try {
    priceMap = JSON.parse(env.RINA_PRICE_MAP || '{}');
  } catch {
    return json({ error: 'Invalid RINA_PRICE_MAP environment variable' }, 500, request);
  }

  // Validate plan against price mapping
  const priceId = priceMap[payload.plan];
  if (!priceId) {
    console.error(`Invalid plan: ${payload.plan}. Available plans: ${Object.keys(priceMap).join(', ')}`);
    return json({ error: 'Invalid product' }, 400, request);
  }

  // Fail fast on missing Stripe key
  if (!env.STRIPE_SECRET_KEY) {
    return json({ error: 'Stripe is not configured' }, 500, request);
  }

  // Initialize Stripe
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });

  try {
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: SUBSCRIPTION_PLANS.has(payload.plan) ? 'subscription' : 'payment',
      success_url: safeUrl(payload.successUrl, `${env.DOMAIN}/success.html`),
      cancel_url: safeUrl(payload.cancelUrl, `${env.DOMAIN}/cancel.html`),
      metadata: {
        plan: payload.plan,
        source: 'cloudflare-pages',
      },
    });

    console.log(`💳 Checkout session created: ${session.id} for plan: ${payload.plan}`);
    return json({
      sessionId: session.id,
      url: session.url,
    }, 200, request);
  } catch (error) {
    console.error('Checkout session error:', error);
    return json({ error: 'Failed to create checkout session' }, 500, request);
  }
};

/* ==============================
   OPTIONS Handler (CORS)
=============================== */

export const onRequestOptions: PagesFunction<Env> = async ({ request }) => {
  const origin = request.headers.get('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : 'https://rinawarptech.com';

  return new Response('', {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'OPTIONS, POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};