#!/usr/bin/env node
import { exec } from "child_process";
import fetch from "node-fetch";

// ===============================
// Configuration
// ===============================
const WEBSITE_DIR = "./apps/website";
const ELECTRON_DIR = "./apps/terminal-pro/desktop";
const PRODUCTION_API_URL = "https://api.rinawarptech.com/api/checkout-v2";
const PLANS = ["basic", "starter", "creator", "enterprise"];
const TIMEOUT = 5000; // ms
const STRICT_MODE = process.env.STRICT_MODE === 'true';

// ===============================
// Test Results Tracking
// ===============================
const testResults = {
  lint: null,
  websiteBuild: null,
  electronBuild: null,
  preDeployAPI: null,
  checkoutFlows: {},
  securityChecks: {},
  criticalFailures: [],
  warnings: []
};

// ===============================
// Helper Functions
// ===============================
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

async function testPlanCheckout(plan) {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT);
    const res = await fetch(PRODUCTION_API_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "User-Agent": "RinaWarp-Production-Test/1.0"
      },
      body: JSON.stringify({ 
        plan,
        test_mode: true,
        source: "production_pre_test"
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

async function validateSecurityHeaders() {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT);
    const res = await fetch(PRODUCTION_API_URL, { 
      method: "HEAD", 
      signal: controller.signal 
    });
    clearTimeout(id);
    
    const headers = res.headers;
    const securityChecks = {
      'x-content-type-options': headers.get('x-content-type-options'),
      'x-frame-options': headers.get('x-frame-options'),
      'x-xss-protection': headers.get('x-xss-protection'),
      'strict-transport-security': headers.get('strict-transport-security')
    };
    
    console.log("🔒 Security headers check:");
    Object.entries(securityChecks).forEach(([header, value]) => {
      if (value) {
        console.log(`   ✅ ${header}: ${value}`);
        testResults.securityChecks[header] = 'present';
      } else {
        console.log(`   ⚠️ ${header}: missing`);
        testResults.securityChecks[header] = 'missing';
        testResults.warnings.push(`Missing security header: ${header}`);
      }
    });
    
    return Object.values(securityChecks).every(value => value);
  } catch (err) {
    console.warn(`⚠️ Security headers check failed: ${err.message}`);
    return false;
  }
}

async function checkDependencies() {
  try {
    console.log("📦 Checking dependency vulnerabilities...");
    const result = await runCommand("npm audit --audit-level=moderate", WEBSITE_DIR);
    
    // Parse npm audit output for vulnerabilities
    const hasVulnerabilities = result.includes("vulnerabilities") && !result.includes("found 0 vulnerabilities");
    
    if (hasVulnerabilities) {
      console.warn("⚠️ Security vulnerabilities detected in dependencies");
      testResults.warnings.push("Security vulnerabilities detected in dependencies");
      return !STRICT_MODE; // Fail in strict mode, warn otherwise
    } else {
      console.log("✅ No critical vulnerabilities found");
      return true;
    }
  } catch (err) {
    console.warn(`⚠️ Dependency check failed: ${err.message}`);
    return false;
  }
}

