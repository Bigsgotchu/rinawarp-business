# Final Release Checklist

## Pre-Release Setup (One-time per environment)

### Secrets Configuration

Set these secrets in your GitHub repository settings:

**Required:**

- `GH_TOKEN` - GitHub token for releases

**Optional (for code signing & monitoring):**

- `SENTRY_DSN` - Sentry DSN for crash reporting
- `MACOS_CERT_P12_BASE64` - Base64-encoded macOS signing certificate
- `MACOS_CERT_PASSWORD` - macOS certificate password
- `APPLE_ID` - Apple ID email for notarization
- `APPLE_APP_SPECIFIC_PASSWORD` - App-specific password
- `APPLE_TEAM_ID` - Apple Team ID (if required)
- `WIN_CERT_PFX_BASE64` - Base64-encoded Windows signing certificate
- `WIN_CERT_PASSWORD` - Windows certificate password

### Toolchain Verification

Ensure these versions are pinned:

- `.nvmrc` = `20.19.6`
- `packageManager` = `pnpm@9.0.0`

## Local Testing

Before creating a release, run locally once:

```bash
# Full quality pipeline
pnpm repo:cleanup && pnpm quality:check && pnpm ship
```

This will:

- Clean repository and run autofixes
- Execute all quality gates (TypeScript, ESLint, Prettier, Spell Check, CSS Lint)
- Build the Electron app for all platforms
- Run packaged preload smoke tests
- Prepare for publishing (only in CI)

## Release Process

### Method 1: Changesets (Recommended)

```bash
# 1. Create changeset for changes
pnpm release:prepare

# 2. Commit and push changes
git add .
git commit -m "chore: prepare release"
git push

# 3. When merged to main, CI will:
#    - Create version PR
#    - Generate changelogs
#    - Build and sign applications
#    - Publish to GitHub Releases
```

### Method 2: Manual Tag

```bash
# 1. Tag and push
git tag vX.Y.Z
git push --tags

# 2. CI will automatically:
#    - Build, sign, and notarize applications
#    - Run smoke tests on packaged builds
#    - Publish to GitHub Releases
#    - Verify signatures (macOS Gatekeeper, Windows)
```

## Post-Release Verification

### GitHub Releases

1. **Verify Artifacts**: Check that all platform builds are present
   - macOS: `.dmg` and `.zip` files
   - Windows: `.exe` installer and `.zip` files
   - Linux: `.AppImage`, `.deb`, and `.zip` files

2. **Code Signing Verification**:
   - **macOS**: Right-click app → Get Info → Check "Digital Signature" shows "Developer ID Application: RinaWarp, Inc."
   - **Windows**: Right-click installer → Properties → Digital Signatures tab

3. **Notarization Check (macOS)**:
   ```bash
   # Verify notarization
   xcrun notarytool log "APP_PATH" --keychain-profile "AC_PASSWORD"
   ```

### Smoke Testing

1. **Download & Install**: Test the actual distributed packages
2. **Core Functionality**: Verify the app launches and basic features work
3. **Error Reporting**: If Sentry is enabled, verify test errors appear in dashboard

### Monitoring

- **Sentry Dashboard**: Check for any crash reports
- **GitHub Issues**: Monitor for user-reported issues
- **Download Analytics**: Track adoption of new release

## Rollback Procedure

If critical issues are found:

1. **Immediately**: Create hotfix branch from last stable tag
2. **Fix & Test**: Apply minimal fix with full testing
3. **Emergency Release**:
   ```bash
   git tag vX.Y.Z-hotfix
   git push --tags
   ```
4. **Notify Users**: Update release notes with critical fix notice

## Emergency Contacts

- **Security Issues**: security@rinawarp.com
- **Production Outages**: on-call@rinawarp.com
- **General Support**: GitHub Issues

---

**✅ Release Ready**: When all checks pass and artifacts are verified, your application is production-ready with enterprise-grade code signing, notarization, and monitoring!
