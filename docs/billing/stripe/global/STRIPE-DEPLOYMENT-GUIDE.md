# Stripe Deployment Guide

**Date:** December 2, 2025  
**Status:** Ready for Deployment  
**Updated Keys:** Publishable Key ✅ | Secret Key Required  

## 🚀 Current Status

### ✅ Completed Updates

- **Publishable Key Updated** in `netlify.toml`
- **Security Configuration** updated in `.env.production`
- **Removed Exposed Secret Key** from configuration files
- **Added Environment Variable References** for secure key management

### ⏳ Pending Actions

- **Secret Key Configuration** (requires manual setup)
- **Webhook Secret Configuration** (requires Stripe dashboard setup)
- **Final Deployment** (ready to proceed)

## 📋 Deployment Steps

### Step 1: Configure Environment Variables

#### For Netlify Deployment

```bash
# In Netlify Dashboard → Site Settings → Environment Variables
STRIPE_SECRET_KEY=sk_live_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

#### For Local Development

```bash
# Copy .env.production to .env and add your keys
cp .env.production .env
# Edit .env and replace ${STRIPE_SECRET_KEY} and ${STRIPE_WEBHOOK_SECRET}
```

### Step 2: Get Your Secret Key

1. **Login to Stripe Dashboard:** <https://dashboard.stripe.com/>
2. **Navigate to:** Developers → API keys
3. **Copy "Secret key"** (starts with `sk_live_`)
4. **Set as environment variable** `STRIPE_SECRET_KEY`

### Step 3: Configure Webhooks

1. **In Stripe Dashboard:** Developers → Webhooks
2. **Add endpoint:** `https://rinawarptech.com/api/webhooks/stripe`
3. **Select events:**
   - `checkout.session.completed`
   - `payment_intent.succeeded`
4. **Copy webhook secret** (starts with `whsec_`)
5. **Set as environment variable** `STRIPE_WEBHOOK_SECRET`

### Step 4: Deploy to Production

#### Option A: Netlify CLI

```bash
# Install Netlify CLI if not already installed
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy to production
netlify deploy --prod
```

#### Option B: Git Push (if connected to Netlify)

```bash
# Commit and push changes
git add .
git commit -m "Update Stripe configuration with new publishable key"
git push origin main
```

## 🔍 Verification Steps

### 1. Check Configuration

```bash
# Test Stripe integration
node -e "
const config = require('./src/shared/packages/platform/platform-config/unified-config.js');
console.log('✅ Stripe publishable key configured:', !!config.shared.stripe.publishableKey);
console.log('⚠️ Stripe secret key status:', process.env.STRIPE_SECRET_KEY ? 'Configured' : 'Missing');
"
```

### 2. Test Payment Integration

```bash
# Run health check
node src/cli/bin/rinawarp.js health

# Check Stripe configuration
node src/cli/bin/rinawarp.js revenue stripe auth --api-key YOUR_SECRET_KEY
```

### 3. Test Webhook Endpoint

```bash
# Test webhook endpoint exists
curl -I https://rinawarptech.com/api/webhooks/stripe
# Expected: HTTP 200 or proper error handling
```

## 🛡️ Security Verification

### Before Deployment

- [ ] No exposed secret keys in repository
- [ ] Environment variables properly configured
- [ ] Webhook endpoint properly secured
- [ ] SSL certificate valid for domain

### After Deployment

- [ ] Test payment flow end-to-end
- [ ] Verify webhook delivery
- [ ] Check Stripe dashboard for test transactions
- [ ] Monitor for any security alerts

## 🔧 Troubleshooting

### Common Issues

#### 1. "Invalid API Key" Error

**Cause:** Secret key not set or incorrect  
**Solution:** Verify `STRIPE_SECRET_KEY` environment variable

#### 2. "Webhook Verification Failed"

**Cause:** Webhook secret not configured  
**Solution:** Set `STRIPE_WEBHOOK_SECRET` environment variable

#### 3. "Publishable Key Not Found"

**Cause:** Frontend not loading updated configuration  
**Solution:** Clear browser cache and redeploy

#### 4. Environment Variable Not Loading

**Cause:** Netlify environment variables not set  
**Solution:** Check Netlify dashboard environment variables

### Health Check Commands

```bash
# Check overall system health
node src/cli/bin/rinawarp.js health --verbose

# Check Stripe integration specifically
node src/cli/bin/rinawarp.js revenue health

# Test Stripe authentication
node src/cli/bin/rinawarp.js revenue stripe auth --api-key YOUR_KEY
```

## 📊 Post-Deployment Monitoring

### Key Metrics to Monitor

1. **Payment Success Rate:** Should be >95%
2. **Webhook Delivery Success:** Should be >99%
3. **API Response Times:** Should be <2 seconds
4. **Error Rates:** Should be <1%

### Monitoring Commands

```bash
# Daily health check
node src/cli/bin/rinawarp.js health

# Weekly detailed report
node src/cli/bin/rinawarp.js revenue stripe report

# Check recent transactions
# (View in Stripe Dashboard → Payments)
```

## 🔄 Rollback Plan

### If Issues Occur

1. **Immediate:** Revert to previous deployment
2. **Investigate:** Check logs for errors
3. **Fix:** Address configuration issues
4. **Re-deploy:** After fixes are complete

### Rollback Commands

```bash
# Rollback via Netlify CLI
netlify rollback

# Or use Netlify Dashboard → Deploys → Previous successful deploy
```

## 📞 Support

### If You Need Help

1. **Check Logs:** Use `netlify functions:log` for function logs
2. **Test Locally:** Ensure everything works locally first
3. **Verify Environment:** Double-check all environment variables
4. **Contact Support:** RinaWarp development team

### Emergency Contacts

- **Technical Issues:** Check deployment logs first
- **Stripe Issues:** Review Stripe dashboard for account status
- **Domain Issues:** Verify DNS and SSL certificate

---

## ✅ Deployment Checklist

### Pre-Deployment

- [x] Updated publishable key in netlify.toml
- [x] Removed exposed secret key from .env.production
- [x] Added environment variable references
- [x] Created deployment guide

### During Deployment

- [ ] Set STRIPE_SECRET_KEY environment variable
- [ ] Set STRIPE_WEBHOOK_SECRET environment variable
- [ ] Deploy to production
- [ ] Verify deployment success

### Post-Deployment

- [ ] Test payment flow
- [ ] Test webhook delivery
- [ ] Monitor for 24 hours
- [ ] Update monitoring alerts

**Deployment Status:** 🟡 Ready for Manual Configuration  
**Next Step:** Configure secret keys and deploy  

---

**Document Created:** December 2, 2025 at 06:58 UTC  
**Updated:** December 2, 2025 at 06:58 UTC  
**Ready for Deployment:** YES (pending secret key configuration)
