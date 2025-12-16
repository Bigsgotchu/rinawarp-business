# Go-Live Checklist for Electron 20.3.12 Pinning

## 🚀 Pre-Flight Verification

### Sanity + ABI Checks

```bash
# Verify Electron version is pinned
pnpm -w exec node -p "require('electron/package.json').version"
# Expected: 20.3.12

# Verify ABI compatibility
cd apps/terminal-pro/desktop
pnpm electron:abi
# Expected: 20.3.12 107

# Test native module rebuild
pnpm rebuild && pnpm test pty-smoke.test.ts
```

### Updater Feed Integrity (Pages)

```bash
# Set your Pages domain (or custom domain)
export UPDATES_ORIGIN="https://<your>.pages.dev"

# Consolidated validation matrix
pnpm prepublish:verify
```

## 🔄 Release Dry-Run

```bash
# Full release checklist validation
pnpm -w --filter ./apps/terminal-pro/desktop release:checklist

# Complete CI path simulation
pnpm -w --filter ./apps/terminal-pro/desktop release:atomic
```

## ⚡ Fast Rollback Drill (Test Once)

### Option 1: Re-run Previous Version

```bash
# Re-run previous version through release pipeline
git revert last-updates-commit
pnpm -w --filter ./apps/terminal-pro/desktop release:atomic
```

### Option 2: Cache Purge & Redeploy

```bash
# Redeploy and purge caches
git revert last-updates-commit
# Redeploy to Pages
# Purge CDN caches
pnpm -w --filter ./apps/terminal-pro/desktop cache:purge
```

## 🛡️ Continuous Protection

### CI Jobs Running Automatically

- **Electron Version Guards**: Validates pinning on every PR
- **PTY Smoke Test**: Catches ABI slips early on Linux
- **Updater Smoke Test**: Validates feed integrity
- **Builder Stack Lockfile Guard**: Prevents toolchain drift

### One-Liner Health Checks

```bash
# Verify pinned Electron version repo-wide
pnpm -w exec node -p "require('electron/package.json').version"

# Verify ABI compatibility
cd apps/terminal-pro/desktop && pnpm electron:abi

# Heal dev environment if download glitches
cd apps/terminal-pro/desktop && pnpm electron:heal
```

## 📋 Manual Verification Commands

### Native Module Compatibility

```bash
# Test PTY rebuild process
cd apps/terminal-pro/desktop
pnpm rebuild
node -e "console.log('ABI:', process.versions.modules)"

# Verify module loads correctly
node -e "const pty = require('node-pty'); console.log('✅ PTY loads successfully')"
```

### Update Feed Configuration

```bash
# Check update feed URL
cd apps/terminal-pro/desktop
node -e "
  const pkg = require('./package.json');
  console.log('Update URL:', pkg.build.publish[0].url);
"

# Test feed accessibility
curl -s "https://updates.rinawarp.dev/stable/latest.yml" | head -10
```

### Builder Stack Consistency

```bash
# Verify builder packages are aligned
pnpm list electron-builder electron-builder-squirrel-windows app-builder-lib dmg-builder
```

## 🎯 Success Criteria

✅ **All checks pass**: No version drift detected  
✅ **CI green**: All guard jobs complete successfully  
✅ **Native modules work**: PTY rebuilds without errors  
✅ **Update feed valid**: References correct Electron version  
✅ **Lockfile consistent**: Builder stack versions aligned

## 🚨 If Something Goes Wrong

1. **Version mismatch**: Check overrides in root and desktop package.json
2. **ABI errors**: Verify Node version and Electron headers compatibility
3. **Build failures**: Run `pnpm electron:heal` to rebuild environment
4. **Update issues**: Validate feed URL and cache purge

---

**Status**: 🟢 Ready for Production Deployment

_This configuration provides enterprise-grade Electron version management with multiple safety layers._
