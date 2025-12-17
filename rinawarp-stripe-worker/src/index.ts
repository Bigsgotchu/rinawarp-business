import Stripe from "stripe";

export interface Env {
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  RINA_PRICE_MAP: string;
  DOMAIN: string;
}

export default {
  async fetch(req: Request, env: Env) {
    console.log("RINA_PRICE_MAP:", env.RINA_PRICE_MAP);
    const stripe = new Stripe(env.STRIPE_SECRET_KEY);

    const url = new URL(req.url);

    // Checkout
    if (url.pathname === "/api/checkout-v2" && req.method === "POST") {
      const { plan, successUrl, cancelUrl } = await req.json();

      if (!plan) {
        return new Response("Plan is required", { status: 400 });
      }

      const prices = JSON.parse(env.RINA_PRICE_MAP);
      const priceId = prices[plan];

      if (!priceId) {
        return new Response("Invalid plan", { status: 400 });
      }

      // Determine payment mode based on plan type
      const isSubscription = plan.includes('monthly');
      
      const session = await stripe.checkout.sessions.create({
        mode: isSubscription ? "subscription" : "payment",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: successUrl || `${env.DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${env.DOMAIN}/cancel/`,
        metadata: {
          plan: plan,
        },
      });

      return Response.json({
        sessionId: session.id,
        plan,
        successUrl: session.success_url,
        cancelUrl: session.cancel_url
      });
    }

    // Webhooks
    if (url.pathname === "/api/webhooks/stripe") {
      const sig = req.headers.get("stripe-signature")!;
      const body = await req.text();

      try {
        const event = stripe.webhooks.constructEvent(
          body,
          sig,
          env.STRIPE_WEBHOOK_SECRET
        );

        if (event.type === "checkout.session.completed") {
          const session = event.data.object as Stripe.Checkout.Session;
          
          // TODO: license fulfillment
          console.log("Checkout session completed:", session.id);
          
          // Here you would typically:
          // 1. Find the customer/order in your database
          // 2. Generate a license key
          // 3. Send confirmation email
          // 4. Update order status
        }

        return Response.json({ received: true });
      } catch (err: unknown) {
        const error = err as { message?: string };
        console.error("Webhook signature verification failed:", error.message ?? "Unknown error");
        return new Response("Webhook Error", { status: 400 });
      }
    }

    // Proxy other requests to Pages
    return fetch(`https://rinawarptech.pages.dev${url.pathname}${url.search}`, {
      method: req.method,
      headers: req.headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
    });
  },
};