# Pipeline Testing Guide

This guide provides comprehensive instructions for testing the complete RinaWarp pipeline end-to-end, ensuring all components work together correctly.

## Overview

The pipeline testing process verifies:

1. **R2 Upload + Admin API Integration**: Ensures AppImage uploads to R2 and updates the latest.json manifest
2. **Repository Synchronization**: Aligns all repos to the same commit to prevent drift
3. **Website Integration**: Verifies the website properly fetches data from the Admin API
4. **End-to-End Download**: Tests the complete user download experience

## Prerequisites

### Environment Variables

Set these environment variables before running tests:

```bash
export ADMIN_API_BASE_URL="https://rinawarp-admin-api.rinawarptech.workers.dev"
export ADMIN_API_TOKEN="your_admin_api_token"
export R2_ACCESS_KEY_ID="your_r2_access_key"
export R2_SECRET_ACCESS_KEY="your_r2_secret_key"
export R2_ACCOUNT_ID="your_r2_account_id"
export R2_PUBLIC_BASE_URL="https://download.rinawarptech.com"
export WEBSITE_BASE_URL="https://rinawarptech.com"
```

### Required Tools

- Git
- curl
- jq
- sha256sum
- Node.js (for some scripts)

### GitHub Actions Secrets

Ensure these secrets are configured in your GitHub repository:

- `ADMIN_API_BASE_URL`
- `ADMIN_API_TOKEN`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_ACCOUNT_ID`
- `R2_PUBLIC_BASE_URL`

## Quick Start

### 1. Run All Tests

Execute the comprehensive test suite:

```bash
cd scripts
chmod +x *.sh
./run-all-tests.sh
```

This will run all tests and generate a detailed report.

### 2. Individual Test Components

Run specific tests as needed:

```bash
# Pipeline end-to-end test
./test-pipeline-e2e.sh

# Repository synchronization
./sync-repos-to-commit.sh

# Website integration verification
./verify-website-integration.sh
```

## Detailed Testing Procedures

### 1. Test the Pipeline with a Throwaway Tag

#### A) Create and Push a Test Tag

```bash
cd /path/to/desktop/repo
git checkout fix/windows-r2
git pull --ff-only

# Create unique test tag
TEST_TAG="v1.0.2-test.$(date +%Y%m%d%H%M%S)"
git tag -a "$TEST_TAG" -m "CI test: R2 upload + Admin API latest"
git push origin "$TEST_TAG"
```

#### B) Verify R2 Upload and Admin API

```bash
# Check latest.json
curl -sS "$ADMIN_API_BASE_URL/api/downloads/latest.json" | jq

# Expected output should show:
# - version == your test tag version
# - linux.appimage.url points to R2 URL
# - linux.appimage.sha256 is non-empty
```

#### C) Verify SHA256 Matches

```bash
URL="$(curl -sS "$ADMIN_API_BASE_URL/api/downloads/latest.json" | jq -r '.linux.appimage.url')"
SHA_EXPECTED="$(curl -sS "$ADMIN_API_BASE_URL/api/downloads/latest.json" | jq -r '.linux.appimage.sha256')"

curl -L -o app.AppImage "$URL"
SHA_ACTUAL="$(sha256sum app.AppImage | awk '{print $1}')"

test "$SHA_EXPECTED" = "$SHA_ACTUAL" && echo "✅ SHA256 verified"
```

#### D) Run AppImage Smoke Tests

```bash
./app.AppImage --smoke-test --smoke-ipc --smoke-rina-roundtrip
./app.AppImage --smoke-test --smoke-ipc --smoke-rina-roundtrip --smoke-offline
```

#### E) Cleanup Test Tag

```bash
git tag -d "$TEST_TAG"
git push origin ":refs/tags/$TEST_TAG"
```

### 2. Repository Synchronization

#### A) Check Current Alignment

```bash
cd /path/to/desktop/repo
git rev-parse HEAD  # Get current commit SHA
```

#### B) Sync Other Repos

```bash
# Sync all repos to desktop repo's commit
./sync-repos-to-commit.sh

# Or hard align to specific SHA
./sync-repos-to-commit.sh --hard
```

#### C) Verify Alignment

```bash
# Check each repo's commit
cd /path/to/backend
git rev-parse HEAD

cd /path/to/workers
git rev-parse HEAD

# All should match the desktop repo's commit
```

### 3. Website Integration Verification

#### A) Verify API Endpoints

```bash
# Check pricing API
curl -sS "$ADMIN_API_BASE_URL/api/pricing" | jq

# Check downloads API
curl -sS "$ADMIN_API_BASE_URL/api/downloads/latest.json" | jq
```

#### B) Verify Website Pages

```bash
# Check pricing page loads
curl -I "$WEBSITE_BASE_URL/pricing"

# Check download page loads
curl -I "$WEBSITE_BASE_URL/download"

# Check success page loads
curl -I "$WEBSITE_BASE_URL/success"
```

#### C) End-to-End Download Test

```bash
# Get download URL from API
URL="$(curl -sS "$ADMIN_API_BASE_URL/api/downloads/latest.json" | jq -r '.linux.appimage.url')"

# Download and verify
curl -L -o app.AppImage "$URL"
sha256sum app.AppImage
```

## GitHub Actions Integration

### 1. Update Workflows to Use Reusable Hardening

Replace hardening steps in existing workflows with:

```yaml
jobs:
  build:
    uses: rinawarp/.github/.github/workflows/reusable-hardening.yml@fix/windows-r2
    with:
      os: ubuntu-latest
    secrets: inherit
