/// <reference types="@cloudflare/workers-types" />

// functions/checkout.ts
import Stripe from 'stripe';

export interface Env {
  STRIPE_SECRET_KEY: string;
  PRICING_KV: KVNamespace; // ← NEW: Pricing controlled from Admin Console
  ADMIN_API_SECRET: string;

  // Allowed origins
  CHECKOUT_ALLOWED_ORIGINS?: string;
}

const stripeVersion = '2023-10-16';

type Payload = {
  product: string; // "terminal" | "amvc" | "bundle"
  planId: string; // matches PricingConfig.entries.id
  quantity?: number; // optional, for teams
  email?: string; // metadata
};

interface PriceEntry {
  id: string;
  stripePriceId: string;
  name: string;
  description?: string;
  type: 'subscription' | 'one_time';
  amount: number;
  currency: 'usd' | 'eur';
  active: boolean;
  maxSeats?: number;
}

interface PricingConfig {
  version: number;
  updatedAt: string;
  updatedBy: string;
  products: {
    terminal: PriceEntry[];
    amvc: PriceEntry[];
    bundles: PriceEntry[];
  };
}

/* ==============================
   Utility Helpers
================================ */

function json(body: any, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

function validateOrigin(request: Request, allowed: string[]): boolean {
  const origin = request.headers.get('origin') ?? '';
  return allowed.includes(origin);
}

/* ==============================
   Main Entry
================================ */

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // CORS preflight handled globally
  const originHeader = request.headers.get('origin') || '';
  const allowedOrigins = (env.CHECKOUT_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

  if (!validateOrigin(request, allowedOrigins)) {
    return json({ error: 'Unauthorized origin', origin: originHeader }, 403);
  }

  let payload: Payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Invalid JSON payload' }, 400);
  }

  // Validate required fields
  if (!payload.product || !payload.planId) {
    return json({ error: 'product and planId are required' }, 400);
  }

  /* ==============================
     Load Pricing Config from KV
  ================================= */
  const rawPricing = await env.PRICING_KV.get('pricing_config_v1');
  if (!rawPricing) {
    return json({ error: 'Pricing configuration missing in KV' }, 500);
  }

  const pricing = JSON.parse(rawPricing) as PricingConfig;

  const group =
    payload.product === 'terminal'
      ? pricing.products.terminal
      : payload.product === 'amvc'
        ? pricing.products.amvc
        : pricing.products.bundles;

  if (!group) {
    return json({ error: `Unknown product: ${payload.product}` }, 400);
  }

  const plan = group.find((p) => p.id === payload.planId);

  if (!plan) {
    return json(
      {
        error: 'Unknown planId',
        product: payload.product,
        planId: payload.planId,
        availablePlans: group.map((p) => p.id),
      },
      400,
    );
  }

  if (!plan.active) {
    return json({ error: 'This pricing plan is inactive', planId: plan.id }, 400);
  }

  if (!plan.stripePriceId) {
    return json(
      {
        error: 'Pricing plan has no Stripe price ID configured',
        planId: plan.id,
      },
      500,
    );
  }

  /* ==============================
     Initialize Stripe
  ================================= */
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: stripeVersion,
  });

  const quantity = payload.quantity ?? 1;

  /* ==============================
     Build Stripe Checkout Session
  ================================= */

  try {
    const session = await stripe.checkout.sessions.create({
      mode: plan.type === 'subscription' ? 'subscription' : 'payment',

      line_items: [
        {
          price: plan.stripePriceId,
          quantity,
        },
      ],

      success_url: 'https://rinawarptech.com/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://rinawarptech.com/cancel',

      metadata: {
        product: payload.product,
        planId: payload.planId,
        pricingVersion: pricing.version,
        updatedBy: pricing.updatedBy,
      },
    });

    return json({ ok: true, checkout_url: session.url });
  } catch (error: any) {
    return json(
      {
        error: 'Stripe checkout creation failed',
        message: error.message,
        plan: plan.id,
        stripePriceId: plan.stripePriceId,
      },
      500,
    );
  }
};

/* ==============================
   OPTIONS Handler (CORS)
================================ */

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response('', {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
