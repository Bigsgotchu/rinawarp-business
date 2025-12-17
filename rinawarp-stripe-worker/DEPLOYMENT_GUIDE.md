# RinaWarp Stripe Worker Deployment Guide

## Quick Deploy Steps

### 1. Deploy the Worker
```bash
cd rinawarp-stripe-worker
npm run deploy
```

### 2. Set Environment Variables
You need to set these secrets using Wrangler:

```bash
# Set Stripe Secret Key
wrangler secret put STRIPE_SECRET_KEY

# Set Stripe Webhook Secret  
wrangler secret put STRIPE_WEBHOOK_SECRET

# Set your domain
wrangler secret put DOMAIN

# Set price map (JSON format)
wrangler secret put RINA_PRICE_MAP
```

Example RINA_PRICE_MAP format:
```json
{
  "starter": "price_1234567890",
  "pro": "price_0987654321", 
  "enterprise": "price_1122334455"
}
```

### 3. Update Stripe Dashboard Webhook

In your Stripe Dashboard, set the webhook URL to:
```
https://rinawarptech.com/api/webhooks/stripe
```

Select events:
- `checkout.session.completed`

### 4. Test the Integration

The Worker will be available at:
```
https://rinawarp-stripe-worker.workers.dev/api/checkout-v2
```

And webhooks at:
```
https://rinawarp-stripe-worker.workers.dev/api/webhooks/stripe
```

## Architecture

The Worker provides:
- **Checkout endpoint**: `/api/checkout-v2` (POST)
- **Webhook endpoint**: `/api/webhooks/stripe` (POST)
- **Proxy routing**: All `/api/*` requests from Pages proxy to Worker

## What This Fixes

✅ **Failed to load pricing configuration** - Worker handles price mapping
✅ **Checkout session creation** - Stripe integration implemented  
✅ **Stripe Checkout redirect** - Proper success/cancel URLs
✅ **Webhooks 404** - Dedicated webhook endpoint
✅ **License fulfillment trigger** - Webhook handles completed payments

## File Structure

```
rinawarp-stripe-worker/
├── src/index.ts          # Main Worker code
├── package.json          # Dependencies
├── wrangler.toml         # Worker configuration
├── tsconfig.json         # TypeScript config
└── DEPLOYMENT_GUIDE.md   # This file
```

## API Endpoints

### POST /api/checkout-v2
Creates a Stripe Checkout session.

**Request:**
```json
{
  "priceKey": "pro"
}
```

**Response:**
```json
{
  "sessionId": "cs_..."
}
```

### POST /api/webhooks/stripe  
Handles Stripe webhooks.

**Events processed:**
- `checkout.session.completed` - Triggers license fulfillment

## Environment Variables Required

| Variable | Description | Example |
|----------|-------------|---------|
| STRIPE_SECRET_KEY | Your Stripe secret key | sk_live_... |
| STRIPE_WEBHOOK_SECRET | Stripe webhook endpoint secret | whsec_... |
| DOMAIN | Your domain | https://rinawarptech.com |
| RINA_PRICE_MAP | JSON price mapping | {"pro": "price_..."} |

## Troubleshooting

### Worker not responding
- Check Worker deployment status in Cloudflare dashboard
- Verify environment variables are set
- Check Worker logs: `wrangler tail`

### Webhook verification fails
- Ensure STRIPE_WEBHOOK_SECRET matches Stripe dashboard
- Check webhook endpoint URL is correct

### Price not found
- Verify RINA_PRICE_MAP contains the priceKey
- Ensure price IDs are correct Stripe price IDs