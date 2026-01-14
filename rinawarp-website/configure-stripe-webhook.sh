#!/bin/bash

# Configure Stripe webhook for RinaWarp production
# This script assumes you have the Stripe CLI installed and authenticated

set -e

echo "🔧 Configuring Stripe webhook for RinaWarp..."

# Get the webhook secret from Stripe
WEBHOOK_SECRET=$(stripe listen --print-secret events)
echo "✅ Webhook secret: $WEBHOOK_SECRET"

# Create or update the webhook in Stripe Dashboard
stripe listen --forward-to https://www.rinawarptech.com/api/stripe-webhook \
  --events checkout.session.completed \
  --events charge.refunded \
  --events customer.subscription.updated \
  --events customer.subscription.deleted \
  --events invoice.paid \
  --events invoice.payment_failed

echo ""
echo "📝 To complete setup, add these environment variables to Cloudflare Pages:"
echo ""
echo "STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET"
echo ""
echo "✅ Stripe webhook configuration complete!"
echo ""
echo "Next steps:"
echo "1. Deploy your Cloudflare Pages application"
echo "2. Test the webhook with: stripe trigger checkout.session.completed"
echo "3. Monitor logs in Cloudflare Pages dashboard"
