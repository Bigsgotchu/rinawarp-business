# New Pricing Structure - Stripe Setup Guide

This document outlines the changes made to implement the new pricing structure based on the comprehensive copy audit. The new structure focuses on local-first messaging, trust-building, and clear value propositions.

## ✅ Completed Implementation

### 1. Updated React Pricing Component (`/apps/website/src/components/Pricing.jsx`)

- ✅ New plan structure: Free, Basic ($9.99/mo), Starter ($29/mo - featured), Creator ($69/mo), Pro ($99/mo)
- ✅ Lifetime tiers: Founder ($699), Pioneer ($800), Evergreen ($999)
- ✅ Local-first messaging and trust-building copy
- ✅ FAQ section with common questions
- ✅ Download action for free plan
- ✅ Proper checkout integration for paid plans

### 2. Updated HTML Pricing Page (`/apps/website/public/pricing.html`)

- ✅ Complete HTML-ready implementation with responsive design
- ✅ All copy from the audit recommendations
- ✅ Trust badges and local-first messaging
- ✅ Scarcity elements for lifetime tiers
- ✅ Interactive FAQ section

### 3. Updated Stripe Integration

- ✅ Checkout API (`/apps/website/functions/api/checkout-v2.js`) updated with new plan mappings
- ✅ Frontend checkout script (`/apps/website/public/checkout.js`) updated with new plan keys
- ✅ Support for both subscription and one-time payment modes
- ✅ Backward compatibility with existing plan keys

## 🔧 Required Stripe Setup

The following Stripe prices need to be created to fully activate the new pricing structure:

### Monthly Subscription Plans

1. **Basic Monthly** - $9.99/month
   - Price ID: `price_basic_monthly`
   - Usage: Entry-level Rina Agent assistance

2. **Starter Monthly** - $29/month (Featured/Recommended)
   - Price ID: `price_starter_monthly`
   - Usage: Core agent workflow for daily professional use

3. **Creator Monthly** - $69/month
   - Price ID: `price_creator_monthly`
   - Usage: Voice-enabled command execution, priority processing

4. **Pro Monthly** - $99/month
   - Price ID: `price_pro_monthly`
   - Usage: Unlimited usage with priority support

### Lifetime One-Time Plans

5. **Founder Lifetime** - $699 one-time
   - Price ID: `price_founder_lifetime`
   - Limit: 200 total licenses
   - Usage: Early supporter tier

6. **Pioneer Lifetime** - $800 one-time
   - Price ID: `price_pioneer_lifetime`
   - Limit: 300 total licenses
   - Usage: Second wave supporter tier

7. **Evergreen Lifetime** - $999 one-time
   - Price ID: `price_evergreen_lifetime`
   - Usage: Standard lifetime license

## 🌍 Environment Configuration

Update your `RINA_PRICE_MAP` environment variable in Cloudflare Pages:

```json
{
  "basic-monthly": "price_basic_monthly",
  "starter-monthly": "price_starter_monthly",
  "creator-monthly": "price_creator_monthly",
  "pro-monthly": "price_pro_monthly",
  "founder-lifetime": "price_founder_lifetime",
  "pioneer-lifetime": "price_pioneer_lifetime",
  "evergreen-lifetime": "price_evergreen_lifetime"
}
```

## 🎯 Key Improvements from Audit

### Messaging & Trust Building

- ✅ "Simple, transparent pricing" instead of generic "Pricing"
- ✅ "Start free. Upgrade only when Rina saves you real time"
- ✅ Local-first messaging throughout
- ✅ Trust badges: Local-first, Offline-capable, Stripe checkout, Cancel anytime
- ✅ "No ads. No telemetry. No data resale"

### Scarcity & Social Proof

- ✅ Lifetime tier limits (200, 300, then evergreen)
- ✅ "Most users land here after a week" for Basic tier
- ✅ "Best value for heavy users" for Creator tier
- ✅ "Designed for heavy daily workflows" for Pro tier

### Anti-Backlash Elements

- ✅ Clear "What lifetime means" explanation
- ✅ "Lifetime licenses help fund development" messaging
- ✅ Fair-use protection messaging
- ✅ Comprehensive FAQ addressing common concerns

### UX Improvements

- ✅ Free plan with useful features (not frustrating)
- ✅ Clear upgrade paths with specific use cases
- ✅ Professional design with proper visual hierarchy
- ✅ Mobile-responsive layout

## 🚀 Deployment Steps

1. **Create Stripe Prices**: Set up the 7 new Stripe prices listed above
2. **Update Environment**: Set the `RINA_PRICE_MAP` environment variable
3. **Test Integration**: Verify checkout flow for all plans
4. **Deploy Updates**: Push changes to production
5. **Monitor Performance**: Track conversion rates and user feedback

## 🔍 Testing Checklist

- [ ] Free plan download works
- [ ] Basic plan checkout redirects to Stripe
- [ ] Starter plan (featured) checkout works
- [ ] Creator plan checkout works
- [ ] Pro plan checkout works
- [ ] Founder lifetime purchase works
- [ ] Pioneer lifetime purchase works
- [ ] Evergreen lifetime purchase works
- [ ] All plan buttons show loading states
- [ ] FAQ sections expand/collapse properly
- [ ] Mobile responsiveness works
- [ ] Trust badges display correctly

## 📈 Expected Benefits

Based on the audit analysis, this new pricing structure should improve:

- **Conversion Rate**: Better value communication and trust building
- **Backlash Resistance**: Transparent messaging and fair pricing
- **User Satisfaction**: Clear upgrade paths and useful free tier
- **Revenue Optimization**: Proper anchoring and upsell positioning

The new structure addresses the core issues identified in the audit while maintaining the technical functionality and integrating seamlessly with the existing Stripe infrastructure.
