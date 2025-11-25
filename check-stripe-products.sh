#!/bin/bash

# Script to check existing Stripe products and prices
echo "🔍 Checking existing Stripe products and prices..."

# Check if we have the Stripe CLI installed
if ! command -v stripe &> /dev/null; then
    echo "Installing Stripe CLI..."
    curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
    echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian local stable" | sudo tee -a /etc/apt/sources.list.d/stripe.list
    sudo apt update
    sudo apt install -y stripe
fi

# Authenticate with Stripe (you'll need to run stripe login first)
echo "Please run 'stripe login' first if you haven't already"
echo ""

# List products with their prices
echo "📋 Your existing Stripe products:"
stripe products list --expand=data.default_price --limit=10 --api-key="$STRIPE_SECRET_KEY"

echo ""
echo "💰 Your prices:"
stripe prices list --expand=data.product --limit=20 --api-key="$STRIPE_SECRET_KEY"

echo ""
echo "🔑 Current environment:"
echo "STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY:0:20}..."