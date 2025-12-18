import Stripe from "stripe";

export interface Env {
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  RINA_PRICE_MAP: string;
  DOMAIN: string;
}

export default {
  async fetch(req: Request, env: Env) {
    console.log("🔍 Request:", req.method, req.url);
    console.log("🔑 Environment check:");
    console.log("- STRIPE_SECRET_KEY:", env.STRIPE_SECRET_KEY ? "✅ Set" : "❌ Missing");
    console.log("- RINA_PRICE_MAP:", env.RINA_PRICE_MAP ? "✅ Set" : "❌ Missing");
    console.log("- DOMAIN:", env.DOMAIN);
    
    const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    const url = new URL(req.url);

    // Health check
    if (url.pathname === "/health" || url.pathname === "/api/health") {
      return Response.json({ 
        status: "ok", 
        timestamp: new Date().toISOString(),
        env: {
          stripe_key_set: !!env.STRIPE_SECRET_KEY,
          price_map_set: !!env.RINA_PRICE_MAP,
          domain: env.DOMAIN
        }
      });
    }

    // Checkout
    if (url.pathname === "/api/checkout-v2" && req.method === "POST") {
      try {
        const { plan, successUrl, cancelUrl } = await req.json();
        console.log("🛒 Checkout request:", { plan, successUrl, cancelUrl });

        if (!plan) {
          console.log("❌ No plan provided");
          return new Response(JSON.stringify({ error: "Plan is required" }), { 
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }

        const prices = JSON.parse(env.RINA_PRICE_MAP);
        console.log("💰 Available prices:", Object.keys(prices));
        
        const priceId = prices[plan];
        if (!priceId) {
          console.log("❌ Invalid plan:", plan);
          return new Response(JSON.stringify({ 
            error: "Invalid plan", 
            available_plans: Object.keys(prices),
            requested_plan: plan 
          }), { 
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }

        console.log("✅ Found price ID:", priceId);

        // Determine payment mode based on plan type
        const isSubscription = plan.includes('monthly');
        console.log("📋 Payment mode:", isSubscription ? "subscription" : "payment");
        
        const session = await stripe.checkout.sessions.create({
          mode: isSubscription ? "subscription" : "payment",
          line_items: [{ price: priceId, quantity: 1 }],
          success_url: successUrl || `${env.DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: cancelUrl || `${env.DOMAIN}/cancel/`,
          metadata: {
            plan: plan,
          },
        });

        console.log("✅ Session created:", session.id);

        return Response.json({
          sessionId: session.id,
          plan,
          successUrl: session.success_url,
          cancelUrl: session.cancel_url
        });

      } catch (error) {
        console.error("💥 Checkout error:", error);
        return new Response(JSON.stringify({ 
          error: "Failed to create checkout session",
          details: error instanceof Error ? error.message : "Unknown error"
        }), { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // Webhooks
    if (url.pathname === "/api/webhooks/stripe") {
      console.log("🔗 Webhook received");
      const sig = req.headers.get("stripe-signature");
      if (!sig) {
        return new Response("Missing signature", { status: 400 });
      }

      const body = await req.text();

      try {
        const event = stripe.webhooks.constructEvent(
          body,
          sig,
          env.STRIPE_WEBHOOK_SECRET
        );

        console.log("✅ Webhook event:", event.type);

        if (event.type === "checkout.session.completed") {
          const session = event.data.object as Stripe.Checkout.Session;
          console.log("💳 Checkout completed:", session.id);
          
          // TODO: license fulfillment
          console.log("Checkout session completed:", session.id);
        }

        return Response.json({ received: true });
      } catch (err: unknown) {
        const error = err as { message?: string };
        console.error("❌ Webhook error:", error.message ?? "Unknown error");
        return new Response("Webhook Error", { status: 400 });
      }
    }

    // Proxy other requests to Pages
    console.log("🔄 Proxying to Pages:", url.pathname);
    return fetch(`https://rinawarptech.pages.dev${url.pathname}${url.search}`, {
      method: req.method,
      headers: req.headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
    });
  },
};