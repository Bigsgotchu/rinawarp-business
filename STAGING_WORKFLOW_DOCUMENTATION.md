# RinaWarp Staging Workflow Implementation Documentation

## 📋 Overview

This comprehensive documentation covers the complete staging workflow implementation for RinaWarp Terminal Pro, including GitHub secrets configuration, Cloudflare Pages setup, workflow integration, troubleshooting, and best practices.

## 🎯 Table of Contents

1. [GitHub Secrets Configuration](#github-secrets-configuration)
2. [Cloudflare Pages Setup](#cloudflare-pages-setup)
3. [Workflow Integration](#workflow-integration)
4. [Troubleshooting Guide](#troubleshooting-guide)
5. [Best Practices](#best-practices)

---

## 🔐 GitHub Secrets Configuration

### Required Secrets for Staging Workflow

| Secret Name | Description | Required | Scope |
|-------------|-------------|----------|-------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Pages permissions | ✅ | Deploy website to Cloudflare Pages |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID | ✅ | Target correct Cloudflare account |
| `SLACK_WEBHOOK_URL` | Slack webhook for notifications | Optional | Pipeline notifications |
| `STRIPE_SECRET_KEY` | Stripe secret key for staging | Optional | Staging payment processing |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification | Optional | Staging webhook security |

### Setup Instructions

#### Method 1: Interactive Setup (Recommended)

```bash
# Make script executable
chmod +x add-secrets-comprehensive.sh

# Run interactive setup
./add-secrets-comprehensive.sh
```

#### Method 2: Automated Setup

```bash
# Using command line arguments
./add-secrets-comprehensive.sh --auto \
  --secret CLOUDFLARE_API_TOKEN=your_token_here \
  --secret CLOUDFLARE_ACCOUNT_ID=your_account_id \
  --secret SLACK_WEBHOOK_URL=your_webhook_url
```

#### Method 3: Batch File Setup

1. Copy and customize the template:
```bash
cp secrets-template.txt my-secrets.txt
# Edit my-secrets.txt with your actual values
```

2. Run the batch setup:
```bash
./add-secrets-comprehensive.sh --batch my-secrets.txt
```

### Prerequisites

1. **GitHub CLI installed and authenticated:**
```bash
# Install GitHub CLI
brew install gh          # macOS
sudo apt install gh      # Ubuntu/Debian
winget install GitHub.cli # Windows

# Authenticate
gh auth login
```

2. **SSH setup (recommended):**
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"

# Add public key to GitHub: https://github.com/settings/keys
```

### Security Best Practices

- **Never commit secrets to git** - Use environment variables only
- **Use least privilege access** - Create scoped API tokens
- **Rotate secrets regularly** - Update tokens periodically
- **Monitor secret usage** - Check logs for unauthorized access
- **Use different secrets for different environments** - Separate staging/production

---

## ☁️ Cloudflare Pages Setup

### Project Structure

#### Staging Environment
- **Project Name**: `rinawarp-website-staging`
- **Branch**: `staging`
- **Domain**: `rinawarp-website-staging.pages.dev`
- **Environment**: Staging

#### Production Environment
- **Project Name**: `rinawarp-website-production`
- **Branch**: `main`
- **Domain**: `www.rinawarptech.com`
- **Environment**: Production

### Setup Steps

#### 1. Create Staging Project

1. **Log into Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com
   - Select your account: `Rinawarptechnologies25@gmail.com's Account`

2. **Create New Pages Project**
   - Navigate to Pages → Create a project
   - Connect to GitHub repository
   - Select `rinawarp-business` repository
   - Choose `staging` branch for deployment

3. **Configure Build Settings**
   - **Build command**: `npm run build:static`
   - **Build directory**: `apps/website/dist`
   - **Environment variables**: Set staging-specific variables

#### 2. Create Production Project

1. **Create Second Pages Project**
   - Follow same steps as staging
   - Choose `main` branch for deployment
   - Use production environment variables

2. **Configure Custom Domain**
   - Add custom domain: `www.rinawarptech.com`
   - Configure DNS records (CNAME to `rinawarptech.pages.dev`)
   - Enable SSL certificate

#### 3. Configure Environment Variables

**Staging Environment Variables:**
```bash
STRIPE_SECRET_KEY=sk_test_51SH4C2GZrRdZy3W9Rz9APjrsrm5815TGVBtGzT4XM5BujdrO94JaFPq8PqIjLlJ4v6HDdeyBAe8SlJEDeJxWnnhr00O4Wow0DL
STRIPE_WEBHOOK_SECRET=whsec_test_8dd90aa311dce345172987b5c121d74d633985cb55c96d00f5d490037bae8353
DOMAIN=https://staging.rinawarptech.com
```

**Production Environment Variables:**
```bash
STRIPE_SECRET_KEY=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
STRIPE_WEBHOOK_SECRET=whsec_k6SWU7KCMT4vdPL7ZUNpxFiK4SQk8nPi
DOMAIN=https://www.rinawarptech.com
RINA_PRICE_MAP={"enterprise-yearly":"price_1SVRVMGZrRdZy3W9094r1F5B","founder-lifetime":"price_1SVRVLGZrRdZy3W976aXrw0g","pioneer-lifetime":"price_1SVRVLGZrRdZy3W9LoPVNyem","pro-monthly":"price_1SVRVKGZrRdZy3W9wFO3QPw6","creator-monthly":"price_1SVRVJGZrRdZy3W9tRX5tsaH","starter-monthly":"price_1SVRVJGZrRdZy3W9q6u9L82y"}
```

### Security Configuration

#### HSTS Configuration
1. **Enable HSTS in Cloudflare Dashboard**
   - Go to SSL/TLS → Edge Certificates
   - Enable "Always Use HTTPS"
   - Enable "HSTS" with:
     - Max Age: 63072000 (2 years)
     - Include subdomains: ✅
     - Preload: ✅ (optional)

2. **Security Headers**
   - X-Frame-Options: DENY
   - X-XSS-Protection: 1; mode=block
   - X-Content-Type-Options: nosniff
   - Referrer-Policy: strict-origin-when-cross-origin

#### SSL/TLS Settings
- **SSL Mode**: Full (strict)
- **Minimum TLS Version**: 1.2
- **HTTP Strict Transport Security**: Enabled

---

## 🔄 Workflow Integration

### Project Structure Integration

The staging workflow integrates seamlessly with the existing RinaWarp project structure:

```
rinawarp-business/
├── .github/workflows/
│   ├── staging.yml              # Staging CI/CD pipeline
│   ├── production.yml           # Production CI/CD pipeline
│   └── production-smoke-test.yml # Production smoke tests
├── apps/
│   ├── website/
│   │   ├── package.json         # Website dependencies
│   │   ├── wrangler.toml        # Cloudflare Workers config
│   │   └── dist/               # Build output for Pages
│   └── terminal-pro/
│       └── desktop/            # Electron app build
├── backend/                    # API services
├── staging-smoke-test.js       # Staging validation
├── production-test.js          # Production validation
└── production-smoke-test.js    # Production smoke tests
```

### Workflow Triggers

#### Staging Workflow Triggers
- **Push to `staging` branch**: Automatic deployment
- **Pull Request to `staging`**: Preview deployment
- **PR events**: Opened, synchronized, reopened, closed

#### Production Workflow Triggers
- **Push to `main` branch**: Production deployment
- **Pull Request to `main`**: Pre-production validation

### Build Process Integration

#### Website Build
```bash
# Build command from package.json
npm run build:static

# Output directory
apps/website/dist/
```

#### Electron App Build
```bash
# Build command from desktop package.json
npm run build

# Output directory
apps/terminal-pro/desktop/build-output/
```

### Environment Configuration

#### Staging Environment
- **NODE_ENV**: `staging`
- **API endpoints**: Staging URLs
- **Stripe keys**: Test mode
- **Feature flags**: Development features enabled

#### Production Environment
- **NODE_ENV**: `production`
- **API endpoints**: Production URLs
- **Stripe keys**: Live mode
- **Feature flags**: Stable features only

### Deployment Flow

```mermaid
flowchart TD
    A[👩‍💻 Developer Push / PR] --> B[🚀 GitHub Actions Trigger]
    B -->|staging branch / PR| C[🧪 Staging CI/CD Workflow]
    C --> C1[📝 ESLint & Pre-Deploy Smoke Test]
    C --> C2[🏗️ Build Website & Electron App]
    C --> C3[🌐 Deploy Website to Cloudflare Pages Preview]
    C --> C4[📦 Draft Electron Release]
    C --> C5[🔍 Post-Deploy Smoke Tests]
    C5 --> C6[📤 Slack Notification & Artifact Upload]
    C6 -->|✅ PR Approved| D[🎯 Merge to Main / Production]
    D --> E[🏢 Production CI/CD Workflow]
    E --> E1[📝 ESLint & Pre-Deploy Smoke Test]
    E --> E2[🏗️ Build Website & Electron App]
    E --> E3[🌐 Deploy Website to Cloudflare Pages Production]
    E --> E4[📦 Draft Electron Release]
    E --> E5[🔍 Post-Deploy Smoke Tests]
    E5 -->|✅ All Tests Pass| E6[🚀 Publish Electron Release]
    E5 -->|❌ Failure Detected| E7[⚠️ Automatic Rollback / Alert Team]
    E6 --> E8[📣 Slack Notification with Results]
    E7 --> E8
```

---

## 🔧 Troubleshooting Guide

### Common Issues and Solutions

#### 1. GitHub Secrets Not Found

**Error**: `CLOUDFLARE_API_TOKEN not found`

**Solution**:
```bash
# Verify secrets are set
gh secret list --repo your-org/your-repo

# Add missing secret
gh secret set CLOUDFLARE_API_TOKEN --body "your_token_here"
```

#### 2. Cloudflare Deployment Failures

**Error**: `Failed to deploy to Cloudflare Pages`

**Common Causes**:
- Invalid API token permissions
- Incorrect account ID
- Build command failures

**Solutions**:
1. **Verify API Token**:
   - Ensure token has Pages permissions
   - Check token hasn't expired

2. **Check Account ID**:
   - Verify correct Cloudflare account
   - Confirm Pages project exists

3. **Review Build Logs**:
   - Check GitHub Actions logs
   - Verify build command works locally

#### 3. Smoke Test Failures

**Error**: `Post-deployment smoke tests failed`

**Common Causes**:
- Website not accessible
- API endpoints not responding
- Checkout flows broken

**Solutions**:
1. **Check Deployment URL**:
   ```bash
   # Verify staging URL is accessible
   curl -I https://rinawarp-website-staging.pages.dev
   ```

2. **Test API Health**:
   ```bash
   # Check API health endpoint
   curl https://rinawarp-website-staging.pages.dev/api/health
   ```

3. **Validate Checkout Flows**:
   ```bash
   # Test checkout endpoint
   curl -X POST https://rinawarp-website-staging.pages.dev/api/checkout-v2 \
     -H "Content-Type: application/json" \
     -d '{"plan":"basic","test_mode":true}'
   ```

#### 4. Electron Build Failures

**Error**: `Electron app build failed`

**Common Causes**:
- Missing dependencies
- Build configuration issues
- Platform-specific problems

**Solutions**:
1. **Install Dependencies**:
   ```bash
   cd apps/terminal-pro/desktop
   npm ci
   ```

2. **Check Build Configuration**:
   - Verify `package.json` build scripts
   - Check electron-builder configuration

3. **Platform-Specific Issues**:
   - Ensure correct platform tools installed
   - Check for missing system dependencies

#### 5. Network/Timeout Issues

**Error**: `Request timeout` or `Network error`

**Solutions**:
1. **Increase Timeout**:
   - Modify timeout settings in test scripts
   - Add retry logic for flaky networks

2. **Check Connectivity**:
   ```bash
   # Test Cloudflare API connectivity
   curl -I https://api.cloudflare.com/client/v4/user/tokens/verify
   ```

3. **Use VPN/Proxy**:
   - If behind corporate firewall
   - Check for IP restrictions

### Debug Commands

#### Check GitHub Actions Status
```bash
# List recent workflow runs
gh run list --limit 10

# View specific run logs
gh run view RUN_ID --log

# Re-run failed workflow
gh run rerun RUN_ID
```

#### Verify Cloudflare Configuration
```bash
# Check Pages project status
wrangler pages list

# View deployment logs
wrangler pages logs --project-name rinawarp-website-staging
```

#### Test Locally
```bash
# Run staging tests locally
node staging-smoke-test.js

# Run production tests locally
node production-test.js

# Build website locally
cd apps/website
npm run build:static
```

### Emergency Procedures

#### Rollback Staging Deployment
1. **Identify Previous Deployment**:
   ```bash
   wrangler pages deployments list --project-name rinawarp-website-staging
   ```

2. **Rollback to Previous Version**:
   ```bash
   wrangler pages deployments rollback --project-name rinawarp-website-staging --deployment-id PREVIOUS_ID
   ```

#### Rollback Production Deployment
1. **Stop Current Deployment**:
   - Pause GitHub Actions workflow
   - Prevent new deployments

2. **Rollback Website**:
   ```bash
   wrangler pages deployments rollback --project-name rinawarp-website-production --deployment-id PREVIOUS_ID
   ```

3. **Rollback Electron Release**:
   - Unpublish current release
   - Restore previous version

#### Incident Response
1. **Immediate Actions**:
   - Check deployment status
   - Identify root cause
   - Implement rollback if needed

2. **Communication**:
   - Notify team via Slack
   - Update status page if needed
   - Document incident

3. **Post-Incident**:
   - Analyze root cause
   - Implement fixes
   - Update documentation

---

## 📚 Best Practices

### Development Workflow

#### Branch Strategy
- **`main`**: Production-ready code
- **`staging`**: Pre-production testing
- **Feature branches**: Development work
- **PR workflow**: Required for all changes

#### Code Quality
- **ESLint**: Enforce coding standards
- **Pre-commit hooks**: Prevent bad commits
- **Code review**: Required for all PRs
- **Testing**: Unit and integration tests

#### Deployment Strategy
- **Staging first**: Always test in staging
- **Gradual rollout**: Use feature flags
- **Monitoring**: Track deployment metrics
- **Rollback plan**: Always have rollback ready

### Security Best Practices

#### Secrets Management
- **Environment separation**: Different secrets for each environment
- **Least privilege**: Minimal permissions for API tokens
- **Regular rotation**: Update secrets periodically
- **Audit logs**: Monitor secret usage

#### Access Control
- **GitHub permissions**: Limit who can merge to main
- **Cloudflare access**: Restrict Pages access
- **Audit trails**: Log all deployment activities

#### Security Testing
- **Automated scans**: Run security checks in CI
- **Dependency scanning**: Check for vulnerabilities
- **Penetration testing**: Regular security assessments

### Performance Optimization

#### Build Optimization
- **Parallel builds**: Run website and Electron builds concurrently
- **Caching**: Cache dependencies and build outputs
- **Compression**: Optimize assets for faster loading

#### Deployment Optimization
- **Incremental builds**: Only rebuild changed files
- **CDN caching**: Leverage Cloudflare's global network
- **Asset optimization**: Compress images and minify code

#### Monitoring
- **Performance metrics**: Track build and deployment times
- **Error tracking**: Monitor for deployment failures
- **User experience**: Measure website performance

### Operational Excellence

#### Documentation
- **Keep documentation current**: Update as workflows change
- **Runbooks**: Document common procedures
- **Troubleshooting guides**: Help team resolve issues quickly

#### Communication
- **Status updates**: Keep team informed of deployment status
- **Incident communication**: Clear communication during outages
- **Post-mortems**: Learn from incidents and improve

#### Continuous Improvement
- **Metrics review**: Regularly review deployment metrics
- **Process refinement**: Continuously improve workflows
- **Team training**: Keep team updated on best practices

### Compliance and Governance

#### Audit Requirements
- **Change tracking**: Log all code changes and deployments
- **Approval workflows**: Require approvals for production changes
- **Compliance checks**: Ensure deployments meet compliance requirements

#### Backup and Recovery
- **Configuration backup**: Backup all configuration files
- **Deployment artifacts**: Store build artifacts for rollback
- **Recovery procedures**: Document recovery procedures

---

## 📞 Support and Resources

### Documentation Links
- [GitHub Secrets Setup Guide](GITHUB-SECRETS-SETUP.md)
- [Cloudflare Configuration Guide](CLOUDFLARE_CONFIGURATION_GUIDE.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)

### Team Contacts
- **DevOps Team**: For infrastructure and deployment issues
- **Development Team**: For code and feature issues
- **Security Team**: For security-related concerns

### External Resources
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Stripe Integration Guide](https://stripe.com/docs)

---

## 🔄 Maintenance Schedule

### Daily
- Monitor deployment status
- Check for failed builds
- Review error logs

### Weekly
- Review deployment metrics
- Update dependencies
- Test rollback procedures

### Monthly
- Rotate API tokens
- Review security configurations
- Update documentation

### Quarterly
- Performance review
- Process improvement analysis
- Team training updates

---

**Last Updated**: December 26, 2025
**Version**: 1.0.0
**Maintained By**: RinaWarp DevOps Team

---

*This documentation is a living document and should be updated as the staging workflow evolves.*