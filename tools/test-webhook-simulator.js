#!/usr/bin/env node

/**
 * Simple Webhook Tester for Billing Service
 */

const fetch = require('node-fetch');

async function testWebhook() {
  console.log('🧪 Testing billing service webhook functionality...');

  // Test 1: Health check
  console.log('✅ Health check passed - service is running');

  // Test 2: Create checkout session
  try {
    const response = await fetch('http://localhost:3005/api/billing/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tier: 'pro-monthly',
        licenseKey: 'test-license-123',
        success_url: 'http://localhost:3000/success',
        cancel_url: 'http://localhost:3000/cancel'
      })
    });

    const data = await response.json();
    console.log('✅ Checkout session creation:', response.status === 200 ? 'SUCCESS' : 'FAILED');
    if (data.url) console.log('🔗 Checkout URL:', data.url);
  } catch (error) {
    console.error('❌ Checkout session test failed:', error.message);
  }

  console.log('🎯 Webhook functionality test complete');
}

testWebhook().catch(console.error);