#!/usr/bin/env node
/**
 * Pricing Contract Verification Script
 *
 * Ensures pricing consistency across:
 * - Admin API (/api/pricing)
 * - Desktop application (PRICING_PLANS)
 * - Website (rinawarptech.com)
 *
 * Exit codes:
 * 0 - All checks passed
 * 1 - Contract mismatch detected / runtime failure
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

// Expected canonical pricing contract
const CANONICAL_PRICING = {
    monthly: [
        { id: "starter_monthly", name: "Starter", priceUsd: 29, interval: "month" },
        { id: "creator_monthly", name: "Creator", priceUsd: 69, interval: "month" },
        { id: "pro_monthly", name: "Pro", priceUsd: 99, interval: "month" },
    ],
    lifetime: [
        { id: "founder_lifetime", name: "Founder Lifetime", priceUsd: 699, interval: "lifetime" },
        { id: "pioneer_lifetime", name: "Pioneer Lifetime", priceUsd: 800, interval: "lifetime" },
        { id: "final_lifetime", name: "Final Lifetime", priceUsd: 999, interval: "lifetime" },
    ],
};

// Admin API candidate URLs in priority order - will try each until one passes contract validation
const ADMIN_API_CANDIDATES = [
    "https://api.rinawarptech.com/api/pricing", // Canonical API - priority 1
    "https://admin-api.rinawarptech.workers.dev/api/pricing", // Good fallback - priority 2
    "https://rinawarp-admin-api.rinawarptech.workers.dev/api/pricing", // Broken endpoint - last resort only
].filter(Boolean);

const ADMIN_API_URL = ADMIN_API_CANDIDATES[0]; // Keep for backward compatibility
const WEBSITE_PRICING_URL = process.env.WEBSITE_PRICING_URL || "https://rinawarptech.com/pricing";

// IMPORTANT: default path should match your repo layout
const DEFAULT_DESKTOP_PRICING_PATH = path.join(
    __dirname,
    "../src/shared/types/pricing.types.ts"
);
const DESKTOP_PRICING_PATH = process.env.DESKTOP_PRICING_PATH || DEFAULT_DESKTOP_PRICING_PATH;

function httpsGetFollow(url, { timeoutMs = 15000, maxRedirects = 5 } = {}) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, (res) => {
            const status = res.statusCode || 0;

            // Handle redirects
            if (status >= 300 && status < 400 && res.headers.location) {
                if (maxRedirects <= 0) {
                    reject(new Error(`Too many redirects fetching ${url}`));
                    return;
                }
                const nextUrl = new URL(res.headers.location, url).toString();
                res.resume();
                resolve(httpsGetFollow(nextUrl, { timeoutMs, maxRedirects: maxRedirects - 1 }));
                return;
            }

            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => resolve({ status, headers: res.headers, body: data }));
        });

        req.on("error", (err) => reject(new Error(`Request to ${url} failed: ${err.message}`)));
        req.setTimeout(timeoutMs, () => {
            req.destroy();
            reject(new Error(`Request to ${url} timed out after ${timeoutMs}ms`));
        });
    });
}

class PricingContractVerifier {
    constructor() {
        this.errors = [];
        this.warnings = [];
    }

    log(message, type = "info") {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
    }

    async fetchJson(url) {
        const res = await httpsGetFollow(url);
        if (res.status < 200 || res.status >= 300) {
            throw new Error(`Non-2xx from ${url}: ${res.status}`);
        }
        try {
            return JSON.parse(res.body);
        } catch (e) {
            throw new Error(`Failed to parse JSON from ${url}: ${e.message}`);
        }
    }

    async fetchText(url) {
        const res = await httpsGetFollow(url);
        if (res.status < 200 || res.status >= 300) {
            throw new Error(`Non-2xx from ${url}: ${res.status}`);
        }
        return res.body;
    }

    async fetchAdminAPI() {
        let lastErr = null;
        let validationErrors = [];

        for (const url of ADMIN_API_CANDIDATES) {
            try {
                this.log(`Trying Admin API: ${url}`);
                const json = await this.fetchJson(url);

                // Must have ok: true
                if (!json || json.ok !== true) {
                    const err = new Error(`Admin API responded but ok!=true at ${url}`);
                    validationErrors.push(`${url}: ${err.message}`);
                    lastErr = err;
                    continue;
                }

                // Must have required fields
                if (!Array.isArray(json.plans) || !Array.isArray(json.lifetime)) {
                    const err = new Error(`Missing required fields: plans[] and lifetime[] at ${url}`);
                    validationErrors.push(`${url}: ${err.message}`);
                    lastErr = err;
                    continue;
                }

                // Must have at least 3 lifetime plans (release-blocking check)
                if (json.lifetime.length === 0) {
                    const err = new Error(`RELEASE-BLOCKING: 0 lifetime plans at ${url}`);
                    validationErrors.push(`${url}: ${err.message}`);
                    lastErr = err;
                    continue;
                }

                // Check for correct field structure (new format)
                const hasStripeEnv = [...json.plans, ...json.lifetime].every(plan => plan.stripeEnv);
                const hasNewFields = json.plans.every(plan => plan.priceUsd && plan.interval) &&
                    json.lifetime.every(plan => plan.priceUsd && plan.interval);

                if (!hasStripeEnv || !hasNewFields) {
                    const err = new Error(`Old/broken contract format detected at ${url} - missing stripeEnv or new field structure`);
                    validationErrors.push(`${url}: ${err.message}`);
                    lastErr = err;
                    continue;
                }

                // If we get here, the contract is valid
                this.log(`✅ Valid pricing contract found at: ${url}`);
                this.log(`   - ${json.plans.length} monthly plans`);
                this.log(`   - ${json.lifetime.length} lifetime plans`);
                return json;

            } catch (e) {
                lastErr = e;
                validationErrors.push(`${url}: ${e.message}`);
                this.warnings.push(`Admin API attempt failed at ${url}: ${e.message}`);
            }
        }

        throw new Error(
            `Could not fetch VALID pricing from any Admin API candidate.\n` +
            `Tried (in priority order):\n- ${ADMIN_API_CANDIDATES.join("\n- ")}\n` +
            `Validation errors:\n- ${validationErrors.join("\n- ")}\n` +
            `Last error: ${lastErr?.message || "unknown"}`
        );
    }

    parseDesktopPricing() {
        try {
            if (!fs.existsSync(DESKTOP_PRICING_PATH)) {
                throw new Error(`Desktop pricing file not found at: ${DESKTOP_PRICING_PATH}`);
            }

            const content = fs.readFileSync(DESKTOP_PRICING_PATH, "utf8");

            const plansMatch = content.match(/export const PRICING_PLANS = \{([\s\S]*?)\} as const;/);
            if (!plansMatch) {
                throw new Error("Could not find PRICING_PLANS in desktop code");
            }

            const plans = {};
            const planRegex =
                /(\w+):\s*\{[\s\S]*?id:\s*['"]([^'"]+)['"][\s\S]*?name:\s*['"]([^'"]+)['"][\s\S]*?price:\s*(\d+)[\s\S]*?billing:\s*['"]([^'"]+)['"][\s\S]*?soldOut:\s*(true|false)/g;

            let match;
            while ((match = planRegex.exec(plansMatch[0])) !== null) {
                const [, planKey, id, name, price, billing, soldOut] = match;
                plans[planKey] = {
                    id,
                    name,
                    price: parseInt(price, 10),
                    billing,
                    soldOut: soldOut === "true",
                };
            }

            if (Object.keys(plans).length === 0) {
                throw new Error("Parsed 0 desktop plans — regex may not match pricing.types.ts structure. Check that pricing.types.ts contains fields: id, name, price, billing, soldOut");
            }

            return plans;
        } catch (error) {
            throw new Error(`Failed to parse desktop pricing: ${error.message}`);
        }
    }

    validateAdminAPI(apiData) {
        this.log("Validating Admin API response...");

        if (!apiData || apiData.ok !== true || !Array.isArray(apiData.plans) || !Array.isArray(apiData.lifetime)) {
            this.errors.push("Admin API missing required fields: ok=true, plans[], lifetime[]");
            return false;
        }

        // Hard fail if lifetime plans are missing (release-blocking)
        if (apiData.lifetime.length === 0) {
            this.errors.push("RELEASE-BLOCKING: Admin API returning 0 lifetime plans. Expected 3 canonical lifetime plans.");
            return false;
        }

        const monthlyPlans = apiData.plans;
        const expectedMonthly = CANONICAL_PRICING.monthly;

        if (monthlyPlans.length !== expectedMonthly.length) {
            this.errors.push(
                `Admin API monthly plans count mismatch: expected ${expectedMonthly.length}, got ${monthlyPlans.length}`
            );
        }

        for (const expected of expectedMonthly) {
            const found = monthlyPlans.find((p) => p.id === expected.id);
            if (!found) {
                this.errors.push(`Admin API missing monthly plan: ${expected.id}`);
                continue;
            }
            if (found.name !== expected.name) {
                this.errors.push(
                    `Admin API monthly plan name mismatch for ${expected.id}: expected "${expected.name}", got "${found.name}"`
                );
            }
            if (found.priceUsd !== expected.priceUsd) {
                this.errors.push(
                    `Admin API monthly plan price mismatch for ${expected.id}: expected ${expected.priceUsd}, got ${found.priceUsd}`
                );
            }
            if (found.interval !== expected.interval) {
                this.errors.push(
                    `Admin API monthly plan interval mismatch for ${expected.id}: expected "${expected.interval}", got "${found.interval}"`
                );
            }
            if (!found.stripeEnv) {
                this.errors.push(`RELEASE-BLOCKING: Admin API monthly plan missing stripeEnv field for ${expected.id}. Expected 'stripeEnv' but got: ${Object.keys(found).join(', ')}`);
            }
        }

        const lifetimePlans = apiData.lifetime;
        const expectedLifetime = CANONICAL_PRICING.lifetime;

        if (lifetimePlans.length !== expectedLifetime.length) {
            this.errors.push(
                `Admin API lifetime plans count mismatch: expected ${expectedLifetime.length}, got ${lifetimePlans.length}`
            );
        }

        for (const expected of expectedLifetime) {
            const found = lifetimePlans.find((p) => p.id === expected.id);
            if (!found) {
                this.errors.push(`Admin API missing lifetime plan: ${expected.id}`);
                continue;
            }
            if (found.name !== expected.name) {
                this.errors.push(
                    `Admin API lifetime plan name mismatch for ${expected.id}: expected "${expected.name}", got "${found.name}"`
                );
            }
            if (found.priceUsd !== expected.priceUsd) {
                this.errors.push(
                    `Admin API lifetime plan price mismatch for ${expected.id}: expected ${expected.priceUsd}, got ${found.priceUsd}`
                );
            }
            if (found.interval !== expected.interval) {
                this.errors.push(
                    `Admin API lifetime plan interval mismatch for ${expected.id}: expected "${expected.interval}", got "${found.interval}"`
                );
            }
            if (!found.stripeEnv) {
                this.errors.push(`RELEASE-BLOCKING: Admin API lifetime plan missing stripeEnv field for ${expected.id}. Expected 'stripeEnv' but got: ${Object.keys(found).join(', ')}`);
            }
        }

        return this.errors.length === 0;
    }

    validateDesktopPricing(desktopPlans) {
        this.log("Validating desktop pricing...");

        const allCanonical = [...CANONICAL_PRICING.monthly, ...CANONICAL_PRICING.lifetime];

        for (const canonical of allCanonical) {
            const found = Object.values(desktopPlans).find((p) => p.id === canonical.id);
            if (!found) {
                this.errors.push(`Desktop missing canonical plan: ${canonical.id}`);
                continue;
            }
            if (found.price !== canonical.priceUsd) {
                this.errors.push(
                    `Desktop plan ${canonical.id} price mismatch: expected ${canonical.priceUsd}, got ${found.price}`
                );
            }
        }

        return this.errors.length === 0;
    }

    validateConsistency(apiData, desktopPlans) {
        this.log("Validating consistency between Admin API and desktop...");

        const apiIds = [...apiData.plans.map((p) => p.id), ...apiData.lifetime.map((p) => p.id)];
        const desktopIds = Object.values(desktopPlans).map((p) => p.id);

        const apiOnly = apiIds.filter((id) => !desktopIds.includes(id));
        const desktopOnly = desktopIds.filter((id) => !apiIds.includes(id));

        if (apiOnly.length > 0) this.errors.push(`Admin API has plans not in desktop: ${apiOnly.join(", ")}`);
        if (desktopOnly.length > 0) this.errors.push(`Desktop has plans not in API: ${desktopOnly.join(", ")}`);

        return this.errors.length === 0;
    }

    validateWebsite(html) {
        this.log("Validating website pricing content...");

        // Basic checks: plan names appear
        const requiredNames = ["Starter", "Creator", "Pro", "Founder", "Pioneer", "Final"];
        for (const name of requiredNames) {
            if (!new RegExp(name, "i").test(html)) {
                this.errors.push(`Website missing plan name: ${name}`);
            }
        }

        // Price checks (make tolerant of whitespace / formatting)
        const requiredPricePatterns = [
            /\b29\b/i,
            /\b69\b/i,
            /\b99\b/i,
            /\b699\b/i,
            /\b800\b/i,
            /\b999\b/i,
        ];

        requiredPricePatterns.forEach((rx, idx) => {
            if (!rx.test(html)) {
                this.errors.push(`Website missing canonical price pattern #${idx + 1}: ${rx}`);
            }
        });

        // Additional tolerant checks for billing indicators
        if (!/month|mo\b|\/\s*month/i.test(html)) {
            this.warnings.push("Website: could not find a clear monthly indicator (month/mo).");
        }
        if (!/lifetime/i.test(html)) {
            this.warnings.push("Website: could not find the word 'lifetime'.");
        }

        return this.errors.length === 0;
    }

    async run() {
        this.log("Starting pricing contract verification...");

        try {
            this.log(`Fetching Admin API from candidates: ${ADMIN_API_CANDIDATES.join(', ')}`);
            const apiData = await this.fetchAdminAPI();
            this.log("Admin API data fetched successfully");

            this.log(`Parsing desktop pricing from: ${DESKTOP_PRICING_PATH}`);
            const desktopPlans = this.parseDesktopPricing();
            this.log(`Desktop pricing parsed successfully (${Object.keys(desktopPlans).length} plans)`);

            this.validateAdminAPI(apiData);
            this.validateDesktopPricing(desktopPlans);
            this.validateConsistency(apiData, desktopPlans);

            // Website verification
            this.log(`Fetching Website pricing page from: ${WEBSITE_PRICING_URL}`);
            const websiteHtml = await this.fetchText(WEBSITE_PRICING_URL);
            this.validateWebsite(websiteHtml);

            if (this.errors.length === 0) {
                this.log("✅ All pricing contract checks passed!", "success");
                this.log(`Admin API: ${apiData.plans.length} monthly, ${apiData.lifetime.length} lifetime plans`);
                this.log(`Desktop: ${Object.keys(desktopPlans).length} plans`);
                this.log(`Website: verified ${WEBSITE_PRICING_URL}`);
                return 0;
            }

            this.log("❌ Pricing contract validation failed!", "error");
            this.errors.forEach((e) => this.log(e, "error"));
            return 1;
        } catch (error) {
            this.log(`❌ Verification failed: ${error.message}`, "error");
            return 1;
        }
    }
}

if (require.main === module) {
    const verifier = new PricingContractVerifier();
    verifier.run().then((code) => process.exit(code));
}

module.exports = PricingContractVerifier;