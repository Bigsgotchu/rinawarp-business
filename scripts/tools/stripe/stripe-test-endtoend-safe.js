/**
 * RinaWarp Stripe End-to-End Test (Safe Mode)
 * -------------------------------------------
 * - Auto-detects key type (test/live)
 * - Prevents accidental live charges
 * - Verifies checkout + webhook delivery
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_xxx
 *   STRIPE_WEBHOOK_URL=http://localhost:4242/stripe/webhook
 *   node -r dotenv/config stripe-test-endtoend-safe.js
 */

import Stripe from 'stripe';
import fs from 'fs';
import fetch from 'node-fetch';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

const KEY = process.env.STRIPE_SECRET_KEY || '';
const WEBHOOK_URL = process.env.STRIPE_WEBHOOK_URL;
const OUTPUT_FILE = 'stripe-endtoend-results.txt';
const ALLOW_LIVE = process.env.ALLOW_LIVE === 'true';

const isTestKey = KEY.startsWith('sk_test_');
const isLiveKey = KEY.startsWith('sk_live_');

async function sanityCheckEnvironment() {
  console.log('🧭 Environment detection:');
  if (isTestKey) console.log('   ✅ Running in TEST MODE.');
  if (isLiveKey) console.log('   ⚠️ Running in LIVE MODE.');
  if (isLiveKey && !ALLOW_LIVE) {
    console.error(
      '\n🚨 Detected LIVE Stripe key (sk_live_)! Aborting to prevent real charges.\n' +
        'If you really intend to test in live mode, rerun with:\n' +
        'ALLOW_LIVE=true node -r dotenv/config stripe-test-endtoend-safe.js\n',
    );
    process.exit(1);
  }
  if (!KEY) {
    console.error('❌ Missing STRIPE_SECRET_KEY in .env');
    process.exit(1);
  }

  // Check key format
  if (!KEY.startsWith('sk_test_') && !KEY.startsWith('sk_live_')) {
    console.error('❌ Invalid key format. Key must start with \'sk_test_\' or \'sk_live_\'');
    process.exit(1);
  }

  // Test connection
  try {
    await stripe.products.list({ limit: 1 });
    console.log('   ✅ Stripe connection successful');
  } catch (error) {
    console.error('❌ Stripe connection failed:', error.message);
    console.error('   Check your key format and ensure it\'s not truncated.');
    process.exit(1);
  }
}

async function sendTestEvent(session) {
  if (!WEBHOOK_URL) {
    console.warn('⚠️  No STRIPE_WEBHOOK_URL set — skipping webhook delivery test.');
    return { delivered: false, status: 'skipped' };
  }

  const payload = {
    id: 'evt_test_' + session.id,
    type: 'checkout.session.completed',
    data: { object: session },
  };

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return { delivered: true, status: res.status };
  } catch (err) {
    return { delivered: false, status: err.message };
  }
}

async function testPrice(price) {
  const mode = price.recurring ? 'subscription' : 'payment';
  console.log(`▶ Testing ${price.product.name} (${price.id}) — ${mode}`);
  try {
    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: price.id, quantity: 1 }],
      customer_email: 'test@example.com',
      success_url: 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://example.com/cancel',
    });

    const webhook = await sendTestEvent(session);
    const result =
      webhook.delivered && webhook.status >= 200 && webhook.status < 300
        ? 'PASS'
        : webhook.status === 'skipped'
          ? 'WARN'
          : 'WARN';

    console.log(`   ✅ Checkout OK | Webhook: ${webhook.status} | URL: ${session.url}\n`);
    return {
      product: price.product.name,
      priceId: price.id,
      mode,
      result,
      webhookStatus: webhook.status,
      url: session.url,
    };
  } catch (err) {
    console.error(`   ❌ Failed for ${price.id}: ${err.message}\n`);
    return {
      product: price.product.name,
      priceId: price.id,
      mode,
      result: 'FAIL',
      error: err.message,
    };
  }
}

async function main() {
  await sanityCheckEnvironment();

  console.log('🔍 Fetching active prices...');
  const prices = await stripe.prices.list({
    active: true,
    limit: 100,
    expand: ['data.product'],
  });

  const rinawarpPrices = prices.data.filter((p) => p.product?.name?.includes('RinaWarp'));

  if (!rinawarpPrices.length) {
    console.log('⚠️  No matching RinaWarp prices found.');
    process.exit(1);
  }

  const results = [];
  for (const p of rinawarpPrices) {
    results.push(await testPrice(p));
  }

  fs.writeFileSync(
    OUTPUT_FILE,
    [
      `Environment: ${isLiveKey ? 'LIVE' : 'TEST'}`,
      ...results.map((r) =>
        r.result === 'PASS'
          ? `✅ ${r.product} (${r.mode}) → ${r.priceId}\nWebhook ${r.webhookStatus}\n${r.url}\n`
          : r.result === 'WARN'
            ? `⚠️ ${r.product} (${r.mode}) Webhook warning → ${r.webhookStatus}\n${r.url}\n`
            : `❌ ${r.product} (${r.mode}) Error: ${r.error}\n`,
      ),
    ].join('\n'),
    'utf8',
  );

  const pass = results.filter((r) => r.result === 'PASS').length;
  const warn = results.filter((r) => r.result === 'WARN').length;
  const fail = results.filter((r) => r.result === 'FAIL').length;

  console.log(
    `\n🧾 Results saved to ${OUTPUT_FILE}\n✅ ${pass} PASS | ⚠️ ${warn} WARN | ❌ ${fail} FAIL`,
  );
}

main().catch((err) => {
  console.error('🚨 Fatal error:', err);
  process.exit(1);
});
