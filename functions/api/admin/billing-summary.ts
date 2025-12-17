/// <reference types="@cloudflare/workers-types" />

// functions/api/admin/billing-summary.ts
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
      'access-control-allow-origin': '*'
    }
  });
}

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

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const adminSecret = request.headers.get(ADMIN_HEADER);
  if (!adminSecret || adminSecret !== env.ADMIN_API_SECRET) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const url = new URL(request.url);
  const cursor = url.searchParams.get('cursor') || '';
  const limit = Number(url.searchParams.get('limit') || '20');

  // naive scan: in production you might tighten this with explicit indexes
  const list = await env.BILLING_KV.list({
    prefix: 'billing:purchase:',
    cursor,
    limit
  });

  let totalRevenue = 0;
  const purchases: any[] = [];

  for (const key of list.keys) {
    const doc = await kvGetJson<any>(env.BILLING_KV, key.name);
    if (!doc) continue;
    purchases.push(doc);
    totalRevenue += doc.amountTotalCents || 0;
  }

  // Fetch basic subscription count
  const activeSubs =
    (await kvGetJson<string[]>(
      env.BILLING_KV,
      'billing:index:subscriptions_active'
    )) || [];

  return json({
    summary: {
      recentRevenueCents: totalRevenue,
      recentPurchasesCount: purchases.length,
      activeSubscriptions: activeSubs.length
    },
    purchases,
    listComplete: list.list_complete
  });
};