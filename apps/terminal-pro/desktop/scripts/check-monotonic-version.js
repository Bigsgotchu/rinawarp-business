#!/usr/bin/env node

/**
 * Monotonic version check for RinaWarp Terminal Pro
 * Prevents promoting versions older than what's already advertised in stable feeds
 * Guards against downgrade attacks
 */

const execa = require('execa');
const { readFileSync } = require('fs');
const { resolve } = require('path');

// Read version from package.json
const packageJson = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf8'));
const version = process.env.VERSION || packageJson.version || '0.4.0';

/**
 * Parse semantic version string
 */
function parseVersion(versionStr) {
  const match = versionStr.match(/^v?(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
  if (!match) {
    throw new Error(`Invalid version format: ${versionStr}`);
  }

  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4] || null,
  };
}

/**
 * Compare two semantic versions
 * Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
function compareVersions(v1, v2) {
  const parsed1 = parseVersion(v1);
  const parsed2 = parseVersion(v2);

  // Compare major
  if (parsed1.major !== parsed2.major) {
    return parsed1.major > parsed2.major ? 1 : -1;
  }

  // Compare minor
  if (parsed1.minor !== parsed2.minor) {
    return parsed1.minor > parsed2.minor ? 1 : -1;
  }

  // Compare patch
  if (parsed1.patch !== parsed2.patch) {
    return parsed1.patch > parsed2.patch ? 1 : -1;
  }

  // Handle prerelease versions
  // Release versions (no prerelease) are considered newer than prerelease
  if (!parsed1.prerelease && parsed2.prerelease) return 1;
  if (parsed1.prerelease && !parsed2.prerelease) return -1;

  // Both are prerelease - lexicographic comparison
  if (parsed1.prerelease && parsed2.prerelease) {
    if (parsed1.prerelease === parsed2.prerelease) return 0;
    return parsed1.prerelease > parsed2.prerelease ? 1 : -1;
  }

  return 0; // Equal
}

/**
 * Extract version from YAML feed content
 */
function extractVersionFromFeed(content) {
  // Try various YAML version field patterns
  const patterns = [
    /version:\s*["']?([^"'\s]+)["']?/g,
    /version:\s*(\S+)/g,
    /["']version["']:\s*["']?([^"'\s]+)["']?/g,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      const version = match[1] || match[2];
      if (version && /^v?\d+\.\d+\.\d+/.test(version)) {
        return version.replace(/^v/, '');
      }
    }
  }

  return null;
}

/**
 * Fetch and parse current stable version
 */
async function getCurrentStableVersion(feedName, base) {
  const url = `${base}/${feedName}`;

  try {
    const { stdout } = await execa('curl', ['-4fsSL', url], { timeout: 30000 });
    const extractedVersion = extractVersionFromFeed(stdout);

    if (!extractedVersion) {
      throw new Error(`Could not extract version from ${feedName}`);
    }

    return extractedVersion;
  } catch (error) {
    // If feed doesn't exist yet, that's OK for first deployment
    if (error.code === 22 || error.message.includes('404')) {
      console.log(`  📝 ${feedName} not found - first deployment`);
      return null;
    }
    throw error;
  }
}

/**
 * Main version check runner
 */
async function run() {
  const ORIGIN = process.env.UPDATES_ORIGIN || 'https://updates.rinawarp.dev';
  const base = `${ORIGIN}/stable`;

  try {
    console.log(`🔍 Checking monotonic version for ${version}`);
    console.log(`🔍 Using origin: ${ORIGIN}`);

    // Check both feed files
    for (const feed of ['latest.yml', 'latest-mac.yml']) {
      const currentVersion = await getCurrentStableVersion(feed, base);

      if (currentVersion) {
        console.log(`  Current ${feed} version: ${currentVersion}`);
        console.log(`  Attempting to promote: ${version}`);

        const comparison = compareVersions(version, currentVersion);

        if (comparison < 0) {
          throw new Error(
            `Version ${version} is older than current ${feed} version ${currentVersion}. ` +
              `Downgrade attacks are not allowed.`,
          );
        } else if (comparison === 0) {
          console.log(`  ⚠️  Version ${version} is same as current ${feed} version`);
          console.log(`  This might indicate a re-deployment attempt`);
        } else {
          console.log(`  ✅ Version ${version} is newer than current ${feed} version`);
        }
      } else {
        console.log(`  📝 No existing version in ${feed} - allowing first deployment`);
      }
    }

    console.log('✅ Monotonic version check passed');
  } catch (error) {
    console.error(`❌ Monotonic version check failed: ${error.message}`);
    throw error;
  }
}

// CLI interface
if (require.main === module) {
  run().catch(console.error);
}

module.exports = {
  run,
  compareVersions,
  parseVersion,
  extractVersionFromFeed,
  getCurrentStableVersion,
};
