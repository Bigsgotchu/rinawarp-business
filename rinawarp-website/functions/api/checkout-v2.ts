import Stripe from "stripe";
import type { PagesFunction } from "https://deno.land/x/wrangler@v3/types.d.ts";

export const onRequestPost: PagesFunction = async ({ env, request }) => {
  if (!env.STRIPE_SECRET_KEY) {
    return new Response("Stripe not configured", { status: 500 });
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16"
  });

  const body = await request.json();
  const plan = body.plan || "pro-monthly";
  
  // Get price from RINA_PRICE_MAP or use default
  let priceId = plan;
  if (env.RINA_PRICE_MAP) {
    try {
      const priceMap = JSON.parse(env.RINA_PRICE_MAP);
      priceId = priceMap[plan] || priceId;
    } catch (e) {
      console.error("Failed to parse RINA_PRICE_MAP", e);
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    success_url: `${env.SITE_URL}/success.html?license={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.SITE_URL}/cancel.html`,
    metadata: {
      source: body.source || "unknown",
      plan: plan
    }
  });

  return new Response(
    JSON.stringify({ url: session.url }),
    {
      headers: { "Content-Type": "application/json" }
    }
  );
};
