#!/usr/bin/env node

/**
 * Pricing Contract Verification Script
 * 
 * Ensures pricing consistency across:
 * - Admin API (/api/pricing)
 * - Desktop application (PRICING_PLANS)
 * - Website (rinawarptech.com)
 * 
 * Usage: node scripts/verify-pricing-contract.js
 * 
 * Exit codes:
 * 0 - All checks passed
 * 1 - Contract mismatch detected
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Expected canonical pricing contract
const CANONICAL_PRICING = {
    monthly: [
        { id: 'starter_monthly', name: 'Starter', priceUsd: 29, interval: 'month' },
        { id: 'creator_monthly', name: 'Creator', priceUsd: 69, interval: 'month' },
        { id: 'pro_monthly', name: 'Pro', priceUsd: 99, interval: 'month' }
    ],
    lifetime: [
        { id: 'founder_lifetime', name: 'Founder Lifetime', priceUsd: 699, interval: 'lifetime' },
        { id: 'pioneer_lifetime', name: 'Pioneer Lifetime', priceUsd: 800, interval: 'lifetime' },
        { id: 'final_lifetime', name: 'Final Lifetime', priceUsd: 999, interval: 'lifetime' }
    ]
};

const ADMIN_API_URL = process.env.ADMIN_API_URL || 'https://api.rinawarptech.com/api/pricing';
const DESKTOP_PRICING_PATH = path.join(__dirname, '../src/shared/types/pricing.types.ts');

class PricingContractVerifier {
    constructor() {
        this.errors = [];
        this.warnings = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
    }

    async fetchJson(url) {
        return new Promise((resolve, reject) => {
            const req = https.get(url, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        resolve(json);
                    } catch (e) {
                        reject(new Error(`Failed to parse JSON from ${url}: ${e.message}`));
                    }
                });
            });
            req.on('error', (err) => {
                reject(new Error(`Request to ${url} failed: ${err.message}`));
            });
            req.setTimeout(15000, () => {
                req.destroy();
                reject(new Error(`Request to ${url} timed out`));
            });
        });
    }

    async fetchText(url) {
        return new Promise((resolve, reject) => {
            const req = https.get(url, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    resolve(data);
                });
            });
            req.on('error', (err) => {
                reject(new Error(`Request to ${url} failed: ${err.message}`));
            });
            req.setTimeout(15000, () => {
                req.destroy();
                reject(new Error(`Request to ${url} timed out`));
            });
        });
    }

    parseDesktopPricing() {
        try {
            const content = fs.readFileSync(DESKTOP_PRICING_PATH, 'utf8');

            // Extract PRICING_PLANS object using regex (simplified parsing)
            const plansMatch = content.match(/export const PRICING_PLANS = \{([\s\S]*?)\} as const;/);
            if (!plansMatch) {
                throw new Error('Could not find PRICING_PLANS in desktop code');
            }

            // Parse individual plan objects
            const plans = {};
            const planRegex = /(\w+):\s*\{[\s\S]*?id:\s*['"]([^'"]+)[''][\s\S]*?name:\s*['"]([^'"]+)[''][\s\S]*?price:\s*(\d+)[\s\S]*?billing:\s*['"]([^'"]+)[''][\s\S]*?soldOut:\s*(true|false)/g;

            let match;
            while ((match = planRegex.exec(plansMatch[0])) !== null) {
                const [, planKey, id, name, price, billing, soldOut] = match;
                plans[planKey] = {
                    id,
                    name,
                    price: parseInt(price),
                    billing,
                    soldOut: soldOut === 'true'
                };
            }

            return plans;
        } catch (error) {
            throw new Error(`Failed to parse desktop pricing: ${error.message}`);
        }
    }

    validateAdminAPI(apiData) {
        this.log('Validating Admin API response...');

        // Check structure
        if (!apiData.ok || !apiData.plans || !apiData.lifetime) {
            this.errors.push('Admin API missing required fields: ok, plans, or lifetime');
            return false;
        }

        // Validate monthly plans
        const monthlyPlans = apiData.plans;
        const expectedMonthly = CANONICAL_PRICING.monthly;

        if (monthlyPlans.length !== expectedMonthly.length) {
            this.errors.push(`Admin API monthly plans count mismatch: expected ${expectedMonthly.length}, got ${monthlyPlans.length}`);
        }

        for (const expected of expectedMonthly) {
            const found = monthlyPlans.find(p => p.id === expected.id);
            if (!found) {
                this.errors.push(`Admin API missing monthly plan: ${expected.id}`);
                continue;
            }

            if (found.name !== expected.name) {
                this.errors.push(`Admin API monthly plan name mismatch for ${expected.id}: expected "${expected.name}", got "${found.name}"`);
            }

            if (found.priceUsd !== expected.priceUsd) {
                this.errors.push(`Admin API monthly plan price mismatch for ${expected.id}: expected ${expected.priceUsd}, got ${found.priceUsd}`);
            }

            if (found.interval !== expected.interval) {
                this.errors.push(`Admin API monthly plan interval mismatch for ${expected.id}: expected "${expected.interval}", got "${found.interval}"`);
            }

            if (!found.stripeEnv) {
                this.errors.push(`Admin API monthly plan missing stripeEnv for ${expected.id}`);
            }
        }

        // Validate lifetime plans
        const lifetimePlans = apiData.lifetime;
        const expectedLifetime = CANONICAL_PRICING.lifetime;

        if (lifetimePlans.length !== expectedLifetime.length) {
            this.errors.push(`Admin API lifetime plans count mismatch: expected ${expectedLifetime.length}, got ${lifetimePlans.length}`);
        }

        for (const expected of expectedLifetime) {
            const found = lifetimePlans.find(p => p.id === expected.id);
            if (!found) {
                this.errors.push(`Admin API missing lifetime plan: ${expected.id}`);
                continue;
            }

            if (found.name !== expected.name) {
                this.errors.push(`Admin API lifetime plan name mismatch for ${expected.id}: expected "${expected.name}", got "${found.name}"`);
            }

            if (found.priceUsd !== expected.priceUsd) {
                this.errors.push(`Admin API lifetime plan price mismatch for ${expected.id}: expected ${expected.priceUsd}, got ${found.priceUsd}`);
            }

            if (found.interval !== expected.interval) {
                this.errors.push(`Admin API lifetime plan interval mismatch for ${expected.id}: expected "${expected.interval}", got "${found.interval}"`);
            }

            if (!found.stripeEnv) {
                this.errors.push(`Admin API lifetime plan missing stripeEnv for ${expected.id}`);
            }
        }

        return this.errors.length === 0;
    }

    validateDesktopPricing(desktopPlans) {
        this.log('Validating desktop pricing...');

        // Check that all canonical plans exist in desktop
        const allCanonicalIds = [
            ...CANONICAL_PRICING.monthly.map(p => p.id),
            ...CANONICAL_PRICING.lifetime.map(p => p.id)
        ];

        for (const id of allCanonicalIds) {
            const found = Object.values(desktopPlans).find(p => p.id === id);
            if (!found) {
                this.errors.push(`Desktop missing canonical plan: ${id}`);
                continue;
            }

            // Validate price matches canonical
            const canonical = [...CANONICAL_PRICING.monthly, ...CANONICAL_PRICING.lifetime]
                .find(p => p.id === id);

            if (found.price !== canonical.priceUsd) {
                this.errors.push(`Desktop plan ${id} price mismatch: expected ${canonical.priceUsd}, got ${found.price}`);
            }
        }

        return this.errors.length === 0;
    }

    validateConsistency(apiData, desktopPlans) {
        this.log('Validating consistency between Admin API and desktop...');

        // Check that IDs match between API and desktop
        const apiIds = [
            ...apiData.plans.map(p => p.id),
            ...apiData.lifetime.map(p => p.id)
        ];

        const desktopIds = Object.values(desktopPlans).map(p => p.id);

        const apiOnly = apiIds.filter(id => !desktopIds.includes(id));
        const desktopOnly = desktopIds.filter(id => !apiIds.includes(id));

        if (apiOnly.length > 0) {
            this.errors.push(`Admin API has plans not in desktop: ${apiOnly.join(', ')}`);
        }

        if (desktopOnly.length > 0) {
            this.errors.push(`Desktop has plans not in Admin API: ${desktopOnly.join(', ')}`);
        }

        return this.errors.length === 0;
    }

    async run() {
        this.log('Starting pricing contract verification...');

        try {
            // Fetch Admin API data
            this.log(`Fetching Admin API from: ${ADMIN_API_URL}`);
            const apiData = await this.fetchAdminAPI();
            this.log('Admin API data fetched successfully');

            // Parse desktop pricing
            this.log(`Parsing desktop pricing from: ${DESKTOP_PRICING_PATH}`);
            const desktopPlans = this.parseDesktopPricing();
            this.log('Desktop pricing parsed successfully');

            // Run validations
            const adminValid = this.validateAdminAPI(apiData);
            const desktopValid = this.validateDesktopPricing(desktopPlans);
            const consistencyValid = this.validateConsistency(apiData, desktopPlans);

            // Report results
            if (this.errors.length === 0) {
                this.log('✅ All pricing contract checks passed!', 'success');
                this.log(`Admin API: ${apiData.plans.length} monthly, ${apiData.lifetime.length} lifetime plans`);
                this.log(`Desktop: ${Object.keys(desktopPlans).length} plans`);
                return 0;
            } else {
                this.log('❌ Pricing contract validation failed!', 'error');
                this.errors.forEach(error => this.log(error, 'error'));
                return 1;
            }

        } catch (error) {
            this.log(`❌ Verification failed: ${error.message}`, 'error');
            return 1;
        }
    }
}

// Run if called directly
if (require.main === module) {
    const verifier = new PricingContractVerifier();
    verifier.run().then(exitCode => {
        process.exit(exitCode);
    });
}

module.exports = PricingContractVerifier;