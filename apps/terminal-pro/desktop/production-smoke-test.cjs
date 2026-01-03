#!/usr/bin/env node

/**
 * Production Smoke Test
 * Tests basic Electron app functionality without requiring full build
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Production Smoke Test...\n');

// Test 1: Check if main files exist
console.log('1️⃣ Checking required files...');
const requiredFiles = [
    'src/main.js',
    'src/preload.js',
    'src/renderer/index.html',
    'package.json'
];

let allFilesExist = true;
for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
        console.log(`   ✅ ${file} exists`);
    } else {
        console.log(`   ❌ ${file} missing`);
        allFilesExist = false;
    }
}

if (!allFilesExist) {
    console.error('\n❌ Smoke test failed: Missing required files');
    process.exit(1);
}

// Test 2: Check package.json structure
console.log('\n2️⃣ Checking package.json structure...');
try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    if (pkg.name && pkg.version && pkg.dependencies && pkg.dependencies.electron) {
        console.log(`   ✅ Package structure valid`);
        console.log(`   ✅ Electron version: ${pkg.dependencies.electron}`);
    } else {
        console.error('   ❌ Invalid package.json structure');
        process.exit(1);
    }
} catch (error) {
    console.error('   ❌ Failed to parse package.json:', error.message);
    process.exit(1);
}

// Test 3: Check Electron installation
console.log('\n3️⃣ Checking Electron installation...');
try {
    execSync('npx electron --version', { stdio: 'pipe' });
    console.log('   ✅ Electron is installed and accessible');
} catch (error) {
    console.error('   ❌ Electron not properly installed:', error.message);
    process.exit(1);
}

// Test 4: Check Node.js version compatibility
console.log('\n4️⃣ Checking Node.js version...');
const nodeVersion = process.versions.node;
const [major, minor] = nodeVersion.split('.').map(Number);

if (major >= 18) {
    console.log(`   ✅ Node.js version ${nodeVersion} is compatible`);
} else {
    console.error(`   ❌ Node.js version ${nodeVersion} is too old (need >= 18)`);
    process.exit(1);
}

// Test 5: Basic import test
console.log('\n5️⃣ Testing basic module imports...');
try {
    // Test if we can at least parse the main file
    const mainContent = fs.readFileSync('src/main.js', 'utf8');
    if (mainContent.includes('electron') && mainContent.includes('BrowserWindow')) {
        console.log('   ✅ Main file contains expected Electron imports');
    } else {
        console.error('   ❌ Main file missing expected Electron imports');
        process.exit(1);
    }
} catch (error) {
    console.error('   ❌ Failed to read main file:', error.message);
    process.exit(1);
}

console.log('\n✅ All smoke tests passed!');
console.log('\n📊 Test Summary:');
console.log('   • File structure: ✅');
console.log('   • Package configuration: ✅');
console.log('   • Electron installation: ✅');
console.log('   • Node.js compatibility: ✅');
console.log('   • Module imports: ✅');

process.exit(0);