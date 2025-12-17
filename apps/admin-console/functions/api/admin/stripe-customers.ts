export interface Env {
  ADMIN_PASSWORD: string;
  STRIPE_SECRET_KEY: string;
}

function jsonResponse(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type,x-admin-secret",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      ...(init.headers || {}),
    },
  });
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return jsonResponse({}, { status: 204 });
  }

  if (request.method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, { status: 405 });
  }

  const secret = request.headers.get("x-admin-secret");
  if (!secret || secret !== env.ADMIN_PASSWORD) {
    return jsonResponse({ error: "Unauthorized" }, { status: 401 });
  }

  const stripeKey = env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return jsonResponse({ error: "Stripe key not configured" }, { status: 500 });
  }

  const params = new URLSearchParams({
    limit: "50",
    expand: ["data.subscriptions"].join(","),
  });

  const res = await fetch(`https://api.stripe.com/v1/customers?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${stripeKey}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    return jsonResponse({ error: "Stripe API error", details: text }, { status: 500 });
  }

  const json = (await res.json()) as any;
  const customers = (json.data || []).map((c: any) => ({
    id: c.id,
    email: c.email,
    name: c.name,
    createdAt: new Date((c.created ?? c.created * 1000) * 1000).toISOString(),
    subscriptionStatus:
      c.subscriptions?.data?.[0]?.status ?? "none",
    products:
      c.subscriptions?.data?.flatMap((s: any) =>
        s.items?.data?.map((i: any) => i.price?.nickname || i.price?.id)
      ) ?? [],
  }));

  return jsonResponse(customers);
};