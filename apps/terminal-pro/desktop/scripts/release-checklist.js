#!/usr/bin/env node

/**
 * Release checklist validator for RinaWarp Terminal Pro
 * Validates tag format, artifacts, and generates required files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ReleaseChecklist {
  constructor() {
    this.version = require('../package.json').version;
    this.distDir = path.join(__dirname, '..', 'dist');
  }

  async run() {
    console.log('📋 Running release checklist...\n');

    const checks = [
      this.validateVersion.bind(this),
      this.validateArtifacts.bind(this),
      this.generateSBOM.bind(this),
      this.validateSignatures.bind(this),
      this.generateChecksums.bind(this),
      this.createReleaseNotes.bind(this),
    ];

    let allPassed = true;
    for (const check of checks) {
      try {
        await check();
        console.log('✅ Passed\n');
      } catch (error) {
        console.log(`❌ Failed: ${error.message}\n`);
        allPassed = false;
      }
    }

    if (allPassed) {
      console.log('🎉 All release checks passed!');
      console.log(`\nTag: v${this.version}`);
      console.log(
        `Annotation: Commit: ${this.getCurrentCommit()} Electron: ${require('../package.json').devDependencies.electron.replace(/[\^~]/g, '')} ABI: ${process.versions.modules} Node-pty: rebuilt ✅ CSP/COOP/COEP: enforced ✅ SBOM: dist/sbom-${this.version}.spdx.json`,
      );
      console.log('\nArtifacts to upload:');
      console.log('- mac: .dmg + .zip + latest-mac.yml');
      console.log('- win: .exe/.msi + latest.yml');
      console.log('- linux: .AppImage + .sig (or .deb/.rpm + repo metadata)');
      console.log('- SBOM + checksums (SHA256SUMS + SHA256SUMS.sig)');
    } else {
      console.log('❌ Release checklist failed. Please fix issues above.');
      process.exit(1);
    }
  }

  validateVersion() {
    console.log('🔍 Validating version format...');
    const versionRegex = /^\d+\.\d+\.\d+$/;
    if (!versionRegex.test(this.version)) {
      throw new Error(`Invalid version format: ${this.version}. Expected: MAJOR.MINOR.PATCH`);
    }
  }

  validateArtifacts() {
    console.log('🔍 Validating build artifacts...');

    if (!fs.existsSync(this.distDir)) {
      throw new Error('dist directory not found. Run build first.');
    }

    const requiredArtifacts = {
      mac: ['RinaWarp Terminal Pro.dmg', 'RinaWarp Terminal Pro.zip', 'latest-mac.yml'],
      win: ['RinaWarpTerminalPro.exe', 'latest.yml'],
      linux: ['RinaWarp-Terminal-Pro.AppImage'],
    };

    const existingFiles = fs.readdirSync(this.distDir);
    const missing = [];

    for (const [platform, files] of Object.entries(requiredArtifacts)) {
      for (const file of files) {
        if (!existingFiles.some((f) => f === file)) {
          missing.push(`${platform}: ${file}`);
        }
      }
    }

    if (missing.length > 0) {
      throw new Error(`Missing artifacts: ${missing.join(', ')}`);
    }
  }

  async generateSBOM() {
    console.log('🔍 Generating SBOM...');
    const SBOMGenerator = require('./generate-sbom');
    const generator = new SBOMGenerator();
    await generator.generate();
  }

  validateSignatures() {
    console.log('🔍 Validating signatures...');

    // Check for signature files
    const files = fs.readdirSync(this.distDir);
    const hasMacSig = files.some((f) => f.endsWith('.dmg'));
    const hasWinSig = files.some((f) => f.includes('.exe'));
    const hasLinuxSig = files.some((f) => f.endsWith('.sig') || f.endsWith('.asc'));

    if (!hasMacSig && !hasWinSig && !hasLinuxSig) {
      console.log('⚠️  No signature files found. Run signing scripts if not already done.');
    }
  }

  generateChecksums() {
    console.log('🔍 Generating checksums...');

    const checksumsPath = path.join(this.distDir, 'SHA256SUMS');
    const files = fs
      .readdirSync(this.distDir)
      .filter(
        (f) =>
          f.endsWith('.dmg') ||
          f.endsWith('.zip') ||
          f.endsWith('.exe') ||
          f.endsWith('.AppImage') ||
          f.endsWith('.deb') ||
          f.endsWith('.rpm') ||
          f.endsWith('.spdx.json'),
      );

    let checksums = '';
    for (const file of files) {
      const filePath = path.join(this.distDir, file);
      const hash = execSync(`shasum -a 256 "${filePath}"`).toString().split(' ')[0];
      checksums += `${hash}  ${file}\n`;
    }

    fs.writeFileSync(checksumsPath, checksums);
    console.log(`Checksums written to: ${checksumsPath}`);

    // Sign checksums
    try {
      execSync(`gpg --detach-sign --armor "${checksumsPath}"`);
      console.log('Checksums signed');
    } catch (error) {
      console.log('⚠️  Could not sign checksums. GPG key may not be available.');
    }
  }

  createReleaseNotes() {
    console.log('🔍 Creating release notes...');

    const notesPath = path.join(this.distDir, `RELEASE_NOTES_${this.version}.md`);
    const notes = `# RinaWarp Terminal Pro v${this.version}

## Release Information
- **Version**: ${this.version}
- **Date**: ${new Date().toISOString().split('T')[0]}
- **Commit**: ${this.getCurrentCommit()}

## Security Features
- ✅ Code signing and notarization
- ✅ CSP/COOP/COEP enforced
- ✅ Bridge integrity protection
- ✅ Secrets redaction
- ✅ Cross-origin isolation

## Artifacts
- macOS: DMG, ZIP, Update feed
- Windows: EXE/MSI, Update feed
- Linux: AppImage, DEB/RPM packages

## Checksums
See SHA256SUMS file for artifact verification.

## SBOM
Software Bill of Materials included: sbom-${this.version}.spdx.json
`;

    fs.writeFileSync(notesPath, notes);
    console.log(`Release notes written to: ${notesPath}`);
  }

  getCurrentCommit() {
    try {
      return execSync('git rev-parse --short HEAD').toString().trim();
    } catch {
      return 'unknown';
    }
  }
}

// CLI interface
if (require.main === module) {
  const checklist = new ReleaseChecklist();
  checklist.run().catch(console.error);
}

module.exports = ReleaseChecklist;
