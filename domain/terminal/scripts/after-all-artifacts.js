#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log(
  '🎯 Running final artifact processing for RinaWarp Terminal Pro...'
);

const releaseDir = path.join(__dirname, '..', 'release');

if (!fs.existsSync(releaseDir)) {
  console.log('❌ No release directory found');
  process.exit(1);
}

// Generate release manifest
const artifacts = fs
  .readdirSync(releaseDir)
  .filter((file) => fs.statSync(path.join(releaseDir, file)).isFile())
  .map((file) => {
    const filePath = path.join(releaseDir, file);
    const stats = fs.statSync(filePath);

    return {
      name: file,
      size: stats.size,
      path: filePath,
      checksum: generateChecksum(filePath),
      platform: detectPlatform(file),
      type: detectArtifactType(file),
    };
  });

const releaseManifest = {
  version: require('../package.json').version,
  buildTime: new Date().toISOString(),
  artifacts: artifacts,
  totalSize: artifacts.reduce((sum, artifact) => sum + artifact.size, 0),
  platforms: [...new Set(artifacts.map((a) => a.platform))],
  buildInfo: require('../build-info.json'),
};

// Save release manifest
fs.writeFileSync(
  path.join(releaseDir, 'release-manifest.json'),
  JSON.stringify(releaseManifest, null, 2)
);

console.log(`📦 Generated release manifest with ${artifacts.length} artifacts`);

// Create latest.yml for auto-updates
if (artifacts.length > 0) {
  const latestConfig = {
    version: releaseManifest.version,
    releaseDate: releaseManifest.buildTime,
    github: {
      owner: 'rinawarptech',
      repo: 'terminal-pro',
    },
    files: artifacts.map((artifact) => ({
      url: `${artifact.name}`,
      sha512: artifact.checksum,
      size: artifact.size,
    })),
  };

  fs.writeFileSync(
    path.join(releaseDir, 'latest.yml'),
    JSON.stringify(latestConfig, null, 2)
  );

  console.log('🔄 Generated auto-update configuration');
}

// Create installation instructions
const installInstructions = generateInstallInstructions(artifacts);
fs.writeFileSync(
  path.join(releaseDir, 'INSTALLATION-GUIDE.txt'),
  installInstructions
);

console.log('📋 Generated installation guide');
console.log('✅ Final artifact processing complete');

function generateChecksum(filePath) {
  try {
    return execSync(`sha256sum "${filePath}"`).toString().split(' ')[0];
  } catch (error) {
    return 'checksum-unavailable';
  }
}

function detectPlatform(filename) {
  if (filename.includes('.dmg')) return 'macos';
  if (filename.includes('.exe') || filename.includes('.msi')) return 'windows';
  if (
    filename.includes('.AppImage') ||
    filename.includes('.deb') ||
    filename.includes('.rpm')
  )
    return 'linux';
  return 'unknown';
}

function detectArtifactType(filename) {
  if (filename.includes('.dmg')) return 'installer';
  if (filename.includes('.exe') || filename.includes('.msi'))
    return 'installer';
  if (filename.includes('.AppImage')) return 'portable';
  if (filename.includes('.deb') || filename.includes('.rpm')) return 'package';
  return 'archive';
}

function generateInstallInstructions(artifacts) {
  let instructions = 'RinaWarp Terminal Pro Installation Guide\n';
  instructions += '=====================================\n\n';

  const platforms = {
    macos: artifacts.filter((a) => a.platform === 'macos'),
    windows: artifacts.filter((a) => a.platform === 'windows'),
    linux: artifacts.filter((a) => a.platform === 'linux'),
  };

  Object.entries(platforms).forEach(([platform, platformArtifacts]) => {
    if (platformArtifacts.length > 0) {
      instructions += `${platform.toUpperCase()}:\n`;
      platformArtifacts.forEach((artifact) => {
        instructions += `  - ${artifact.name} (${Math.round(artifact.size / 1024 / 1024)} MB)\n`;
      });
      instructions += '\n';
    }
  });

  instructions += 'For detailed installation instructions, visit:\n';
  instructions += 'https://rinawarptech.com/docs/installation\n';

  return instructions;
}
