/**
 * RinaWarp Terminal Pro - Release Engineering Pipeline
 * Comprehensive script for managing releases, builds, and updates
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const semver = require('semver');

class ReleaseEngineeringPipeline {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.packageJsonPath = path.join(this.projectRoot, 'package.json');
    this.buildOutputPath = path.join(this.projectRoot, 'build-output');
  }

  /**
   * Update electron-builder configuration with enhanced settings
   */
  updateElectronBuilderConfig() {
    console.log('🔧 Updating electron-builder configuration...');

    const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));

    // Enhance build configuration
    const enhancedBuildConfig = {
      ...packageJson.build,
      asarUnpack: [
        'node_modules/electron-log/**/*',
        'node_modules/openai/**/*',
        'node_modules/stripe/**/*',
        'node_modules/ws/**/*',
        'node_modules/node-pty/**/*',
      ],
      // Add consistent artifact naming
      artifactName: '${productName}-${version}-${arch}.${ext}',
      // Enhanced publish configuration
      publish: {
        provider: 'generic',
        url: 'https://download.rinawarptech.com/releases/',
        channel: 'latest',
      },
      // Build optimization
      compression: 'maximum',
      removePackageScripts: false,
      npmRebuild: true,
      buildDependenciesFromSource: false,
      nodeGypRebuild: false,
      // Version management
      buildVersion: process.env.BUILD_NUMBER || '1',
      buildNumber: process.env.BUILD_NUMBER || '1',
    };

    // Update platform-specific artifact names
    if (enhancedBuildConfig.win) {
      enhancedBuildConfig.win.artifactName =
        'RinaWarp-Terminal-Pro-Setup-${version}-${arch}.${ext}';
      enhancedBuildConfig.win.compression = 'maximum';
      enhancedBuildConfig.win.timeStampServer = 'http://timestamp.sectigo.com';
    }

    if (enhancedBuildConfig.mac) {
      enhancedBuildConfig.mac.artifactName = 'RinaWarp-Terminal-Pro-${version}-${arch}.${ext}';
      enhancedBuildConfig.mac.gatekeeperAssess = false;
    }

    if (enhancedBuildConfig.linux) {
      enhancedBuildConfig.linux.artifactName = 'RinaWarp-Terminal-Pro-${version}-${arch}.${ext}';
      enhancedBuildConfig.linux.executableName = 'rinawarp-terminal-pro';
    }

    // Update package.json
    packageJson.build = enhancedBuildConfig;
    fs.writeFileSync(this.packageJsonPath, JSON.stringify(packageJson, null, 2));

    console.log('✅ Electron-builder configuration updated');
    return true;
  }

  /**
   * Validate and bump version
   */
  bumpVersion(bumpType = 'patch') {
    console.log(`📦 Bumping version (${bumpType})...`);

    const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
    const currentVersion = packageJson.version;

    try {
      const newVersion = semver.inc(currentVersion, bumpType);
      if (!newVersion) {
        throw new Error(`Invalid version increment: ${currentVersion} + ${bumpType}`);
      }

      packageJson.version = newVersion;
      fs.writeFileSync(this.packageJsonPath, JSON.stringify(packageJson, null, 2));

      console.log(`✅ Version updated: ${currentVersion} → ${newVersion}`);
      return newVersion;
    } catch (error) {
      console.error('❌ Version bump failed:', error.message);
      return null;
    }
  }

  /**
   * Dry run version bump - show what would change without applying
   */
  dryRunVersionBump(bumpType = 'patch') {
    console.log(`🔍 Dry run version bump (${bumpType})...`);

    const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
    const currentVersion = packageJson.version;

    try {
      const newVersion = semver.inc(currentVersion, bumpType);
      if (!newVersion) {
        throw new Error(`Invalid version increment: ${currentVersion} + ${bumpType}`);
      }

      console.log(`Current version: ${currentVersion}`);
      console.log(`Would bump to: ${newVersion}`);
      console.log(`Package.json changes:`);
      console.log(`  "version": "${currentVersion}" → "${newVersion}"`);

      return { currentVersion, newVersion };
    } catch (error) {
      console.error('❌ Dry run failed:', error.message);
      return null;
    }
  }

  /**
   * Build all platforms
   */
  async buildAllPlatforms(options = {}) {
    console.log('🏗️  Building for all platforms...');

    const { skipTests = false, verbose = false } = options;

    try {
      // Security audit first
      if (!skipTests) {
        console.log('🔒 Running security audit...');
        execSync('npm run security-audit', {
          cwd: this.projectRoot,
          stdio: verbose ? 'inherit' : 'pipe',
        });
      }

      // Build for each platform
      const platforms = ['linux', 'win', 'mac'];

      for (const platform of platforms) {
        console.log(`📦 Building ${platform}...`);

        try {
          const command =
            platform === 'mac' ? 'npm run build:mac:simple' : `npm run build:${platform}`;
          execSync(command, {
            cwd: this.projectRoot,
            stdio: verbose ? 'inherit' : 'pipe',
          });
          console.log(`✅ ${platform} build completed`);
        } catch (error) {
          console.error(`❌ ${platform} build failed:`, error.message);
          throw error;
        }
      }

      console.log('✅ All platform builds completed');
      return this.validateBuildArtifacts();
    } catch (error) {
      console.error('❌ Build process failed:', error.message);
      throw error;
    }
  }

  /**
   * Validate build artifacts
   */
  validateBuildArtifacts() {
    console.log('🔍 Validating build artifacts...');

    const artifacts = [];
    const expectedFiles = [
      'RinaWarp-Terminal-Pro-*-x64.AppImage',
      'RinaWarp-Terminal-Pro-*-x64.deb',
      'RinaWarp-Terminal-Pro-Setup-*-x64.exe',
      'RinaWarp-Terminal-Pro-*-x64.dmg',
    ];

    if (!fs.existsSync(this.buildOutputPath)) {
      throw new Error('Build output directory not found');
    }

    const files = fs.readdirSync(this.buildOutputPath);

    expectedFiles.forEach((pattern) => {
      const matchingFiles = files.filter((file) => {
        const regex = new RegExp(pattern.replace('*', '.*'));
        return regex.test(file);
      });

      if (matchingFiles.length === 0) {
        console.warn(`⚠️  No artifacts found matching: ${pattern}`);
      } else {
        matchingFiles.forEach((file) => {
          const filePath = path.join(this.buildOutputPath, file);
          const stats = fs.statSync(filePath);
          artifacts.push({
            name: file,
            size: stats.size,
            path: filePath,
          });
        });
      }
    });

    console.log(`✅ Found ${artifacts.length} artifacts`);
    return artifacts;
  }

  /**
   * Generate release notes
   */
  generateReleaseNotes(version, changelog) {
    console.log('📝 Generating release notes...');

    const releaseNotes = `# RinaWarp Terminal Pro v${version}

## 🎉 What's New

${changelog || 'This release includes performance improvements, bug fixes, and enhanced features.'}

## 📦 Installation

### Linux
- **AppImage**: Download and run the AppImage file
- **Debian/Ubuntu**: Install the .deb package

### Windows
- Download and run the Setup.exe installer

### macOS  
- Download the .dmg file and drag to Applications

## 🔧 System Requirements

- **Linux**: Ubuntu 18.04+ or equivalent
- **Windows**: Windows 10 or later
- **macOS**: macOS 10.15+ (Catalina)

## 📋 Release Checklist

- [ ] Security audit passed
- [ ] All platform builds successful  
- [ ] Artifact validation passed
- [ ] Release notes generated
- [ ] Git tag created
- [ ] GitHub release published

---

**Built with ❤️ by RinaWarp Technologies**
`;

    const releaseNotesPath = path.join(this.projectRoot, 'RELEASE_NOTES.md');
    fs.writeFileSync(releaseNotesPath, releaseNotes);

    console.log(`✅ Release notes generated: ${releaseNotesPath}`);
    return releaseNotesPath;
  }

  /**
   * Run comprehensive release validation
   */
  runReleaseValidation() {
    console.log('🔍 Running comprehensive release validation...');

    const validations = [];

    // Check Node.js version
    const nodeVersion = process.version;
    const requiredNodeVersion = '>=18.0.0';
    const nodeValid = semver.satisfies(nodeVersion.replace('v', ''), requiredNodeVersion);
    validations.push({
      name: 'Node.js version',
      passed: nodeValid,
      details: `Current: ${nodeVersion}, Required: ${requiredNodeVersion}`,
    });

    // Check npm version
    try {
      const npmVersion = execSync('npm --version').toString().trim();
      const requiredNpmVersion = '>=9.0.0';
      const npmValid = semver.satisfies(npmVersion, requiredNpmVersion);
      validations.push({
        name: 'npm version',
        passed: npmValid,
        details: `Current: ${npmVersion}, Required: ${requiredNpmVersion}`,
      });
    } catch {
      validations.push({
        name: 'npm version',
        passed: false,
        details: 'npm not found',
      });
    }

    // Check required files
    const requiredFiles = [
      'package.json',
      'src/main/main.js',
      'src/renderer/index.html',
      'assets/icons/icon.ico',
      'assets/icons/icon.icns',
      'assets/icons/icon.png',
    ];

    requiredFiles.forEach((file) => {
      const filePath = path.join(this.projectRoot, file);
      const exists = fs.existsSync(filePath);
      validations.push({
        name: `File exists: ${file}`,
        passed: exists,
        details: exists ? 'Found' : 'Missing',
      });
    });

    // Check build output directory
    const buildOutputExists = fs.existsSync(this.buildOutputPath);
    validations.push({
      name: 'Build output directory',
      passed: buildOutputExists,
      details: buildOutputExists ? 'Ready' : 'Will be created',
    });

    // Display results
    console.log('\n📊 Validation Results:');
    validations.forEach((validation) => {
      const status = validation.passed ? '✅' : '❌';
      console.log(`${status} ${validation.name}: ${validation.details}`);
    });

    const allPassed = validations.every((v) => v.passed);
    console.log(
      `\n${allPassed ? '✅' : '❌'} Overall: ${allPassed ? 'All validations passed' : 'Some validations failed'}`,
    );

    return { passed: allPassed, validations };
  }

  /**
   * Main CLI interface
   */
  async run() {
    const args = process.argv.slice(2);
    const command = args[0];

    try {
      switch (command) {
        case 'update-config':
          this.updateElectronBuilderConfig();
          break;

        case 'bump-version':
          const bumpType = args[1] || 'patch';
          this.bumpVersion(bumpType);
          break;

        case 'dry-run-bump':
          const dryRunType = args[1] || 'patch';
          this.dryRunVersionBump(dryRunType);
          break;

        case 'build':
          const skipTests = args.includes('--skip-tests');
          const verbose = args.includes('--verbose');
          await this.buildAllPlatforms({ skipTests, verbose });
          break;

        case 'validate':
          this.runReleaseValidation();
          break;

        case 'generate-notes':
          const version = args[1] || require(this.packageJsonPath).version;
          const changelog = args.slice(2).join(' ');
          this.generateReleaseNotes(version, changelog);
          break;

        case 'release':
          const releaseBumpType = args[1] || 'patch';
          const releaseChangelog = args.slice(2).join(' ');

          console.log('🚀 Starting full release process...');

          // 1. Validate environment
          const validation = this.runReleaseValidation();
          if (!validation.passed) {
            throw new Error('Release validation failed');
          }

          // 2. Bump version
          const newVersion = this.bumpVersion(releaseBumpType);
          if (!newVersion) {
            throw new Error('Version bump failed');
          }

          // 3. Build
          await this.buildAllPlatforms();

          // 4. Generate release notes
          this.generateReleaseNotes(newVersion, releaseChangelog);

          console.log(`🎉 Release ${newVersion} completed successfully!`);
          break;

        default:
          console.log(`
RinaWarp Terminal Pro - Release Engineering Pipeline

Usage: node scripts/release-engineering.js <command> [options]

Commands:
  update-config          Update electron-builder configuration
  bump-version [type]    Bump version (patch|minor|major) [default: patch]
  dry-run-bump [type]    Show version bump without applying [default: patch]
  build [--skip-tests] [--verbose]  Build for all platforms
  validate               Run release validation checks
  generate-notes [version] [changelog]  Generate release notes
  release [type] [changelog]  Full release process

Examples:
  node scripts/release-engineering.js dry-run-bump minor
  node scripts/release-engineering.js build --verbose
  node scripts/release-engineering.js release patch "Fix memory leak in terminal"
`);
      }
    } catch (error) {
      console.error('❌ Command failed:', error.message);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const pipeline = new ReleaseEngineeringPipeline();
  pipeline.run();
}

module.exports = ReleaseEngineeringPipeline;
