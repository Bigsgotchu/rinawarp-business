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

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "RinaWarp Pro"
          },
          unit_amount: 1999
        },
        quantity: 1
      }
    ],
    success_url: `${env.SITE_URL}/success.html?license={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.SITE_URL}/cancel.html`,
    metadata: {
      source: body.source || "unknown"
    }
  });

  return new Response(
    JSON.stringify({ url: session.url }),
    {
      headers: { "Content-Type": "application/json" }
    }
  );
};
