# Cloudflare Production Setup Guide

## 🎯 Overview

This guide provides step-by-step instructions to configure your RinaWarp production environment in Cloudflare Pages, enabling full Stripe integration and payment processing.

## 📋 Prerequisites

- Access to Cloudflare Dashboard
- Access to rinawarptech Pages project
- Stripe account with live API keys

## 🔧 Configuration Steps

### Step 1: Navigate to Environment Variables

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your account
3. Navigate to **Pages** → **rinawarptech** → **Settings** → **Variables & Secrets**

### Step 2: Add Required Environment Variables

Add the following 4 environment variables with these exact values:

#### 1. STRIPE_SECRET_KEY
```
STRIPE_SECRET_KEY_EXPOSED_REMOVED
```

#### 2. STRIPE_WEBHOOK_SECRET
```
whsec_yOVnlDM7oBl5sCrhkiPKTVLSkqR2Q4ma
```

#### 3. DOMAIN
```
https://rinawarptech.com
```

#### 4. RINA_PRICE_MAP
```json
{"enterprise-yearly":"price_1SVRVMGZrRdZy3W9094r1F5B","founder-lifetime":"price_1SVRVLGZrRdZy3W976aXrw0g","pioneer-lifetime":"price_1SVRVLGZrRdZy3W9LoPVNyem","pro-monthly":"price_1SVRVKGZrRdZy3W9wFO3QPw6","creator-monthly":"price_1SVRVJGZrRdZy3W9tRX5tsaH","starter-monthly":"price_1SVRVJGZrRdZy3W9q6u9L82y"}
```

### Step 3: Deploy Changes

1. Click **Save and Deploy** to apply the environment variables
2. Wait for the deployment to complete
3. Verify the deployment status shows "Success"

## 🧪 Verification

### Test 1: Basic API Health
```bash
curl https://rinawarptech.com/api/health
```

**Expected Response**: HTTP 200 with health status

### Test 2: Checkout API
```bash
curl -X POST https://rinawarptech.com/api/checkout-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "founder-lifetime",
    "successUrl": "https://rinawarptech.com/success.html",
    "cancelUrl": "https://rinawarptech.com/cancel.html"
  }'
```

**Expected Response**: 
```json
{"sessionId": "cs_xxx..."}
```

### Test 3: All Plan Types

Test each available plan:

- `founder-lifetime` → $999 (Founder Lifetime)
- `creator-monthly` → $29.99/month (Creator Monthly)
- `pro-monthly` → $49.99/month (Pro Monthly)
- `enterprise-yearly` → $3000/year (Enterprise Yearly)
- `pioneer-lifetime` → $700 (Pioneer Lifetime)
- `starter-monthly` → $9.99/month (Starter Monthly)

## 📊 Available Plans

| Plan Code | Price | Description |
|-----------|-------|-------------|
| `starter-monthly` | $9.99/month | Starter Monthly |
| `creator-monthly` | $29.99/month | Creator Monthly |
| `pro-monthly` | $49.99/month | Pro Monthly |
| `enterprise-yearly` | $3000/year | Enterprise Yearly |
| `pioneer-lifetime` | $700 one-time | Pioneer Lifetime |
| `founder-lifetime` | $999 one-time | Founder Lifetime |

## 🔍 Troubleshooting

### Common Issues

1. **HTTP 500 Errors**
   - Check that all 4 environment variables are set
   - Verify the deployment completed successfully
   - Check Cloudflare Functions logs

2. **"Invalid Price ID" Errors**
   - Verify RINA_PRICE_MAP JSON is exactly as specified
   - Check that plan codes match exactly (case-sensitive)

3. **CORS Errors**
   - Ensure the website is deployed with latest changes
   - Check that CORS headers include Authorization

### Debug Steps

1. **Check Environment Variables**
   ```bash
   # Use the test script
   ./test-stripe-integration.sh
   ```

2. **Check Cloudflare Logs**
   - Go to Pages → rinawarptech → Functions
   - Check recent invocations and error logs

3. **Verify Stripe Configuration**
   - Ensure webhook endpoint is configured in Stripe Dashboard
   - Verify live API keys are being used

## 🚀 Next Steps

After successful configuration:

1. **Test Payment Flow**: Complete a test purchase
2. **Monitor Transactions**: Check Stripe Dashboard for activity
3. **Set Up Webhooks**: Configure additional webhook endpoints if needed
4. **Production Domain**: Set up custom domain if not already configured

## 📞 Support

If issues persist after following this guide:

1. Check Cloudflare Functions logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test with curl commands to isolate the issue
4. Check Stripe Dashboard for webhook delivery status

---

**Status**: ✅ Ready for Production Configuration

**Last Updated**: December 17, 2025