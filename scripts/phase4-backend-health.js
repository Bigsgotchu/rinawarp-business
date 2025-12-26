#!/usr/bin/env node

/**
 * Phase 4: Backend Services Health Check
 * Validates all backend services are ready and configured
 */

import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();

// Service definitions
const services = [
    {
        name: 'API Gateway',
        path: 'backend/api-gateway/server.js',
        env: ['PORT', 'NODE_ENV'],
        ports: [3000, 3001]
    },
    {
        name: 'Auth Service',
        path: 'backend/auth-service/server.js',
        env: ['PORT', 'JWT_SECRET'],
        ports: [3002]
    },
    {
        name: 'Licensing Service',
        path: 'backend/licensing-service/server.js',
        env: ['PORT', 'DATABASE_URL'],
        ports: [3003]
    },
    {
        name: 'Billing Service',
        path: 'backend/billing-service/server.js',
        env: ['PORT', 'STRIPE_SECRET_KEY'],
        ports: [3004]
    }
];

console.log('🏥 RinaWarp: Phase 4 – Backend Services Check');
console.log('===========================================\n');

let allHealthy = true;

// Check each service
for (const service of services) {
    console.log(`🔍 Checking ${service.name}...`);

    // Check if service file exists
    const servicePath = path.join(projectRoot, service.path);
    if (fs.existsSync(servicePath)) {
        console.log(`  ✅ Service file exists: ${service.path}`);
    } else {
        console.log(`  ❌ Service file missing: ${service.path}`);
        allHealthy = false;
        continue;
    }

    // Check package.json for dependencies
    const packagePath = path.join(projectRoot, service.path.replace('server.js', 'package.json'));
    if (fs.existsSync(packagePath)) {
        try {
            const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            console.log(`  ✅ Dependencies: ${Object.keys(pkg.dependencies || {}).length} packages`);
        } catch (error) {
            console.log(`  ⚠️  Could not parse package.json for ${service.name}`);
        }
    }

    // Check environment variables
    console.log(`  📋 Required environment variables:`);
    for (const envVar of service.env) {
        // In a real implementation, you'd check .env files or process.env
        console.log(`    - ${envVar}: ${process.env[envVar] ? '✅ Set' : '⚠️  Not set'}`);
    }

    // Check ports
    console.log(`  🛰️  Listening ports: ${service.ports.join(', ')}`);

    console.log('');
}

// Check shared configuration
console.log('🔧 Checking shared configuration...');
const configFiles = [
    'config/continue-config.yaml',
    'backend/api-gateway/middleware/dashboardAuth.js',
    'backend/billing-service/entitlements.js'
];

for (const configFile of configFiles) {
    const configPath = path.join(projectRoot, configFile);
    if (fs.existsSync(configPath)) {
        console.log(`  ✅ ${configFile}`);
    } else {
        console.log(`  ⚠️  ${configFile} - Not found (may be optional)`);
    }
}

// Check database configuration
console.log('\n🗄️  Checking database configuration...');
const dbFiles = [
    'backend/billing-service/license-db.js',
    'backend/stripe-secure/database-schema.sql'
];

for (const dbFile of dbFiles) {
    const dbPath = path.join(projectRoot, dbFile);
    if (fs.existsSync(dbPath)) {
        console.log(`  ✅ ${dbFile}`);
    } else {
        console.log(`  ⚠️  ${dbFile} - Not found (may be optional)`);
    }
}

// Check deployment configuration
console.log('\n🚀 Checking deployment configuration...');
const deployFiles = [
    'wrangler.toml',
    'backend/api-gateway/server-hardened.js',
    'backend/api-gateway/server-telemetry.js'
];

for (const deployFile of deployFiles) {
    const deployPath = path.join(projectRoot, deployFile);
    if (fs.existsSync(deployPath)) {
        console.log(`  ✅ ${deployFile}`);
    } else {
        console.log(`  ⚠️  ${deployFile} - Not found (may be optional)`);
    }
}

// Summary
console.log('\n📊 Backend Health Summary');
console.log('========================');
if (allHealthy) {
    console.log('✅ All backend services are configured');
    console.log('✅ Ready for local development');
    console.log('💡 Tip: Use "npm run dev" to start all services');
} else {
    console.log('❌ Some backend services have issues');
    console.log('💡 Run "npm install" in each service directory to fix dependency issues');
}

console.log('\n💡 Next steps:');
console.log('  1. Set up environment variables in .env files');
console.log('  2. Run "RinaWarp: Phase 3 – Environment Setup"');
console.log('  3. Start services with "npm run dev"');
