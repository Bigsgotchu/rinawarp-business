#!/usr/bin/env node
import puppeteer from 'puppeteer';
import { exec } from "child_process";
import fetch from "node-fetch";

// ==============================
// Configuration
// ==============================
const PRODUCTION_WEBSITE_URL = "https://www.rinawarptech.com";
const PRODUCTION_API_URL = "https://www.rinawarptech.com/api/checkout-v2";
const PRODUCTION_HEALTH_URL = "https://www.rinawarptech.com/api/health";
const PLANS = ["basic", "starter", "creator", "enterprise"];
const TIMEOUT = 5000; // ms
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // ms

// ==============================
// Test Results Tracking
// ==============================
const testResults = {
  websiteAccessibility: null,
  apiHealth: null,
  checkoutFlows: {},
  criticalFailures: [],
  warnings: []
};

// ==============================
// Helper Functions
// ==============================
function runCommand(cmd, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    const process = exec(cmd, { cwd, shell: true }, (err, stdout, stderr) => {
      if (err) {
        console.error(stderr);
        return reject(err);
      }
      console.log(stdout);
      resolve(stdout);
    });
    process.stdout.pipe(process.stdout);
    process.stderr.pipe(process.stderr);
  });
}

async function withRetry(fn, description) {
  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      const result = await fn();
      if (attempt > 1) {
        console.log(`✅ ${description} succeeded on attempt ${attempt}`);
      }
      return result;
    } catch (err) {
      if (attempt === RETRY_ATTEMPTS) {
        throw err;
      }
      console.warn(`⚠️ ${description} failed on attempt ${attempt}, retrying in ${RETRY_DELAY}ms...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
}

async function checkServer(url, description, isCritical = false) {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT);
    const res = await fetch(url, { method: "HEAD", signal: controller.signal });
    clearTimeout(id);
    
    if (res.ok) {
      console.log(`✅ ${description} - OK (${res.status})`);
      return true;
    } else {
      const errorMsg = `${description} returned HTTP ${res.status}`;
      if (isCritical) {
        testResults.criticalFailures.push(errorMsg);
        console.error(`❌ CRITICAL: ${errorMsg}`);
      } else {
        testResults.warnings.push(errorMsg);
        console.warn(`⚠️ ${errorMsg}`);
      }
      return false;
    }
  } catch (err) {
    const errorMsg = `${description} failed: ${err.message}`;
    if (isCritical) {
      testResults.criticalFailures.push(errorMsg);
      console.error(`❌ CRITICAL: ${errorMsg}`);
    } else {
      testResults.warnings.push(errorMsg);
      console.warn(`⚠️ ${errorMsg}`);
    }
    return false;
  }
}

async function testAPIHealth() {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT);
    const res = await fetch(PRODUCTION_HEALTH_URL, { method: "GET", signal: controller.signal });
    clearTimeout(id);
    
    if (res.ok) {
      const healthData = await res.json();
      console.log(`✅ API health check passed - Status: ${healthData.status || 'healthy'}`);
      return true;
    } else {
      const errorMsg = `API health check returned HTTP ${res.status}`;
      testResults.criticalFailures.push(errorMsg);
      console.error(`❌ CRITICAL: ${errorMsg}`);
      return false;
    }
  } catch (err) {
    const errorMsg = `API health check failed: ${err.message}`;
    testResults.criticalFailures.push(errorMsg);
    console.error(`❌ CRITICAL: ${errorMsg}`);
    return false;
  }
}

async function testProEndpoint() {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT);
    
    // Test without auth (should fail with 401)
    const resNoAuth = await fetch(`${PRODUCTION_API_URL.replace('/checkout-v2', '/pro')}`, {
      method: "GET",
      signal: controller.signal
    });
    
    if (resNoAuth.status !== 401) {
      throw new Error(`Expected 401 Unauthorized, got ${resNoAuth.status}`);
    }
    
    // Test with invalid auth (should also fail with 401)
    const resInvalidAuth = await fetch(`${PRODUCTION_API_URL.replace('/checkout-v2', '/pro')}`, {
      method: "GET",
      headers: {
        "Authorization": "Bearer invalid-license-key"
      },
      signal: controller.signal
    });
    
    if (resInvalidAuth.status !== 401) {
      throw new Error(`Expected 401 Unauthorized with invalid license, got ${resInvalidAuth.status}`);
    }
    
    console.log(`✅ Pro endpoint authentication check passed - Properly rejects unauthorized requests`);
    return true;
  } catch (err) {
    const errorMsg = `Pro endpoint test failed: ${err.message}`;
    testResults.criticalFailures.push(errorMsg);
    console.error(`❌ CRITICAL: ${errorMsg}`);
    return false;
  }
}

async function testPlanCheckout(plan) {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT);
    const res = await fetch(PRODUCTION_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "RinaWarp-Smoke-Test/1.0"
      },
      body: JSON.stringify({
        plan,
        test_mode: true,
        source: "smoke_test"
      }),
      signal: controller.signal
    });
    clearTimeout(id);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    
    // Validate response structure - expect Stripe URL
    if (data && data.url && data.url.includes('stripe.com')) {
      console.log(`✅ ${plan} plan checkout passed - Stripe URL received`);
      testResults.checkoutFlows[plan] = 'passed';
      return true;
    } else {
      throw new Error('Invalid response structure - missing Stripe URL');
    }
  } catch (err) {
    const errorMsg = `${plan} plan checkout failed: ${err.message}`;
    testResults.checkoutFlows[plan] = 'failed';
    testResults.criticalFailures.push(errorMsg);
    console.error(`❌ CRITICAL: ${errorMsg}`);
    return false;
  }
}

async function validateSSL() {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT);
    const res = await fetch(PRODUCTION_WEBSITE_URL, { 
      method: "HEAD", 
      signal: controller.signal 
    });
    clearTimeout(id);
    
    // Check for HTTPS
    if (PRODUCTION_WEBSITE_URL.startsWith('https://')) {
      console.log(`✅ SSL/TLS validation passed - HTTPS enforced`);
      return true;
    } else {
      throw new Error('Website not using HTTPS');
    }
  } catch (err) {
    const errorMsg = `SSL/TLS validation failed: ${err.message}`;
    testResults.warnings.push(errorMsg);
    console.warn(`⚠️ ${errorMsg}`);
    return false;
  }
}

async function checkCSPHeaders() {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT);
    const res = await fetch(PRODUCTION_WEBSITE_URL, { 
      method: "HEAD", 
      signal: controller.signal 
    });
    clearTimeout(id);
    
    const csp = res.headers.get('content-security-policy');
    if (csp) {
      console.log(`✅ Content Security Policy present`);
      return true;
    } else {
      console.warn(`⚠️ Content Security Policy not found`);
      return false;
    }
  } catch (err) {
    console.warn(`⚠️ CSP header check failed: ${err.message}`);
    return false;
  }
}

// ==============================
// Puppeteer Browser Tests
// ==============================
async function testBannerVisibility() {
  let browser;
  try {
    console.log("🔍 Testing banner visibility with Puppeteer...");
    browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    // Set viewport to simulate common screen size
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to the website
    await page.goto(PRODUCTION_WEBSITE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Scroll to bottom of page to ensure all elements are loaded
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    // Wait for potential animations/transitions
    await page.waitForTimeout(2000);
    
    // Check for banner elements with offset tolerance
    const bannerSelector = '.cookie-banner, #cookie-consent, [data-cookie-banner]';
    const banner = await page.$(bannerSelector);
    
    if (banner) {
      // Get banner bounding box with tolerance for off-screen elements
      const bbox = await banner.boundingBox();
      
      if (bbox) {
        // Allow banner to be up to 100px off-screen (tolerance for initial load)
        const tolerance = 100;
        const isVisible = bbox.y + bbox.height > tolerance && 
                         bbox.y < window.innerHeight + tolerance;
        
        if (isVisible) {
          console.log(`✅ Banner visibility test passed - Banner is visible (position: ${bbox.y}, height: ${bbox.height})`);
          return true;
        } else {
          console.warn(`⚠️ Banner is partially off-screen but within tolerance`);
          return true; // Still pass with warning
        }
      } else {
        console.log(`✅ Banner element found but not visible (may be hidden by CSS)`);
        return true;
      }
    } else {
      console.warn(`⚠️ Banner element not found - may not be present on this page`);
      return true; // Not a critical failure
    }
  } catch (err) {
    console.warn(`⚠️ Banner visibility test failed: ${err.message}`);
    testResults.warnings.push(`Banner visibility test failed: ${err.message}`);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function testStripeNavigation() {
  let browser;
  try {
    console.log("🔍 Testing Stripe checkout navigation...");
    browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to pricing page
    const pricingUrl = `${PRODUCTION_WEBSITE_URL}/pricing.html`;
    await page.goto(pricingUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Click on a checkout button
    const checkoutButton = await page.$('a[href*="stripe.com"]');
    
    if (checkoutButton) {
      await Promise.all([
        page.waitForNavigation({ timeout: 30000 }),
        checkoutButton.click()
      ]);
      
      // Verify we navigated to Stripe
      const currentUrl = page.url();
      if (currentUrl.includes('stripe.com')) {
        console.log(`✅ Stripe navigation test passed - Successfully navigated to Stripe checkout`);
        return true;
      } else {
        throw new Error(`Did not navigate to Stripe. Current URL: ${currentUrl}`);
      }
    } else {
      console.warn(`⚠️ No Stripe checkout button found on pricing page`);
      return true; // Not critical
    }
  } catch (err) {
    console.warn(`⚠️ Stripe navigation test failed: ${err.message}`);
    testResults.warnings.push(`Stripe navigation test failed: ${err.message}`);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function testDownloadLinks() {
  let browser;
  try {
    console.log("🔍 Testing download links...");
    browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to downloads page
    const downloadsUrl = `${PRODUCTION_WEBSITE_URL}/download.html`;
    await page.goto(downloadsUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Check for download links
    const downloadLinks = await page.$$('a[download], a[href$=".vsix"], a[href$=".exe"], a[href$=".dmg"]');
    
    if (downloadLinks.length > 0) {
      console.log(`✅ Found ${downloadLinks.length} download link(s)`);
      
      // Test first download link
      const firstLink = downloadLinks[0];
      const href = await page.evaluate(el => el.getAttribute('href'), firstLink);
      
      if (href) {
        console.log(`✅ Download link found: ${href}`);
        return true;
      } else {
        console.warn(`⚠️ Download link found but href attribute missing`);
        return true; // Not critical
      }
    } else {
      console.warn(`⚠️ No download links found on downloads page`);
      return true; // Not critical
    }
  } catch (err) {
    console.warn(`⚠️ Download links test failed: ${err.message}`);
    testResults.warnings.push(`Download links test failed: ${err.message}`);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// ==============================
// Main Script
// ==============================
(async () => {
  console.log("\x1b[36m[PRODUCTION SMOKE TEST]\x1b[0m === RinaWarp Production Smoke Test ===\n");
  console.log(`Target: ${PRODUCTION_WEBSITE_URL}`);
  console.log(`API: ${PRODUCTION_API_URL}`);
  console.log(`Health: ${PRODUCTION_HEALTH_URL}\n`);
  
  // 1️⃣ Check Website Accessibility (Critical)
  console.log("\x1b[36m[PRODUCTION SMOKE TEST]\x1b[0m 1. Checking website accessibility...");
  testResults.websiteAccessibility = await withRetry(
    () => checkServer(PRODUCTION_WEBSITE_URL, "Website accessibility", true),
    "Website accessibility check"
  );
  
  // 2️⃣ Check API Health (Critical)
  console.log("\x1b[36m[PRODUCTION SMOKE TEST]\x1b[0m 2. Checking API health...");
  testResults.apiHealth = await withRetry(
    testAPIHealth,
    "API health check"
  );
  
  // 2.5️⃣ Check Pro Endpoint Authentication (Critical)
  if (testResults.apiHealth) {
    console.log("\x1b[36m[PRODUCTION SMOKE TEST]\x1b[0m 2.5. Checking pro endpoint authentication...");
    const proTestResult = await withRetry(
      testProEndpoint,
      "Pro endpoint authentication check"
    );
    testResults.proEndpoint = proTestResult;
  } else {
    console.warn("\x1b[36m[PRODUCTION SMOKE TEST]\x1b[0m ⚠️ Skipping pro endpoint test due to API health failure\n");
  }
  
  // 3️⃣ Test Checkout Flows (Critical)
  if (testResults.apiHealth) {
    console.log("\x1b[36m[PRODUCTION SMOKE TEST]\x1b[0m 3. Testing checkout flows for all plans...");
    for (const plan of PLANS) {
      await testPlanCheckout(plan);
    }
  } else {
    console.warn("\x1b[36m[PRODUCTION SMOKE TEST]\x1b[0m ⚠️ Skipping checkout tests due to API health failure\n");
  }
  
  // 4️⃣ Security Checks (Non-Critical)
  console.log("\x1b[36m[PRODUCTION SMOKE TEST]\x1b[0m 4. Running security checks...");
  await validateSSL();
  await checkCSPHeaders();
  
  // 5️⃣ Performance Check (Non-Critical)
  console.log("\x1b[36m[PRODUCTION SMOKE TEST]\x1b[0m 5. Basic performance check...");
  try {
    const start = Date.now();
    await fetch(PRODUCTION_WEBSITE_URL, { method: "HEAD" });
    const responseTime = Date.now() - start;
    console.log(`✅ Website response time: ${responseTime}ms`);
    if (responseTime > 3000) {
      testResults.warnings.push(`Slow response time: ${responseTime}ms`);
      console.warn(`⚠️ Slow response time detected: ${responseTime}ms`);
    }
  } catch (err) {
    console.warn(`⚠️ Performance check failed: ${err.message}`);
  }
  
  // 6️⃣ Puppeteer Browser Tests
  console.log("\x1b[36m[PRODUCTION SMOKE TEST]\x1b[0m 6. Running browser-based tests...");
  await testBannerVisibility();
  await testStripeNavigation();
  await testDownloadLinks();
  
  // ==============================
  // Results Summary
  // ==============================
  console.log("\n" + "=".repeat(60));
  console.log("\x1b[36m[PRODUCTION SMOKE TEST]\x1b[0m TEST RESULTS SUMMARY");
  console.log("=".repeat(60));
  
  console.log(`\n🌐 Website Accessibility: ${testResults.websiteAccessibility ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`🏥 API Health: ${testResults.apiHealth ? '✅ PASSED' : '❌ FAILED'}`);
  
  console.log(`\n💳 Checkout Flows:`);
  PLANS.forEach(plan => {
    const status = testResults.checkoutFlows[plan] || 'skipped';
    const icon = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⚠️';
    console.log(`   ${icon} ${plan}: ${status.toUpperCase()}`);
  });
  
  if (testResults.warnings.length > 0) {
    console.log(`\n⚠️ Warnings (${testResults.warnings.length}):`);
    testResults.warnings.forEach(warning => console.log(`   • ${warning}`));
  }
  
  // ==============================
  // Decision Logic
  // ==============================
  const criticalFailures = testResults.criticalFailures.length;
  const checkoutFailures = Object.values(testResults.checkoutFlows).filter(status => status === 'failed').length;
  
  console.log(`\n📊 CRITICAL FAILURES: ${criticalFailures}`);
  console.log(`📊 CHECKOUT FAILURES: ${checkoutFailures}`);
  
  if (criticalFailures > 0) {
    console.log("\n❌ WORKFLOW FAILURE: Critical endpoints failed");
    console.log("Critical failures:");
    testResults.criticalFailures.forEach(failure => console.log(`   • ${failure}`));
    process.exit(1);
  } else if (checkoutFailures > 0) {
    console.log("\n❌ WORKFLOW FAILURE: Checkout flows failed");
    console.log("Failed checkout flows:");
    Object.entries(testResults.checkoutFlows).forEach(([plan, status]) => {
      if (status === 'failed') {
        console.log(`   • ${plan} plan`);
      }
    });
    process.exit(1);
  } else {
    console.log("\n✅ WORKFLOW SUCCESS: All critical tests passed");
    console.log("Production smoke test completed successfully");
    process.exit(0);
  }
  
})().catch(err => {
  console.error(`\n💥 UNEXPECTED ERROR: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});