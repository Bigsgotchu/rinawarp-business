import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CANONICAL = "backend/stripe-secure/webhook.js";

const WEBHOOK_CANDIDATES = [
  "backend/stripe-secure/webhook.js",
  "backend/billing-service/server.js",
  "backend/api-gateway/server.js",
  "apps/website/functions/api/stripe/webhook.js",
];

function read(rel) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p, "utf8");
}

function hasAny(s, needles) {
  return needles.some((n) => s.includes(n));
}

function banner(title) {
  console.log("\n============================================================");
  console.log(title);
  console.log("============================================================");
}

function pass(msg) { console.log(`✅ PASS ${msg}`); }
function fail(msg, detail) {
  console.log(`❌ FAIL ${msg}`);
  if (detail) console.log(`   ${detail}`);
  process.exitCode = 1;
}

console.log("🚀 Starting Stripe Webhook Security Audit (Canonical Only)...");

// --- Test 1: Canonical webhook exists
banner("🔍 Canonical Webhook Presence");
{
  const s = read(CANONICAL);
  if (!s) fail(`Canonical file missing: ${CANONICAL}`);
  else pass(`Canonical file found: ${CANONICAL}`);
}

// --- Test 2: No other files contain Stripe webhook verification
banner("🔍 No Duplicate Webhook Implementations");
for (const rel of WEBHOOK_CANDIDATES) {
  const s = read(rel);
  if (!s) continue;
  if (rel === CANONICAL) continue;

  // Disallow any Stripe webhook signature verification patterns outside canonical
  const bad = hasAny(s, [
    "stripe.webhooks.constructEvent",
    "constructEvent(",
    "STRIPE_WEBHOOK_SECRET",
    "stripe-signature",
    "express.raw({ type: \"application/json\"",
    "express.raw({type:\"application/json\"",
  ]);
  if (bad) {
    fail(`Duplicate webhook verification detected in ${rel}`, "Move webhook verification to backend/stripe-secure/webhook.js only.");
  } else {
    pass(`No webhook verification in ${rel}`);
  }
}

// --- Test 3: Canonical webhook MUST use express.raw + constructEvent
banner("🔍 Canonical Raw Body + Signature Verification");
{
  const s = read(CANONICAL) || "";
  const hasRaw = hasAny(s, ["express.raw({ type: \"application/json\" })", "express.raw({type:\"application/json\"})"]);
  const hasConstruct = hasAny(s, ["stripe.webhooks.constructEvent", "constructEvent("]);
  if (!hasRaw) fail("Canonical webhook missing express.raw({ type: 'application/json' })");
  else pass("Canonical webhook has express.raw");
  if (!hasConstruct) fail("Canonical webhook missing stripe.webhooks.constructEvent()");
  else pass("Canonical webhook verifies signature with constructEvent");
}

// --- Test 4: Environment config present (static check)
banner("🔍 Environment Configuration");
{
  const required = ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"];
  const s = read(CANONICAL) || "";
  for (const key of required) {
    if (!s.includes(key)) {
      fail(`Canonical webhook does not reference ${key}`, "Add a runtime guard that throws if missing.");
    } else {
      pass(`Canonical references ${key}`);
    }
  }
}

// --- Test 5: Subscription event handling present (static allowlist check)
banner("🔍 Subscription Event Handling");
{
  const s = read(CANONICAL) || "";
  const requiredTypes = [
    "checkout.session.completed",
    "invoice.paid",
    "invoice.payment_failed",
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
  ];
  let missing = [];
  for (const t of requiredTypes) {
    if (!s.includes(t)) missing.push(t);
  }
  if (missing.length) {
    fail("Canonical webhook missing subscription-related event handling", `Missing: ${missing.join(", ")}`);
  } else {
    pass("Canonical webhook includes subscription event handling strings");
  }
}

console.log("\n🎯 Audit Complete.");
if (!process.exitCode) {
  console.log("✅ Overall Result: 5/5 tests passed");
} else {
  console.log("⚠️  Fix failing tests before production deployment.");
}
