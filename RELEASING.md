# Release Guide

## Quick Ship

For local development or when you want full control:

```bash
pnpm ship
```

This runs the complete pipeline:

1. **Repository cleanup** - formats and lints autofixes
2. **Quality gates** - typecheck, lint, format, spell, CSS lint
3. **Electron preload smoke test** - verifies preload can be resolved
4. **Electron build** - builds for all platforms
5. **Packaged smoke test** - verifies preload is in packaged app
6. **Publish** - publishes to GitHub Releases (only in CI)

## Changesets Workflow (Recommended)

For managed versioning and changelogs:

```bash
# 1. Create a changeset for your changes
pnpm changeset

# 2. Version packages (creates changelog and updates versions)
pnpm version

# 3. Tag and publish the release
pnpm release:tag
```

The Changesets GitHub Action automatically:

- Creates version PRs on main branch merges
- Generates changelogs from changeset files
- Publishes packages when PRs are merged
- Creates GitHub Releases with proper versioning

## Tag-based Release

For manual version control:

```bash
git tag vX.Y.Z
git push --tags
```

CI will automatically:

- Build and test the release
- Verify preload in packaged apps
- Publish to GitHub Releases
- Run final smoke tests

## Quality Gates

The ship pipeline enforces these quality gates:

- **TypeScript**: `pnpm typecheck`
- **ESLint**: `pnpm lint:ci` (strict mode)
- **Prettier**: `pnpm format:check`
- **Spell Check**: `pnpm spell`
- **CSS Lint**: `pnpm lint:css`
- **Preload Smoke**: `pnpm smoke:preload`
- **Packaged Preload**: `pnpm smoke:preload:packaged`

## Local Development

For faster local iteration, use changed-only checks:

```bash
# Format changed files only
pnpm format:changed

# Lint changed files only
pnpm lint:changed

# Spell check changed files only
pnpm spell:changed
```

Git hooks automatically run these fast checks:

- **pre-commit**: Changed-only formatting and linting
- **pre-push**: Changed-only checks before pushing to remote

## Electron Builder Configuration

The build configuration ensures preload files are always included:

```json
{
  "build": {
    "files": [
      "dist/**",
      "node_modules/**",
      "package.json",
      "**/electron/**/preload.*",
      "**/electron/main/preload.*",
      "**/preload.*"
    ]
  }
}
```

This guarantees that preload scripts are packaged regardless of the bundler layout.

## Code Signing (Optional)

### macOS Signing/Notarization

To enable macOS code signing and notarization:

1. **Set up certificates** in your Apple Developer account
2. **Configure GitHub Secrets**:
   - `MACOS_CERT_P12_BASE64`: Base64-encoded .p12 certificate
   - `MACOS_CERT_PASSWORD`: Certificate password
   - `APPLE_ID`: Apple ID email
   - `APPLE_APP_SPECIFIC_PASSWORD`: App-specific password
   - `APPLE_TEAM_ID`: Apple Team ID (optional, if required by your account)

3. **Certificate setup**:
   - Export your Developer ID Application certificate as .p12 file
   - Base64 encode it: `base64 -i certificate.p12`
   - Add to GitHub secrets as `MACOS_CERT_P12_BASE64`

### Windows Code Signing

To enable Windows code signing:

1. **Obtain code signing certificate** (.pfx file)
2. **Configure GitHub Secrets**:
   - `WIN_CERT_PFX_BASE64`: Base64-encoded .pfx certificate OR
   - `WIN_CERT_PFX_URL`: Direct URL to .pfx file
   - `WIN_CERT_PASSWORD`: Certificate password

3. **Certificate setup**:
   - Base64 encode your .pfx file: `base64 -i certificate.pfx`
   - Add to GitHub secrets as `WIN_CERT_PFX_BASE64`

### Release Preparation

For a complete release workflow with changesets:

```bash
# Create changeset and prepare release
pnpm release:prepare

# This opens an interactive changeset editor
# Commit changes and when merged to main, CI runs the full release process
```

### Local Release

For full local control:

```bash
# Complete ship pipeline
pnpm ship

# This runs: cleanup → quality → build → packaged smoke → publish
```

## Toolchain Versions

The project is locked to specific toolchain versions:

- **Node.js**: 20.19.6
- **pnpm**: 9.0.0
- **Electron**: 20.3.12

See `.nvmrc` and `package.json` for exact versions.

## CI/CD Workflows

### Continuous Integration (CI)

- Runs on all PRs and main branch pushes
- Full quality gates and smoke tests
- Uses Node.js version from `.nvmrc`
- Caches pnpm dependencies
- Corepack enabled for pnpm 9.0.0

### Release Workflow

- Triggers on version tags (`v*.*.*`)
- Runs full ship pipeline
- Publishes to GitHub Releases
- Verifies packaged builds
- Optional code signing for macOS/Windows

### Changesets Workflow

- Runs on main branch pushes
- Automatically creates version PRs
- Manages changelog generation
- Publishes packages when PRs are merged

## Workflow States

### Development Workflow

1. Make changes
2. Run `pnpm ship` locally to verify
3. Create changeset: `pnpm changeset`
4. Commit and push
5. Let CI handle the rest

### Release Workflow (Manual)

1. Create changeset: `pnpm changeset`
2. Version packages: `pnpm version`
3. Tag release: `pnpm release:tag`
4. Push changes: `git push --follow-tags`

### Quick Release (CI-driven)

1. Commit changes with conventional commits
2. Let Changesets Action create version PR
3. Merge PR to trigger release
4. CI handles building and publishing

## Troubleshooting

### Preload Not Found

If `smoke:preload` fails:

1. Check preload file exists in expected locations
2. Verify electron-builder configuration includes preload files
3. Ensure build process copies preload to correct directory

### Quality Gate Failures

1. Run `pnpm ship` locally to see exact failures
2. Use `pnpm -s format:fix` and `pnpm -s lint:fix` for autofixes
3. Check TypeScript errors with `pnpm typecheck`

### Build Failures

1. Ensure Node.js version matches `.nvmrc`
2. Clear pnpm cache: `pnpm store prune`
3. Rebuild dependencies: `pnpm install --force`

### Changesets Issues

1. Check `.changeset/config.json` configuration
2. Ensure proper changeset file format
3. Verify GitHub token has proper permissions

## Advanced Usage

### Custom Release Process

```bash
# Custom pipeline with specific steps
pnpm -s repo:cleanup
pnpm -s quality:check
pnpm -s smoke:preload
pnpm -w --filter ./apps/terminal-pro/desktop build
pnpm -s smoke:preload:packaged
```

### Pre-release Testing

```bash
# Dry run without publishing
NODE_ENV=development pnpm ship

# Build only without publish
pnpm -w --filter ./apps/terminal-pro/desktop build
pnpm smoke:preload:packaged
```

### Emergency Hotfix

```bash
# Quick fix without full pipeline
git checkout -b hotfix/critical-fix
# Make changes
pnpm format:changed && pnpm lint:changed
git commit -m "fix: critical hotfix"
git push origin hotfix/critical-fix
# Then create PR for review
```
