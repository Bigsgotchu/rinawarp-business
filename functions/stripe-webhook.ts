/// <reference types="@cloudflare/workers-types" />

// functions/stripe-webhook.ts
import type { Stripe as StripeType } from 'stripe';
import Stripe from 'stripe';

interface Env {
  STRIPE_SECRET_KEY: string;
  BILLING_KV: KVNamespace;
  ANALYTICS_KV: KVNamespace;
  STRIPE_WEBHOOK_SECRET?: string; // optional if you haven't wired it yet
}

type BillingCustomer = {
  stripeCustomerId: string;
  email: string | null;
  name?: string | null;
  createdAt: string;
  updatedAt: string;
  ltvCents: number;
  lastSeenAt: string;
  flags: {
    hasTerminal?: boolean;
    hasAmvc?: boolean;
    hasBundle?: boolean;
  };
};

type BillingPurchaseKind =
  | 'one_time'
  | 'subscription_first_invoice'
  | 'subscription_renewal'
  | 'refund';

type BillingPurchase = {
  id: string;
  stripeCustomerId: string;
  email: string | null;
  amountTotalCents: number;
  currency: string;
  productType: 'terminal' | 'ai_mvc' | 'bundle' | 'other';
  productId: string | null;
  priceId: string | null;
  quantity: number;
  kind: BillingPurchaseKind;
  stripeInvoiceId?: string | null;
  stripePaymentIntentId?: string | null;
  createdAt: string;
  metadata?: Record<string, any>;
};

type BillingSubscription = {
  id: string;
  stripeCustomerId: string;
  email: string | null;
  status: string;
  productId: string | null;
  priceId: string | null;
  quantity: number;
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: number | null;
  startedAt: number | null;
  latestInvoiceId?: string | null;
  latestPaymentIntentId?: string | null;
};

async function kvGetJson<T>(
  kv: KVNamespace,
  key: string
): Promise<T | null> {
  const raw = await kv.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function kvPutJson(
  kv: KVNamespace,
  key: string,
  value: unknown
): Promise<void> {
  await kv.put(key, JSON.stringify(value));
}

function nowIso() {
  return new Date().toISOString();
}

function lowerEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  return email.trim().toLowerCase();
}

async function upsertCustomer(
  env: Env,
  stripeCustomerId: string,
  email: string | null,
  name?: string | null,
  amountDeltaCents = 0,
  flagsDelta?: Partial<BillingCustomer['flags']>
): Promise<BillingCustomer> {
  const key = `billing:customer:${stripeCustomerId}`;
  const existing =
    (await kvGetJson<BillingCustomer>(env.BILLING_KV, key)) || null;

  const now = nowIso();
  const base: BillingCustomer =
    existing || {
      stripeCustomerId,
      email,
      name,
      createdAt: now,
      updatedAt: now,
      ltvCents: 0,
      lastSeenAt: now,
      flags: {}
    };

  const updated: BillingCustomer = {
    ...base,
    email: email ?? base.email,
    name: name ?? base.name,
    ltvCents: base.ltvCents + amountDeltaCents,
    updatedAt: now,
    lastSeenAt: now,
    flags: {
      ...base.flags,
      ...(flagsDelta || {})
    }
  };

  await kvPutJson(env.BILLING_KV, key, updated);

  const emailKeyEmail = lowerEmail(updated.email || '');
  if (emailKeyEmail) {
    await kvPutJson(
      env.BILLING_KV,
      `billing:index:customer_by_email:${emailKeyEmail}`,
      { stripeCustomerId }
    );
  }

  return updated;
}

async function recordPurchase(
  env: Env,
  purchase: BillingPurchase
): Promise<void> {
  const purchaseKey = `billing:purchase:${purchase.id}`;
  await kvPutJson(env.BILLING_KV, purchaseKey, purchase);

  const listKey = `billing:index:purchases_by_customer:${purchase.stripeCustomerId}`;
  const existingList =
    (await kvGetJson<string[]>(env.BILLING_KV, listKey)) || [];
  if (!existingList.includes(purchase.id)) {
    existingList.unshift(purchase.id);
    if (existingList.length > 200) existingList.length = 200;
    await kvPutJson(env.BILLING_KV, listKey, existingList);
  }
}

