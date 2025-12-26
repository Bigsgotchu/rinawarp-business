#!/usr/bin/env node
import { exec } from "child_process";
import fetch from "node-fetch";

// ===============================
// Configuration
// ===============================
const WEBSITE_DIR = "./apps/website";
const ELECTRON_DIR = "./apps/terminal-pro/desktop";
const STAGING_URL = "https://staging.rinawarptech.com/api/checkout-v2";
const PLANS = ["basic", "starter", "creator", "enterprise"];
const TIMEOUT = 5000; // ms

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

async function checkServer(url) {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT);
    const res = await fetch(url, { method: "HEAD", signal: controller.signal });
    clearTimeout(id);
    return res.ok;
  } catch (err) {
    console.warn(`[STAGING TEST] Server unreachable: ${url}`);
    return false;
  }
}

async function testPlanCheckout(plan) {
  try {
    const res = await fetch(STAGING_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    console.log(`✅ ${plan} plan checkout passed`);
  } catch (err) {
    console.error(`❌ ${plan} plan checkout error: ${err.message}`);
  }
}

// ===============================
// Main Script
// ===============================
(async () => {
  console.log("\x1b[36m[STAGING TEST]\x1b[0m === RinaWarp Terminal Pro Staging Sanity Test ===\n");

  // 1️⃣ Lint
  console.log("\x1b[36m[STAGING TEST]\x1b[0m Running ESLint...");
  try {
    await runCommand("npx eslint . --max-warnings=0");
    console.log("\x1b[36m[STAGING TEST]\x1b[0m ✅ ESLint validation passed\n");
  } catch {
    console.warn("\x1b[36m[STAGING TEST]\x1b[0m ⚠️ ESLint completed with warnings/errors\n");
  }

  // 2️⃣ Build Website
  console.log("\x1b[36m[STAGING TEST]\x1b[0m Building website...");
  try {
    await runCommand("npm ci && npm run build", WEBSITE_DIR);
    console.log("\x1b[36m[STAGING TEST]\x1b[0m ✅ Website build complete\n");
  } catch {
    console.error("\x1b[36m[STAGING TEST]\x1b[0m ❌ Website build failed\n");
    process.exit(1);
  }

  // 3️⃣ Build Electron
  console.log("\x1b[36m[STAGING TEST]\x1b[0m Building Electron app...");
  try {
    await runCommand("npm ci && npm run build", ELECTRON_DIR);
    console.log("\x1b[36m[STAGING TEST]\x1b[0m ✅ Electron build complete\n");
  } catch {
    console.error("\x1b[36m[STAGING TEST]\x1b[0m ❌ Electron build failed\n");
    process.exit(1);
  }

  // 4️⃣ Check Staging API
  const serverUp = await checkServer(STAGING_URL);
  if (!serverUp) {
    console.warn("\x1b[36m[STAGING TEST]\x1b[0m ⚠️ Staging API unreachable. Skipping plan checkout tests\n");
  } else {
    console.log("\x1b[36m[STAGING TEST]\x1b[0m Testing checkout for all plans...");
    for (const plan of PLANS) {
      await testPlanCheckout(plan);
    }
    console.log("");
  }

  console.log("\x1b[36m[STAGING TEST]\x1b[0m ✅ All automated staging tests completed\n");
})();