# GitHub Actions AppImage Release Implementation

This implementation provides a complete GitHub Actions workflow for building, testing, and releasing AppImage artifacts with node-pty integration.

## 📋 What's Been Implemented

### 1. GitHub Actions Workflow

- **File**: `.github/workflows/release-appimage.yml`
- **Triggers**: Manual dispatch (`workflow_dispatch`) and version tags (`v*.*.*`)
- **Platform**: Ubuntu 22.04
- **Features**:
  - Node.js setup with npm caching
  - Deterministic native dependency rebuild for Electron
  - PTY smoke test validation
  - AppImage build with staging configuration
  - Scope guard verification (checks for unwanted files)
  - Size budget enforcement (180MB default)
  - SHA256 checksum generation
  - Artifact upload and optional GitHub Release creation

### 2. Supporting Scripts

#### Scope Guard (`scripts/ci-verify-appimage.sh`)

- Extracts AppImage and inspects contents
- Fails if forbidden content is found (source files, configs, docs)
- Ensures clean, production-ready builds

#### Size Budget (`scripts/check-size.sh`)

- Validates AppImage size against configured budget
- Default: 180MB (adjustable via `MAX_MB` environment variable)
- Uses GNU stat for accurate file size measurement

#### PTY Smoke Test (`scripts/smoke-pty.mjs`)

- Tests node-pty functionality before full build
- Spawns a PTY and validates output
- Catches "build succeeded but PTY fails" scenarios

#### Build Staging (`scripts/build-staging.sh`)

- Prepares staging-specific build environment
- Sets production build variables
- Creates necessary directories

### 3. Electron Builder Configuration

- **File**: `electron-builder-config.js`
- **Key Features**:
  - **asarUnpack**: `["**/*.node"]` - Only unpacks native modules
  - Optimized AppImage build settings
  - Proper desktop integration
  - Maximum compression for smaller artifacts

### 4. Updated Package.json Scripts

- `ci:verify:appimage` - Run scope guard
- `ci:check:size` - Enforce size budget
- `ci:smoke:pty` - Test PTY functionality
- `dist:linux:staged` - Complete staging build process

## 🚀 Usage

### Manual Trigger

```bash
# Navigate to Actions tab in GitHub repository
# Select "Release AppImage (staged)"
# Click "Run workflow"
```

### Tag-based Release

```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0
```

## 🔧 Node-PTY Hardening Features

### 1. Version Pinning (Recommended)

Add to your `package.json`:

```json
{
  "dependencies": {
    "node-pty": "1.0.0",
    "electron": "28.0.0"
  }
}
```

### 2. Native Dependency Rebuild

The workflow uses `electron-builder install-app-deps` to ensure:

- node-pty is rebuilt for the correct Electron version
- ABI compatibility between Electron and native modules
- Deterministic builds across environments

### 3. Minimal asarUnpack

Only `.node` files are unpacked from asar archive:

- Reduces AppImage size
- Improves security (no source code exposure)
- Faster startup times

### 4. Runtime Validation

PTY smoke test ensures:

- Native modules load correctly
- PTY spawning works on target system
- Environment compatibility

## 📦 Build Process Flow

1. **Setup**: Checkout code, setup Node.js with caching
2. **Dependencies**: Install npm packages
3. **Native Rebuild**: Rebuild node-pty for Electron
4. **Smoke Test**: Validate PTY functionality
5. **Build**: Compile TypeScript, build renderer, prepare staging
6. **Package**: Create AppImage with electron-builder
7. **Verify**: Run scope guard and size checks
8. **Upload**: Store artifacts and generate checksums
9. **Release**: Create GitHub Release on tags

## 🛠️ Customization

### Size Budget

Modify in workflow file:

```yaml
env:
  MAX_MB: '150' # Adjust to your needs
```

### App Metadata

Update `electron-builder-config.js`:

```js
appId: 'your.app.id',
productName: 'Your App Name',
```

### Build Configuration

Add staging-specific assets in `scripts/build-staging.sh`:

```bash
# Copy staging configs
cp assets/staging/* dist-terminal-pro/ 2>/dev/null || true
```

## 🔍 Troubleshooting

### Common Issues

1. **PTK Smoke Test Fails**
   - Check node-pty version compatibility
   - Ensure native rebuild completed successfully
   - Verify system dependencies (gcc, make, python)

2. **Size Budget Exceeded**
   - Review asarUnpack configuration
   - Check for unnecessary files in build
   - Optimize bundle size

3. **Scope Guard Fails**
   - Check for development files in production build
   - Verify Vite/build configuration
   - Ensure no source maps or configs included

### Debug Steps

```bash
# Test locally
npm run ci:smoke:pty
npm run dist:linux:staged
npm run ci:verify:appimage
npm run ci:check:size
```

## 📋 Files Created/Modified

### New Files

- `.github/workflows/release-appimage.yml`
- `scripts/ci-verify-appimage.sh`
- `scripts/check-size.sh`
- `scripts/smoke-pty.mjs`
- `scripts/build-staging.sh`
- `electron-builder-config.js`

### Modified Files

- `package.json` - Added new scripts and build configuration

## ✅ Validation Checklist

- [ ] GitHub Actions workflow created
- [ ] Scope guard script implemented
- [ ] Size budget check implemented
- [ ] PTY smoke test implemented
- [ ] Electron builder configuration optimized
- [ ] Package.json scripts updated
- [ ] Build staging script created
- [ ] Native dependency rebuild configured
- [ ] Minimal asarUnpack setting applied
- [ ] GitHub Release integration configured

## 🎯 Next Steps

1. **Test the workflow** with a manual trigger
2. **Pin dependencies** in package.json for deterministic builds
3. **Add staging assets** if needed in build-staging.sh
4. **Configure code signing** if required for distribution
5. **Set up monitoring** for build success/failure notifications
6. **Add additional targets** (Deb, RPM) if needed
7. **Implement auto-versioning** based on git tags

This implementation provides a production-ready, secure, and efficient AppImage release pipeline with robust node-pty integration.
