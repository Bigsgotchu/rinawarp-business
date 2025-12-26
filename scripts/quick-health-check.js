#!/usr/bin/env node

/**
 * Quick Health Check
 * Fast validation of critical project components
 */

import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();

console.log('⚡ RinaWarp: Quick Health Check');
console.log('==============================\n');

// Quick checks
const checks = [
    {
        name: 'Package.json',
        path: 'package.json',
        validator: (content) => {
            const pkg = JSON.parse(content);
            return pkg.name && pkg.version;
        }
    },
    {
        name: 'API Gateway',
        path: 'backend/api-gateway/server.js',
        validator: (content) => content.includes('express') || content.includes('fastify')
    },
    {
        name: 'VS Code Tasks',
        path: '.vscode/tasks.json',
        validator: (content) => {
            const tasks = JSON.parse(content);
            return tasks.tasks && tasks.tasks.some(t => t.label?.includes('RinaWarp'));
        }
    },
    {
        name: 'Deployment Script',
        path: 'deploy-pages.sh',
        validator: (content) => content.includes('wrangler') || content.includes('cloudflare')
    }
];

let allPassed = true;

for (const check of checks) {
    const fullPath = path.join(projectRoot, check.path);
    if (fs.existsSync(fullPath)) {
        try {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (check.validator(content)) {
                console.log(`✅ ${check.name}`);
            } else {
                console.log(`❌ ${check.name} - Validation failed`);
                allPassed = false;
            }
        } catch (error) {
            console.log(`❌ ${check.name} - Error reading file`);
            allPassed = false;
        }
    } else {
        console.log(`❌ ${check.name} - File not found`);
        allPassed = false;
    }
}

// Check Node.js version
console.log('\n🔧 Environment Check...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion >= 18) {
    console.log(`✅ Node.js ${nodeVersion} (supported)`);
} else {
    console.log(`⚠️  Node.js ${nodeVersion} (recommended: 18+)`);
}

// Check npm/yarn
try {
    const packageLock = fs.existsSync(path.join(projectRoot, 'package-lock.json'));
    const yarnLock = fs.existsSync(path.join(projectRoot, 'yarn.lock'));
    if (packageLock) {
        console.log('✅ npm (package-lock.json found)');
    } else if (yarnLock) {
        console.log('✅ yarn (yarn.lock found)');
    } else {
        console.log('⚠️  No lock file found');
    }
} catch (error) {
    console.log('⚠️  Could not check package manager');
}

console.log('\n📊 Quick Health Summary');
console.log('======================');
if (allPassed) {
    console.log('✅ Project is ready for development');
    console.log('💡 Use "RinaWarp: Full Local Validation" for comprehensive checks');
} else {
    console.log('❌ Project has critical issues');
    console.log('💡 Use "RinaWarp: Phase 1 – Project Analysis" for detailed diagnostics');
}

console.log('\n🚀 Available Commands:');
console.log('  - RinaWarp: Quick Health Check (this command)');
console.log('  - RinaWarp: Full Local Validation');
console.log('  - RinaWarp: Phase 1 – Project Analysis');
