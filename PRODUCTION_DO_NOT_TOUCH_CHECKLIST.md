# Production "Do Not Touch" Checklist

## 🚫 ABSOLUTELY DO NOT MODIFY IN PRODUCTION

### Core Infrastructure (Frozen)
- [ ] Cloudflare Pages project: `rinawarptech-website`
- [ ] Custom domain: `rinawarptech.com`
- [ ] API routing: `/api/*` → Pages Functions
- [ ] Stripe webhook endpoints (if any)
- [ ] DNS records for rinawarptech.com

### Pricing Configuration (Locked)
- [ ] pricing.json structure and keys
- [ ] Stripe price IDs (real production IDs only)
- [ ] Plan names and intervals
- [ ] Currency (USD only)

### Critical Files (Read-Only)
- [ ] `/functions/api/checkout-v2.js` - Core revenue function
- [ ] `/pricing.json` - Single source of truth
- [ ] `/index.html` - Main landing page
- [ ] `/_headers` - Security headers
- [ ] `/_redirects` - URL redirects

## ⚠️ APPROVED FOR MODIFICATION

### Safe to Change
- [ ] Marketing copy in HTML files
- [ ] CSS styling (except brand.css structure)
- [ ] Images in /assets/
- [ ] Blog posts in /blog/
- [ ] Legal pages (/terms.html, /privacy.html, etc.)
- [ ] Download links and assets

### Requires Testing
- [ ] New HTML pages
- [ ] Additional CSS files
- [ ] New static assets
- [ ] Non-critical JavaScript

## 🚨 EMERGENCY PROCEDURES

### If Something Breaks Revenue
1. **IMMEDIATELY** revert to previous deployment in Cloudflare Pages
2. Check Stripe Dashboard for failed payments
3. Communicate with affected customers
4. Debug in staging environment first
5. Test thoroughly before re-deploying

### Rollback Steps
```bash
# In Cloudflare Pages dashboard:
1. Go to Deployments
2. Find working deployment
3. Click "Rollback"
4. Verify site loads
5. Check checkout still works
```

## 📊 Monitoring Requirements

### Daily Checks
- [ ] Site loads: https://rinawarptech.com
- [ ] Checkout API responds
- [ ] Stripe dashboard shows new payments
- [ ] No JavaScript errors in browser console

### Weekly Checks
- [ ] Run `./test-checkout-smoke.sh`
- [ ] Check Cloudflare Pages deployment status
- [ ] Review Stripe failed payments
- [ ] Monitor GA4 events (if implemented)

## 🔧 Development Workflow

### For Any Changes
1. **NEVER** edit directly in production
2. Make changes in development/staging
3. Test with `./test-checkout-smoke.sh`
4. Deploy to staging preview URL
5. Manual test checkout flow
6. Only then deploy to production

### Code Review Requirements
- [ ] Changes reviewed by another developer
- [ ] Checkout functionality tested
- [ ] No breaking changes to pricing.json structure
- [ ] Static assets load correctly

## 📞 Support Contacts

### Technical Issues
- Cloudflare Pages: Check dashboard for deployment errors
- Stripe: Monitor dashboard for payment failures
- Domain: Contact registrar if DNS issues

### Business Impact
- Failed payments: Check Stripe logs
- Site down: Check Cloudflare status page
- Customer complaints: Review recent deployments

## ✅ Final Sign-Off

**I understand that modifying the above "Do Not Touch" items in production can break revenue and customer trust. I will follow the emergency procedures and development workflow.**

Signed: ____________________ Date: ____________