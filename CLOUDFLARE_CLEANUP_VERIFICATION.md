# Cloudflare Cleanup - Verification Guide

## Summary of Changes

### Code Changes (Completed ✅)

1. **Added CSP Headers**
   - `rinawarp-website/public/index.html` - Added Content Security Policy
   - `rinawarp-website/public/pricing.html` - Added Content Security Policy
   - Both allow: Stripe.js, Plausible.io, and self-hosted resources

2. **Smoke Test Configuration**
   - `verify-rinawarp-smoke.js` - Already correctly configured
   - Points to: `https://www.rinawarptech.com/api/health`
   - Points to: `https://www.rinawarptech.com/api/checkout-v2`

### Cloudflare Dashboard Actions (Required ⚠️)

These must be done manually in the Cloudflare Dashboard:

1. **Remove Conflicting Worker Routes**
   - Go to: Workers & Pages → [Worker Name] → Routes
   - Delete any routes matching: `rinawarptech.com/api/*`
   - Delete any routes matching: `www.rinawarptech.com/api/*`

2. **Delete Unused Workers (Optional)**
   - `rinawarp-api` - No routes, no traffic (safe to delete)
   - Other workers can be kept if needed for future functionality

## Verification Steps

### 1. Check Git Changes
```bash
cd /home/karina/Documents/rinawarp-Business
git status --porcelain
git diff --stat
```

Expected: Modified files include:
- `rinawarp-website/public/index.html`
- `rinawarp-website/public/pricing.html`

### 2. Test API Health (After Dashboard Changes)
```bash
curl https://www.rinawarptech.com/api/health
```

Expected Response:
```json
{"status":"ok","service":"rinawarp-api","timestamp":"2026-01-14T16:00:00.000Z"}
```
HTTP Status: 200

### 3. Run Smoke Tests
```bash
node verify-rinawarp-smoke.js
```

Expected Results:
- ✅ Website Accessibility: PASSED
- ✅ API Health: PASSED
- ✅ Checkout Flows: All plans PASSED
- ✅ SSL/TLS: PASSED
- ✅ Content Security Policy: Present
- ✅ Banner Visibility: PASSED
- ✅ Stripe Navigation: PASSED
- ✅ Download Links: PASSED
- Exit code: 0 (success)

### 4. Test Checkout Flow Manually
1. Open: https://www.rinawarptech.com/pricing.html
2. Click any "Subscribe" button
3. Verify Stripe checkout loads without errors
4. Verify no CSP warnings in browser console

### 5. Verify VS Code Extension
The extension should:
- Successfully call `https://www.rinawarptech.com/api/checkout-v2`
- Open Stripe checkout without errors
- Not receive 404 responses

## Expected Final State

### Production Architecture

✅ **Single Backend (Pages Functions)**
- `rinawarptech-website` (Cloudflare Pages)
  - Website frontend
  - API endpoints: `/api/health`, `/api/checkout-v2`
  - Stripe integration
  - All traffic routes through Pages Functions

⚠️ **Optional Workers (Keep if Needed)**
- `rina-agent` - Agent/bot functionality
- `admin-api` - Admin routes on separate subdomain
- `rinawarp-license` - License verification

❌ **Removed Workers**
- Any worker with `/api/*` routes on main domain
- `rinawarp-api` (if confirmed unused)

## Troubleshooting

### Issue: API Returns 404
**Cause:** Worker still has `/api/*` routes
**Solution:** Remove all `/api/*` routes from workers in Cloudflare Dashboard

### Issue: CSP Warnings
**Cause:** Missing CSP header or incorrect configuration
**Solution:** Verify CSP header is present in both index.html and pricing.html

### Issue: Smoke Test Fails
**Cause:** Multiple APIs responding to same routes
**Solution:** Ensure only Pages Functions handle `/api/*` routes

## Success Criteria

All of the following must be true:

1. ✅ `curl https://www.rinawarptech.com/api/health` returns 200
2. ✅ `node verify-rinawarp-smoke.js` passes without skips
3. ✅ VS Code extension checkout opens Stripe
4. ✅ No conflicting workers handle `/api/*` routes
5. ✅ CSP headers present on all pages
6. ✅ No random 404s for API endpoints

## Next Steps

1. **Immediate:** Complete Cloudflare Dashboard actions
2. **Verify:** Run all verification steps
3. **Monitor:** Watch for API routing issues in production
4. **Document:** Update any internal runbooks with new architecture

## Files Modified

```
rinawarp-website/public/index.html         | CSP header added
rinawarp-website/public/pricing.html       | CSP header added
verify-rinawarp-smoke.js                    | Already correct
CLOUDFLARE_CLEANUP_SUMMARY.md              | Documentation created
CLOUDFLARE_CLEANUP_VERIFICATION.md         | This file
```

## Cloudflare Dashboard Actions Checklist

- [ ] Remove `/api/*` routes from all workers
- [ ] Delete unused workers (optional)
- [ ] Verify Pages Functions are primary API handler
- [ ] Test API endpoints work consistently

Once all steps are complete, the system will have:
- Clean, predictable routing
- No conflicting API endpoints
- Stable smoke tests
- Reliable VS Code extension integration
- Secure CSP headers
