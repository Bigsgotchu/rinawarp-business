#!/usr/bin/env node

/**
 * Test script to verify Stripe Worker deployment
 * Run this after deploying and setting environment variables
 */

const WORKER_URL = 'https://rinawarp-stripe-worker.workers.dev';

async function testWorkerEndpoints() {
  console.log('🔍 Testing RinaWarp Stripe Worker...\n');

  // Test health check
  try {
    const healthResponse = await fetch(WORKER_URL);
    console.log(`✅ Worker health check: ${healthResponse.status} ${healthResponse.statusText}`);
  } catch (error) {
    console.log(`❌ Worker not responding: ${error.message}`);
    return;
  }

  // Test checkout endpoint
  try {
    const checkoutResponse = await fetch(`${WORKER_URL}/api/checkout-v2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceKey: 'test' })
    });
    
    if (checkoutResponse.status === 400) {
      console.log('✅ Checkout endpoint working (expected 400 for invalid priceKey)');
    } else {
      console.log(`⚠️  Checkout endpoint: ${checkoutResponse.status} ${checkoutResponse.statusText}`);
    }
  } catch (error) {
    console.log(`❌ Checkout endpoint error: ${error.message}`);
  }

  // Test webhook endpoint
  try {
    const webhookResponse = await fetch(`${WORKER_URL}/api/webhooks/stripe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'test' })
    });
    
    if (webhookResponse.status === 400) {
      console.log('✅ Webhook endpoint working (expected 400 for invalid signature)');
    } else {
      console.log(`⚠️  Webhook endpoint: ${webhookResponse.status} ${webhookResponse.statusText}`);
    }
  } catch (error) {
    console.log(`❌ Webhook endpoint error: ${error.message}`);
  }

  console.log('\n📝 Next steps:');
  console.log('1. Set environment variables: wrangler secret put STRIPE_SECRET_KEY');
  console.log('2. Set webhook secret: wrangler secret put STRIPE_WEBHOOK_SECRET');
  console.log('3. Configure Stripe dashboard webhook URL');
  console.log('4. Test with real priceKey values');
}

testWorkerEndpoints().catch(console.error);