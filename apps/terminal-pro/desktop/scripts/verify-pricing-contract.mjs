#!/usr/bin/env node

/**
 * Pricing Contract Verification Script (Node.js Module)
 * 
 * Ensures pricing consistency across:
 * - Admin API (/api/pricing)
 * - Desktop application (PRICING_PLANS)
 * 
 * Usage: node scripts/verify-pricing-contract.mjs
 * 
 * Exit codes:
 * 0 - All checks passed
 * 1 - Contract mismatch detected
 * 2 - Missing environment variables
 */

import fs from "node:fs";
import path from "node:path";

const ADMIN_API_BASE_URL = process.env.ADMIN_API_BASE_URL;
if (!ADMIN_API_BASE_URL) {
    console.error("❌ Missing ADMIN_API_BASE_URL env var");
    process.exit(2);
}

function assert(condition, message) {
    if (!condition) {
        console.error("❌", message);
        process.exit(1);
    }
}

function normalizePlan(p) {
    return {
        id: p.id,
        name: p.name,
        interval: p.interval ?? p.billing ?? null,
        priceUsd: p.priceUsd ?? p.price ?? null,
        soldOut: Boolean(p.soldOut),
    };
}

// --- Load desktop source-of-truth ---
const desktopPricingPath = path.resolve("src/shared/types/pricing.types.ts");
assert(fs.existsSync(desktopPricingPath), `Desktop pricing file not found: ${desktopPricingPath}`);

const desktopText = fs.readFileSync(desktopPricingPath, "utf8");

// Expected canonical IDs
const expectedIds = [
    "starter_monthly",
    "creator_monthly",
    "pro_monthly",
    "founder_lifetime",
    "pioneer_lifetime",
    "final_lifetime",
];

for (const id of expectedIds) {
    assert(desktopText.includes(id), `Desktop pricing missing canonical id: ${id}`);
}

// --- Fetch Admin API pricing ---
const res = await fetch(`${ADMIN_API_BASE_URL.replace(/\/$/, "")}/pricing`);
assert(res.ok, `Admin API /pricing failed: ${res.status} ${res.statusText}`);
const json = await res.json();
assert(json && json.ok === true, "Admin API /pricing did not return ok: true");

const adminPlans = [
    ...(json.plans ?? []),
    ...(json.lifetime ?? []),
].map(normalizePlan);

const adminById = new Map(adminPlans.map((p) => [p.id, p]));

// --- Validate IDs exist ---
for (const id of expectedIds) {
    assert(adminById.has(id), `Admin API pricing missing id: ${id}`);
}

// --- Validate prices (hard lock) ---
const expectedPrice = new Map([
    ["starter_monthly", 29],
    ["creator_monthly", 69],
    ["pro_monthly", 99],
    ["founder_lifetime", 699],
    ["pioneer_lifetime", 800],
    ["final_lifetime", 999],
]);

for (const [id, price] of expectedPrice) {
    const p = adminById.get(id);
    assert(p.priceUsd === price, `Price mismatch for ${id}: expected ${price}, got ${p.priceUsd}`);
}

// --- Validate lifetime soldOut logic (tiered availability) ---
// Founder: first 200, Pioneer: next 200, Final: final 100
const founder = adminById.get("founder_lifetime");
const pioneer = adminById.get("pioneer_lifetime");
const final = adminById.get("final_lifetime");

// Pioneer should only be available if Founder is sold out
if (founder.soldOut === false && pioneer.soldOut === true) {
    assert(false, "Pioneer lifetime cannot be sold out while Founder is still available");
}

// Final should only be available if both Founder and Pioneer are sold out
if ((founder.soldOut === false || pioneer.soldOut === false) && final.soldOut === true) {
    assert(false, "Final lifetime cannot be sold out while Founder or Pioneer are still available");
}

// --- Validate intervals ---
const expectedInterval = new Map([
    ["starter_monthly", "month"],
    ["creator_monthly", "month"],
    ["pro_monthly", "month"],
    ["founder_lifetime", "lifetime"],
    ["pioneer_lifetime", "lifetime"],
    ["final_lifetime", "lifetime"],
]);

for (const [id, interval] of expectedInterval) {
    const p = adminById.get(id);
    assert(p.interval === interval, `Interval mismatch for ${id}: expected ${interval}, got ${p.interval}`);
}

console.log("✅ Pricing contract verified: desktop IDs exist + Admin API prices/intervals match");