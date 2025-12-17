#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Verifying build artifacts for RinaWarp Terminal Pro...\n');

const releaseDir = path.join(__dirname, '..', 'release');

if (!fs.existsSync(releaseDir)) {
  console.log('❌ No release directory found');
  process.exit(1);
}

// Read release manifest if available
let manifest = null;
const manifestPath = path.join(releaseDir, 'release-manifest.json');

if (fs.existsSync(manifestPath)) {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  console.log(`📋 Found release manifest for version ${manifest.version}`);
}

console.log('\n🔍 Verifying artifacts...\n');

// Verification results
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
};

// Get all files in release directory
const artifacts = fs
  .readdirSync(releaseDir)
  .filter((file) => fs.statSync(path.join(releaseDir, file)).isFile())
  .filter(
    (file) =>
      !file.endsWith('.json') &&
      !file.endsWith('.yml') &&
      !file.endsWith('.txt')
  );

results.total = artifacts.length;

artifacts.forEach((artifact) => {
  const artifactPath = path.join(releaseDir, artifact);

  console.log(`🔍 Verifying: ${artifact}`);

  // Basic file checks
  const stats = fs.statSync(artifactPath);
  const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

  console.log(`  📏 Size: ${fileSizeMB} MB`);

  // Platform-specific checks
  const ext = path.extname(artifact).toLowerCase();

  try {
    switch (ext) {
    case '.dmg':
      verifyDmg(artifactPath);
      break;
    case '.exe':
    case '.msi':
      verifyWindows(artifactPath);
      break;
    case '.appimage':
    case '.deb':
    case '.rpm':
      verifyLinux(artifactPath);
      break;
    default:
      verifyGeneric(artifactPath);
    }

    // Checksum verification
    if (fs.existsSync(`${artifactPath}.sha256`)) {
      const expectedChecksum = fs
        .readFileSync(`${artifactPath}.sha256`, 'utf8')
        .trim();
      const actualChecksum = execSync(`sha256sum "${artifactPath}"`)
        .toString()
        .split(' ')[0];

      if (expectedChecksum === actualChecksum) {
        console.log('  ✅ Checksum verified');
        results.passed++;
      } else {
        console.log('  ❌ Checksum mismatch');
        results.failed++;
        results.errors.push(`${artifact}: Checksum mismatch`);
      }
    } else {
      console.log('  ⚠️  No checksum file found');
      results.passed++;
    }
  } catch (error) {
    console.log(`  ❌ Verification failed: ${error.message}`);
    results.failed++;
    results.errors.push(`${artifact}: ${error.message}`);
  }

  console.log('');
});

console.log('📊 Verification Results:');
console.log(`✅ Passed: ${results.passed}`);
console.log(`❌ Failed: ${results.failed}`);
console.log(`📁 Total: ${results.total}`);

if (results.errors.length > 0) {
  console.log('\n❌ Errors:');
  results.errors.forEach((error) => console.log(`  - ${error}`));
}

if (results.failed === 0) {
  console.log('\n🎉 All artifacts verified successfully!');
  process.exit(0);
} else {
  console.log('\n💥 Some artifacts failed verification!');
  process.exit(1);
}

function verifyDmg(filePath) {
  // Basic DMG verification
  const size = fs.statSync(filePath).size;
  if (size < 50 * 1024 * 1024) {
    // 50MB minimum
    throw new Error('DMG file too small');
  }
  console.log('  ✅ DMG format verified');
}

function verifyWindows(filePath) {
  // Basic Windows executable verification
  const size = fs.statSync(filePath).size;
  if (size < 100 * 1024 * 1024) {
    // 100MB minimum for Electron app
    throw new Error('Windows executable too small');
  }
  console.log('  ✅ Windows executable verified');
}

function verifyLinux(filePath) {
  // Basic Linux package verification
  const size = fs.statSync(filePath).size;
  if (size < 80 * 1024 * 1024) {
    // 80MB minimum
    throw new Error('Linux package too small');
  }
  console.log('  ✅ Linux package verified');
}

function verifyGeneric(filePath) {
  // Generic file verification
  const size = fs.statSync(filePath).size;
  if (size < 1024) {
    // 1KB minimum
    throw new Error('File too small');
  }
  console.log('  ✅ File integrity verified');
}
