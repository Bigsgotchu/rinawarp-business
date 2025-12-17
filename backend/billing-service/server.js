import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import Stripe from 'stripe';
import { saveProcessedEvent, updateLicensePlan } from './license-db.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.BILLING_SERVICE_PORT || 3005;

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'billing-service',
    timestamp: new Date().toISOString(),
  });
});

// Create checkout session for upgrades
app.post("/api/billing/create-checkout-session", express.json(), async (req, res) => {
  const { tier, licenseKey, success_url, cancel_url } = req.body;

  if (!tier || !licenseKey) {
    return res.status(400).json({ error: "Missing tier or licenseKey" });
  }

  try {
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: tier === 'pro-monthly' ? process.env.STRIPE_PRO_PRICE_ID : process.env.STRIPE_LIFETIME_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: tier === 'pro-monthly' ? 'subscription' : 'payment',
      success_url: success_url || 'https://rinawarptech.com/download-terminal-pro',
      cancel_url: cancel_url || 'https://rinawarptech.com/pricing.html',
      metadata: {
        tier,
        licenseKey,
      },
    });

    console.log(`💳 Checkout session created: ${session.id} for ${tier}`);
    res.json({ url: session.url, sessionId: session.id });

  } catch (err) {
    console.error("❌ Stripe checkout error:", err.message);
    res.status(500).json({ error: "Failed to create checkout session", details: err.message });
  }
});

// Stripe Webhook endpoint (must use RAW body)
app.post(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error("❌ Stripe webhook signature failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Prevent duplicates
    if (await saveProcessedEvent.check(event.id)) {
      console.log(`⚠️ Duplicate event ignored: ${event.id}`);
      return res.json({ received: true });
    }

    console.log(`🔔 Event received: ${event.type}`);

    try {
      switch (event.type) {
        // ----- ONE-TIME LIFETIME PURCHASE -----
        case "checkout.session.completed":
          await handleCheckoutCompleted(event.data.object);
          break;

        // ----- SUBSCRIPTIONS -----
        case "customer.subscription.created":
        case "customer.subscription.updated":
          await handleSubscriptionUpdate(event.data.object);
          break;

        case "invoice.payment_failed":
        case "customer.subscription.deleted":
          await handleSubscriptionCancelled(event.data.object);
          break;

        default:
          console.log(`ℹ️ Unhandled event type: ${event.type}`);
      }

      await saveProcessedEvent.store(event.id);
      res.json({ received: true });
    } catch (err) {
      console.error("❌ Webhook handler failed:", err);
      res.status(500).send("Webhook handler failed");
    }
  }
);

// -------------------------------
// HANDLERS
// -------------------------------

async function handleCheckoutCompleted(session) {
  console.log("💰 Checkout Completed:", session.id);

  const tier = session.metadata?.tier;
  const licenseKey = session.metadata?.licenseKey;

  if (!licenseKey || !tier) {
    console.error("❌ Missing metadata: licenseKey or tier");
    return;
  }

  if (tier.startsWith("lifetime")) {
    await updateLicensePlan(licenseKey, {
      plan: "lifetime",
      features: {
        premiumMode: true,
        maxDailyMessages: Infinity,
      },
      timestamp: Date.now(),
    });

    console.log(`👑 Lifetime license activated for ${licenseKey}`);
  }
}

async function handleSubscriptionUpdate(subscription) {
  console.log("🔄 Subscription Update:", subscription.id);

  const metadata = subscription.metadata || {};
  const licenseKey = metadata.licenseKey;

  if (!licenseKey) {
    console.error("❌ No license key in metadata");
    return;
  }

  await updateLicensePlan(licenseKey, {
    plan: "pro",
    features: {
      premiumMode: true,
      maxDailyMessages: 200,
    },
    subscription_end: subscription.current_period_end,
  });

  console.log(`🌟 PRO subscription active for ${licenseKey}`);
}

async function handleSubscriptionCancelled(subscription) {
  const licenseKey = subscription.metadata?.licenseKey;
  if (!licenseKey) return;

  await updateLicensePlan(licenseKey, {
    plan: "free",
    features: {
      premiumMode: false,
      maxDailyMessages: 20,
    },
  });

  console.log(`⚠️ Subscription canceled — license downgraded for ${licenseKey}`);
}

// Start server
app.listen(PORT, () => {
  console.log(`💳 Billing service running on port ${PORT}`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  console.log(`🔔 Webhook endpoint: http://localhost:${PORT}/api/webhooks/stripe`);
});