export interface Env {
  ANALYTICS_KV: KVNamespace;
  ADMIN_PASSWORD: string;
}

type Summary = {
  totalRevenue: number;
  totalSales: number;
  products: { id: string; name: string; revenue: number; sales: number }[];
};

type RecentSale = {
  id: string;
  email: string;
  productId: string;
  productName: string;
  amount: number;
  currency: string;
  timestamp: string;
};

type RequestBody =
  | { action: "summary" }
  | { action: "recent_sales" };

function jsonResponse(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type,x-admin-secret",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      ...(init.headers || {}),
    },
  });
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return jsonResponse({}, { status: 204 });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, { status: 405 });
  }

  const secret = request.headers.get("x-admin-secret");
  if (!secret || secret !== env.ADMIN_PASSWORD) {
    return jsonResponse({ error: "Unauthorized" }, { status: 401 });
  }

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.action === "summary") {
    const stored = await env.ANALYTICS_KV.get("summary", { type: "json" });
    const summary: Summary =
      (stored as Summary | null) || {
        totalRevenue: 0,
        totalSales: 0,
        products: [],
      };
    return jsonResponse(summary);
  }

  if (body.action === "recent_sales") {
    const stored = await env.ANALYTICS_KV.get("recent_sales", { type: "json" });
    const sales: RecentSale[] = (stored as RecentSale[] | null) || [];
    return jsonResponse(sales);
  }

  return jsonResponse({ error: "Unknown action" }, { status: 400 });
};