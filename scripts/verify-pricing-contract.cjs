#!/usr/bin/env node

/**
 * Pricing Contract Verification Script
 * 
 * Verifies that the Admin API pricing endpoint returns the correct contract format
 * 
 * Usage: node scripts/verify-pricing-contract.cjs
 * 
 * Expected format:
 * {
 *   ok: true,
 *   plans: [3 monthly plans],
 *   lifetime: [3 lifetime plans],
 *   stripeEnv: present everywhere,
 *   priceUsd: present for all plans
 * }
 */

const https = require('https');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

function makeHtmlRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', reject);
  });
}

async function checkWebsiteConsistency(apiData) {
  try {
    console.log(`\n🌐 Checking website consistency...`);
    
    // Check if API says any lifetime is available (soldOut: false)
    const apiHasAvailableLifetime = apiData.lifetime.some(p => p && p.soldOut === false);
    
    if (apiHasAvailableLifetime) {
      // Fetch website HTML and check for sold-out message
      const websiteHtml = await makeHtmlRequest('https://rinawarptech.com/pricing');
      
      if (/All\s+Lifetime\s+Offers\s+Sold\s+Out/i.test(websiteHtml)) {
        console.log(`❌ Website consistency check failed:`);
        console.log(`   Website shows 'All Lifetime Offers Sold Out' but API reports lifetime available (soldOut:false).`);
        console.log(`   This mismatch will confuse customers.`);
        allPassed = false;
      } else {
        console.log(`✅ Website consistency check passed:`);
        console.log(`   API shows lifetime plans available, website doesn't show sold-out message.`);
      }
    } else {
      console.log(`✅ Website consistency check skipped: API shows all lifetime plans sold out.`);
    }
  } catch (error) {
    console.log(`❌ Website consistency check failed: ${error.message}`);
    allPassed = false;
  }
}

async function verifyPricingContract() {
  const endpoints = [
    'https://api.rinawarptech.com/api/pricing',
    'https://admin-api.rinawarptech.workers.dev/api/pricing'
  ];

  let allPassed = true;

  for (const url of endpoints) {
    console.log(`\n🔍 Verifying ${url}...`);
    
    try {
      const data = await makeRequest(url);
      
      // Check if response has required structure
      if (!data.ok) {
        console.log(`❌ ${url}: Missing 'ok: true'`);
        allPassed = false;
        continue;
      }

      if (!data.plans || !Array.isArray(data.plans)) {
        console.log(`❌ ${url}: Missing or invalid 'plans' array`);
        allPassed = false;
        continue;
      }

      if (!data.lifetime || !Array.isArray(data.lifetime)) {
        console.log(`❌ ${url}: Missing or invalid 'lifetime' array`);
        allPassed = false;
        continue;
      }

      // Check plans
      console.log(`📊 Plans: ${data.plans.length} monthly plans`);
      if (data.plans.length !== 3) {
        console.log(`❌ ${url}: Expected 3 monthly plans, got ${data.plans.length}`);
        allPassed = false;
      }

      // Check lifetime
      console.log(`📊 Lifetime: ${data.lifetime.length} lifetime plans`);
      if (data.lifetime.length !== 3) {
        console.log(`❌ ${url}: Expected 3 lifetime plans, got ${data.lifetime.length}`);
        allPassed = false;
      }

      // Verify each plan has required fields
      const allPlans = [...data.plans, ...data.lifetime];
      for (const plan of allPlans) {
        if (!plan.stripeEnv) {
          console.log(`❌ ${url}: Plan ${plan.id} missing 'stripeEnv' field`);
          allPassed = false;
        }
        if (!plan.priceUsd) {
          console.log(`❌ ${url}: Plan ${plan.id} missing 'priceUsd' field`);
          allPassed = false;
        }
        if (plan.soldOut === undefined) {
          console.log(`❌ ${url}: Plan ${plan.id} missing 'soldOut' field`);
          allPassed = false;
        }
      }

      if (allPassed) {
        console.log(`✅ ${url}: All checks passed!`);
        console.log(`   ✅ 3 monthly plans`);
        console.log(`   ✅ 3 lifetime plans`);
        console.log(`   ✅ stripeEnv present everywhere`);
        console.log(`   ✅ priceUsd present for all plans`);
      }

      // Check website consistency if API data is valid
      if (data.ok && data.lifetime && Array.isArray(data.lifetime)) {
        await checkWebsiteConsistency(data);
      }

    } catch (error) {
      console.log(`❌ ${url}: Request failed - ${error.message}`);
      allPassed = false;
    }
  }

  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('🎉 ALL CHECKS PASSED! Pricing contract is valid.');
    console.log('✅ 3 monthly plans');
    console.log('✅ 3 lifetime plans');
    console.log('✅ stripeEnv present everywhere');
    console.log('✅ priceUsd present for all plans');
    process.exit(0);
  } else {
    console.log('❌ SOME CHECKS FAILED! Pricing contract verification failed.');
    process.exit(1);
  }
}

// Run verification
verifyPricingContract().catch(error => {
  console.error('Verification failed:', error);
  process.exit(1);
});