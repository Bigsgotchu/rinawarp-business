#!/usr/bin/env node

/**
 * Phase 1: Project Analysis
 * Validates project structure and identifies key components
 */

import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const requiredFiles = [
    'package.json',
    'backend/api-gateway/server.js',
    'backend/billing-service/server.js',
    'backend/licensing-service/server.js',
    'backend/auth-service/server.js'
];

const requiredDirectories = [
    'backend',
    'backend/api-gateway',
    'backend/billing-service',
    'backend/licensing-service',
    'backend/auth-service',
    'assets',
    'config'
];

console.log('🔍 RinaWarp: Phase 1 – Project Analysis');
console.log('=====================================\n');

// Check required files
console.log('📁 Checking required files...');
const missingFiles = [];
for (const file of requiredFiles) {
    const fullPath = path.join(projectRoot, file);
    if (fs.existsSync(fullPath)) {
        console.log(`  ✅ ${file}`);
    } else {
        console.log(`  ❌ ${file} - MISSING`);
        missingFiles.push(file);
    }
}

// Check required directories
console.log('\n📁 Checking required directories...');
const missingDirs = [];
for (const dir of requiredDirectories) {
    const fullPath = path.join(projectRoot, dir);
    if (fs.existsSync(fullPath)) {
        console.log(`  ✅ ${dir}`);
    } else {
        console.log(`  ❌ ${dir} - MISSING`);
        missingDirs.push(dir);
    }
}

// Analyze package.json
console.log('\n📦 Analyzing package.json...');
try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
    console.log(`  📋 Project: ${packageJson.name}`);
    console.log(`  📋 Version: ${packageJson.version}`);
    console.log(`  📋 Scripts: ${Object.keys(packageJson.scripts || {}).length} available`);
} catch (error) {
    console.log('  ❌ Could not parse package.json');
}

// Check for deployment files
console.log('\n🚀 Checking deployment configuration...');
const deploymentFiles = [
    '.github/workflows',
    'wrangler.toml',
    'deploy-pages.sh'
];

for (const file of deploymentFiles) {
    const fullPath = path.join(projectRoot, file);
    if (fs.existsSync(fullPath)) {
        console.log(`  ✅ ${file}`);
    } else {
        console.log(`  ⚠️  ${file} - Not found (may be optional)`);
    }
}

// Summary
console.log('\n📊 Analysis Summary');
console.log('==================');
if (missingFiles.length === 0 && missingDirs.length === 0) {
    console.log('✅ Project structure is complete');
    console.log('✅ All required components present');
    process.exit(0);
} else {
    console.log('❌ Project structure has issues:');
    if (missingFiles.length > 0) {
        console.log(`  - Missing files: ${missingFiles.join(', ')}`);
    }
    if (missingDirs.length > 0) {
        console.log(`  - Missing directories: ${missingDirs.join(', ')}`);
    }
    process.exit(1);
}
