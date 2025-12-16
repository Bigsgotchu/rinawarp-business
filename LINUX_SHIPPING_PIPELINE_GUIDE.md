# Linux 0.4.0 Shipping Pipeline Guide

## Overview

The Linux shipping pipeline has been implemented and is ready for production deployment of RinaWarp Terminal Pro 0.4.0 for Linux platforms.

## 🚀 Quick Start

### One-Command Deployment

Set your environment variables and run the complete pipeline:

```bash
FEEDS_ORIGIN="https://rinawarptech.pages.dev" \
ARTIFACTS_ORIGIN="https://rinawarp-updates.rinawarptech.workers.dev" \
VERSION=0.4.0 \
pnpm ship:linux
```

### Using the Ship Script

The `ship:linux` script is now available in the root package.json:

```bash
# With all environment variables set
pnpm ship:linux

# Or specify them inline
REQUIRED_PLATFORMS=linux \
FEEDS_ORIGIN="https://rinawarptech.pages.dev" \
ARTIFACTS_ORIGIN="https://rinawarp-updates.rinawarptech.workers.dev" \
VERSION=0.4.0 \
pnpm ship:linux
```

## 🔧 Pipeline Steps

The shipping pipeline executes these steps in order:

### 1. Build Linux Artifact

```bash
pnpm -w --filter ./apps/terminal-pro/desktop build:linux
```

- Builds Electron app for Linux (AppImage, deb, rpm)
- Outputs to `apps/terminal-pro/desktop/dist/`

### 2. Generate Feeds

```bash
pnpm -w --filter ./apps/terminal-pro/desktop feeds:gen
```

- Creates electron-updater feeds
- Generates update metadata and manifests
- Prepares feed files for Pages deployment

### 3. Sync to R2

```bash
pnpm -w --filter ./apps/terminal-pro/desktop r2:sync
```

- Uploads artifacts to Cloudflare R2 storage
- Syncs to `rinawarp-updates/releases/` bucket
- Makes artifacts available via Worker endpoint

### 4. Deploy Worker

```bash
pnpm -w --filter ./apps/terminal-pro/desktop worker:deploy
```

- Deploys Cloudflare Worker for artifact serving
- Endpoint: `https://rinawarp-updates.rinawarptech.workers.dev`
- Serves binary downloads with proper CORS headers

### 5. Deploy Pages

```bash
pnpm -w --filter ./apps/website pages:deploy
```

- Deploys feed files to Cloudflare Pages
- Endpoint: `https://rinawarptech.pages.dev`
- Serves update feeds and metadata

### 6. Purge Cache

```bash
pnpm -w --filter ./apps/terminal-pro/desktop cache:purge
```

- Purges Cloudflare cache for feed URLs
- Ensures clients see updates immediately
- Critical for zero-downtime updates

### 7. Production Verification

```bash
pnpm -w --filter ./apps/terminal-pro/desktop prepublish:verify:prod
```

- Validates split-origin configuration
- Checks feed accessibility
- Verifies artifact downloads
- Confirms update mechanism integrity

## 📋 Environment Variables

| Variable             | Required | Default                                             | Description                           |
| -------------------- | -------- | --------------------------------------------------- | ------------------------------------- |
| `VERSION`            | Yes      | -                                                   | Version being shipped (e.g., "0.4.0") |
| `FEEDS_ORIGIN`       | Yes      | `https://rinawarptech.pages.dev`                    | Pages deployment origin               |
| `ARTIFACTS_ORIGIN`   | Yes      | `https://rinawarp-updates.rinawarptech.workers.dev` | Worker/R2 artifact origin             |
| `REQUIRED_PLATFORMS` | Yes      | `linux`                                             | Target platforms (linux/mac/win)      |

## 🔄 Fallback Commands

If any step fails, individual commands can be run manually:

### R2 Sync Fallback

```bash
pnpm dlx wrangler r2 object put rinawarp-updates/releases/$VERSION/RinaWarp-Terminal-Pro-$VERSION.AppImage \
  --file ./apps/terminal-pro/desktop/dist/RinaWarp\ Terminal\ Pro-$VERSION-x86_64.AppImage
```

### Worker Deploy Fallback

```bash
cd apps/terminal-pro/desktop && pnpm dlx wrangler deploy
```

### Pages Deploy Fallback

```bash
cd apps/website && pnpm dlx wrangler pages deploy ./dist/updates --project-name rinawarptech
```

## 🛠️ Individual Commands

You can also run each step individually:

```bash
# Build only
pnpm -w --filter ./apps/terminal-pro/desktop build:linux

# Generate feeds only
pnpm -w --filter ./apps/terminal-pro/desktop feeds:gen

# Deploy Worker only
pnpm -w --filter ./apps/terminal-pro/desktop worker:deploy

# Deploy Pages only
pnpm -w --filter ./apps/website pages:deploy

# Verify production setup
pnpm -w --filter ./apps/terminal-pro/desktop prepublish:verify:prod
```

## 🔍 Troubleshooting

### Common Issues

1. **R2 Sync Fails**
   - Check Wrangler authentication: `pnpm dlx wrangler whoami`
   - Verify R2 bucket exists and is accessible
   - Ensure proper permissions for object upload

2. **Worker Deploy Fails**
   - Check for syntax errors in Worker code
   - Verify Wrangler configuration
   - Check Cloudflare account limits

3. **Pages Deploy Fails**
   - Ensure `dist/updates` directory exists
   - Check Pages project configuration
   - Verify build output is complete

4. **Cache Purge Fails**
   - Verify Cloudflare API token has purge permissions
   - Check that feed URLs are correctly formatted
   - Ensure cache zones are properly configured

### Debug Mode

Run with verbose output to see detailed logs:

```bash
# Enable debug output
DEBUG=* FEEDS_ORIGIN="https://rinawarptech.pages.dev" \
ARTIFACTS_ORIGIN="https://rinawarp-updates.rinawarptech.workers.dev" \
VERSION=0.4.0 \
pnpm ship:linux
```

## 📊 Expected Timeline

- **Build**: 2-5 minutes
- **Feeds Generation**: 30-60 seconds
- **R2 Sync**: 1-3 minutes
- **Worker Deploy**: 30-60 seconds
- **Pages Deploy**: 1-2 minutes
- **Cache Purge**: 15-30 seconds
- **Verification**: 30-60 seconds

**Total**: ~6-12 minutes for complete deployment

## 🔒 Security Notes

- All deployments use production endpoints
- Artifact signing and verification enabled
- CORS properly configured for cross-origin updates
- Cache invalidation ensures immediate propagation

## 📈 Success Indicators

After successful deployment:

1. ✅ Linux artifacts available at Worker endpoint
2. ✅ Update feeds accessible via Pages
3. ✅ Cache purged and updates propagating
4. ✅ Production verification passed
5. ✅ Clients can check for and download updates

## 🎯 Next Steps

1. **Monitor**: Watch for update check success
2. **Test**: Verify update flow works end-to-end
3. **Notify**: Inform users about new version availability
4. **Document**: Update release notes and changelog

---

**Pipeline Status**: ✅ IMPLEMENTED AND READY  
**Last Updated**: 2025-12-16T06:56:12Z  
**Version**: 0.4.0 Linux Release
