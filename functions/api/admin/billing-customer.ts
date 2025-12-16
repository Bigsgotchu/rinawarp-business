/// <reference types="@cloudflare/workers-types" />

// functions/api/admin/billing-customer.ts
interface Env {
  BILLING_KV: KVNamespace;
  ADMIN_API_SECRET: string;
}

const ADMIN_HEADER = 'x-admin-secret';

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json',
      'access-control-allow-origin': '*',
    },
  });
}

async function kvGetJson<T>(kv: KVNamespace, key: string): Promise<T | null> {
  const raw = await kv.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const adminSecret = request.headers.get(ADMIN_HEADER);
  if (!adminSecret || adminSecret !== env.ADMIN_API_SECRET) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const url = new URL(request.url);
  const email = url.searchParams.get('email');
  const stripeCustomerId = url.searchParams.get('customerId');

  let customerId = stripeCustomerId || null;

  if (!customerId && email) {
    const lower = email.trim().toLowerCase();
    const index = await kvGetJson<{ stripeCustomerId: string }>(
      env.BILLING_KV,
      `billing:index:customer_by_email:${lower}`,
    );
    customerId = index?.stripeCustomerId || null;
  }

  if (!customerId) {
    return json({ error: 'Customer not found' }, 404);
  }

  const customerKey = `billing:customer:${customerId}`;
  const customer = await kvGetJson<any>(env.BILLING_KV, customerKey);

  const purchasesIdxKey = `billing:index:purchases_by_customer:${customerId}`;
  const purchaseIds = (await kvGetJson<string[]>(env.BILLING_KV, purchasesIdxKey)) || [];
  const purchases: any[] = [];
  for (const id of purchaseIds) {
    const p = await kvGetJson<any>(env.BILLING_KV, `billing:purchase:${id}`);
    if (p) purchases.push(p);
  }

  const credits = (await kvGetJson<any>(env.BILLING_KV, `billing:credits:${customerId}`)) || null;

  // naive subscription search
  const subsList = await env.BILLING_KV.list({
    prefix: 'billing:subscription:',
  });
  const subscriptions: any[] = [];
  for (const key of subsList.keys) {
    const sub = await kvGetJson<any>(env.BILLING_KV, key.name);
    if (sub?.stripeCustomerId === customerId) subscriptions.push(sub);
  }

  return json({
    customerId,
    customer,
    purchases,
    subscriptions,
    credits,
  });
};
