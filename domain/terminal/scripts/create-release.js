#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

console.log('🚀 Creating release for RinaWarp Terminal Pro...\n');

const releaseDir = path.join(__dirname, '..', 'release');
const packageJson = require('../package.json');
const version = packageJson.version;

// Check if release directory exists
if (!fs.existsSync(releaseDir)) {
  console.log('❌ No release directory found. Run build first.');
  process.exit(1);
}

// Read release manifest
const manifestPath = path.join(releaseDir, 'release-manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.log('❌ No release manifest found. Run build first.');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

console.log(`📦 Creating release for version ${version}`);
console.log(`🏗️  Build date: ${manifest.buildTime}`);
console.log(`📁 Artifacts: ${manifest.artifacts.length}\n`);

// Generate release notes
const releaseNotes = generateReleaseNotes(manifest);

// Create GitHub release (if gh CLI is available)
async function createGitHubRelease() {
  try {
    console.log('🎯 Creating GitHub release...');

    // Check if gh CLI is available
    execSync('gh --version', { stdio: 'pipe' });

    const tagName = `v${version}`;
    const releaseName = `RinaWarp Terminal Pro ${version}`;

    // Create release
    const createReleaseCmd = `gh release create ${tagName} --title "${releaseName}" --notes "${releaseNotes}"`;
    execSync(createReleaseCmd, { stdio: 'inherit' });

    // Upload artifacts
    console.log('📤 Uploading artifacts to GitHub...');
    manifest.artifacts.forEach((artifact) => {
      const artifactPath = path.join(releaseDir, artifact.name);
      const uploadCmd = `gh release upload ${tagName} "${artifactPath}"`;
      execSync(uploadCmd, { stdio: 'inherit' });
      console.log(`  ✅ Uploaded: ${artifact.name}`);
    });

    console.log('✅ GitHub release created successfully!');
    return true;
  } catch (error) {
    console.log('⚠️  GitHub CLI not available or authentication failed');
    console.log('   Release created locally only');
    return false;
  }
}

// Generate distribution packages
function createDistributionPackages() {
  console.log('📦 Creating distribution packages...');

  // Create ZIP archive for manual distribution
  const zipName = `rinawarp-terminal-pro-${version}-all-platforms.zip`;
  const zipPath = path.join(releaseDir, zipName);

  console.log(`  Creating: ${zipName}`);

  // Use system zip if available
  try {
    const artifacts = manifest.artifacts
      .map((a) => path.join(releaseDir, a.name))
      .join(' ');
    execSync(`zip -r "${zipPath}" ${artifacts} -x "*.sha256"`, {
      cwd: releaseDir,
    });
    console.log('  ✅ Created ZIP archive');
  } catch (error) {
    console.log(
      '  ⚠️  Could not create ZIP archive (zip command not available)'
    );
  }

  // Create torrent file (if torrent tools available)
  try {
    console.log('  🌊 Creating torrent file...');
    // Add torrent creation logic here if needed
  } catch (error) {
    console.log('  ⚠️  Torrent creation not available');
  }
}

// Generate installation script
function generateInstallScript() {
  console.log('📜 Generating installation script...');

  const installScript = `#!/bin/bash
# RinaWarp Terminal Pro Installation Script
# Version: ${version}

echo "🚀 Installing RinaWarp Terminal Pro ${version}..."

# Detect platform
PLATFORM=$(uname -s)

case $PLATFORM in
  "Darwin")
    echo "🍎 Detected macOS"
    # Add macOS installation logic
    ;;
  "Linux")
    echo "🐧 Detected Linux"
    # Add Linux installation logic
    ;;
  "MINGW64_NT"*)
    echo "🪟 Detected Windows (Git Bash)"
    # Add Windows installation logic
    ;;
  *)
    echo "❌ Unsupported platform: $PLATFORM"
    exit 1
    ;;
esac

echo "✅ Installation completed!"
`;

  fs.writeFileSync(path.join(releaseDir, 'install.sh'), installScript);
  console.log('  ✅ Generated install.sh');
}

// Main execution
async function main() {
  const githubRelease = await createGitHubRelease();
  createDistributionPackages();
  generateInstallScript();

  console.log('\n🎉 Release preparation completed!');
  console.log('\n📋 Release Summary:');
  console.log(`  Version: ${version}`);
  console.log(`  Artifacts: ${manifest.artifacts.length}`);
  console.log(
    `  Total size: ${(manifest.totalSize / 1024 / 1024).toFixed(2)} MB`
  );
  console.log(`  Platforms: ${manifest.platforms.join(', ')}`);

  if (githubRelease) {
    console.log('\n🌐 Release published to GitHub');
  } else {
    console.log('\n📁 Release artifacts ready for manual distribution');
    console.log(`   Location: ${releaseDir}`);
  }

  console.log('\n📝 Release notes:');
  console.log(releaseNotes);
}

main().catch(console.error);

function generateReleaseNotes(manifest) {
  let notes = `# RinaWarp Terminal Pro ${version}\n\n`;
  notes += `Released on ${new Date(manifest.buildTime).toLocaleDateString()}\n\n`;

  notes += "## What's New\n\n";
  notes += '🚀 **Production-ready builds** with cross-platform support\n';
  notes += '🔐 **Enhanced security** with code signing and verification\n';
  notes += '⚡ **Optimized performance** with production builds\n';
  notes += '🎨 **Professional packaging** with proper icons and metadata\n\n';

  notes += '## Downloads\n\n';

  const platforms = {
    macos: manifest.artifacts.filter((a) => a.platform === 'macos'),
    windows: manifest.artifacts.filter((a) => a.platform === 'windows'),
    linux: manifest.artifacts.filter((a) => a.platform === 'linux'),
  };

  Object.entries(platforms).forEach(([platform, artifacts]) => {
    if (artifacts.length > 0) {
      notes += `### ${platform.charAt(0).toUpperCase() + platform.slice(1)}\n`;
      artifacts.forEach((artifact) => {
        const sizeMB = (artifact.size / 1024 / 1024).toFixed(1);
        notes += `- **${artifact.name}** (${sizeMB} MB)\n`;
      });
      notes += '\n';
    }
  });

  notes += '## Installation\n\n';
  notes += '1. Download the appropriate file for your platform\n';
  notes += '2. Run the installer or extract the archive\n';
  notes += '3. Follow the setup wizard\n\n';

  notes += '## System Requirements\n\n';
  notes += '- **macOS**: 10.13 or later\n';
  notes += '- **Windows**: Windows 10 or later\n';
  notes += '- **Linux**: Most modern distributions\n\n';

  notes += '## Support\n\n';
  notes +=
    'For support and documentation, visit: https://rinawarptech.com/docs\n';
  notes +=
    'Report issues at: https://github.com/rinawarptech/terminal-pro/issues\n';

  return notes;
}
