# Build Fix Guide - RinaWarp Terminal Pro

## Issue Summary

The AppImage contains Node.js instead of the Electron application, preventing the desktop app from launching.

## Root Cause Analysis

Based on the smoke test findings:

- ✅ Application code structure is correct
- ✅ electron-builder configuration appears proper
- ❌ AppImage packaging process failed to include Electron runtime
- ❌ Binary responds as Node.js instead of launching Electron app

## Potential Causes

1. **Incorrect main file reference** - May be pointing to Node.js entry instead of Electron
2. **electron-builder configuration issue** - AppImage target not properly configured
3. **Build process corruption** - Previous builds may have corrupted the output
4. **Missing Electron dependencies** - Runtime not properly bundled

## Quick Fix Steps

### 1. Verify Main Entry Point

```bash
# Check if main.js exists and is proper Electron main process
head -20 apps/terminal-pro/desktop/src/main.js
```

### 2. Clean Rebuild

```bash
cd apps/terminal-pro/desktop
# Clean previous builds
rm -rf dist/ build-output/
# Clear electron cache
rm -rf node_modules/.cache/
# Fresh install
pnpm install
# Rebuild with verbose output
pnpm build:linux --verbose
```

### 3. Verify electron-builder Configuration

Ensure the build config includes proper AppImage settings:

```json
{
  "linux": {
    "target": [
      {
        "target": "AppImage",
        "arch": ["x64"]
      }
    ],
    "category": "Development"
  }
}
```

### 4. Test Build Output

```bash
# Check if the built AppImage contains Electron
./dist/RinaWarp-Terminal-Pro-*-x86_64.AppImage --version
# Should show app version, not Node.js version
```

### 5. Validate AppImage Contents

```bash
# Extract and verify contents
./dist/RinaWarp-Terminal-Pro-*-x86_64.AppImage --appimage-extract
ls squashfs-root/
# Should see: AppRun, rinawarp-terminal-pro (Electron binary), resources/
```

## Verification Commands

### Before Fix (Current Broken State)

```bash
$ ./RinaWarp-Terminal-Pro-1.0.0-x86_64.AppImage --version
v22.21.1  # ❌ Node.js version
```

### After Fix (Expected Working State)

```bash
$ ./RinaWarp-Terminal-Pro-1.0.0-x86_64.AppImage --version
1.0.0  # ✅ Application version

$ ./RinaWarp-Terminal-Pro-1.0.0-x86_64.AppImage --help
# Should show Electron app help, not Node.js help
```

## Long-term Prevention

### Add Build Verification

Create a post-build smoke test script:

```bash
#!/bin/bash
# scripts/verify-build.sh
APPIMAGE="$1"
if [[ -z "$APPIMAGE" ]]; then
  echo "Usage: $0 <path-to-appimage>"
  exit 1
fi

echo "Testing AppImage: $APPIMAGE"

# Test 1: Should not be Node.js
VERSION=$($APPIMAGE --version 2>/dev/null)
if [[ "$VERSION" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "❌ FAIL: AppImage contains Node.js ($VERSION)"
  exit 1
fi

# Test 2: Should be executable
if [[ ! -x "$APPIMAGE" ]]; then
  echo "❌ FAIL: AppImage is not executable"
  exit 1
fi

echo "✅ PASS: AppImage appears to be properly built"
```

### CI/CD Integration

Add to build pipeline:

```yaml
- name: Verify Build
  run: |
    cd apps/terminal-pro/desktop
    ./scripts/verify-build.sh dist/*.AppImage
```

## Emergency Workaround

If immediate fix is needed, consider shipping the source code with build instructions until the AppImage issue is resolved.

## Next Steps

1. Apply fix and rebuild
2. Re-run smoke test
3. Validate on clean machine
4. Proceed with distribution only after successful test
