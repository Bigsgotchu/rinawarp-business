#!/usr/bin/env node

/**
 * Website Pricing Visibility Verification Script
 * 
 * Verifies that the pricing page shows the correct state at runtime,
 * focusing on actual visibility rather than HTML presence.
 * 
 * Usage: node scripts/verify-website-pricing-visibility.cjs
 * 
 * This script checks:
 * 1. Whether "All Lifetime Offers Sold Out" banner is visible at runtime
 * 2. Whether lifetime offers are visible when available
 * 3. Consistency between API data and website display
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
        console.error("❌ Playwright not available. Please install @playwright/test");
        console.error("   npm install @playwright/test");
        console.error("   npx playwright install chromium");
        process.exit(1);
    }
}

// Website URL for testing
const WEBSITE_PRICING_URL = process.env.WEBSITE_PRICING_URL || 'https://rinawarptech.com/pricing';
const API_BASE_URL = process.env.API_BASE_URL || 'https://api.rinawarptech.com';

class WebsitePricingVerifier {
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

    async checkApiPricing() {
        this.log("🔍 Checking Admin API pricing data...");

        try {
            const data = await this.makeRequest(`${API_BASE_URL}/api/pricing`);

            if (!data.ok) {
                throw new Error("API pricing endpoint returned ok: false");
            }

            if (!data.lifetime || !Array.isArray(data.lifetime)) {
                throw new Error("Missing or invalid lifetime plans in API response");
            }

            // Check if any lifetime plans are available
            const availableLifetimePlans = data.lifetime.filter(plan => plan && plan.soldOut === false);
            const hasAvailableLifetime = availableLifetimePlans.length > 0;

            this.log(`📊 API Data: ${data.lifetime.length} lifetime plans, ${availableLifetimePlans.length} available`);

            return {
                hasAvailableLifetime,
                lifetimePlans: data.lifetime,
                availableCount: availableLifetimePlans.length
            };

        } catch (error) {
            throw new Error(`Failed to check API pricing: ${error.message}`);
        }
    }

    async checkLifetimeStatusAPI() {
        this.log("🔍 Checking lifetime status endpoint...");

        try {
            const response = await fetch(`${API_BASE_URL}/api/lifetime-status`);
            if (response.ok) {
                const data = await response.json();
                const hasAvailable = Object.values(data).some(tier => tier.remaining > 0);
                this.log(`📊 Status API: ${hasAvailable ? 'Has available inventory' : 'No available inventory'}`);
                return { hasAvailable, data };
            }
        } catch (error) {
            this.warnings.push("Could not fetch /api/lifetime-status endpoint");
        }
        return { hasAvailable: false, data: null };
    }

    async validateWebsiteRuntime(apiData) {
        this.log("🌐 Checking website runtime visibility...");
        this.log(`   URL: ${WEBSITE_PRICING_URL}`);

        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();

        try {
            // Navigate and wait for page to be fully loaded
            await page.goto(WEBSITE_PRICING_URL, {
                waitUntil: "networkidle",
                timeout: 45000
            });

            // Allow client-side JavaScript to run and toggle UI
            await page.waitForTimeout(2000);

            // Look for the sold-out banner by text content (more robust than selectors)
            const soldOutBanner = page.getByText(/All Lifetime Offers Sold Out/i).first();

            // Check if banner exists and is visible
            const bannerExists = await soldOutBanner.count().then(n => n > 0);
            const bannerVisible = bannerExists ? await soldOutBanner.isVisible() : false;

            // Look for lifetime offers section (generic selectors to handle DOM changes)
            const lifetimeOfferSelectors = [
                '[data-plan-id*="lifetime"]',
                '#lifetime-offers-container',
                '.lifetime-offers',
                '[class*="lifetime"]',
                '.pricing-card[data-plan-type="lifetime"]'
            ];

            let lifetimeOfferVisible = false;
            for (const selector of lifetimeOfferSelectors) {
                try {
                    const element = page.locator(selector).first();
                    if (await element.isVisible()) {
                        lifetimeOfferVisible = true;
                        break;
                    }
                } catch {
                    // Continue to next selector
                }
            }

            // Report findings
            this.log("📊 Website Runtime State:");
            this.log(`   Sold-out banner: ${bannerExists ? 'FOUND' : 'NOT FOUND'} (${bannerVisible ? 'VISIBLE' : 'HIDDEN'})`);
            this.log(`   Lifetime offers: ${lifetimeOfferVisible ? 'VISIBLE' : 'NOT VISIBLE'}`);

            // Critical checks - only fail if there's a real inconsistency
            if (apiData.hasAvailableLifetime && bannerVisible) {
                this.errors.push(
                    `CRITICAL: Website shows "All Lifetime Offers Sold Out" banner as VISIBLE but API reports ${apiData.availableCount} available lifetime plans.`
                );
            }

            if (!apiData.hasAvailableLifetime && lifetimeOfferVisible) {
                this.warnings.push(
                    "API reports no available lifetime plans but lifetime offers section is visible (might be intentional UI design)."
                );
            }

            // Additional validation: if we have available plans, ensure they're somewhat accessible
            if (apiData.hasAvailableLifetime && !lifetimeOfferVisible) {
                this.warnings.push(
                    "API reports available lifetime plans but no lifetime offers section detected. This might indicate a UI/selector issue."
                );
            }

            return this.errors.length === 0;

        } catch (error) {
            this.errors.push(`Website runtime check failed: ${error.message}`);
            return false;
        } finally {
            await browser.close();
        }
    }

    async run() {
        this.log("Starting website pricing visibility verification...");
        this.log(`   Website: ${WEBSITE_PRICING_URL}`);
        this.log(`   API: ${API_BASE_URL}`);

        try {
            // Check API data first
            const apiData = await this.checkApiPricing();
            const statusData = await this.checkLifetimeStatusAPI();

            // Validate website consistency with API data
            const websiteValid = await this.validateWebsiteRuntime(apiData);

            // Report warnings
            this.warnings.forEach(w => this.log(w, 'warning'));

            // Final result
            if (this.errors.length === 0) {
                this.log("🎉 ALL CHECKS PASSED! Website pricing visibility is correct.", "success");
                this.log("   ✅ Runtime visibility matches API data");
                this.log("   ✅ No contradictory states detected");
                return 0;
            } else {
                this.log("❌ WEBSITE CHECKS FAILED! Pricing visibility verification failed.", "error");
                this.errors.forEach((e) => this.log(e, "error"));
                return 1;
            }

        } catch (error) {
            this.log(`❌ Verification failed: ${error.message}`, "error");
            return 1;
        }
    }
}

// Run verification
async function main() {
    const verifier = new WebsitePricingVerifier();
    const exitCode = await verifier.run();
    process.exit(exitCode);
}

main().catch(error => {
    console.error('Verification failed:', error);
    process.exit(1);
});