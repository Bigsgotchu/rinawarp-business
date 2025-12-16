# Cloudflare Pages Deployment Setup

## Overview

This project now uses a **Cloudflare Pages-first** deployment strategy. No more GitHub Releases - deployments go directly from CI to Cloudflare Pages.

## Architecture

```
guard → build → deploy (preview or prod) → wait/ping → Slack notify → record deployment JSON
```

## Environment Variables Required

Set these secrets in your GitHub repository:

### Required for all deployments

- `CF_ACCOUNT_ID` – Your Cloudflare account ID
- `CF_PAGES_PROJECT` – Pages project name
- `CLOUDFLARE_API_TOKEN` – Token with Pages permissions

### Optional for production notifications

- `SLACK_WEBHOOK_URL` – Slack webhook for deployment notifications

## New Scripts

### Individual deployment scripts

- `pnpm pages:deploy:preview` – Deploy to preview environment
- `pnpm pages:deploy:prod` – Deploy to production
- `pnpm pages:wait` – Poll Pages API until deployment completes
- `pnpm pages:ping` – Health check deployed site
- `pnpm pages:slack` – Send Slack notification

### Combined deployment workflows

- `pnpm ship:pages:preview` – Full preview deployment pipeline
- `pnpm ship:pages:prod` – Full production deployment pipeline

## Deployment Flow

### Preview Deployments (Pull Requests)

1. Quality gates pass
2. Build website
3. Deploy to preview environment
4. Wait for deployment success
5. Health check deployed site
6. _(No Slack notification)_

### Production Deployments (Main Branch)

1. Quality gates pass
2. Release guard validates Cloudflare Pages readiness
3. Build website
4. Deploy to production
5. Wait for deployment success
6. Health check deployed site
7. Send Slack notification
8. Record deployment JSON for future reference

## Configuration

### wrangler.toml

```toml
name = "rinawarp-business"
account_id = "${CF_ACCOUNT_ID}"
compatibility_date = "2025-01-01"

[pages]
project_name = "${CF_PAGES_PROJECT}"
build_dir = "apps/website/dist-website"

[vars]
NODE_ENV = "production"
```

### Build Output

The website builds to `apps/website/dist-website/` which is deployed to Cloudflare Pages.

## Manual Deployment

You can run the full pipeline locally:

```bash
# Preview deployment
pnpm ship:pages:preview

# Production deployment
pnpm ship:pages:prod
```

Or run individual steps:

```bash
# Deploy and wait
pnpm pages:deploy:prod && pnpm pages:wait && pnpm pages:ping
```

## CI/CD Pipeline

The GitHub Actions workflow now:

1. **Runs on pull requests**: Deploys previews for testing
2. **Runs on main branch pushes**: Deploys to production with notifications
3. **Quality gates**: Type checking, linting, tests, health checks
4. **Release guard**: Validates Cloudflare Pages configuration
5. **Deployment**: Uses Wrangler CLI for Pages deployment
6. **Verification**: Waits for success and health checks
7. **Notifications**: Slack notifications for production deploys

## Slack Notifications

Production deployments send rich Slack messages with:

- Deployment URL
- Branch and commit info
- Build size and duration
- Quick action buttons

## Files Modified/Added

### New Scripts

- `scripts/pages-deploy.mjs` - Cloudflare Pages deployment
- `scripts/pages-wait.mjs` - Poll deployment status
- `scripts/pages-ping.mjs` - Health check deployed site
- `scripts/pages-slack.mjs` - Slack notifications

### Updated Files

- `wrangler.toml` - Cloudflare Pages configuration
- `scripts/release-guard.mjs` - Added Cloudflare Pages validation
- `package.json` - New deployment scripts
- `.github/workflows/ci.yml` - Updated CI pipeline

### Configuration

- Set repository secrets in GitHub
- Ensure Cloudflare Pages project exists
- Configure Slack webhook (optional)

## Migration from GitHub Releases

**Before**: GitHub Release → Assets → Manual Deployment
**After**: Direct CI → Cloudflare Pages deployment

This eliminates the GitHub Release step and provides:

- ✅ Faster deployments
- ✅ Preview environments for PRs
- ✅ Better integration with Cloudflare
- ✅ Built-in health checks
- ✅ Slack notifications
- ✅ Deployment tracking

## Troubleshooting

### Common Issues

1. **Deployment fails**: Check Cloudflare API token permissions
2. **Build fails**: Ensure `apps/website/dist-website/` directory exists
3. **Health check fails**: Verify the site is actually deployed and accessible
4. **Slack notifications not working**: Check webhook URL and format

### Debug Information

Deployment data is saved to `.debug/pages-deploy.json` for troubleshooting.

### Manual Verification

```bash
# Check deployment status
pnpm pages:wait

# Test deployed site
pnpm pages:ping

# Check deployment data
cat .debug/pages-deploy.json
```
