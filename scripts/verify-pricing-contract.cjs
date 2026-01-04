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

// Try to load Playwright for runtime website checking
let chromium = null;
try {
  // Try root directory first
  ({ chromium } = require("@playwright/test"));
} catch {
  try {
    // Fall back to desktop app directory where it's installed
    ({ chromium } = require("../apps/terminal-pro/desktop/node_modules/@playwright/test"));
  } catch {
    console.log("⚠️ Playwright not available; using basic HTML checks only");
  }
}

// Website URL for testing
const WEBSITE_PRICING_URL = 'https://rinawarptech.com/pricing';

class PricingContractVerifier {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  log(message, level = 'info') {
    const prefix = level === 'error' ? '❌' : level === 'success' ? '✅' : level === 'warning' ? '⚠️' : '📋';
    console.log(`${prefix} ${message}`);
  }

  async makeRequest(url) {
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

  async validateApiEndpoint(url) {
    this.log(`🔍 Verifying ${url}...`);

    try {
      const data = await this.makeRequest(url);

      // Check if response has required structure
      if (!data.ok) {
        this.errors.push(`${url}: Missing 'ok: true'`);
        return false;
      }

      if (!data.plans || !Array.isArray(data.plans)) {
        this.errors.push(`${url}: Missing or invalid 'plans' array`);
        return false;
      }

      if (!data.lifetime || !Array.isArray(data.lifetime)) {
        this.errors.push(`${url}: Missing or invalid 'lifetime' array`);
        return false;
      }

      // Check plans
      this.log(`📊 Plans: ${data.plans.length} monthly plans`);
      if (data.plans.length !== 3) {
        this.errors.push(`${url}: Expected 3 monthly plans, got ${data.plans.length}`);
      }

      // Check lifetime
      this.log(`📊 Lifetime: ${data.lifetime.length} lifetime plans`);
      if (data.lifetime.length !== 3) {
        this.errors.push(`${url}: Expected 3 lifetime plans, got ${data.lifetime.length}`);
      }

      // Verify each plan has required fields
      const allPlans = [...data.plans, ...data.lifetime];
      for (const plan of allPlans) {
        if (!plan.stripeEnv) {
          this.errors.push(`${url}: Plan ${plan.id} missing 'stripeEnv' field`);
        }
        if (!plan.priceUsd) {
          this.errors.push(`${url}: Plan ${plan.id} missing 'priceUsd' field`);
        }
        if (plan.soldOut === undefined) {
          this.errors.push(`${url}: Plan ${plan.id} missing 'soldOut' field`);
        }
      }

      if (this.errors.length === 0) {
        this.log(`✅ ${url}: All checks passed!`);
        this.log(`   ✅ 3 monthly plans`);
        this.log(`   ✅ 3 lifetime plans`);
        this.log(`   ✅ stripeEnv present everywhere`);
        this.log(`   ✅ priceUsd present for all plans`);
      }

      return data;

    } catch (error) {
      this.errors.push(`${url}: Request failed - ${error.message}`);
      return null;
    }
  }

  async validateWebsiteRuntime(apiData) {
    this.log("🌐 Checking website consistency (runtime)...");

    // Check both API endpoints to understand the data inconsistency
    const lifetimeStatusData = await this.checkLifetimeStatusAPI();
    const pricingApiData = apiData;

    // Check what the live website is actually displaying
    if (!chromium) {
      this.warnings.push("Playwright not available; using basic HTML checks only");
      return true;
    }

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
      await page.goto(WEBSITE_PRICING_URL, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(1000); // allow client JS to toggle UI

      const soldOutSel = "#sold-out-message";
      const lifetimeSel = "#lifetime-offers-container";

      const soldOutExists = (await page.locator(soldOutSel).count()) > 0;
      const lifetimeExists = (await page.locator(lifetimeSel).count()) > 0;

      if (!soldOutExists || !lifetimeExists) {
        this.errors.push(
          `Website DOM contract changed: expected ${soldOutSel} and ${lifetimeSel} to exist on ${WEBSITE_PRICING_URL}`
        );
        return false;
      }

      const soldOutVisible = await page.locator(soldOutSel).isVisible();
      const lifetimeVisible = await page.locator(lifetimeSel).isVisible();

      // Check consistency with /api/pricing data
      const pricingHasAvailable = pricingApiData?.lifetime?.some((p) => p && p.soldOut === false);

      // Check consistency with /api/lifetime-status data  
      const statusHasAvailable = lifetimeStatusData ? Object.values(lifetimeStatusData).some(tier => tier.remaining > 0) : false;

      if (pricingHasAvailable && soldOutVisible) {
        this.errors.push(
          "CRITICAL: Website shows 'All Lifetime Offers Sold Out' but /api/pricing reports lifetime available (soldOut:false)."
        );
      }

      if (statusHasAvailable && soldOutVisible) {
        this.errors.push(
          "CRITICAL: Website shows 'All Lifetime Offers Sold Out' but /api/lifetime-status reports available inventory."
        );
      }

      if (pricingHasAvailable && !lifetimeVisible) {
        this.errors.push(
          "/api/pricing reports lifetime available (soldOut:false) but lifetime offers container is not visible."
        );
      }

      if (!pricingHasAvailable && !statusHasAvailable && !soldOutVisible) {
        this.errors.push(
          "Both APIs report no lifetime available, but sold-out message is not visible."
        );
      }

      // Report the data comparison
      this.log("📊 API Data Comparison:");
      this.log(`   /api/pricing: ${pricingHasAvailable ? 'Has available plans' : 'All sold out'}`);
      this.log(`   /api/lifetime-status: ${statusHasAvailable ? 'Has available inventory' : 'All sold out'}`);
      this.log(`   Website: Sold-out message ${soldOutVisible ? 'VISIBLE' : 'HIDDEN'}, Lifetime offers ${lifetimeVisible ? 'VISIBLE' : 'HIDDEN'}`);

      if (this.errors.length === 0) {
        this.log("✅ Website consistency check passed: Runtime visibility matches API data.");
      }

      return this.errors.length === 0;
    } catch (error) {
      this.errors.push(`Website runtime check failed: ${error.message}`);
      return false;
    } finally {
      await browser.close();
    }
  }

  async checkLifetimeStatusAPI() {
    try {
      const response = await fetch('https://rinawarptech.com/api/lifetime-status');
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      this.warnings.push("Could not fetch /api/lifetime-status endpoint");
    }
    return null;
  }

  async run() {
    this.log("Starting pricing contract verification...");

    try {
      const endpoints = [
        'https://api.rinawarptech.com/api/pricing',
        'https://admin-api.rinawarptech.workers.dev/api/pricing'
      ];

      let validApiData = null;

      for (const url of endpoints) {
        const apiData = await this.validateApiEndpoint(url);
        if (apiData && !validApiData) {
          validApiData = apiData;
        }
      }

      // Run website consistency check if we have valid API data
      if (validApiData) {
        await this.validateWebsiteRuntime(validApiData);
      }

      // Report warnings
      this.warnings.forEach(w => this.log(w, 'warning'));

      if (this.errors.length === 0) {
        this.log("🎉 ALL CHECKS PASSED! Pricing contract is valid.", "success");
        return 0;
      }

      this.log("❌ SOME CHECKS FAILED! Pricing contract verification failed.", "error");
      this.errors.forEach((e) => this.log(e, "error"));
      return 1;
    } catch (error) {
      this.log(`❌ Verification failed: ${error.message}`, "error");
      return 1;
    }
  }
}

// Run verification
async function main() {
  const verifier = new PricingContractVerifier();
  const exitCode = await verifier.run();
  process.exit(exitCode);
}

main().catch(error => {
  console.error('Verification failed:', error);
  process.exit(1);
});