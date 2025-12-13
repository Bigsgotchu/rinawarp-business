import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { updateLicensePlan, getLicenseByKey, saveProcessedEvent } from './license-db.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.BILLING_SERVICE_PORT || 3005;

// NOTE: Stripe operations moved to canonical webhook at backend/stripe-secure/webhook.js
// This service focuses on license management and checkout session creation only
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
    // Create Stripe checkout session with required metadata
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      client_reference_id: licenseKey, // Required by audit
      line_items: [
        {
          price: tier === 'pro-monthly' ? process.env.STRIPE_PRO_PRICE_ID : process.env.STRIPE_LIFETIME_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: tier === 'pro-monthly' ? 'subscription' : 'payment',
      success_url: success_url || 'rinawarp-terminal-pro://upgrade-success',
      cancel_url: cancel_url || 'rinawarp-terminal-pro://upgrade-cancel',
      metadata: {
        tier,
        licenseKey,
        user_id: licenseKey, // Required by audit
      },
    });

    console.log(`💳 Checkout session created: ${session.id} for ${tier}`);
    res.json({ url: session.url, sessionId: session.id });

  } catch (err) {
    console.error("❌ Stripe checkout error:", err.message);
    res.status(500).json({ error: "Failed to create checkout session", details: err.message });
  }
});

// NOTE: Stripe webhooks are handled ONLY by backend/stripe-secure/webhook.js
// This service must not verify Stripe signatures or parse webhook raw bodies.

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
  console.log(`🔔 Webhook endpoint: http://localhost:${PORT}/webhook`);
});
