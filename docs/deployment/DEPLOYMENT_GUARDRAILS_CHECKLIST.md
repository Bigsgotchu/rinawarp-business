# Cloudflare Pages Deployment - Guardrails Checklist

## ✅ Pre-Deployment Verification

### Environment Configuration

- [ ] `UPDATES_ORIGIN` set to Pages domain in CI
- [ ] `CF_ACCOUNT_ID`, `CF_API_TOKEN`, `CF_ZONE_ID` secrets configured
- [ ] `PAGES_DOMAIN` variable set in repository
- [ ] wrangler.toml account_id updated for terminal-pro updates

### Verification Stack

- [ ] Consolidated verify script returns non-zero on required failures
- [ ] All required verification scripts present and functional:
  - [ ] `pre-publish-guard.js` - Artifact presence + headers
  - [ ] `pre-publish-guard-hash.js` - SHA-256 verification
  - [ ] `validate-feeds.js` - Feed schema validation
  - [ ] `check-monotonic-version.js` - Version progression
  - [ ] `verify-blockmap.js` - Blockmap validation

### Headers and Caching

- [ ] `_headers` checked in alongside `/stable/` and `/releases/<ver>/`
- [ ] Cache policies correctly configured:
  - [ ] Feed files: `no-store` for immediate updates
  - [ ] Artifacts: `max-age=31536000, immutable` for long-term caching
  - [ ] Releases: `max-age=31536000, immutable` for permanent archives

### Cache Management

- [ ] Cache purge targets only feed files (`latest.yml`, `latest-mac.yml`, `SHA256SUMS`)
- [ ] `cache-purge.js` script handles precise purging
- [ ] CF_API_TOKEN has `Cache:Purges` permission

### Feed Configuration

- [ ] `latest*.yml` host URLs match the chosen origin
- [ ] Feed files point to correct artifact URLs
- [ ] Platform-specific feeds properly configured

### Security and Signing

- [ ] SHA256SUMS uploaded under both `/releases/<ver>/` and `/stable/`
- [ ] Detached signatures available for all artifacts
- [ ] Platform signing verification optional but recommended

## 🚀 Deployment Process

### CI Workflow

- [ ] `.github/workflows/release-to-pages.yml` configured
- [ ] Workflow accepts version input correctly
- [ ] All steps execute in proper sequence:
  1. Build artifacts → 2. Stage tree → 3. Verify → 4. Deploy → 5. Purge cache

### Atomic Promotion Model

- [ ] Build artifacts → copy to `/releases/<version>/`
- [ ] After verification passes, update `/stable/` files
- [ ] Deploy and purge only feed files (not immutable `/releases/*`)

### Rollback Strategy

- [ ] Fast rollback: revert commit and redeploy
- [ ] Surgical rollback: re-run prepare-updates-tree.js with prior version
- [ ] Rollback process tested and documented

## 🧪 Testing Checklist

### Local Smoke Testing

```bash
export UPDATES_ORIGIN="https://your-project.pages.dev"
pnpm prepublish:verify
```

### CI Integration Testing

- [ ] Test workflow dispatch with sample version
- [ ] Verify all verification steps pass
- [ ] Confirm cache purge succeeds
- [ ] Check GitHub release creation

### Feed Accessibility

```bash
# Verify feeds are accessible
curl -I https://your-project.pages.dev/stable/latest.yml
curl -I https://your-project.pages.dev/stable/latest-mac.yml
curl -I https://your-project.pages.dev/stable/SHA256SUMS
```

### Health Monitoring

- [ ] `pnpm monitor:check` returns healthy status
- [ ] Post-deployment monitoring in place
- [ ] Alert system configured for failures

## 📊 Production Readiness

### Monitoring and Alerting

- [ ] Health check endpoint monitored
- [ ] Deployment failure notifications configured
- [ ] Auto-update client telemetry tracking

### Documentation

- [ ] Deployment guide complete and accessible
- [ ] Rollback procedures documented
- [ ] Troubleshooting guide available

### Security

- [ ] Tokens have minimal required permissions
- [ ] No secrets in code or logs
- [ ] Verification stack provides security guarantees

## 🎯 Success Criteria

- [ ] ✅ All required verifications pass before deployment
- [ ] ✅ Feed files purged from cache for immediate client visibility
- [ ] ✅ Artifacts cached for 1 year (immutable)
- [ ] ✅ Atomic updates with no partial deployments
- [ ] ✅ Fast rollback capability (< 5 minutes)
- [ ] ✅ GitHub releases created with proper artifacts
- [ ] ✅ Health checks return green status post-deployment

## 🚨 Emergency Contacts

- **Deployment Issues**: [Your contact info]
- **Cloudflare Support**: [Support channel]
- **Rollback Authority**: [Your contact info]

---

**Final Check**: All items ✅ = Production ready for atomic Cloudflare Pages deployment!
