# 10-Step Launch Smoke Test

## Pre-Launch Checklist (Run These First)

### 1. ✅ Domain & SSL

- [ ] Visit <https://rinawarptech.com> (loads without SSL errors)
- [ ] Check all pages: /, /pricing, /about, /contact, /download
- [ ] Verify favicon.ico loads
- [ ] Check OG image: <https://rinawarptech.com/assets/og-image.png>

### 2. ✅ Static Assets

- [ ] CSS loads: <https://rinawarptech.com/css/styles.css>
- [ ] Brand CSS: <https://rinawarptech.com/css/brand.css>
- [ ] All images in /assets/ load
- [ ] No 404s in browser dev tools

### 3. ✅ Pricing Configuration

- [ ] Visit <https://rinawarptech.com/pricing.json>
- [ ] Verify all 7 plans present with real Stripe price IDs
- [ ] Confirm prices match: Basic $9.99, Starter $29, Creator $69, Pro $99, Founder $699, Pioneer $800, Evergreen $999

## Revenue Flow Test (Creates Real Stripe Sessions)

### 4. ✅ Checkout API Health

```bash
curl -X POST https://rinawarptech.com/api/checkout-v2 \
  -H "Content-Type: application/json" \
  -d '{"plan":"basic-monthly","email":"test@example.com"}'
```

- [ ] Returns `{"sessionId":"cs_..."}`
- [ ] No errors in response

### 5. ✅ All Plan Checkouts

Run the smoke test script:

```bash
./test-checkout-smoke.sh
```

- [ ] All 7 plans return success
- [ ] No "Invalid plan" errors

### 6. ✅ Stripe Dashboard Validation

- [ ] Login to Stripe Dashboard
- [ ] Check "Payments" → see test checkout sessions
- [ ] Verify correct amounts and modes (subscription/payment)
- [ ] Confirm customer email captured

## User Experience Test (Manual Browser Testing)

### 7. ✅ Frontend Checkout Flow

- [ ] Click any "Get Started" button on homepage
- [ ] Redirects to Stripe Checkout
- [ ] Shows correct plan name and price
- [ ] Can enter test card: 4242 4242 4242 4242
- [ ] Completes successfully

### 8. ✅ Success/Cancel URLs

- [ ] After successful payment, redirects to success.html
- [ ] Cancel button redirects to cancel.html
- [ ] Both pages load properly

### 9. ✅ Analytics Events

- [ ] Open browser dev tools → Network
- [ ] Click checkout button
- [ ] Verify GA4 events fire (if implemented)
- [ ] Check for any JavaScript errors

### 10. ✅ Mobile Responsiveness

- [ ] Test on mobile device or browser dev tools
- [ ] Pricing page displays correctly
- [ ] Checkout flow works on mobile
- [ ] No horizontal scroll issues

## Post-Test Cleanup

- [ ] Delete test checkout sessions from Stripe Dashboard
- [ ] Clear browser cache/cookies
- [ ] Test again with incognito window

## Go/No-Go Decision

- [ ] All 10 steps pass = 🚀 LAUNCH
- [ ] Any failures = 🔧 Fix issues first

## Emergency Rollback

If issues discovered after launch:

1. Revert to previous deployment in Cloudflare Pages
2. Update DNS if needed
3. Communicate with affected users
