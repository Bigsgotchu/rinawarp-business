# Stripe Setup Guide for RinaWarp Terminal Pro

## Quick Setup Checklist

### 1. Create Product in Stripe Dashboard
1. Log into your Stripe Dashboard
2. Switch to **Live Mode** when ready for production
3. Go to **Products** → **Add Product**
4. Set Product name: `RinaWarp Terminal Pro`
5. Add description: `Professional terminal application with advanced features for developers and power users`

### 2. Create Pricing Structure
Under the product, create these **Prices**:

#### Monthly Subscriptions
- **Basic**: Recurring, $9.99/month
- **Starter**: Recurring, $29/month  
- **Creator**: Recurring, $69/month
- **Pro**: Recurring, $99/month

#### One-Time Lifetime Purchases
- **Founder Lifetime**: One-time, $699
- **Pioneer Lifetime**: One-time, $800
- **Lifetime Future**: One-time, $999

### 3. Create Payment Links
For each price created above:
1. In Stripe Dashboard, go to **Payment Links**
2. Click **Create payment link**
3. Select the price you just created
4. Customize the payment link (optional)
5. Copy the generated URL

### 4. Update Configuration
Update `config/stripe-config.json` with your actual payment links:

```json
{
  "pricingTiers": [
    {
      "id": "basic",
      "paymentLink": "https://buy.stripe.com/your_actual_basic_link"
    },
    // ... repeat for all tiers
  ]
}
```

## Expected Payment Link Format
Your payment links will look like:
- Test: `https://buy.stripe.com/test_abc123def456`
- Live: `https://buy.stripe.com_abc123def456`

## Environment Variables Template
Create these environment variables in your deployment:

```bash
BASIC_PAYMENT_LINK="https://buy.stripe.com/your_basic_link"
STARTER_PAYMENT_LINK="https://buy.stripe.com/your_starter_link" 
CREATOR_PAYMENT_LINK="https://buy.stripe.com/your_creator_link"
PRO_PAYMENT_LINK="https://buy.stripe.com/your_pro_link"
FOUNDER_PAYMENT_LINK="https://buy.stripe.com/your_founder_link"
PIONEER_PAYMENT_LINK="https://buy.stripe.com/your_pioneer_link"
LIFETIME_FUTURE_PAYMENT_LINK="https://buy.stripe.com/your_lifetime_future_link"
```

## Copy Updates for Website
⚠️ **Important**: Since we now offer subscriptions, update all copy to reflect:

**Instead of**: "No subscriptions required"
**Use**: "Start free. Choose monthly or lifetime when you're ready."

## Testing
1. Test all payment links in Stripe's test mode first
2. Verify redirects work correctly
3. Test both subscription and one-time payments
4. Ensure all pricing displays match your setup

## Post-Setup
After configuring:
1. Update the pricing page HTML
2. Test the complete payment flow
3. Verify analytics tracking
4. Set up webhooks if needed for account provisioning

## File Locations
- Stripe config: `/website/rinawarp-website/config/stripe-config.json`
- Downloads manifest: `/website/rinawarp-website/downloads/terminal-pro/manifest.json`
- Pricing page: `/website/rinawarp-website/pricing.html`