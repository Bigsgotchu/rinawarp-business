# Stripe Webhook Configuration Guide

## Overview
Configure Stripe webhooks to handle payment events and activate licenses automatically.

## Step 1: Access Stripe Dashboard

1. Go to [https://dashboard.stripe.com/](https://dashboard.stripe.com/)
2. Sign in to your account
3. **Important**: Switch to **LIVE MODE** (toggle in top-left corner)

## Step 2: Create Webhook Endpoint

### Navigate to Webhooks
- Go to **Developers** → **Webhooks**
- Click **"Add endpoint"**

### Configure Webhook Settings
- **Endpoint URL**: `https://api.rinawarptech.com/api/stripe/webhook`
- **Select events to send** (choose these specific events):
  - `checkout.session.completed`
  - `invoice.payment_succeeded`
  - `payment_intent.succeeded`
  - `customer.subscription.deleted`
  - `customer.subscription.updated`
  - `invoice.paid`
  - `invoice.payment_failed`

### Create and Get Secret
1. Click **"Add endpoint"**
2. **Copy the webhook signing secret** (starts with `whsec_`)
3. You'll need this secret for your backend configuration

## Step 3: Update Backend Environment

Add the webhook secret to your backend `.env` file:

```bash
# Add this line to your .env file on the Oracle VM
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret_here
```

## Step 4: Test Webhook Configuration

### Using Stripe CLI (Recommended)
```bash
# Install Stripe CLI
stripe listen --forward-to https://api.rinawarptech.com/api/stripe/webhook

# Test specific events
stripe trigger checkout.session.completed
stripe trigger invoice.payment_succeeded
stripe trigger payment_intent.succeeded
```

### Using Stripe Dashboard
1. Go to **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. Use **"Send test webhook"** feature
4. Select events to test

## Step 5: Monitor Webhook Delivery

### In Stripe Dashboard
- **Developers** → **Webhooks** → **Your endpoint**
- View **"Recent deliveries"** tab
- Check for successful deliveries (200 status codes)

### Backend Logs
```bash
# Check webhook logs on your VM
pm2 logs rinawarp-api

# Or view specific log file
tail -f /var/www/rinawarp-api/logs/error.log
```

## Required Stripe Products

Ensure you have these products created in Stripe:

### Lifetime Licenses
1. **RinaWarp Terminal Pro — Founder Lifetime** ($699)
2. **RinaWarp Terminal Pro — Pioneer Lifetime** ($800)
3. **RinaWarp Terminal Pro — Lifetime Access** ($999)

### Monthly Subscriptions
4. **RinaWarp Terminal Pro — Starter** ($29.99/month)
5. **RinaWarp Terminal Pro — Creator** ($69.99/month)
6. **RinaWarp Terminal Pro — Pro** ($99.99/month)

## Security Best Practices

### 1. Verify Webhook Signatures
Your backend should verify webhook signatures:
```javascript
const signature = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  body, 
  signature, 
  process.env.STRIPE_WEBHOOK_SECRET
);
```

### 2. Handle Failed Webhooks
- Implement retry logic for failed webhook deliveries
- Monitor webhook failure rates in Stripe dashboard
- Set up alerts for webhook failures

### 3. Idempotency
- Use Stripe's idempotency keys for critical operations
- Prevent duplicate license generation

## Troubleshooting

### Common Issues

**Webhook not receiving events**
- ✅ Check webhook URL is publicly accessible
- ✅ Verify DNS is working: `curl https://api.rinawarptech.com/api/stripe/webhook`
- ✅ Check SSL certificate is valid
- ✅ Verify webhook secret matches

**Events not processing correctly**
- ✅ Check backend logs for errors
- ✅ Verify database connection
- ✅ Test with Stripe CLI locally first

**License not activating**
- ✅ Verify license creation in database
- ✅ Check API endpoint accessibility
- ✅ Review webhook processing logs

### Health Check Commands
```bash
# Test webhook endpoint directly
curl -X POST https://api.rinawarptech.com/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Check backend status
curl https://api.rinawarptech.com/health

# View recent webhooks
curl https://api.rinawarptech.com/api/webhooks/recent
```

## Expected Webhook Flow

1. **Customer completes checkout** → `checkout.session.completed`
2. **Webhook processes event** → Creates license in database
3. **Customer receives license** → Via email or dashboard
4. **License activates in Terminal Pro** → Customer can use software

## Next Steps

After webhook configuration:
1. ✅ Test complete payment flow
2. ✅ Verify license activation in Terminal Pro
3. ✅ Set up monitoring and alerts
4. ✅ Configure email notifications

**Your webhook endpoint will be**: `https://api.rinawarptech.com/api/stripe/webhook`