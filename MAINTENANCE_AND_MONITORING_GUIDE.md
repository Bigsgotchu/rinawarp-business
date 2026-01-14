# RinaWarp Maintenance & Monitoring Guide

## Overview

This document provides comprehensive guidance for maintaining and monitoring the RinaWarp platform, including the VS Code extension, website, and backend services.

---

## 1. Deployment Workflow

### Production Deployment

The primary deployment script is [`deploy-rinawarp-production.sh`](deploy-rinawarp-production.sh). It performs the following steps:

1. **Install dependencies** - Installs Node.js packages for the VS Code extension
2. **Build extension** - Compiles the TypeScript extension
3. **Package VSIX** - Creates a `.vsix` installer file
4. **Optional Marketplace publish** - Publishes to VS Code Marketplace (controlled by `VSCE_PUBLISH` flag)
5. **Build website** - Compiles the website assets
6. **Inject branding** - Adds RinaWarp CSS and cookie banner
7. **Deploy to Cloudflare Pages** - Deploys the website
8. **Verify deployment** - Checks HTTP status
9. **Run smoke tests** - Executes automated verification tests
10. **Audit logging** - Records deployment details

### GitHub Actions Deployment

The main deployment workflow is [`.github/workflows/deploy-rinawarp.yml`](.github/workflows/deploy-rinawarp.yml), which:

- Runs on `push` to `main` branch
- Can be triggered manually via `workflow_dispatch`
- Builds the VS Code extension
- Packages the VSIX
- Deploys the website to Cloudflare Pages
- Runs smoke tests
- Logs deployment information

---

## 2. Smoke Testing

### Automated Smoke Tests

The [`verify-rinawarp-smoke.js`](verify-rinawarp-smoke.js) script performs comprehensive smoke testing:

- **Website accessibility** - Verifies HTTP 200 response
- **API health** - Checks `/api/health` endpoint
- **Checkout flows** - Tests all pricing plans (basic, starter, creator, enterprise)
- **Security checks** - Validates SSL/TLS and CSP headers
- **Performance** - Measures response times
- **Browser tests** - Uses Puppeteer to test:
  - Cookie banner visibility
  - Stripe checkout navigation
  - Download link functionality

### Smoke Test Workflows

#### Production Smoke Test

[`.github/workflows/production-smoke-test.yml`](.github/workflows/production-smoke-test.yml):
- Runs every 6 hours (cron: `0 */6 * * *`)
- Runs on push to `main` or `master` branches
- Can be triggered manually
- Notifies on failure via Slack (if configured)

#### Manual Smoke Test

[`.github/workflows/prod-smoke.yml`](.github/workflows/prod-smoke.yml):
- Runs on tag pushes (e.g., `v1.0.0`)
- Can be triggered manually
- Executes custom smoke test script

### Running Smoke Tests Manually

```bash
# From the repository root
cd vscode-rinawarp-extension
node verify-rinawarp-smoke.js
```

---

## 3. Analytics & Monitoring

### Analytics Configuration

The website uses multiple analytics providers:

1. **Plausible Analytics** - Privacy-friendly, lightweight analytics
2. **Google Analytics 4 (GA4)** - Comprehensive tracking
3. **Cloudflare Analytics** - Built-in analytics from Cloudflare Pages

Configuration: [`rinawarp-website/public/js/analytics.js`](rinawarp-website/public/js/analytics.js)

### Tracked Events

- **Page views** - All page loads
- **Checkout clicks** - Pricing button clicks
- **Download clicks** - VSIX and installer downloads
- **Errors** - JavaScript errors and unhandled rejections

### Verifying Analytics

```bash
# Check if analytics is properly configured
curl -I https://rinawarptech.com | grep -i "content-security-policy"

# Verify Plausible script is loaded
curl -s https://rinawarptech.com | grep "plausible.io"
```

---

## 4. Deployment Logging

### Deployment Log Format

A CSV log file (`deployment-log.csv`) tracks all deployments with the following columns:
- **Timestamp** - UTC date and time
- **VSIX File** - Name of the generated VSIX package
- **Website URL** - Deployment URL
- **HTTP Status** - Response code from the website

### Viewing Deployment Logs

```bash
# View the deployment log
cat deployment-log.csv

# View recent deployments (last 10)
tail -n 10 deployment-log.csv
```

### Smoke Test Logs

Smoke test results are logged to `smoke-test-log.txt` in the extension directory:

```bash
cat vscode-rinawarp-extension/smoke-test-log.txt
```

---

## 5. VSIX Publishing

### Publishing to Marketplace

The VSIX can be published to the VS Code Marketplace using:

```bash
cd vscode-rinawarp-extension
vsce publish
```

### GitHub Release Workflow

