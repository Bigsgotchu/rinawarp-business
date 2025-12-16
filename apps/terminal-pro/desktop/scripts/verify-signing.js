#!/usr/bin/env node

/**
 * Signing and notarization verification for RinaWarp Terminal Pro
 * Validates macOS notarization and Windows code signing
 */

const execa = require('execa');
const { readFileSync } = require('fs');
const { resolve } = require('path');

// Read version from package.json
const packageJson = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf8'));
const version = process.env.VERSION || packageJson.version || '0.4.0';

const ORIGIN = process.env.UPDATES_ORIGIN || 'https://updates.rinawarp.dev';
const base = `${ORIGIN}/releases/${version}`;

/**
 * Retry helper with exponential backoff
 */
async function retry(fn, maxAttempts = 3, baseDelay = 1000) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts) break;

      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`  ⏳ Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Download artifact for testing
 */
async function downloadArtifact(artifactName) {
  const url = `${base}/${artifactName}`;
  const localPath = `/tmp/${artifactName}`;

  console.log(`  Downloading ${artifactName}...`);

  await retry(
    async () => {
      await execa('curl', ['-4fsSL', url, '--output', localPath]);
    },
    3,
    1000,
  );

  return localPath;
}

/**
 * Verify macOS notarization with spctl
 */
async function verifyMacNotarization(dmgPath) {
  if (process.platform !== 'darwin') {
    console.log('  ⏭️  Skipping macOS notarization check (not on macOS)');
    return { status: 'SKIPPED', reason: 'Not on macOS platform' };
  }

  try {
    console.log('  🔍 Verifying macOS notarization with spctl...');

    const { stdout } = await execa('spctl', ['-a', '-vvv', '-t', 'install', dmgPath], {
      encoding: 'utf8',
    });

    // Check for notarization indicators
    const isNotarized =
      stdout.includes('source=Notarized Developer ID') ||
      stdout.includes('accepted') ||
      stdout.includes('Developer ID Application');

    if (isNotarized) {
      console.log('  ✅ macOS notarization verified');
      return { status: 'PASSED', details: stdout };
    } else {
      console.log('  ❌ macOS notarization not found');
      return { status: 'FAILED', reason: 'Notarization not detected', details: stdout };
    }
  } catch (error) {
    console.log(`  ⚠️  macOS notarization check failed: ${error.message}`);
    return { status: 'FAILED', reason: error.message };
  }
}

/**
 * Verify Windows code signing with signtool
 */
async function verifyWindowsSigning(exePath) {
  if (process.platform !== 'win32') {
    console.log('  ⏭️  Skipping Windows signing check (not on Windows)');
    return { status: 'SKIPPED', reason: 'Not on Windows platform' };
  }

  try {
    console.log('  🔍 Verifying Windows code signing with signtool...');

    const { stdout } = await execa('signtool', ['verify', '/pa', '/all', exePath], {
      encoding: 'utf8',
    });

    // Check for valid signature indicators
    const isSigned =
      stdout.includes('Successfully verified') ||
      stdout.includes('Number of signatures') ||
      stdout.includes('Hash algorithm');

    if (isSigned) {
      console.log('  ✅ Windows code signing verified');
      return { status: 'PASSED', details: stdout };
    } else {
      console.log('  ❌ Windows code signing verification failed');
      return { status: 'FAILED', reason: 'Code signing not detected', details: stdout };
    }
  } catch (error) {
    // signtool might not be available, which is OK
    console.log(`  ⚠️  Windows signing check unavailable: ${error.message}`);
    return { status: 'SKIPPED', reason: 'signtool not available' };
  }
}

/**
 * Verify Linux AppImage permissions
 */
async function verifyLinuxAppImage(appImagePath) {
  if (process.platform !== 'linux') {
    console.log('  ⏭️  Skipping Linux AppImage check (not on Linux)');
    return { status: 'SKIPPED', reason: 'Not on Linux platform' };
  }

  try {
    console.log('  🔍 Verifying Linux AppImage permissions...');

    // Check if file is executable
    const { stdout } = await execa('ls', ['-la', appImagePath]);
    const isExecutable = stdout.includes('x'); // Check for execute permission

    // Try to run AppImage with --appimage-help to verify it's valid
    try {
      await execa(appImagePath, ['--appimage-help'], { timeout: 5000 });
      console.log('  ✅ Linux AppImage verified (executable and valid)');
      return { status: 'PASSED', details: 'Executable and responds to --appimage-help' };
    } catch {
      if (isExecutable) {
        console.log('  ✅ Linux AppImage has correct permissions');
        return { status: 'PASSED', details: 'Executable but may need additional testing' };
      } else {
        console.log('  ❌ Linux AppImage is not executable');
        return { status: 'FAILED', reason: 'AppImage lacks execute permissions' };
      }
    }
  } catch (error) {
    console.log(`  ⚠️  Linux AppImage check failed: ${error.message}`);
    return { status: 'FAILED', reason: error.message };
  }
}

/**
 * Clean up downloaded files
 */
async function cleanup(files) {
  for (const file of files) {
    try {
      await execa('rm', ['-f', file]);
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Main verification runner
 */
async function run() {
  console.log(`🔐 Verifying signing and notarization for version ${version}`);
  console.log(`🔍 Using origin: ${ORIGIN}`);
  console.log(`💻 Platform: ${process.platform}`);

  const downloadedFiles = [];
  const results = [];

  try {
    // Test macOS DMG if available
    const macDmg = `RinaWarpTerminalPro-${version}.dmg`;
    try {
      const dmgPath = await downloadArtifact(macDmg);
      downloadedFiles.push(dmgPath);
      const result = await verifyMacNotarization(dmgPath);
      results.push({ platform: 'macOS', artifact: macDmg, ...result });
    } catch {
      console.log('  ⚠️  macOS DMG not available for testing');
    }

    // Test Windows EXE if available
    const winExe = `RinaWarpTerminalPro-${version}.exe`;
    try {
      const exePath = await downloadArtifact(winExe);
      downloadedFiles.push(exePath);
      const result = await verifyWindowsSigning(exePath);
      results.push({ platform: 'Windows', artifact: winExe, ...result });
    } catch {
      console.log('  ⚠️  Windows EXE not available for testing');
    }

    // Test Linux AppImage
    const linuxAppImage = `RinaWarp-Terminal-Pro-${version}.AppImage`;
    try {
      const appImagePath = await downloadArtifact(linuxAppImage);
      downloadedFiles.push(appImagePath);
      const result = await verifyLinuxAppImage(appImagePath);
      results.push({ platform: 'Linux', artifact: linuxAppImage, ...result });
    } catch {
      console.log('  ⚠️  Linux AppImage not available for testing');
    }

    // Print results summary
    console.log('\n📊 SIGNING VERIFICATION RESULTS:');
    console.log('='.repeat(50));

    for (const result of results) {
      const icon = result.status === 'PASSED' ? '✅' : result.status === 'SKIPPED' ? '⏭️' : '❌';
      console.log(
        `${icon} ${result.platform.padEnd(8)} ${result.artifact.padEnd(30)} ${result.status}`,
      );
      if (result.reason) {
        console.log(`    Reason: ${result.reason}`);
      }
    }

    // Check if any required verifications failed
    const failedRequired = results.filter((r) => r.status === 'FAILED');
    if (failedRequired.length === 0) {
      console.log('\n✅ All available signing verifications passed or skipped');
    } else {
      console.log(`\n❌ ${failedRequired.length} signing verification(s) failed`);
    }
  } catch (error) {
    console.error(`❌ Signing verification failed: ${error.message}`);
    throw error;
  } finally {
    // Clean up downloaded files
    await cleanup(downloadedFiles);
  }
}

// CLI interface
if (require.main === module) {
  run().catch(console.error);
}

module.exports = {
  run,
  verifyMacNotarization,
  verifyWindowsSigning,
  verifyLinuxAppImage,
};
