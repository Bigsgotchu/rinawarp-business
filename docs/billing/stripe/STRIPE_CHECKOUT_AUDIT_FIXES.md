# Stripe Checkout Flow Audit - Implementation Guide

## Overview

This document outlines the fixes implemented for the Stripe checkout flow based on the audit findings. The main issues were:

1. **Frontend/Backend API mismatch** - Frontend sending wrong JSON format
2. **Missing RINA_PRICE_MAP usage** - Backend using hardcoded price IDs
3. **Plan key inconsistencies** - Mismatched plan names between frontend and backend
4. **Button configuration issues** - Missing proper data attributes

## Fixed Files

### 1. Frontend Checkout (`apps/website/public/checkout.js`)

**Changes Made:**

- Replaced hardcoded price IDs with proper plan key mapping
- Implemented Stripe.js integration with `redirectToCheckout`
- Added proper error handling and loading states
- Used data attributes (`data-checkout-button`, `data-plan`) for buttons

**Plan Key Mapping:**

```javascript
const PLAN_KEYS = {
  student: 'terminal_pro_starter',
  professional: 'terminal_pro_creator',
  pro: 'terminal_pro_pro',
  enterprise: 'terminal_pro_enterprise',
};
```

**Button Configuration:**

```html
<button class="btn btn-primary" data-checkout-button data-plan="student">
  Get Starter Plan — $39
</button>
```

### 2. Backend Checkout API (`apps/website/functions/api/checkout-v2.js`)

**Changes Made:**

- Now uses `RINA_PRICE_MAP` environment variable instead of hardcoded prices
- Added fallback price mapping if env var is not set
- Returns `sessionId` instead of `url` for Stripe.js compatibility
- Enhanced error messages to show available plans

**API Response:**

```javascript
// Returns session ID for Stripe.js
{ "sessionId": "cs_xxx" }
```

### 3. Pricing Page (`apps/website/public/pricing.html`)

**Changes Made:**

- Added proper Stripe.js script inclusion
- Configured publishable key via global variable
- Created proper pricing cards with checkout buttons
- Added FAQ section

**Stripe Configuration:**

```html
<script src="https://js.stripe.com/v3/"></script>
<script>
  window.RINA_STRIPE_PUBLISHABLE_KEY = 'pk_live_REPLACE_WITH_YOUR_PUBLISHABLE_KEY';
</script>
<script src="/checkout.js" defer></script>
```

### 4. Analytics Configuration (`apps/website/public/analytics-config.js`)

**Changes Made:**

- Fixed Google Analytics 4 implementation
- Removed any references to problematic `/qzje/` script
- Uses proper GA4 CDN URL
- Added development environment detection

## Environment Variables Setup

In Cloudflare Pages → Settings → Variables & Secrets, set:

### Required Variables

1. **STRIPE_SECRET_KEY**
   - Your Stripe secret key (starts with `sk_live_` or `sk_test_`)

2. **RINA_PRICE_MAP**

   ```json
   {
     "terminal_pro_starter": "price_xxx",
     "terminal_pro_creator": "price_yyy",
     "terminal_pro_pro": "price_zzz",
     "terminal_pro_enterprise": "price_aaa"
   }
   ```

3. **DOMAIN**
   - Your domain: `https://rinawarptech.com`

4. **STRIPE_WEBHOOK_SECRET**
   - From Stripe Dashboard webhook settings

### Optional Variables

5. **DB**
   - D1 database binding for license storage

## Stripe Dashboard Configuration

### 1. Update Webhook Endpoints

**Remove these old endpoints:**

- `https://api.rinawarptech.com/api/stripe/webhook`
- `https://yourdomain.com/webhook/stripe`

**Add this production endpoint:**

- **URL:** `https://rinawarptech.com/api/stripe/webhook`
- **Events:** `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted`

### 2. Get Webhook Secret

After adding the endpoint, Stripe will show a signing secret (starts with `whsec_...`). Set this as `STRIPE_WEBHOOK_SECRET` in Cloudflare Pages.

## Deployment Steps

1. **Update Environment Variables in Cloudflare Pages:**

   ```bash
   # Set these in Cloudflare Pages Dashboard → Settings → Variables & Secrets
   STRIPE_SECRET_KEY=sk_live_xxx
   RINA_PRICE_MAP={"terminal_pro_starter":"price_xxx",...}
   DOMAIN=https://rinawarptech.com
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```

2. **Update Frontend Configuration:**
   - Replace `pk_live_REPLACE_WITH_YOUR_PUBLISHABLE_KEY` in `pricing.html` with your actual publishable key

3. **Deploy to Cloudflare Pages:**

   ```bash
   cd apps/website
   npm run build
   npx wrangler pages deploy public --project-name=rinawarptech --branch=master
   ```

4. **Update Stripe Webhooks:**
   - Remove old webhook endpoints
   - Add new production endpoint
   - Copy new webhook secret to Cloudflare Pages

## Testing Checklist

- [ ] Open DevTools → Network tab
- [ ] Click a "Pay" button on pricing page
- [ ] Verify `POST /api/checkout-v2` returns 200 with sessionId
- [ ] Check for redirect to `checkout.stripe.com`
- [ ] Confirm no console errors
- [ ] Test webhook delivery in Stripe Dashboard → Developers → Webhooks

## Troubleshooting

### If checkout buttons don't work:

1. **Check Network tab:**
   - Look for `POST /api/checkout-v2` request
   - Note status code and response

2. **Check Console:**
   - Look for Stripe configuration errors
   - Verify publishable key is set

3. **Check Environment Variables:**
   - Confirm `RINA_PRICE_MAP` is valid JSON
   - Verify `STRIPE_SECRET_KEY` is set correctly

### If webhooks don't work:

1. **Verify webhook URL:**
   - Should be `https://rinawarptech.com/api/stripe/webhook`
   - Not `api.rinawarptech.com`

2. **Check webhook events:**
   - Must include `checkout.session.completed`

3. **Verify webhook secret:**
   - Should match the one from Stripe Dashboard

## Security Considerations

1. **Never expose secret keys in frontend code**
2. **Use environment variables for all sensitive data**
3. **Verify webhook signatures before processing**
4. **Use HTTPS for all webhook endpoints**
5. **Keep Stripe API version current**

## Next Steps

1. Set up proper error monitoring (e.g., Sentry)
2. Implement analytics tracking for checkout events
3. Add license generation testing
4. Set up automated testing for the checkout flow
5. Monitor webhook delivery success rates
