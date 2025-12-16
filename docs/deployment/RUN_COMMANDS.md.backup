# Cloudflare Pages CI/CD - Run Commands

## 🚀 Quick Start Commands

### 1. Local Development Testing

```bash
# Set environment for local testing
cd apps/terminal-pro/desktop
export UPDATES_ORIGIN="https://your-project.pages.dev"

# Test verification stack
pnpm prepublish:verify

# Test individual verification steps
pnpm prepublish:guard          # Artifact presence + headers
pnpm prepublish:hash           # SHA-256 verification
pnpm prepublish:feeds          # Feed validation
pnpm prepublish:version        # Version monotonicity
pnpm prepublish:blockmap       # Blockmap validation
pnpm prepublish:signatures     # GPG signatures (optional)
pnpm prepublish:signing        # Platform signing (optional)
pnpm prepublish:provenance     # SLSA provenance (optional)
```

### 2. Full Local Release Test

```bash
# Build and test complete atomic release
cd apps/terminal-pro/desktop

# Build all artifacts
pnpm build:all

# Stage Pages tree
node ./scripts/prepare-updates-tree.js 0.4.0

# Run verification
pnpm prepublish:verify

# Test atomic release (if CF credentials available)
pnpm release:atomic
```

### 3. Cache Management

```bash
# Purge feed cache manually (requires CF credentials)
cd apps/terminal-pro/desktop
export CF_API_TOKEN="your-token"
export CF_ZONE_ID="your-zone-id"

# Purge only feed files
pnpm cache:purge

# Test cache purge effectiveness
curl -I https://your-project.pages.dev/stable/latest.yml | grep -i cache
```

### 4. GitHub Actions Workflow

```bash
# Trigger release workflow via GitHub CLI (if available)
gh workflow run release-to-pages.yml -f version=0.4.0

# Or manually:
# 1. Go to GitHub Actions tab
# 2. Select "Release to Pages"
# 3. Click "Run workflow"
# 4. Enter version (e.g., 0.4.0)
# 5. Monitor execution
```

### 5. Rollback Commands

```bash
# Option 1: Git revert (fastest)
git revert <commit-hash>
git push origin main

# Option 2: Re-deploy previous version
cd apps/terminal-pro/desktop
export UPDATES_ORIGIN="https://your-project.pages.dev"
export VERSION="0.3.0"  # Previous version

# Build and stage previous version
pnpm build:all
node ./scripts/prepare-updates-tree.js $VERSION

# Verify and deploy
pnpm prepublish:verify
pnpm deploy:pages
pnpm cache:purge
```

## 🔧 Debug Commands

### Verification Stack Debug

```bash
# Run verification with detailed output
cd apps/terminal-pro/desktop
export UPDATES_ORIGIN="https://your-project.pages.dev"

# Individual script debugging
node ./scripts/pre-publish-guard.js
node ./scripts/validate-feeds.js
node ./scripts/check-monotonic-version.js

# Step-by-step verification
pnpm prepublish:verify:individual
```

### Cloudflare Pages Debug

```bash
# Check Pages deployment status
cd apps/terminal-pro/desktop
pnpm dlx wrangler@3 pages deployment list --project-name=rinawarp-updates

# Verify Pages project configuration
pnpm dlx wrangler@3 pages project list

# Test Pages deployment locally (if needed)
pnpm dlx wrangler@3 pages deploy dist/updates --project-name=rinawarp-updates --branch=production --dry-run
```

### Feed and Artifact Verification

```bash
# Test feed accessibility
curl -I https://your-project.pages.dev/stable/latest.yml
curl -I https://your-project.pages.dev/stable/latest-mac.yml
curl -I https://your-project.pages.dev/stable/SHA256SUMS

# Verify artifact URLs in feeds
curl https://your-project.pages.dev/stable/latest.yml | grep -E "(url|filename)"

# Check cache headers
curl -I https://your-project.pages.dev/stable/latest.yml | grep -i cache
curl -I https://your-project.pages.dev/stable/RinaWarpTerminalPro-0.4.0.exe | grep -i cache
```

### Health Monitoring

```bash
# Run health checks
cd apps/terminal-pro/desktop
pnpm monitor:check        # Basic health check
pnpm monitor:health       # Detailed health status

# Manual health verification
curl https://your-project.pages.dev/stable/latest.yml > /dev/null && echo "✅ Feed accessible" || echo "❌ Feed failed"
```

## 📊 CI/CD Pipeline Commands

### Pre-deployment Checklist

```bash
cd apps/terminal-pro/desktop

# 1. Ensure all tests pass
pnpm test
pnpm lint

# 2. Build artifacts
pnpm build:all

# 3. Verify directory structure
ls -la dist/updates/stable/

# 4. Run verification stack
pnpm prepublish:verify

# 5. Test cache purge (if credentials available)
if [ -n "$CF_API_TOKEN" ]; then
  pnpm cache:purge
fi
```

### Production Deployment

```bash
cd apps/terminal-pro/desktop
export VERSION="0.4.0"

# Execute complete atomic release
pnpm build:all &&
pnpm release:stage &&
pnpm prepublish:verify &&
pnpm deploy:pages &&
pnpm cache:purge

# Monitor post-deployment
pnpm monitor:check
```

## 🔍 Troubleshooting Commands

### DNS Resolution Issues

```bash
# Check DNS resolution
nslookup your-project.pages.dev

# Test with explicit origin
export UPDATES_ORIGIN="https://your-project.pages.dev"
pnpm prepublish:verify

# Alternative: Use fallback
export UPDATES_FALLBACK="https://your-project.pages.dev"
pnpm prepublish:verify
```

### Cloudflare API Issues

```bash
# Test CF API token permissions
curl -X GET "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID" \
  -H "Authorization: Bearer $CF_API_TOKEN"

# Test cache purge permissions
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"files":["/stable/latest.yml"]}'
```

### Build Issues

```bash
# Clean rebuild
cd apps/terminal-pro/desktop
rm -rf dist/ node_modules/.vite
pnpm install
pnpm build:all

# Check Electron builder
npx electron-builder --version
npx electron-builder --help
```

## 📋 Environment Setup

### Required Environment Variables

```bash
# For local development
export UPDATES_ORIGIN="https://your-project.pages.dev"

# For CI/CD (GitHub Actions)
export CF_ACCOUNT_ID="your-account-id"
export CF_API_TOKEN="your-api-token"
export CF_ZONE_ID="your-zone-id"
export PAGES_DOMAIN="your-project.pages.dev"
```

### GitHub Repository Configuration

```bash
# Set repository variables (via GitHub CLI)
gh variable set PAGES_DOMAIN --body "your-project.pages.dev"

# Set repository secrets (via GitHub CLI)
gh secret set CF_ACCOUNT_ID
gh secret set CF_API_TOKEN
gh secret set CF_ZONE_ID
```

## 🎯 Success Verification Commands

```bash
cd apps/terminal-pro/desktop

# Verify all components
echo "=== Verification Stack ==="
pnpm prepublish:verify && echo "✅ Verification passed"

echo "=== Pages Deployment ==="
curl -s -o /dev/null -w "%{http_code}" https://your-project.pages.dev/stable/latest.yml && echo " ✅ Feed accessible"

echo "=== Cache Headers ==="
curl -s -I https://your-project.pages.dev/stable/latest.yml | grep -i "cache-control.*no-store" && echo "✅ Feed cache correct"

echo "=== Health Check ==="
pnpm monitor:check && echo "✅ Health check passed"

echo "🎉 All systems operational!"
```

Use these commands to test, debug, and maintain your Cloudflare Pages CI/CD pipeline!
