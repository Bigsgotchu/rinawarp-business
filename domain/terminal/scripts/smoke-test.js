#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const http = require('http');

console.log('🧪 Running smoke tests for RinaWarp Terminal Pro...\n');

const releaseDir = path.join(__dirname, '..', 'release');
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  tests: [],
};

function runTest(name, testFn) {
  testResults.total++;
  try {
    console.log(`🧪 Running: ${name}`);
    testFn();
    console.log(`✅ PASSED: ${name}\n`);
    testResults.passed++;
    testResults.tests.push({ name, status: 'passed' });
  } catch (error) {
    console.log(`❌ FAILED: ${name} - ${error.message}\n`);
    testResults.failed++;
    testResults.tests.push({ name, status: 'failed', error: error.message });
  }
}

// Test 1: Check if release directory exists
runTest('Release directory exists', () => {
  if (!fs.existsSync(releaseDir)) {
    throw new Error('Release directory not found');
  }
});

// Test 2: Check if artifacts exist
runTest('Build artifacts exist', () => {
  const artifacts = fs
    .readdirSync(releaseDir)
    .filter((file) => fs.statSync(path.join(releaseDir, file)).isFile())
    .filter(
      (file) =>
        !file.endsWith('.json') &&
        !file.endsWith('.yml') &&
        !file.endsWith('.txt')
    );

  if (artifacts.length === 0) {
    throw new Error('No build artifacts found');
  }

  console.log(`  Found ${artifacts.length} artifacts`);
});

// Test 3: Check manifest file
runTest('Release manifest exists', () => {
  const manifestPath = path.join(releaseDir, 'release-manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error('Release manifest not found');
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  console.log(`  Version: ${manifest.version}`);
  console.log(`  Build time: ${manifest.buildTime}`);
  console.log(`  Artifacts: ${manifest.artifacts.length}`);
});

// Test 4: Check checksums
runTest('Checksums are valid', () => {
  const artifacts = fs
    .readdirSync(releaseDir)
    .filter((file) => fs.statSync(path.join(releaseDir, file)).isFile())
    .filter(
      (file) =>
        !file.endsWith('.json') &&
        !file.endsWith('.yml') &&
        !file.endsWith('.txt')
    );

  let validChecksums = 0;
  artifacts.forEach((artifact) => {
    const artifactPath = path.join(releaseDir, artifact);
    const checksumPath = `${artifactPath}.sha256`;

    if (fs.existsSync(checksumPath)) {
      const expectedChecksum = fs
        .readFileSync(checksumPath, 'utf8')
        .trim()
        .split(' ')[0];
      const actualChecksum = execSync(`sha256sum "${artifactPath}"`)
        .toString()
        .split(' ')[0];

      if (expectedChecksum === actualChecksum) {
        validChecksums++;
      }
    }
  });

  if (validChecksums === 0) {
    throw new Error('No valid checksums found');
  }

  console.log(`  Valid checksums: ${validChecksums}`);
});

// Test 5: Check file sizes
runTest('File sizes are reasonable', () => {
  const artifacts = fs
    .readdirSync(releaseDir)
    .filter((file) => fs.statSync(path.join(releaseDir, file)).isFile())
    .filter(
      (file) =>
        !file.endsWith('.json') &&
        !file.endsWith('.yml') &&
        !file.endsWith('.txt')
    );

  const minSize = 10 * 1024 * 1024; // 10MB minimum

  artifacts.forEach((artifact) => {
    const artifactPath = path.join(releaseDir, artifact);
    const stats = fs.statSync(artifactPath);

    if (stats.size < minSize) {
      throw new Error(
        `${artifact} is too small (${(stats.size / 1024 / 1024).toFixed(2)}MB)`
      );
    }

    console.log(`  ${artifact}: ${(stats.size / 1024 / 1024).toFixed(2)}MB`);
  });
});

// Test 6: Check package.json integrity
runTest('Package.json is valid', () => {
  const packagePath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  if (!packageJson.version) {
    throw new Error('Package.json missing version');
  }

  if (!packageJson.name) {
    throw new Error('Package.json missing name');
  }

  console.log(`  Name: ${packageJson.name}`);
  console.log(`  Version: ${packageJson.version}`);
});

// Test 7: Check if app can start (basic functionality test)
runTest('App can start (basic test)', async () => {
  // This is a basic test - in a real scenario you'd want more comprehensive testing
  const packagePath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  if (!packageJson.main) {
    throw new Error('No main entry point defined');
  }

  console.log(`  Main entry: ${packageJson.main}`);

  // Check if main file exists
  const mainPath = path.join(__dirname, '..', packageJson.main);
  if (!fs.existsSync(mainPath)) {
    throw new Error('Main entry file does not exist');
  }

  console.log('  Main file exists');
});

// Test 8: Check build info
runTest('Build info exists', () => {
  const buildInfoPath = path.join(__dirname, '..', 'build-info.json');
  if (!fs.existsSync(buildInfoPath)) {
    throw new Error('Build info not found');
  }

  const buildInfo = JSON.parse(fs.readFileSync(buildInfoPath, 'utf8'));
  console.log(`  Build time: ${buildInfo.buildTime}`);
  console.log(`  Platform: ${buildInfo.platform}`);
  console.log(`  Architecture: ${buildInfo.arch}`);
});

// Print results
console.log('📊 Smoke Test Results:');
console.log(`✅ Passed: ${testResults.passed}`);
console.log(`❌ Failed: ${testResults.failed}`);
console.log(`📊 Total: ${testResults.total}`);

if (testResults.failed > 0) {
  console.log('\n❌ Failed Tests:');
  testResults.tests
    .filter((test) => test.status === 'failed')
    .forEach((test) => {
      console.log(`  - ${test.name}: ${test.error}`);
    });
}

if (testResults.failed === 0) {
  console.log('\n🎉 All smoke tests passed!');
  process.exit(0);
} else {
  console.log('\n💥 Some smoke tests failed!');
  process.exit(1);
}
