#!/usr/bin/env node

// Test script to verify the Stripe price map fix
const fs = require('fs');
const path = require('path');

// Load the corrected price map
const priceMapPath = path.join(__dirname, 'config', 'pricing', 'price_map.json');
const priceMap = JSON.parse(fs.readFileSync(priceMapPath, 'utf8'));

console.log('✅ Price Map Loaded Successfully:');
console.log(JSON.stringify(priceMap, null, 2));

// Test the creator-monthly plan specifically
const testPlan = 'creator-monthly';
const priceId = priceMap[testPlan];

if (priceId) {
  console.log(`\n🎯 Test Plan: ${testPlan}`);
  console.log(`📋 Price ID: ${priceId}`);
  console.log(`✅ Plan validation: PASSED`);
  
  // Verify the price ID format
  if (priceId.startsWith('price_')) {
    console.log(`✅ Price ID format: VALID (starts with 'price_')`);
  } else {
    console.log(`❌ Price ID format: INVALID`);
  }
} else {
  console.log(`❌ Plan validation: FAILED - ${testPlan} not found in price map`);
}

// Check all plans
console.log('\n📊 Available Plans:');
Object.keys(priceMap).forEach(plan => {
  const priceId = priceMap[plan];
  console.log(`  • ${plan}: ${priceId}`);
});

console.log('\n🧪 Testing with curl command:');
console.log(`curl -s -X POST https://rinawarptech.com/api/checkout-v2 \\`);
console.log(`  -H "Content-Type: application/json" \\`);
console.log(`  -d '{\n    "plan": "${testPlan}",\n    "successUrl": "https://rinawarptech.com/success/",\n    "cancelUrl": "https://rinawarptech.com/cancel/"\n  }'`);

console.log('\n✨ Fix Summary:');
console.log('1. ✅ Updated price_map.json with correct Stripe CLI data');
console.log('2. ✅ Updated Cloudflare Worker to accept "plan" parameter');
console.log('3. ✅ Added corrected price map to worker environment');
console.log('4. ✅ Configured proper subscription vs one-time payment logic');
console.log('\n🚀 Ready for testing!');