```

### 2. Add Admin API Update to Release Workflows

In your release workflow, add after R2 upload:

```yaml
- name: Update Admin API latest manifest
  if: startsWith(github.ref, 'refs/tags/')
  env:
    ADMIN_API_BASE_URL: ${{ secrets.ADMIN_API_BASE_URL }}
    ADMIN_API_TOKEN: ${{ secrets.ADMIN_API_TOKEN }}
    R2_PUBLIC_BASE_URL: ${{ secrets.R2_PUBLIC_BASE_URL }}
  run: |
    set -euo pipefail
    APP="$(ls -1 dist-terminal-pro/*.AppImage | head -n 1)"
    SHA_FILE="${APP}.sha256"
    VERSION="${GITHUB_REF_NAME#v}"
    BASENAME="$(basename "$APP")"

    SHA256="$(cat "$SHA_FILE" | awk '{print $1}')"
    APPIMAGE_URL="${R2_PUBLIC_BASE_URL}/terminal-pro/v${VERSION}/${BASENAME}"

    curl -X PUT "${ADMIN_API_BASE_URL}/api/admin/downloads/latest" \
      -H "Authorization: Bearer ${ADMIN_API_TOKEN}" \
      -H "Content-Type: application/json" \
      -d "{\"version\":\"${VERSION}\",\"linuxAppImageUrl\":\"${APPIMAGE_URL}\",\"linuxAppImageSha256\":\"${SHA256}\",\"notesUrl\":\"https://github.com/${GITHUB_REPOSITORY}/releases/tag/${GITHUB_REF_NAME}\"}"
```

## Troubleshooting

### Common Issues

#### R2 Upload Missing

- **Check CI step "Upload to R2" logs**
- **Confirm R2 secrets exist in repo settings**
- **Confirm R2 PUBLIC_BASE_URL matches bucket routing**

#### Admin API latest.json Not Updating

- **Confirm CI calls PUT /api/admin/downloads/latest**
- **Confirm ADMIN_API_TOKEN secret exists and matches Worker ADMIN_TOKEN**
- **Confirm Worker route path + CORS allow methods**

#### Website Not Reflecting Changes

- **Confirm website uses API at runtime (not baked at build)**
- **If cached: bust CDN / set short cache headers for the manifest fetch**

#### Repository Sync Failures

- **Check git status and untracked changes**
- **Ensure remote access and permissions**
- **Verify target commit exists in repo history**

### Debug Commands

```bash
# Check R2 bucket contents
aws s3 ls s3://rinawarp-downloads/terminal-pro/ --endpoint-url https://your-account-id.r2.cloudflarestorage.com

# Check Admin API status
curl -sS "$ADMIN_API_BASE_URL/health"

# Check website API calls (browser dev tools)
# Open Network tab and visit pricing/download pages

# Debug git issues
git status
git remote -v
git log --oneline -5
```

## Best Practices

### 1. Test Environment

- Use test tags for pipeline verification
- Clean up test artifacts after verification
- Test in staging environment when possible

### 2. Security

- Never commit secrets to repository
- Use GitHub Actions secrets for sensitive data
- Regularly rotate API tokens and keys

### 3. Monitoring

- Monitor CI/CD pipeline success rates
- Set up alerts for failed deployments
- Track download metrics and user feedback

### 4. Documentation

- Keep this guide updated with any changes
- Document new test procedures as they're added
- Maintain runbooks for common issues

## Integration Points

### Admin API Endpoints

- `GET /api/pricing` - Pricing information for website
- `GET /api/downloads/latest.json` - Latest download information
- `PUT /api/admin/downloads/latest` - Update download manifest (protected)
- `GET /api/stripe/session` - Stripe session helper

### R2 Object Layout

```
rinawarp-downloads/
├── terminal-pro/
│   ├── v1.0.0/
│   │   ├── RinaWarp-Terminal-Pro-1.0.0-x86_64.AppImage
│   │   └── RinaWarp-Terminal-Pro-1.0.0-x86_64.AppImage.sha256
│   └── stable/
│       ├── latest.yml (for Windows updates)
│       └── installer files
```

### Website Integration

- **Pricing Page**: Fetches from `/api/pricing`
- **Download Page**: Fetches from `/api/downloads/latest.json`
- **Success Page**: Handles Stripe session IDs via `/api/stripe/session`

## Maintenance

### Regular Tasks

- **Weekly**: Run comprehensive test suite
- **Monthly**: Review and update environment variables
- **Quarterly**: Audit security configurations
- **As needed**: Update documentation and procedures

### When to Run Tests

- Before major releases
- After infrastructure changes
- When onboarding new team members
- After security incidents
- When users report download issues

## Support

For issues with this testing process:

1. Check the troubleshooting section above
2. Review CI/CD logs for specific error messages
3. Verify all environment variables are set correctly
4. Check GitHub Actions secrets configuration
5. Consult the individual script documentation

## Related Documentation

- [RELEASE.md](RELEASE.md) - Release process documentation
- [GITHUB_ACTIONS_FIX_GUIDE.md](GITHUB_ACTIONS_FIX_GUIDE.md) - GitHub Actions troubleshooting
- [PRODUCTION_READY_RELEASE_GUIDE.md](PRODUCTION_READY_RELEASE_GUIDE.md) - Production release checklist
