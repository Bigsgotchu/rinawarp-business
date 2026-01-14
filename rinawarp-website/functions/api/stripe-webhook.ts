import Stripe from "stripe";
import type { PagesFunction } from "https://deno.land/x/wrangler@v3/types.d.ts";
import { generateLicense } from "../lib/license";
import { LicenseDB } from "../lib/db";

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET || !env.DB) {
    return new Response("Stripe not configured", { status: 500 });
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
  });

  const sig = request.headers.get("stripe-signature");
  const body = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return new Response("Invalid signature", { status: 400 });
  }

  const db = new LicenseDB(env.DB);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const licenseId = generateLicense(
      session.customer_details?.email || "unknown"
    );

    // Determine plan based on price
    let plan = "pro";
    const priceId = session.display_items?.[0]?.price?.id;
    
    if (priceId?.includes("team")) {
      plan = "team";
    } else if (priceId?.includes("enterprise")) {
      plan = "enterprise";
    }

    // Determine seats (Team plan has 5 seats, others have 1)
    const seats = plan === "team" ? 5 : 1;

    await db.createLicense(
      licenseId,
      session.customer_details?.email || "unknown",
      plan,
      seats,
      "active",
      session.customer,
      session.subscription
    );

    console.log("ISSUED LICENSE:", licenseId);
    console.log("Plan:", plan, "Seats:", seats);
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object;
    
    // Find the license associated with this charge
    const sessions = await stripe.checkout.sessions.list({
      payment_intent: charge.payment_intent,
      limit: 1
    });
    
    if (sessions.data.length > 0) {
      const session = sessions.data[0];
      const licenseId = generateLicense(
        session.customer_details?.email || "unknown"
      );
      
      await db.updateLicenseStatus(licenseId, "refunded");
      console.log("REVOKE LICENSE:", licenseId, "Status: refunded");
    }
  }

  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object;
    
    // Find license by stripe_customer_id
    const license = await db.getLicenseByStripeCustomer(subscription.customer);
    
    if (license) {
      // Update plan based on subscription items
      const plan = subscription.items.data[0]?.price?.metadata?.plan || "pro";
      await db.updateLicenseStatus(license.id, "active");
      console.log("UPDATED SUBSCRIPTION:", license.id, "Plan:", plan);
    }
  }

  return new Response("ok", { status: 200 });
};