async function upsertSubscription(
  env: Env,
  sub: BillingSubscription
): Promise<void> {
  const key = `billing:subscription:${sub.id}`;
  await kvPutJson(env.BILLING_KV, key, sub);

  // Keep a simple list of active subscriptions
  const activeKey = `billing:index:subscriptions_active`;
  const activeList =
    (await kvGetJson<string[]>(env.BILLING_KV, activeKey)) || [];

  const idx = activeList.indexOf(sub.id);
  if (sub.status === 'active' || sub.status === 'trialing') {
    if (idx === -1) activeList.push(sub.id);
  } else {
    if (idx !== -1) activeList.splice(idx, 1);
  }

  await kvPutJson(env.BILLING_KV, activeKey, activeList);
}

function productFlagsForMetadata(meta: Record<string, any> | null | undefined) {
  const flags: BillingCustomer['flags'] = {};
  const type = (meta?.product_type || meta?.productType || '').toString();

  if (type.includes('terminal')) flags.hasTerminal = true;
  if (type.includes('amvc') || type.includes('ai_mvc')) flags.hasAmvc = true;
  if (type.includes('bundle')) flags.hasBundle = true;

  return flags;
}

function detectProductType(
  meta: Record<string, any> | null | undefined
): BillingPurchase['productType'] {
  const type =
    (meta?.product_type ||
      meta?.productType ||
      meta?.plan ||
      meta?.product ||
      '') + '';
  const lower = type.toLowerCase();

  if (lower.includes('terminal')) return 'terminal';
  if (lower.includes('amvc') || lower.includes('music')) return 'ai_mvc';
  if (lower.includes('bundle')) return 'bundle';
  return 'other';
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  let stripe: StripeType;
  try {
    stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16' as any
    });
  } catch (err) {
    console.error('Stripe init error', err);
    return new Response('Stripe misconfigured', { status: 500 });
  }

  // NOTE: For simplicity we trust JSON here.
  // If you want full signature verification:
  // - Use request.clone().text() and stripe.webhooks.constructEvent
  // - Verify using env.STRIPE_WEBHOOK_SECRET
  let event: StripeType.Event;
  try {
    const json = (await request.json()) as StripeType.Event;
    event = json;
  } catch (err) {
    console.error('Invalid JSON body', err);
    return new Response('Bad Request', { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(env, event as any, stripe);
        break;
      case 'invoice.paid':
        await handleInvoicePaid(env, event as any, stripe);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionEvent(env, event as any, stripe);
        break;
      case 'charge.refunded':
        await handleChargeRefunded(env, event as any, stripe);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(env, event as any, stripe);
        break;
      default:
        // ignore events we don't care about (for now)
        break;
    }

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('Webhook handler error', err);
    return new Response('Internal Error', { status: 500 });
  }
};

async function handleCheckoutSessionCompleted(
  env: Env,
  event: StripeType.Event,
  stripe: StripeType
) {
  const session = event.data.object as StripeType.Checkout.Session;

  const customerId =
    (session.customer as string) ||
    (typeof session.customer === 'object'
      ? (session.customer as any).id
      : null);

  if (!customerId) return;

  const email =
    session.customer_details?.email || session.customer_email || null;
  const name = session.customer_details?.name || null;

  const amountTotal = session.amount_total ?? 0;
  const currency = session.currency || 'usd';
  const meta = session.metadata || {};

  const productType = detectProductType(meta);
  const flags = productFlagsForMetadata(meta);

  await upsertCustomer(
    env,
    customerId,
    email,
    name,
    amountTotal,
    flags
  );

  const purchase: BillingPurchase = {
    id: session.payment_intent?.toString() ||
      session.id ||
      `cs_${event.id}`,
    stripeCustomerId: customerId,
    email,
    amountTotalCents: amountTotal,
    currency,
    productType,
    productId: meta.product_id || null,
    priceId: meta.price_id || null,
    quantity: Number(meta.quantity || 1),
    kind: 'one_time',
    stripeInvoiceId: null,
    stripePaymentIntentId: session.payment_intent?.toString(),
    createdAt: nowIso(),
    metadata: meta
  };

  await recordPurchase(env, purchase);
}

