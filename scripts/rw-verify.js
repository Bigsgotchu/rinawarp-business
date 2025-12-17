#!/usr/bin/env node

// RinaWarp Post-Deploy Verification CLI
// Version 1.0

import fetch from "node-fetch";
import chalk from "chalk";
import {execSync} from "child_process";

// CONFIG -------------------------
const WEBSITE_URL = "https://rinawarptech.com";
const ADMIN_LOGIN_URL = "https://api.rinawarptech.com/admin/auth/login";
const ADMIN_USERS_URL = "https://api.rinawarptech.com/admin/users";

const TEST_ADMIN_EMAIL = process.env.RW_ADMIN_EMAIL;
const TEST_ADMIN_PASSWORD = process.env.RW_ADMIN_PASSWORD;

if (!TEST_ADMIN_EMAIL || !TEST_ADMIN_PASSWORD) {
  console.log(chalk.red("❌ Missing RW_ADMIN_EMAIL or RW_ADMIN_PASSWORD env vars"));
  process.exit(1);
}

// Helper to print sections
function header(title) {
  console.log(chalk.cyan("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
  console.log(chalk.cyan(`🔍 ${title}`));
  console.log(chalk.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
}

// Helper to fail script
function fatal(message) {
  console.log(chalk.red(`❌ ${message}`));
  process.exit(1);
}

// MAIN ---------------------------

(async () => {
  // 1. Check Website Online
  header("Checking Website Availability");
  let html = "";

  try {
    const res = await fetch(WEBSITE_URL);
    html = await res.text();

    if (!res.ok) fatal(`Website returned status ${res.status}`);
    console.log(chalk.green(`✅ Website reachable (${res.status})`));
  } catch (err) {
    fatal("Website offline or unreachable.");
  }

  // 2. Check MIME Types
  header("Checking MIME Types");

  const mimeChecks = [
    { file: "/css/styles.css", expected: "text/css" },
    { file: "/js/main.js", expected: "application/javascript" }
  ];

  for (const check of mimeChecks) {
    const url = `${WEBSITE_URL}${check.file}`;
    try {
      const res = await fetch(url);

      const type = res.headers.get("content-type");
      if (!type) fatal(`Missing Content-Type for ${check.file}`);

      if (!type.includes(check.expected)) {
        fatal(
          `${check.file} served as ${type}, expected ${check.expected}`
        );
      }

      console.log(chalk.green(`✅ ${check.file} served as ${type}`));
    } catch (e) {
      fatal(`Failed to load ${check.file}`);
    }
  }

  // 3. Check GA4 script presence
  header("Checking GA4 Script");

  if (!html.includes("gtag(")) {
    fatal("GA4 script missing from homepage");
  }
  console.log(chalk.green("✅ GA4 script detected"));

  // 4. Test Admin Login
  header("Testing Admin Login");

  let token = "";

  try {
    const res = await fetch(ADMIN_LOGIN_URL, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        email: TEST_ADMIN_EMAIL,
        password: TEST_ADMIN_PASSWORD
      })
    });

    const json = await res.json();

    if (!json.token) fatal("Admin login failed — no token returned");

    token = json.token;
    console.log(chalk.green("✅ Admin login successful"));
  } catch (err) {
    fatal("Admin login request failed");
  }

  // 5. Test Protected Admin Endpoint
  header("Testing Protected Admin Endpoints");

  try {
    const res = await fetch(ADMIN_USERS_URL, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) fatal(`Admin users endpoint failed (${res.status})`);

    console.log(chalk.green("✅ Admin protected endpoint working"));
  } catch (e) {
    fatal("Admin users endpoint unreachable");
  }

  // 6. Check for service worker
  header("Checking Service Worker");

  if (html.includes("navigator.serviceWorker")) {
    fatal("Service worker code detected — should be removed");
  }
  console.log(chalk.green("✅ No service worker code found"));

  // Done
  header("All Checks Passed!");
  console.log(chalk.green("🎉 RinaWarp deploy is healthy and production-ready!"));
})();