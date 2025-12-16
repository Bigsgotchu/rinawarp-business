/**
 * RinaWarp Terminal Pro - DMG Customization Tool
 * Creates branded DMG backgrounds and custom installation experience
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class DMGCustomizer {
  constructor() {
    this.appName = 'RinaWarp Terminal Pro';
    this.companyName = 'RinaWarp Technologies';
    this.version = require('../package.json').version;

    // DMG dimensions (standard Retina display)
    this.width = 540;
    this.height = 420;

    // Background image settings
    this.backgroundColor = '#f5f5f7'; // macOS Big Sur+ default
    this.textColor = '#1d1d1f'; // macOS dark gray
  }

  /**
   * Create DMG background directory and template
   */
  createBackgroundTemplate() {
    const bgDir = path.join(__dirname, '../../assets/dmg');
    const bgFile = path.join(bgDir, 'background.png');

    if (!fs.existsSync(bgDir)) {
      fs.mkdirSync(bgDir, { recursive: true });
    }

    // Create a simple branded background
    this.createBrandedBackground(bgFile);

    return bgFile;
  }

  /**
   * Create branded DMG background image
   */
  createBrandedBackground(outputPath) {
    // This creates a simple branded background using ImageMagick if available
    // Fallback to creating a basic structure

    const width = 1080; // Retina scale (2x)
    const height = 840; // Retina scale (2x)

    try {
      // Try to use ImageMagick to create a branded background
      const command = `convert -size ${width}x${height} \\
                gradient:'#f5f5f7'-'#ffffff' \\
                -fill '#1d1d1f' -pointsize 48 -gravity center \\
                -annotate +0-100 '${this.appName}' \\
                -fill '#6e6e73' -pointsize 24 -gravity center \\
                -annotate +0+0 'Drag to Applications folder to install' \\
                -fill '#007aff' -pointsize 32 -gravity center \\
                -annotate +0+100 'Version ${this.version}' \\
                '${outputPath}'`;

      execSync(command, { stdio: 'pipe' });
      console.log('✅ DMG background created with ImageMagick');
    } catch (error) {
      // Fallback: create a simple text-based background using canvas-like approach
      console.log('📝 Creating DMG background template (ImageMagick not available)');
      this.createTextBackground(outputPath, width, height);
    }
  }

  /**
   * Fallback background creation using canvas-like approach
   */
  createTextBackground(outputPath, width, height) {
    // Create a basic HTML template that can be converted to image
    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            margin: 0;
            padding: 0;
            width: ${width}px;
            height: ${height}px;
            background: linear-gradient(135deg, #f5f5f7 0%, #ffffff 100%);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        .title {
            color: #1d1d1f;
            font-size: 48px;
            font-weight: 600;
            margin-bottom: 20px;
        }
        .subtitle {
            color: #6e6e73;
            font-size: 24px;
            margin-bottom: 40px;
        }
        .version {
            color: #007aff;
            font-size: 32px;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <div class="title">${this.appName}</div>
    <div class="subtitle">Drag to Applications folder to install</div>
    <div class="version">Version ${this.version}</div>
</body>
</html>`;

    const htmlPath = outputPath.replace('.png', '.html');
    fs.writeFileSync(htmlPath, html);

    console.log(`📄 DMG background template created: ${htmlPath}`);
    console.log('💡 Convert HTML to PNG using a browser or ImageMagick for better results');
  }

  /**
   * Generate DMG configuration
   */
  generateDMGConfig() {
    const config = {
      title: `${this.appName} ${this.version}`,
      icon: '../assets/icons/icon.icns',
      iconSize: 80,
      window: {
        width: this.width,
        height: this.height,
      },
      contents: [
        {
          x: 130,
          y: 220,
          type: 'file',
        },
        {
          x: 410,
          y: 220,
          type: 'link',
          path: '/Applications',
        },
      ],
      format: 'ULFO',
      // Custom background (if available)
      background: '../assets/dmg/background.png',
      format: 'ULFO',
      internetEnabled: false,
      // Custom volume name
      title: `${this.appName} ${this.version}`,
      // Hide application icon label
      format: 'ULFO',
    };

    return config;
  }

  /**
   * Create DMG installer script for custom installation experience
   */
  createDMGAppletScript() {
    const script = `
-- RinaWarp Terminal Pro DMG Applet Script
-- This script customizes the DMG installation experience

property dialogTitle : "${this.appName} Installer"
property dialogMessage : "Welcome to ${this.appName}!" & return & return & "Drag ${this.appName} to the Applications folder to install." & return & return & "Version ${this.version}"
property button1Text : "Open Applications Folder"
property button2Text : "Cancel"

on open diskImage
    -- Check if app already exists
    tell application "Finder"
        set appName to "${this.appName}"
        set appsFolder to path to applications folder as string
        
        if exists file (appsFolder & appName & ".app") then
            -- App already installed
            display dialog dialogMessage & return & return & "Application already exists." buttons {"Open Applications Folder", "OK"} default button 2
        end if
    end tell
    
    -- Standard DMG behavior
    open diskImage
end open

on clicked buttonName
    if buttonName is button1Text then
        -- Open Applications folder
        tell application "Finder"
            activate
            open (path to applications folder)
        end tell
    end if
    
    -- Close the DMG
    tell application "Finder"
        eject diskImage
    end tell
end clicked
`;
    return script;
  }

  /**
   * Update electron-builder configuration with DMG customizations
   */
  updateElectronBuilderConfig() {
    const packagePath = path.join(__dirname, '../../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    // Enhanced DMG configuration
    packageJson.build.dmg = {
      title: `${this.appName} ${this.version}`,
      icon: 'assets/icons/icon.icns',
      iconSize: 80,
      window: {
        width: this.width,
        height: this.height,
      },
      contents: [
        {
          x: 130,
          y: 220,
          type: 'file',
        },
        {
          x: 410,
          y: 220,
          type: 'link',
          path: '/Applications',
        },
      ],
      background: 'assets/dmg/background.png',
      backgroundColor: '#f5f5f7',
      format: 'ULFO',
      // Custom DMG properties
      internetEnabled: false,
      // Hide icon labels
      format: 'ULFO',
    };

    // Enhanced macOS configuration
    packageJson.build.mac = {
      target: [
        {
          target: 'dmg',
          arch: ['x64', 'arm64'],
        },
        {
          target: 'zip',
          arch: ['x64', 'arm64'],
        },
      ],
      icon: 'assets/icons/icon.icns',
      category: 'public.app-category.developer-tools',
      identity: 'Developer ID Application: RinaWarp Technologies',
      hardenedRuntime: true,
      entitlements: 'entitlements.plist',
      entitlementsInherit: 'entitlements.plist',
      provisioningProfile: './certs/embedded.provisionprofile',
      gatekeeperAssess: false,
      type: 'distribution',
      publish: null,
      artifactName: 'RinaWarp-Terminal-Pro-${version}-${arch}.${ext}',
      // Enhanced features
      target: [
        {
          target: 'dmg',
          arch: ['x64', 'arm64'],
        },
        {
          target: 'zip',
          arch: ['x64', 'arm64'],
        },
      ],
    };

    // Write updated configuration
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated electron-builder configuration');
  }

  /**
   * Main execution
   */
  run() {
    console.log('🎨 Creating DMG customizations for RinaWarp Terminal Pro...');

    // Create background template
    const bgPath = this.createBackgroundTemplate();

    // Generate DMG config
    const config = this.generateDMGConfig();
    console.log('📋 Generated DMG configuration:', JSON.stringify(config, null, 2));

    // Create applet script
    const script = this.createDMGAppletScript();
    const scriptPath = path.join(__dirname, '../../assets/dmg/dmg-applet.scpt');
    fs.writeFileSync(scriptPath, script);
    console.log('📄 Created DMG applet script:', scriptPath);

    // Update electron-builder config
    this.updateElectronBuilderConfig();

    console.log('🎉 DMG customization complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Review generated background template');
    console.log('2. Build DMG with: npm run build:mac');
    console.log('3. Test installation on clean macOS system');
  }
}

// Run if called directly
if (require.main === module) {
  const customizer = new DMGCustomizer();
  customizer.run();
}

module.exports = DMGCustomizer;
