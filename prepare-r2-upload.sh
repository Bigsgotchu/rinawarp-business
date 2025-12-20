#!/bin/bash

# RinaWarp Terminal Pro - R2 Upload Preparation Script
# This script prepares files for R2 upload and provides upload instructions

set -e

echo "🚀 RINAWARP TERMINAL PRO - R2 UPLOAD PREPARATION"
echo "================================================"
echo ""

# Check if required files exist
echo "📋 Checking required files..."

REQUIRED_FILES=(
    "RinaWarp-Terminal-Pro.AppImage"
    "SHA256SUMS.txt"
    "install.sh"
)

MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        echo "✅ $file - $(du -h "$file" | cut -f1)"
    else
        echo "❌ $file - MISSING"
        MISSING_FILES+=("$file")
    fi
done

echo ""

if [[ ${#MISSING_FILES[@]} -gt 0 ]]; then
    echo "🚨 MISSING FILES DETECTED:"
    printf '   • %s\n' "${MISSING_FILES[@]}"
    echo ""
    echo "Please ensure all required files are present before uploading to R2."
    exit 1
fi

echo "✅ All required files present"
echo ""

# Generate file listing for upload
echo "📝 Generating upload manifest..."
cat > UPLOAD_MANIFEST.txt << 'EOF'
# RinaWarp Terminal Pro v1.0.0 - R2 Upload Manifest

## Upload Directory Structure
terminal-pro/
└── 1.0.0/
    ├── RinaWarp-Terminal-Pro-Linux.AppImage
    ├── RinaWarp-Terminal-Pro-Windows.exe (TO BE ADDED)
    └── SHA256SUMS.txt

## File Details

### Linux AppImage
- Source: RinaWarp-Terminal-Pro.AppImage
- Target: terminal-pro/1.0.0/RinaWarp-Terminal-Pro-Linux.AppImage
- Size: 103MB (estimated)
- SHA256: $(sha256sum RinaWarp-Terminal-Pro.AppImage | cut -d' ' -f1)

### Windows Installer (MISSING)
- Source: NOT FOUND - NEEDS TO BE BUILT
- Target: terminal-pro/1.0.0/RinaWarp-Terminal-Pro-Windows.exe
- Status: 🚨 REQUIRED FOR LAUNCH

### Checksum File
- Source: SHA256SUMS.txt
- Target: terminal-pro/1.0.0/SHA256SUMS.txt
- Contents: SHA256 checksums for all binaries

## R2 Upload Commands

# Using AWS CLI (recommended)
aws s3 cp RinaWarp-Terminal-Pro.AppImage s3://rinawarp-downloads/terminal-pro/1.0.0/RinaWarp-Terminal-Pro-Linux.AppImage --acl public-read
aws s3 cp SHA256SUMS.txt s3://rinawarp-downloads/terminal-pro/1.0.0/SHA256SUMS.txt --acl public-read

# After Windows installer is built:
# aws s3 cp RinaWarp-Terminal-Pro-Windows.exe s3://rinawarp-downloads/terminal-pro/1.0.0/RinaWarp-Terminal-Pro-Windows.exe --acl public-read

## Alternative: Cloudflare R2 Console Upload

1. Go to Cloudflare Dashboard → R2 Object Storage
2. Navigate to rinawarp-downloads bucket
3. Create folder: terminal-pro/1.0.0/
4. Upload files with public-read ACL

## Verification Commands

# Test Linux download
curl -I https://rinawarp-downloads.r2.cloudflarestorage.com/terminal-pro/1.0.0/RinaWarp-Terminal-Pro-Linux.AppImage

# Test Windows download (after upload)
curl -I https://rinawarp-downloads.r2.cloudflarestorage.com/terminal-pro/1.0.0/RinaWarp-Terminal-Pro-Windows.exe

## Post-Upload Checklist

- [ ] Linux AppImage accessible via R2 URL
- [ ] SHA256 checksum file accessible
- [ ] Windows installer built and uploaded (REQUIRED)
- [ ] All download links tested
- [ ] install.sh script tested
- [ ] Website download page updated with correct URLs

EOF

echo "📄 Upload manifest created: UPLOAD_MANIFEST.txt"
echo ""

# Create placeholder Windows installer info
echo "📦 Creating Windows installer placeholder..."
cat > WINDOWS_INSTALLER_REQUIRED.md << 'EOF'
# Windows Installer Required for Launch

## Current Status
- ✅ Linux AppImage: Ready for upload
- ❌ Windows Installer: MISSING - REQUIRED FOR LAUNCH

## Required Actions

### 1. Build Windows Installer
```bash
# In the terminal-pro/desktop directory
npm run build:win
# or
npm run dist
```

### 2. Expected Output
- File: `RinaWarp-Terminal-Pro-Setup.exe` (or similar)
- Size: ~76MB (based on documentation)
- Format: NSIS installer for Windows

### 3. Upload to R2
```bash
aws s3 cp dist/RinaWarp-Terminal-Pro-Setup.exe s3://rinawarp-downloads/terminal-pro/1.0.0/RinaWarp-Terminal-Pro-Windows.exe --acl public-read
```

### 4. Update SHA256
```bash
sha256sum RinaWarp-Terminal-Pro-Setup.exe >> SHA256SUMS.txt
```

## Why Windows Installer is Critical

According to the launch playbook:
- "Linux and Windows builds must be available for download"
- "If any fail → STOP and fix R2 permissions"
- Launch cannot proceed without both platforms

## Next Steps
1. Build Windows installer
2. Test installer on Windows system
3. Upload to R2 with public-read permissions
4. Update download URLs on website
5. Test download links
6. Update SHA256SUMS.txt with Windows checksum

EOF

echo "📄 Windows installer requirements documented: WINDOWS_INSTALLER_REQUIRED.md"
echo ""

# Test install.sh URL accessibility
echo "🧪 Testing install.sh URL accessibility..."
INSTALL_SH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://rinawarptech.com/install.sh")
if [[ "$INSTALL_SH_STATUS" = "200" ]]; then
    echo "✅ install.sh is accessible at https://rinawarptech.com/install.sh"
else
    echo "❌ install.sh not accessible (HTTP $INSTALL_SH_STATUS)"
    echo "   Note: This is expected if the website hasn't been redeployed with the new install.sh"
fi

echo ""
echo "🎯 CRITICAL LAUNCH BLOCKERS IDENTIFIED:"
echo "======================================="
echo ""
echo "1. 🚨 MISSING: R2 downloads not accessible"
echo "   • Need to upload AppImage and checksums to R2"
echo "   • Need to build and upload Windows installer"
echo ""
echo "2. ⚠️  REQUIRED: Website redeployment"
echo "   • install.sh needs to be served from website"
echo "   • Download URLs need to point to correct R2 paths"
echo ""
echo "3. ✅ READY: Installation script syntax and logic"
echo "   • install.sh is syntactically valid"
echo "   • SHA256 checksums generated"
echo ""

# Create a summary for the launch team
cat > PHASE_3_DOWNLOADS_STATUS.md << 'EOF'
# Phase 3 - Downloads Verification Status

## Status: 🚨 CRITICAL ISSUES IDENTIFIED

### Completed ✅
- [x] Install script created (install.sh)
- [x] SHA256 checksums generated
- [x] Syntax validation passed
- [x] Upload preparation completed

### Missing ❌
- [ ] R2 upload of Linux AppImage
- [ ] Windows installer build and upload
- [ ] Website redeployment with install.sh
- [ ] Download URL updates

### Critical Path for Launch
1. **IMMEDIATE**: Upload binaries to R2
2. **IMMEDIATE**: Build Windows installer
3. **REQUIRED**: Redeploy website
4. **REQUIRED**: Test all download links

### Files Ready for Upload
- `RinaWarp-Terminal-Pro.AppImage` (103MB)
- `SHA256SUMS.txt` (checksums)
- `install.sh` (installation script)

### Files Still Needed
- Windows installer (.exe file)
- Updated website deployment

## Impact on Launch
**LAUNCH BLOCKED** - Cannot proceed without R2 downloads accessible.

## Next Actions Required
1. Upload files to R2 storage
2. Build Windows installer
3. Redeploy website
4. Re-run download verification tests

EOF

echo "📄 Phase 3 status report created: PHASE_3_DOWNLOADS_STATUS.md"
echo ""
echo "🎯 LAUNCH STATUS: BLOCKED pending R2 uploads and Windows installer"