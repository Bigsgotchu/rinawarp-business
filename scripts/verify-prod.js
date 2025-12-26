#!/usr/bin/env node

/**
 * Production Verification Script
 * Validates production environment before deployment
 */

import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();

console.log('🔒 RinaWarp: Production Verification');
console.log('====================================\n');

// Check production secrets
console.log('🔑 Checking production secrets...');
const requiredSecrets = [
    'STRIPE_SECRET_KEY',
    'DATABASE_URL',
    'JWT_SECRET',
    'CLOUDFLARE_API_TOKEN'
];

let secretsValid = true;
for (const secret of requiredSecrets) {
    if (process.env[secret]) {
        console.log(`  ✅ ${secret}: Set`);
    } else {
        console.log(`  ❌ ${secret}: Missing`);
        secretsValid = false;
    }
}

// Check production deployment files
console.log('\n📁 Checking production deployment files...');
const prodFiles = [
    'wrangler.toml',
    'deploy/deploy-prod.sh',
    'deploy/ship.sh'
];

for (const file of prodFiles) {
    const fullPath = path.join(projectRoot, file);
    if (fs.existsSync(fullPath)) {
        console.log(`  ✅ ${file}`);
    } else {
        console.log(`  ❌ ${file}: Missing`);
        secretsValid = false;
    }
}

// Check production configuration
console.log('\n⚙️  Checking production configuration...');
const prodConfig = [
    'backend/api-gateway/server-hardened.js',
    'backend/api-gateway/server-telemetry.js'
];

for (const config of prodConfig) {
    const fullPath = path.join(projectRoot, config);
    if (fs.existsSync(fullPath)) {
        console.log(`  ✅ ${config}`);
    } else {
        console.log(`  ⚠️  ${config}: Not found (may be optional)`);
    }
}

// Summary
console.log('\n📊 Production Verification Summary');
console.log('==================================');
if (secretsValid) {
    console.log('✅ Production environment ready');
    console.log('✅ All required secrets present');
    console.log('✅ Deployment scripts available');
    process.exit(0);
} else {
    console.log('❌ Production environment has issues');
    console.log('💡 Set missing secrets before deploying');
    process.exit(1);
}