async function handleInvoicePaid(
  env: Env,
  event: StripeType.Event,
  stripe: StripeType
) {
  const invoice = event.data.object as StripeType.Invoice;

  const customerId = invoice.customer as string | null;
  if (!customerId) return;

  const amountTotal = invoice.amount_paid ?? invoice.amount_due ?? 0;
  const currency = invoice.currency || 'usd';
  const email =
    (invoice.customer_email as string | null) ||
    (invoice.customer as any)?.email ||
    null;

  let kind: BillingPurchaseKind = 'subscription_renewal';
  if (invoice.billing_reason === 'subscription_create') {
    kind = 'subscription_first_invoice';
  }

  const lines = (invoice.lines as any)?.data ?? [];
  const firstLine = lines[0];
  const price = (firstLine as any)?.price;
  const product = (price as any)?.product as string | null;

  const meta = (invoice.metadata || {}) as Record<string, any>;
  const productType = detectProductType(meta);

  const purchase: BillingPurchase = {
    id: invoice.id,
    stripeCustomerId: customerId,
    email,
    amountTotalCents: amountTotal,
    currency,
    productType,
    productId: product,
    priceId: price?.id || null,
    quantity: firstLine?.quantity ?? 1,
    kind,
    stripeInvoiceId: invoice.id,
    stripePaymentIntentId:
      ((invoice as any).payment_intent as string | null) || null,
    createdAt: nowIso(),
    metadata: meta
  };

  const flags = productFlagsForMetadata(meta);

  await upsertCustomer(
    env,
    customerId,
    email,
    undefined,
    amountTotal,
    flags
  );
  await recordPurchase(env, purchase);
}

async function handleSubscriptionEvent(
  env: Env,
  event: StripeType.Event,
  stripe: StripeType
) {
  const sub = event.data.object as StripeType.Subscription;

  const customerId = sub.customer as string | null;
  if (!customerId) return;

  const email =
    (sub.metadata?.customer_email as string | undefined) || null;

  const items = sub.items.data;
  const firstItem = items[0];
  const price = firstItem?.price;
  const product = price?.product as string | null;

  const billingSub: BillingSubscription = {
    id: sub.id,
    stripeCustomerId: customerId,
    email,
    status: sub.status,
    productId: product,
    priceId: price?.id || null,
    quantity: firstItem?.quantity ?? 1,
    currentPeriodEnd: (sub as any).current_period_end || null,
    cancelAtPeriodEnd: sub.cancel_at_period_end || false,
    canceledAt: sub.canceled_at || null,
    startedAt: sub.start_date || null,
    latestInvoiceId: sub.latest_invoice as string | null,
    latestPaymentIntentId: null
  };

  await upsertSubscription(env, billingSub);
  await upsertCustomer(env, customerId, email, undefined, 0, {
    hasTerminal: detectProductType(sub.metadata) === 'terminal',
    hasAmvc: detectProductType(sub.metadata) === 'ai_mvc',
    hasBundle: detectProductType(sub.metadata) === 'bundle'
  });
}

async function handleChargeRefunded(
  env: Env,
  event: StripeType.Event,
  stripe: StripeType
) {
  const charge = event.data.object as StripeType.Charge;
  const customerId = charge.customer as string | null;
  if (!customerId) return;

  const amount = charge.amount_refunded ?? 0;
  const currency = charge.currency || 'usd';
  const email =
    (charge.billing_details?.email as string | null) || null;

  const meta = (charge.metadata || {}) as Record<string, any>;
  const productType = detectProductType(meta);

  const purchase: BillingPurchase = {
    id: `refund_${charge.id}`,
    stripeCustomerId: customerId,
    email,
    amountTotalCents: -amount,
    currency,
    productType,
    productId: meta.product_id || null,
    priceId: meta.price_id || null,
    quantity: -1,
    kind: 'refund',
    stripeInvoiceId: (charge as any).invoice as string | null,
    stripePaymentIntentId: charge.payment_intent as string | null,
    createdAt: nowIso(),
    metadata: meta
  };

  await upsertCustomer(env, customerId, email, undefined, -amount);
  await recordPurchase(env, purchase);
}

async function handleInvoicePaymentFailed(
  env: Env,
  event: StripeType.Event,
  stripe: StripeType
) {
  const invoice = event.data.object as StripeType.Invoice;
  const customerId = invoice.customer as string | null;
  if (!customerId) return;

  const email = (invoice.customer_email as string | null) || null;

  // For now: we just touch lastSeen & flags; no LTV change
  await upsertCustomer(env, customerId, email, undefined, 0, {});
}