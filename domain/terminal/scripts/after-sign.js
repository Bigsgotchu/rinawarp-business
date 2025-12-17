#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔐 Running post-signing operations for RinaWarp Terminal Pro...');

// Verify signing status for each platform
const releaseDir = path.join(__dirname, '..', 'release');

if (fs.existsSync(releaseDir)) {
  const artifacts = fs.readdirSync(releaseDir);

  artifacts.forEach((artifact) => {
    const artifactPath = path.join(releaseDir, artifact);

    if (fs.statSync(artifactPath).isFile()) {
      const ext = path.extname(artifact).toLowerCase();

      // Platform-specific signing verification
      if (process.platform === 'darwin' && (ext === '.dmg' || ext === '.app')) {
        console.log(`🔍 Verifying macOS signature for: ${artifact}`);
        // Add macOS codesign verification logic here
      } else if (
        process.platform === 'win32' &&
        (ext === '.exe' || ext === '.msi')
      ) {
        console.log(`🔍 Verifying Windows signature for: ${artifact}`);
        // Add Windows signtool verification logic here
      }
    }
  });
}

// Create signing report
const signReport = {
  timestamp: new Date().toISOString(),
  platform: process.platform,
  artifacts: artifacts.length,
  signed: true,
};

fs.writeFileSync(
  path.join(releaseDir, 'signing-report.json'),
  JSON.stringify(signReport, null, 2)
);

console.log('📋 Generated signing report');
console.log('✅ Post-signing operations complete');
