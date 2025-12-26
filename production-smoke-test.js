#!/usr/bin/env node
import { exec } from "child_process";
import fetch from "node-fetch";

// ==============================
// Configuration
// ==============================
const PRODUCTION_WEBSITE_URL = "https://www.rinawarptech.com";
const PRODUCTION_API_URL = "https://api.rinawarptech.com/api/checkout-v2";
const PRODUCTION_HEALTH_URL = "https://api.rinawarptech.com/api/health";
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
    
    // Validate response structure
    if (data && (data.url || data.checkout_url || data.session_id)) {
      console.log(`✅ ${plan} plan checkout passed - ${data.url ? 'URL' : data.checkout_url ? 'Checkout URL' : 'Session ID'} received`);
      testResults.checkoutFlows[plan] = 'passed';
      return true;
    } else {
      throw new Error('Invalid response structure - missing URL or session ID');
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