// ===============================
// Main Script
// ===============================
(async () => {
  console.log("\x1b[36m[PRODUCTION TEST]\x1b[0m === RinaWarp Terminal Pro Production Pre-Deploy Test ===\n");
  console.log(`STRICT MODE: ${STRICT_MODE ? 'ENABLED' : 'DISABLED'}`);
  console.log(`PRODUCTION API: ${PRODUCTION_API_URL}\n`);

  // 1️⃣ Lint with Strict Mode
  console.log("\x1b[36m[PRODUCTION TEST]\x1b[0m 1. Running ESLint with strict mode...");
  try {
    await runCommand("npx eslint . --max-warnings=0 --max-errors=0", WEBSITE_DIR);
    console.log("\x1b[36m[PRODUCTION TEST]\x1b[0m ✅ ESLint validation passed\n");
    testResults.lint = 'passed';
  } catch (err) {
    const errorMsg = `ESLint validation failed: ${err.message}`;
    testResults.lint = 'failed';
    testResults.criticalFailures.push(errorMsg);
    console.error(`❌ CRITICAL: ${errorMsg}`);
    
    if (STRICT_MODE) {
      console.log("\n🚨 STRICT MODE: Failing pipeline due to lint errors");
      process.exit(1);
    } else {
      console.warn("⚠️ Continuing with warnings (non-strict mode)");
    }
  }

  // 2️⃣ Build Website
  console.log("\x1b[36m[PRODUCTION TEST]\x1b[0m 2. Building website for production...");
  try {
    await runCommand("npm ci && npm run build:static", WEBSITE_DIR);
    console.log("\x1b[36m[PRODUCTION TEST]\x1b[0m ✅ Website build complete\n");
    testResults.websiteBuild = 'passed';
  } catch (err) {
    const errorMsg = `Website build failed: ${err.message}`;
    testResults.websiteBuild = 'failed';
    testResults.criticalFailures.push(errorMsg);
    console.error(`❌ CRITICAL: ${errorMsg}`);
    process.exit(1);
  }

  // 3️⃣ Build Electron
  console.log("\x1b[36m[PRODUCTION TEST]\x1b[0m 3. Building Electron app for production...");
  try {
    await runCommand("npm ci && npm run build", ELECTRON_DIR);
    console.log("\x1b[36m[PRODUCTION TEST]\x1b[0m ✅ Electron build complete\n");
    testResults.electronBuild = 'passed';
  } catch (err) {
    const errorMsg = `Electron build failed: ${err.message}`;
    testResults.electronBuild = 'failed';
    testResults.criticalFailures.push(errorMsg);
    console.error(`❌ CRITICAL: ${errorMsg}`);
    process.exit(1);
  }

  // 4️⃣ Pre-Deploy API Health Check
  console.log("\x1b[36m[PRODUCTION TEST]\x1b[0m 4. Checking production API health...");
  testResults.preDeployAPI = await checkServer(PRODUCTION_API_URL, "Production API health", true);

  // 5️⃣ Test Checkout Flows
  if (testResults.preDeployAPI) {
    console.log("\x1b[36m[PRODUCTION TEST]\x1b[0m 5. Testing checkout flows for all plans...");
    for (const plan of PLANS) {
      await testPlanCheckout(plan);
    }
  } else {
    console.warn("\x1b[36m[PRODUCTION TEST]\x1b[0m ⚠️ Skipping checkout tests due to API health failure\n");
  }

  // 6️⃣ Security Checks
  console.log("\x1b[36m[PRODUCTION TEST]\x1b[0m 6. Running security checks...");
  await validateSecurityHeaders();
  await checkDependencies();

  // ==============================
  // Results Summary
  // ==============================
  console.log("\n" + "=".repeat(60));
  console.log("\x1b[36m[PRODUCTION TEST]\x1b[0m PRE-DEPLOY TEST RESULTS SUMMARY");
  console.log("=".repeat(60));

  console.log(`\n🔍 Lint: ${testResults.lint || 'skipped'}`);
  console.log(`🏗️ Website Build: ${testResults.websiteBuild || 'failed'}`);
  console.log(`🖥️ Electron Build: ${testResults.electronBuild || 'failed'}`);
  console.log(`🏥 API Health: ${testResults.preDeployAPI ? '✅ PASSED' : '❌ FAILED'}`);
  
  console.log(`\n💳 Checkout Flows:`);
  PLANS.forEach(plan => {
    const status = testResults.checkoutFlows[plan] || 'skipped';
    const icon = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⚠️';
    console.log(`   ${icon} ${plan}: ${status.toUpperCase()}`);
  });

  console.log(`\n🔒 Security Checks:`);
  Object.entries(testResults.securityChecks).forEach(([header, status]) => {
    const icon = status === 'present' ? '✅' : '❌';
    console.log(`   ${icon} ${header}: ${status}`);
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
  const buildFailures = [testResults.websiteBuild, testResults.electronBuild].filter(status => status === 'failed').length;
  
  console.log(`\n📊 CRITICAL FAILURES: ${criticalFailures}`);
  console.log(`📊 CHECKOUT FAILURES: ${checkoutFailures}`);
  console.log(`📊 BUILD FAILURES: ${buildFailures}`);

  if (criticalFailures > 0) {
    console.log("\n❌ WORKFLOW FAILURE: Critical pre-deployment checks failed");
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
  } else if (buildFailures > 0) {
    console.log("\n❌ WORKFLOW FAILURE: Build failures detected");
    process.exit(1);
  } else {
    console.log("\n✅ WORKFLOW SUCCESS: All pre-deployment tests passed");
    console.log("Production deployment can proceed safely");
    process.exit(0);
  }

})().catch(err => {
  console.error(`\n💥 UNEXPECTED ERROR: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});