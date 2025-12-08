# RinaWarp Terminal Pro - Comprehensive Deployment Documentation

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Build Environment Setup](#build-environment-setup)
4. [Certificate Configuration](#certificate-configuration)
5. [Build Process](#build-process)
6. [Testing & Validation](#testing--validation)
7. [Distribution & CDN](#distribution--cdn)
8. [Post-Deployment](#post-deployment)
9. [Troubleshooting](#troubleshooting)
10. [Maintenance](#maintenance)

## Overview

This document provides comprehensive instructions for deploying RinaWarp Terminal Pro to macOS platforms. The deployment process includes code signing, notarization, DMG creation, and distribution through CDN.

### Deployment Architecture
```
Development → Build → Code Sign → Notarize → Test → CDN → Users
     ↓           ↓         ↓         ↓        ↓      ↓     ↓
   Source    Binaries   Signed     Approved  Validated  Distributed  Installed
```

### Release Types
- **Alpha:** Internal testing builds
- **Beta:** Limited external testing
- **RC (Release Candidate):** Pre-release testing
- **GA (General Availability):** Production release

## Prerequisites

### System Requirements
- **Operating System:** macOS 11.0 or later
- **Xcode:** Latest Command Line Tools
- **Node.js:** v18.0.0 or later
- **npm:** v9.0.0 or later
- **Developer Account:** Apple Developer Program membership

### Required Software
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install Node.js (via Homebrew)
brew install node

# Verify installations
node --version  # Should be v18+
npm --version   # Should be v9+
xcode-select -p # Should show Xcode path
```

### Apple Developer Setup
1. **Enroll in Apple Developer Program** ($99/year)
2. **Generate Certificates** in Developer Portal
3. **Create App ID** for RinaWarp Terminal Pro
4. **Configure Provisioning Profiles**

## Build Environment Setup

### Directory Structure
```
desktop-app/RinaWarp-Terminal-Pro/
├── src/                    # Application source code
├── assets/                 # Icons, images, resources
│   ├── icons/             # App icons (icns, ico, png)
│   └── dmg/               # DMG customization assets
├── certs/                 # Code signing certificates
│   ├── developer-id.p12
│   ├── developer-id-installer.p12
│   └── embedded.provisionprofile
├── scripts/               # Build and deployment scripts
│   ├── build/
│   │   └── build-macos.sh
│   └── security-audit.js
├── tools/                 # Build tools and utilities
│   ├── dmg-customizer.js
│   └── feedback-system.js
├── docs/                  # Documentation
└── package.json          # Build configuration
```

### Environment Variables
```bash
# Create .env file in project root
cat > .env << EOF
# Apple Developer Credentials
MACOS_CERT_PASSWORD=your_certificate_password
APPLE_ID=your_apple_id@email.com
APPLE_APP_PASSWORD=your_app_specific_password
TEAM_ID=your_team_id

# Build Configuration
BUILD_NUMBER=1
RELEASE_CHANNEL=stable

# CDN Configuration
CDN_BASE_URL=https://download.rinawarptech.com
CDN_API_KEY=your_cdn_api_key

# Analytics
GA_TRACKING_ID=your_ga_tracking_id
FEEDBACK_ENDPOINT=https://api.rinawarptech.com/feedback
EOF
```

## Certificate Configuration

### Step 1: Generate Certificates

#### Developer ID Application Certificate
```bash
# 1. Open Keychain Access
# 2. Certificate Assistant → Request Certificate from CA
# 3. Choose "Save to disk" and enter your email
# 4. Upload CSR to Apple Developer Portal
# 5. Download and install certificate
# 6. Export as .p12 file with password
```

#### Developer ID Installer Certificate
```bash
# Repeat process for installer certificate
# This is needed for package signing
```

### Step 2: Create Provisioning Profile
```bash
# 1. Go to Apple Developer Portal
# 2. Certificates → Profiles
# 3. Create new Profile
# 4. Choose Distribution provisioning
# 5. Select your App ID
# 6. Choose certificates
# 7. Download and save as embedded.provisionprofile
```

### Step 3: Validate Certificates
```bash
# Test certificate installation
security find-identity -v -p codesigning

# Should show:
# 1) ABC123DEF456 "Developer ID Application: RinaWarp Technologies"
# 2) GHI789JKL012 "Developer ID Installer: RinaWarp Technologies"
```

## Build Process

### Automated Build Script
```bash
#!/bin/bash
# Complete build process

set -e  # Exit on any error

echo "🚀 Starting RinaWarp Terminal Pro macOS Build..."

# Load environment variables
if [ -f .env ]; then
    source .env
fi

# Validate prerequisites
validate_environment() {
    echo "🔍 Validating build environment..."
    
    # Check required tools
    command -v node >/dev/null 2>&1 || { echo "❌ Node.js not found"; exit 1; }
    command -v npm >/dev/null 2>&1 || { echo "❌ npm not found"; exit 1; }
    command -v xcode-select >/dev/null 2>&1 || { echo "❌ Xcode not found"; exit 1; }
    command -v codesign >/dev/null 2>&1 || { echo "❌ codesign not found"; exit 1; }
    
    # Check certificates
    [ -f "certs/developer-id.p12" ] || { echo "❌ Developer ID certificate not found"; exit 1; }
    
    echo "✅ Environment validation passed"
}

# Security audit
run_security_audit() {
    echo "🔒 Running security audit..."
    npm run security-audit
    if [ $? -ne 0 ]; then
        echo "❌ Security audit failed"
        exit 1
    fi
    echo "✅ Security audit passed"
}

# Build application
build_application() {
    echo "🔨 Building application..."
    
    # Clean previous builds
    rm -rf build-output/*
    
    # Run electron-builder
    npm run build:mac
    
    if [ $? -ne 0 ]; then
        echo "❌ Build failed"
        exit 1
    fi
    echo "✅ Build completed"
}

# Code signing
sign_application() {
    echo "✍️ Code signing application..."
    
    # Find .app file
    APP_FILE=$(find build-output -name "*.app" -type d | head -1)
    if [ -n "$APP_FILE" ]; then
        codesign --force --verify --verbose --sign "Developer ID Application: RinaWarp Technologies" "$APP_FILE"
        
        # Verify signature
        codesign --verify --verbose "$APP_FILE"
        spctl --assess --verbose "$APP_FILE"
        
        echo "✅ Application signed successfully"
    else
        echo "⚠️ No .app file found for signing"
    fi
}

# Create distributable package
create_package() {
    echo "📦 Creating distributable package..."
    
    # DMG and ZIP are created by electron-builder
    DMG_FILE=$(find build-output -name "*.dmg" -type f | head -1)
    ZIP_FILE=$(find build-output -name "*.zip" -type f | head -1)
    
    if [ -n "$DMG_FILE" ]; then
        echo "📀 DMG created: $DMG_FILE"
        DMG_SIZE=$(du -h "$DMG_FILE" | cut -f1)
        echo "📏 DMG size: $DMG_SIZE"
    fi
    
    if [ -n "$ZIP_FILE" ]; then
        echo "🗜️ ZIP created: $ZIP_FILE"
        ZIP_SIZE=$(du -h "$ZIP_FILE" | cut -f1)
        echo "📏 ZIP size: $ZIP_SIZE"
    fi
}

# Generate checksums
generate_checksums() {
    echo "🔐 Generating checksums..."
    
    cd build-output
    
    # Create checksums for all artifacts
    find . -type f \( -name "*.dmg" -o -name "*.zip" \) -exec shasum -a 256 {} \; > SHA256SUMS.txt
    
    cd ..
    
    echo "✅ Checksums generated at build-output/SHA256SUMS.txt"
}

# Upload to CDN
upload_to_cdn() {
    echo "☁️ Uploading to CDN..."
    
    if [ -n "$CDN_BASE_URL" ] && [ -n "$CDN_API_KEY" ]; then
        # Upload build artifacts
        for file in build-output/*.{dmg,zip}; do
            if [ -f "$file" ]; then
                filename=$(basename "$file")
                version=$(node -p "require('./package.json').version")
                
                # Upload to CDN
                curl -X PUT \
                    -H "Authorization: Bearer $CDN_API_KEY" \
                    -H "Content-Type: application/octet-stream" \
                    --data-binary "@$file" \
                    "$CDN_BASE_URL/releases/v$version/macos/$filename"
                
                echo "✅ Uploaded: $filename"
            fi
        done
    else
        echo "⚠️ CDN configuration not found, skipping upload"
    fi
}

# Main execution
main() {
    validate_environment
    run_security_audit
    build_application
    sign_application
    create_package
    generate_checksums
    upload_to_cdn
    
    echo ""
    echo "🎉 Build process completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Test the DMG on clean macOS system"
    echo "2. Run notarization (if required)"
    echo "3. Update download website"
    echo "4. Notify users of new release"
}

main "$@"
```

### Manual Build Process
```bash
# If automation isn't available, run steps manually:

# 1. Install dependencies
npm install

# 2. Security audit
npm run security-audit

# 3. Build application
npm run build:mac

# 4. Sign application (if certificates configured)
codesign --force --verify --sign "Developer ID Application: RinaWarp Technologies" build-output/*.app

# 5. Verify signature
codesign --verify --verbose build-output/*.app
spctl --assess --verbose build-output/*.app

# 6. Create checksums
cd build-output
shasum -a 256 *.dmg *.zip > SHA256SUMS.txt
cd ..
```

## Testing & Validation

### Pre-Release Testing Checklist

#### Build Validation
- [ ] **Build completes without errors**
- [ ] **All tests pass**
- [ ] **Security audit passes**
- [ ] **Code signature validates**
- [ ] **DMG mounts correctly**
- [ ] **Application launches successfully**

#### Functional Testing
- [ ] **Terminal functionality works**
- [ ] **AI features operational**
- [ ] **Settings persist correctly**
- [ ] **File system access works**
- [ ] **Network connectivity handles properly**

#### Performance Testing
- [ ] **Launch time < 5 seconds**
- [ ] **Memory usage < 500MB baseline**
- [ ] **Terminal response < 100ms**
- [ ] **No memory leaks after 8 hours**

### Automated Testing Script
```bash
#!/bin/bash
# Automated testing validation

test_build_integrity() {
    echo "🔍 Testing build integrity..."
    
    # Check file existence
    [ -f "build-output/RinaWarp-Terminal-Pro"*.dmg ] || { echo "❌ DMG not found"; exit 1; }
    [ -f "build-output/RinaWarp-Terminal-Pro"*.zip ] || { echo "❌ ZIP not found"; exit 1; }
    
    # Verify checksums
    cd build-output
    shasum -c SHA256SUMS.txt
    cd ..
    
    echo "✅ Build integrity validated"
}

test_dmg_mount() {
    echo "📀 Testing DMG mount..."
    
    DMG_FILE=$(find build-output -name "*.dmg" | head -1)
    
    # Mount DMG
    MOUNT_POINT="/tmp/test-mount-$$"
    mkdir -p "$MOUNT_POINT"
    
    hdiutil attach "$DMG_FILE" -mountpoint "$MOUNT_POINT" -quiet
    
    if [ $? -eq 0 ]; then
        echo "✅ DMG mounted successfully"
        
        # Check app exists
        [ -f "$MOUNT_POINT/RinaWarp Terminal Pro.app/Contents/MacOS/RinaWarp Terminal Pro" ] || {
            echo "❌ Application not found in DMG"
            hdiutil detach "$MOUNT_POINT" -quiet
            exit 1
        }
        
        # Unmount
        hdiutil detach "$MOUNT_POINT" -quiet
    else
        echo "❌ Failed to mount DMG"
        exit 1
    fi
    
    rm -rf "$MOUNT_POINT"
}

test_code_signature() {
    echo "✍️ Testing code signature..."
    
    APP_FILE=$(find build-output -name "*.app" | head -1)
    
    if [ -n "$APP_FILE" ]; then
        # Verify signature
        codesign --verify --verbose "$APP_FILE"
        if [ $? -eq 0 ]; then
            echo "✅ Code signature valid"
        else
            echo "❌ Code signature invalid"
            exit 1
        fi
        
        # Check Gatekeeper assessment
        spctl --assess --verbose "$APP_FILE"
        if [ $? -eq 0 ]; then
            echo "✅ Gatekeeper assessment passed"
        else
            echo "⚠️ Gatekeeper assessment failed (expected for unsigned builds)"
        fi
    fi
}

# Run all tests
test_build_integrity
test_dmg_mount
test_code_signature

echo "🎉 All tests passed!"
```

## Distribution & CDN

### CDN Upload Process
```bash
#!/bin/bash
# Upload to CDN

VERSION=$(node -p "require('./package.json').version")
CDN_BASE_URL=${CDN_BASE_URL:-"https://download.rinawarptech.com"}
CDN_API_KEY=${CDN_API_KEY:-""}

upload_to_cdn() {
    echo "☁️ Uploading to CDN..."
    
    if [ -z "$CDN_API_KEY" ]; then
        echo "⚠️ CDN API key not configured, skipping upload"
        return
    fi
    
    # Upload DMG
    DMG_FILE=$(find build-output -name "*.dmg" | head -1)
    if [ -n "$DMG_FILE" ]; then
        curl -X PUT \
            -H "Authorization: Bearer $CDN_API_KEY" \
            -H "Content-Type: application/octet-stream" \
            --data-binary "@$DMG_FILE" \
            "$CDN_BASE_URL/releases/v$VERSION/macos/$(basename "$DMG_FILE")"
        
        echo "✅ DMG uploaded"
    fi
    
    # Upload ZIP
    ZIP_FILE=$(find build-output -name "*.zip" | head -1)
    if [ -n "$ZIP_FILE" ]; then
        curl -X PUT \
            -H "Authorization: Bearer $CDN_API_KEY" \
            -H "Content-Type: application/octet-stream" \
            --data-binary "@$ZIP_FILE" \
            "$CDN_BASE_URL/releases/v$VERSION/macos/$(basename "$ZIP_FILE")"
        
        echo "✅ ZIP uploaded"
    fi
    
    # Upload checksums
    curl -X PUT \
        -H "Authorization: Bearer $CDN_API_KEY" \
        -H "Content-Type: text/plain" \
        --data-binary "@build-output/SHA256SUMS.txt" \
        "$CDN_BASE_URL/releases/v$VERSION/macos/SHA256SUMS.txt"
    
    echo "✅ Checksums uploaded"
}

upload_to_cdn
```

### Website Update Process
```bash
#!/bin/bash
# Update download website

# Update download links
update_download_page() {
    echo "🌐 Updating download page..."
    
    # This would integrate with your website deployment system
    # Example for Netlify:
    
    # Update manifest.json
    node -e "
    const fs = require('fs');
    const version = require('./package.json').version;
    const manifest = {
        version: version,
        releases: {
            macos: {
                dmg: \`https://download.rinawarptech.com/releases/v\${version}/macos/RinaWarp-Terminal-Pro-\${version}-macOS-universal.dmg\`,
                zip: \`https://download.rinawarptech.com/releases/v\${version}/macos/RinaWarp-Terminal-Pro-\${version}-macOS-universal.zip\`
            }
        },
        checksums_url: \`https://download.rinawarptech.com/releases/v\${version}/macos/SHA256SUMS.txt\`
    };
    fs.writeFileSync('website/downloads/terminal-pro/manifest.json', JSON.stringify(manifest, null, 2));
    "
    
    echo "✅ Download page updated"
}

update_download_page
```

## Post-Deployment

### Validation Checklist
```markdown
# Post-Deployment Validation

## Immediate Checks (0-1 hour)
- [ ] Download links are accessible
- [ ] DMG downloads successfully
- [ ] DMG mounts without errors
- [ ] Application launches correctly
- [ ] Basic functionality works
- [ ] No obvious security warnings

## Short-term Monitoring (1-24 hours)
- [ ] Download analytics tracking
- [ ] Installation success rate > 95%
- [ ] No crash reports
- [ ] CDN cache is populated
- [ ] Regional download speeds acceptable

## Long-term Monitoring (1-7 days)
- [ ] User feedback collection
- [ ] Performance metrics stable
- [ ] No security issues reported
- [ ] Update mechanisms work
- [ ] Support ticket volume normal
```

### Monitoring Dashboard
```javascript
// Post-deployment monitoring setup
const monitoring = {
  metrics: {
    download_success_rate: {
      target: '> 99%',
      current: '98.5%',
      status: 'warning'
    },
    
    installation_success_rate: {
      target: '> 95%',
      current: '97.2%',
      status: 'good'
    },
    
    crash_rate: {
      target: '< 0.1%',
      current: '0.05%',
      status: 'good'
    },
    
    user_satisfaction: {
      target: '> 4.0/5.0',
      current: '4.2/5.0',
      status: 'good'
    }
  },
  
  alerts: {
    download_failure: {
      condition: 'rate < 95%',
      action: 'notify_dev_team'
    },
    
    crash_spike: {
      condition: 'crashes > 10/hour',
      action: 'immediate_investigation'
    }
  }
};
```

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Issue: Certificate not found
# Solution: Check certificate installation
security find-identity -v -p codesigning

# Issue: Electron dependencies
# Solution: Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Issue: Code signing errors
# Solution: Check certificate passwords
echo $MACOS_CERT_PASSWORD
```

#### DMG Issues
```bash
# Issue: DMG won't mount
# Solution: Check DMG integrity
hdiutil verify path/to/file.dmg

# Issue: Application won't launch
# Solution: Check Gatekeeper
spctl --assess --verbose path/to/app.app
```

#### CDN Issues
```bash
# Issue: Downloads failing
# Solution: Check CDN status
curl -I https://download.rinawarptech.com/releases/latest/

# Issue: Slow downloads
# Solution: Check CDN performance
curl -w "@curl-format.txt" -o /dev/null -s "https://download.rinawarptech.com/releases/latest/"
```

### Emergency Procedures
```bash
#!/bin/bash
# Emergency rollback procedure

rollback_release() {
    echo "🚨 Emergency rollback initiated..."
    
    # Disable current downloads
    curl -X POST https://api.rinawarptech.com/admin/disable-downloads
    
    # Restore previous version
    PREVIOUS_VERSION="1.0.0"
    
    # Update website to use previous version
    curl -X PUT \
        -H "Authorization: Bearer $ADMIN_API_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"version\": \"$PREVIOUS_VERSION\"}" \
        https://api.rinawarptech.com/admin/download-version
    
    # Notify users
    curl -X POST https://api.rinawarptech.com/admin/send-notification \
        -H "Authorization: Bearer $ADMIN_API_KEY" \
        -H "Content-Type: application/json" \
        -d '{"message": "Temporary issue detected. Please try downloading again."}'
    
    echo "✅ Rollback completed"
}

rollback_release
```

## Maintenance

### Regular Tasks
```bash
# Daily
- Monitor download success rates
- Review crash reports
- Check CDN performance

# Weekly  
- Update security certificates if needed
- Review user feedback
- Analyze usage statistics

# Monthly
- Performance audit
- Security review
- Dependency updates

# Quarterly
- Certificate renewal
- Comprehensive testing
- Architecture review
```

### Update Procedures
```bash
#!/bin/bash
# Minor version update (patch)

update_patch() {
    VERSION=$(node -p "require('./package.json').version")
    PATCH_VERSION=$(echo $VERSION | awk -F. '{print $3+1}')
    NEW_VERSION=$(echo $VERSION | awk -F. -v patch=$PATCH_VERSION '{print $1"."$2"."patch}')
    
    echo "🔄 Updating from $VERSION to $NEW_VERSION"
    
    # Update version in package.json
    node -e "const fs = require('fs'); const pkg = JSON.parse(fs.readFileSync('./package.json')); pkg.version = '$NEW_VERSION'; fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));"
    
    # Build new version
    npm run build:mac
    
    # Upload to CDN
    ./scripts/upload-to-cdn.sh
    
    echo "✅ Patch update completed"
}

update_patch
```

---

## Summary

This deployment documentation provides a complete guide for deploying RinaWarp Terminal Pro to macOS platforms. Follow these procedures systematically to ensure reliable, secure, and user-friendly releases.

### Key Success Factors
1. **Automated Build Process** - Reduces human error
2. **Comprehensive Testing** - Ensures quality
3. **Code Signing** - Establishes trust
4. **CDN Distribution** - Optimizes performance  
5. **Continuous Monitoring** - Maintains quality

### Support Contacts
- **Technical Issues:** support@rinawarptech.com
- **Emergency Escalation:** +1-XXX-XXX-XXXX
- **Documentation:** https://docs.rinawarptech.com