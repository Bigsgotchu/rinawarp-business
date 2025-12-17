// functions/analytics.ts
export interface Env {
  ANALYTICS_PASSWORD: string;
  ANALYTICS_KV: KVNamespace;
}

type AnalyticsAction =
  | "record_sale"
  | "get_lifetime_count"
  | "event";

interface RecordSalePayload {
  action: "record_sale";
  product: string;
  amount: number;
  currency?: string;
  customerId?: string;
}

interface GetLifetimeCountPayload {
  action: "get_lifetime_count";
  product: string;
}

interface EventPayload {
  action: "event";
  type: string;
  meta?: Record<string, unknown>;
}

type AnalyticsPayload =
  | RecordSalePayload
  | GetLifetimeCountPayload
  | EventPayload;

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "https://rinawarptech.com",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type, authorization",
};

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: JSON_HEADERS });

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const origin = request.headers.get("origin") || "";
    if (!["https://rinawarptech.com", "https://www.rinawarptech.com"].includes(origin)) {
      return new Response(
        JSON.stringify({ error: "Invalid origin" }),
        { status: 403, headers: JSON_HEADERS },
      );
    }

    // Simple shared secret for analytics calls
    const authHeader = request.headers.get("authorization") || "";
    const expected = env.ANALYTICS_PASSWORD;
    if (!expected || authHeader !== `Bearer ${expected}`) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: JSON_HEADERS },
      );
    }

    const payload = (await request.json()) as AnalyticsPayload | null;
    if (!payload || typeof payload !== "object" || !("action" in payload)) {
      return new Response(
        JSON.stringify({ error: "Invalid payload" }),
        { status: 400, headers: JSON_HEADERS },
      );
    }

    switch (payload.action) {
      case "record_sale":
        return await handleRecordSale(env, payload);
      case "get_lifetime_count":
        return await handleGetLifetimeCount(env, payload);
      case "event":
        return await handleEvent(env, payload);
      default:
        return new Response(
          JSON.stringify({ error: "Unknown action" }),
          { status: 400, headers: JSON_HEADERS },
        );
    }
  } catch (err) {
    console.error("analytics error", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: JSON_HEADERS },
    );
  }
};

// --- Handlers ------------------------------------------------------------

async function handleRecordSale(env: Env, payload: RecordSalePayload) {
  if (!payload.product || typeof payload.amount !== "number") {
    return new Response(
      JSON.stringify({ error: "Missing product or amount" }),
      { status: 400, headers: JSON_HEADERS },
    );
  }

  const keyBase = `product:${payload.product}`;
  const totalRevenueKey = `${keyBase}:revenue`;
  const saleCountKey = `${keyBase}:count`;

  const [currentRevenueStr, currentCountStr] = await Promise.all([
    env.ANALYTICS_KV.get(totalRevenueKey),
    env.ANALYTICS_KV.get(saleCountKey),
  ]);

  const newRevenue =
    (parseFloat(currentRevenueStr || "0") || 0) + payload.amount;
  const newCount = (parseInt(currentCountStr || "0") || 0) + 1;

  await Promise.all([
    env.ANALYTICS_KV.put(totalRevenueKey, String(newRevenue)),
    env.ANALYTICS_KV.put(saleCountKey, String(newCount)),
  ]);

  // Optionally keep a small recent-sales list
  const historyKey = `${keyBase}:history`;
  const now = new Date().toISOString();
  const saleEntry = {
    time: now,
    amount: payload.amount,
    currency: payload.currency || "usd",
    customerId: payload.customerId || null,
  };

  try {
    const existing = (await env.ANALYTICS_KV.get(historyKey)) || "[]";
    const parsed = JSON.parse(existing) as unknown[];
    const updated = [saleEntry, ...parsed].slice(0, 100); // cap at 100
    await env.ANALYTICS_KV.put(historyKey, JSON.stringify(updated));
  } catch (e) {
    console.warn("Failed to write sale history", e);
  }

  return new Response(
    JSON.stringify({
      ok: true,
      product: payload.product,
      totalRevenue: newRevenue,
      totalSales: newCount,
    }),
    { status: 200, headers: JSON_HEADERS },
  );
}

async function handleGetLifetimeCount(env: Env, payload: GetLifetimeCountPayload) {
  if (!payload.product) {
    return new Response(
      JSON.stringify({ error: "Missing product" }),
      { status: 400, headers: JSON_HEADERS },
    );
  }

  const key = `product:${payload.product}:count`;
  const value = await env.ANALYTICS_KV.get(key);
  const count = parseInt(value || "0") || 0;

  return new Response(
    JSON.stringify({ product: payload.product, count }),
    { status: 200, headers: JSON_HEADERS },
  );
}

async function handleEvent(env: Env, payload: EventPayload) {
  if (!payload.type) {
    return new Response(
      JSON.stringify({ error: "Missing event type" }),
      { status: 400, headers: JSON_HEADERS },
    );
  }

  const key = `events:${payload.type}:${new Date().toISOString()}`;
  await env.ANALYTICS_KV.put(key, JSON.stringify(payload.meta || {}), {
    expirationTtl: 60 * 60 * 24 * 7, // keep for 7 days
  });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: JSON_HEADERS,
  });
}