[`.github/workflows/vsix-release.yml`](.github/workflows/vsix-release.yml) automates VSIX releases:
- Triggers on tag pushes (e.g., `v1.0.0`)
- Builds the extension
- Creates a GitHub release
- Attaches the VSIX file

### Manual Publishing

```bash
# Build and package
cd vscode-rinawarp-extension
npm run compile
vsce package

# Publish to Marketplace
vsce publish
```

**Note:** Requires VS Code Marketplace publisher credentials configured in `~/.vscode/extensions/marketplace.json` or via environment variables.

---

## 6. Maintenance Procedures

### Regular Maintenance Tasks

#### Daily
- [ ] Check deployment logs for errors
- [ ] Review analytics dashboard for traffic trends
- [ ] Monitor smoke test results

#### Weekly
- [ ] Run manual smoke tests
- [ ] Verify backup systems
- [ ] Check Cloudflare analytics

#### Monthly
- [ ] Review security headers
- [ ] Update dependencies
- [ ] Test checkout flows

### Emergency Procedures

#### Website Down
1. Check Cloudflare dashboard for deployment status
2. Review recent GitHub Actions runs
3. Manually trigger deployment if needed
4. Check DNS records for issues

#### API Failures
1. Verify backend service health
2. Check Cloudflare Workers logs
3. Review recent deployments
4. Rollback if necessary

#### Marketplace Issues
1. Check VS Code Marketplace publisher dashboard
2. Verify VSIX package integrity
3. Re-publish if needed

---

## 7. Monitoring & Alerts

### Automated Alerts

- **GitHub Actions** - Fails the workflow on errors
- **Slack Notifications** - Configured in `production-smoke-test.yml` (requires `SLACK_WEBHOOK_URL` secret)
- **Email Alerts** - Can be configured via Cloudflare Pages notifications

### Manual Monitoring

```bash
# Check website status
curl -I https://rinawarptech.com

# Check API health
curl https://api.rinawarptech.com/api/health

# Check VS Code Marketplace listing
curl https://marketplace.visualstudio.com/items?itemName=RinaWarp.rinawarp
```

---

## 8. Version Management

### Version Tags

Follow semantic versioning (SemVer):
- `v1.0.0` - Major version (breaking changes)
- `v1.1.0` - Minor version (new features)
- `v1.1.1` - Patch version (bug fixes)

### Creating a Release

```bash
# Update version in package.json
git add vscode-rinawarp-extension/package.json

# Commit and tag
git commit -m "Release v1.0.0"
git tag v1.0.0

# Push tag
git push origin v1.0.0

# This triggers the vsix-release.yml workflow
```

---

## 9. Compliance & Auditing

### Audit Logs

All deployments are logged in `deployment-log.csv` with:
- Timestamp
- VSIX package name
- Deployment URL
- HTTP status code

### Smoke Test Results

Smoke test logs are preserved in:
- `vscode-rinawarp-extension/smoke-test-log.txt`
- GitHub Actions workflow logs

### Security Audit

Regularly review:
- Content Security Policy headers
- SSL/TLS certificates
- API authentication
- Dependency vulnerabilities

---

## 10. Troubleshooting

### Common Issues

#### Smoke Test Failures
- **Website unavailable**: Check Cloudflare deployment status
- **API health check failed**: Verify backend service is running
- **Checkout flow failed**: Check Stripe API keys and configuration

#### Deployment Failures
- **VSIX packaging failed**: Check Node.js version and dependencies
- **Cloudflare deployment failed**: Verify project name and API token
- **Analytics not tracking**: Check script injection in HTML files

#### Marketplace Publishing
- **Authentication failed**: Verify publisher credentials
- **Package rejected**: Check extension manifest for validation errors

---

## 11. Resources

### Documentation
- [VS Code Extension API](https://code.visualstudio.com/api)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Plausible Analytics](https://plausible.io/)
- [Google Analytics 4](https://analytics.google.com/)

### Contact & Support
- **GitHub Issues**: [https://github.com/rinawarp/rinawarp/issues](https://github.com/rinawarp/rinawarp/issues)
- **Email**: support@rinawarptech.com
- **Slack**: #deployments channel (internal)

---

## 12. Checklists

### Pre-Deployment Checklist
- [ ] All tests passing
- [ ] Smoke tests successful
- [ ] Analytics configured
- [ ] Version updated in package.json
- [ ] Changelog updated
- [ ] Backup created

### Post-Deployment Checklist
- [ ] Website responding (HTTP 200)
- [ ] API health check passing
- [ ] Analytics tracking confirmed
- [ ] Smoke tests passing
- [ ] Deployment logged
- [ ] Notifications sent

---

Last Updated: 2026-01-14
