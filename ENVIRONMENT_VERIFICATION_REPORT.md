# Environment Verification Report

**Date:** $(date)
**Status:** Manual verification required

## Required Environment Variables

### Critical Variables (MUST be set)
- `NODE_ENV=production`
- `STRIPE_SECRET_KEY=sk_live_xxx` (live key)
- `STRIPE_WEBHOOK_SECRET=whsec_xxx` (webhook secret)
- `PUBLIC_SITE_URL=https://rinawarptech.com`
- `RINA_PRICE_MAP={"enterprise-yearly":"price_1SVRVMGZrRdZy3W9094r1F5B","founder-lifetime":"price_1SVRVLGZrRdZy3W976aXrw0g","pioneer-lifetime":"price_1SVRVLGZrRdZy3W9LoPVNyem","pro-monthly":"price_1SVRVKGZrRdZy3W9wFO3QPw6","creator-monthly":"price_1SVRVJGZrRdZy3W9tRX5tsaH","starter-monthly":"price_1SVRVJGZrRdZy3W9q6u9L82y"}`
- `DOMAIN=https://rinawarptech.com`

### Optional Variables (safe to include)
- `GA_MEASUREMENT_ID=G-XXXX`

### Variables to Remove
- Old test keys
- Duplicate Stripe variables
- Unused SENTRY variables

## Stripe Webhook Requirements

- **Endpoint URL:** https://rinawarptech.com/api/stripe-webhook
- **Required Events:** checkout.session.completed, payment_intent.succeeded
- **Secret:** Must be copied to STRIPE_WEBHOOK_SECRET

## Action Required

Manual verification of Cloudflare Pages environment variables is required.
