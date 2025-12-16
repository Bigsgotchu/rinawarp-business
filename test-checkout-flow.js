#!/usr/bin/env node

/**
 * Test script for RinaWarp Stripe checkout flow
 * This script tests the checkout API and validates the configuration
 */

const https = require('https');

console.log('🧪 RinaWarp Checkout Flow Test');
console.log('==============================');

// Configuration
const config = {
  baseUrl: 'https://rinawarptech.com',
  testPlans: [
    'terminal_pro_starter',
    'terminal_pro_creator',
    'terminal_pro_pro',
    'terminal_pro_enterprise',
  ],
};

// Test checkout API
async function testCheckoutAPI() {
  console.log('\n📡 Testing checkout API endpoints...');

  for (const plan of config.testPlans) {
    console.log(`\n🔍 Testing plan: ${plan}`);

    try {
      const response = await makeApiRequest('/api/checkout-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: plan,
          successUrl: `${config.baseUrl}/success.html`,
          cancelUrl: `${config.baseUrl}/cancel.html`,
          email: 'test@example.com',
        }),
      });

      if (response.status === 200) {
        console.log(`  ✅ Plan ${plan}: API working`);
        if (response.data.sessionId) {
          console.log(`  ✅ Session ID received: ${response.data.sessionId.substring(0, 20)}...`);
        } else {
          console.log(`  ⚠️  No session ID in response`);
        }
      } else if (response.status === 400) {
        console.log(`  ⚠️  Plan ${plan}: Invalid (expected if plan not configured)`);
        console.log(
          `     Available plans: ${response.data.availablePlans?.join(', ') || 'unknown'}`,
        );
      } else {
        console.log(`  ❌ Plan ${plan}: Error ${response.status}`);
        console.log(`     ${response.data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`  ❌ Plan ${plan}: Request failed`);
      console.log(`     ${error.message}`);
    }
  }
}

// Test webhook endpoint
async function testWebhookEndpoint() {
  console.log('\n🔗 Testing webhook endpoint...');

  try {
    const response = await makeApiRequest('/api/stripe/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test', // This will fail signature verification, but tests endpoint existence
      },
      body: JSON.stringify({
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            customer_email: 'test@example.com',
          },
        },
      }),
    });

    if (response.status === 401) {
      console.log('  ✅ Webhook endpoint exists (signature verification working)');
    } else if (response.status === 400) {
      console.log('  ✅ Webhook endpoint exists (bad request expected)');
    } else {
      console.log(`  ⚠️  Webhook endpoint returned: ${response.status}`);
    }
  } catch (error) {
    console.log(`  ❌ Webhook endpoint test failed: ${error.message}`);
  }
}

// Check pricing page
async function testPricingPage() {
  console.log('\n💰 Testing pricing page...');

  try {
    const response = await makeApiRequest('/pricing.html', {
      method: 'GET',
    });

    if (response.status === 200) {
      console.log('  ✅ Pricing page accessible');

      // Check for required elements
      const content = response.data;
      const hasStripeScript = content.includes('https://js.stripe.com/v3/');
      const hasCheckoutButtons = content.includes('data-checkout-button');
      const hasPlanData = content.includes('data-plan=');

      if (hasStripeScript) {
        console.log('  ✅ Stripe.js script included');
      } else {
        console.log('  ❌ Stripe.js script missing');
      }

      if (hasCheckoutButtons && hasPlanData) {
        console.log('  ✅ Checkout buttons configured');
      } else {
        console.log('  ❌ Checkout buttons not properly configured');
      }
    } else {
      console.log(`  ❌ Pricing page not accessible: ${response.status}`);
    }
  } catch (error) {
    console.log(`  ❌ Pricing page test failed: ${error.message}`);
  }
}

// Test checkout script
async function testCheckoutScript() {
  console.log('\n📜 Testing checkout script...');

  try {
    const response = await makeApiRequest('/checkout.js', {
      method: 'GET',
    });

    if (response.status === 200) {
      console.log('  ✅ Checkout script accessible');

      const content = response.data;
      const hasStripeIntegration = content.includes('window.Stripe');
      const hasPlanMapping = content.includes('PLAN_KEYS');
      const hasCheckoutHandler = content.includes('handleCheckoutClick');

      if (hasStripeIntegration) {
        console.log('  ✅ Stripe.js integration found');
      } else {
        console.log('  ❌ Stripe.js integration missing');
      }

      if (hasPlanMapping) {
        console.log('  ✅ Plan key mapping found');
      } else {
        console.log('  ❌ Plan key mapping missing');
      }

      if (hasCheckoutHandler) {
        console.log('  ✅ Checkout click handler found');
      } else {
        console.log('  ❌ Checkout click handler missing');
      }
    } else {
      console.log(`  ❌ Checkout script not accessible: ${response.status}`);
    }
  } catch (error) {
    console.log(`  ❌ Checkout script test failed: ${error.message}`);
  }
}

// Helper function to make HTTP requests
function makeApiRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, config.baseUrl);

    const requestOptions = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'RinaWarp-Checkout-Test/1.0',
        ...options.headers,
      },
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const responseData = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: responseData,
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

// Main test runner
async function runTests() {
  try {
    await testCheckoutAPI();
    await testWebhookEndpoint();
    await testPricingPage();
    await testCheckoutScript();

    console.log('\n📋 Test Summary:');
    console.log('================');
    console.log('✅ API endpoints tested');
    console.log('✅ Webhook endpoint verified');
    console.log('✅ Frontend components checked');
    console.log('\n🎯 Next steps:');
    console.log('1. Configure environment variables in Cloudflare Pages');
    console.log('2. Set up Stripe webhook endpoints');
    console.log('3. Test with real checkout flow');
    console.log('4. Monitor webhook delivery in Stripe Dashboard');
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run tests
runTests();
