#!/bin/bash
# stripe-production-setup.sh

echo "🔴 Stripe Production Setup"
echo "=========================="
echo ""

echo "1. Open Stripe Dashboard:"
echo "   https://dashboard.stripe.com/products"
echo ""
read -p "Press Enter after creating products..."

echo ""
echo "2. Enter your Price IDs:"
read -p "Terminal Pro Professional (monthly): " TERMINAL_PRO_MONTH
read -p "Terminal Pro Lifetime: " TERMINAL_PRO_LIFETIME
read -p "Music Video Pro (monthly): " MUSIC_PRO_MONTH

echo ""
echo "3. Set up webhook:"
echo "   URL: https://rinawarptech.com/api/stripe-webhook"
echo "   Events: checkout.session.completed, payment_intent.succeeded"
echo ""
read -p "Enter webhook secret: " WEBHOOK_SECRET

echo ""
echo "4. Updating environment variables..."
cat > .env.production << EOF
NODE_ENV=production
STRIPE_PUBLISHABLE_KEY=pk_live_51SH4C2GZrRdZy3W9fn1FQOulxqlAIrZ7wbqqOEyg6dMBsMrqbxM8sbItQ3lrpLuslBdOYZuHEUcfTbUdhjmk0xvC004XaWWoX8
STRIPE_SECRET_KEY=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
STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET
TERMINAL_PRO_MONTH_PRICE=$TERMINAL_PRO_MONTH
TERMINAL_PRO_LIFETIME_PRICE=$TERMINAL_PRO_LIFETIME
MUSIC_PRO_MONTH_PRICE=$MUSIC_PRO_MONTH
EOF

echo "✅ Environment file created!"
echo ""
echo "Next steps:"
echo "1. Deploy .env.production to your server"
echo "2. Update frontend price IDs"
echo "3. Test with Stripe test mode"
echo "4. Go live!"