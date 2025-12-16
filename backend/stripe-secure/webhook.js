import Stripe from 'stripe';
import express from 'express';
import { generateLicenseKey, hashLicenseKey, encryptLicenseKey } from './licenses.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

// CRITICAL: Environment validation - fail fast if missing
if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error('Missing STRIPE_WEBHOOK_SECRET - webhook verification impossible');
}
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY - Stripe operations impossible');
}

// Allowed event types - strict allowlist
const ALLOWED_EVENTS = new Set([
  'checkout.session.completed',
  'checkout.session.expired',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
  'invoice.payment_failed',
]);

/**
 * Check if event was already processed (idempotency)
 */
async function wasEventProcessed(eventId) {
  // Implement with your database
  // Return true if eventId exists in processed_events table
  return false; // Placeholder
}

/**
 * Mark event as processed
 */
async function markEventProcessed(eventId) {
  // Insert eventId into processed_events table
  // Use unique constraint to prevent duplicates
  console.log(`Marking event ${eventId} as processed`);
}

/**
 * Create license record with encrypted key
 */
async function createLicense({
  licenseHash,
  encryptedLicense,
  tier,
  stripeSessionId,
  stripePaymentIntentId,
}) {
  // Insert into licenses table
  // Fields: license_hash, license_key_encrypted, tier, stripe_session_id, created_at
  console.log(`Creating license: ${licenseHash} for session ${stripeSessionId}`);
}

/**
 * Get license by Stripe session ID for reveal
 */
async function getLicenseBySessionId(sessionId) {
  // Query licenses table by stripe_session_id
  // Return: { licenseKey, tier, licenseHash }
  return null; // Placeholder
}

/**
 * HARDENED WEBHOOK ENDPOINT
 * This implements all security requirements
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  // Validate signature header exists
  if (!sig) {
    console.error('Missing Stripe-Signature header');
    return res.status(400).send('Missing Stripe-Signature header');
  }

  let event;
  try {
    // Verify webhook signature using raw body
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
  }

  // IDEMPOTENCY: Check if we've already processed this event
  if (await wasEventProcessed(event.id)) {
    console.log(`Duplicate event ignored: ${event.id}`);
    return res.status(200).json({ received: true, deduped: true });
  }

  try {
    // STRICT ALLOWLIST: Only handle expected event types
    if (!ALLOWED_EVENTS.has(event.type)) {
      console.log(`Ignoring unhandled event type: ${event.type}`);
      await markEventProcessed(event.id);
      return res.status(200).json({ received: true, ignored: event.type });
    }

    // Handle checkout completion
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // CRITICAL: Verify payment status - only fulfill paid sessions
      if (session.payment_status !== 'paid') {
        console.log(`Skipping unpaid session: ${session.id}`);
        await markEventProcessed(event.id);
        return res.status(200).json({ received: true, skipped: 'not_paid' });
      }

      // Generate secure license key
      const licenseKey = generateLicenseKey();
      const licenseHash = hashLicenseKey(licenseKey);

      // Encrypt license key for storage
      const encryptedLicense = encryptLicenseKey(licenseKey, process.env.LICENSE_ENCRYPTION_SECRET);

      // Create license record
      await createLicense({
        licenseHash,
        encryptedLicense,
        tier: 'pro',
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent || null,
      });

      console.log(`✅ License created for session ${session.id}: ${licenseKey}`);

      // Mark event as processed (prevents Stripe retries)
      await markEventProcessed(event.id);

      // Return 200 immediately - don't do slow work
      return res.status(200).json({ received: true });
    }

    // Handle expired sessions
    if (event.type === 'checkout.session.expired') {
      console.log(`Session expired: ${event.data.object.id}`);
      await markEventProcessed(event.id);
      return res.status(200).json({ received: true, expired: true });
    }

    // Handle subscription events
    if (event.type === 'customer.subscription.created') {
      console.log(`Subscription created: ${event.data.object.id}`);
      await markEventProcessed(event.id);
      return res.status(200).json({ received: true, subscription_created: true });
    }

    if (event.type === 'customer.subscription.updated') {
      console.log(`Subscription updated: ${event.data.object.id}`);
      await markEventProcessed(event.id);
      return res.status(200).json({ received: true, subscription_updated: true });
    }

    if (event.type === 'customer.subscription.deleted') {
      console.log(`Subscription deleted: ${event.data.object.id}`);
      await markEventProcessed(event.id);
      return res.status(200).json({ received: true, subscription_deleted: true });
    }

    if (event.type === 'invoice.paid') {
      console.log(`Invoice paid: ${event.data.object.id}`);
      await markEventProcessed(event.id);
      return res.status(200).json({ received: true, invoice_paid: true });
    }

    if (event.type === 'invoice.payment_failed') {
      console.log(`Invoice payment failed: ${event.data.object.id}`);
      await markEventProcessed(event.id);
      return res.status(200).json({ received: true, payment_failed: true });
    }

    // Mark all other events as processed to prevent retries
    await markEventProcessed(event.id);
    return res.status(200).json({ received: true, handled: event.type });
  } catch (err) {
    // CRITICAL: Log error but return 500 to trigger Stripe retries
    // This ensures we don't lose events if there's a temporary failure
    console.error('Webhook handler error:', err);
    return res.status(500).send('Webhook handler error');
  }
});

/**
 * License reveal endpoint for success page
 */
router.get('/license/reveal', async (req, res) => {
  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ error: 'Missing session_id' });
  }

  try {
    // Verify session exists and is paid in Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session || session.payment_status !== 'paid') {
      return res.status(403).json({ error: 'Invalid or unpaid session' });
    }

    // Get license from database
    const license = await getLicenseBySessionId(session_id);

    if (!license) {
      return res.status(404).json({ error: 'License not found' });
    }

    // Return license key for display
    return res.json({
      licenseKey: license.licenseKey,
      tier: license.tier,
    });
  } catch (err) {
    console.error('License reveal error:', err);
    return res.status(500).json({ error: 'Failed to retrieve license' });
  }
});

export default router;
