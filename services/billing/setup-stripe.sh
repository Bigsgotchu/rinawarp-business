#!/bin/bash
# Setup Stripe for payments

# Check if Stripe keys are set
if [ -z "$STRIPE_SECRET_KEY" ] || [ -z "$STRIPE_PUBLIC_KEY" ]; then
    echo "ERROR: Stripe keys not found in environment variables"
    echo "Please ensure .env contains:"
    echo "  STRIPE_SECRET_KEY=your_secret_key"
    echo "  STRIPE_PUBLIC_KEY=your_public_key"
    exit 1
fi

# Create billing service directory
mkdir -p rinawarp/services/billing
mkdir -p rinawarp/services/billing/logs

# Create Stripe configuration
cat > rinawarp/services/billing/stripe-config.js << 'EOF'
const stripe = require('stripe')("${STRIPE_SECRET_KEY}");

module.exports = {
    stripe,
    webhookSecret: "${STRIPE_WEBHOOK_SECRET:-whsec_test_secret}"
};
EOF

# Create payment handler
cat > rinawarp/services/billing/payment-handler.js << 'EOF'
const express = require("express");
const { stripe } = require("./stripe-config");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

const logFile = path.join(__dirname, "logs", "stripe.log");

function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(logFile, logMessage);
    console.log(logMessage.trim());
}

// Create payment intent
app.post("/create-payment-intent", async (req, res) => {
    try {
        const { amount, currency = "usd", metadata = {} } = req.body;
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            metadata,
            automatic_payment_methods: { enabled: true }
        });
        
        log(`Payment intent created: ${paymentIntent.id} for $${amount / 100}`);
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        log(`Payment error: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

// Webhook handler
app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        log(`Webhook error: ${err.message}`);
        res.status(400).send(`Webhook error: ${err.message}`);
        return;
    }
    
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            log(`Payment succeeded: ${paymentIntent.id} for $${paymentIntent.amount / 100}`);
            break;
        case 'payment_intent.payment_failed':
            const failedIntent = event.data.object;
            log(`Payment failed: ${failedIntent.id}`);
            break;
        default:
            log(`Unhandled event type: ${event.type}`);
    }
    
    res.json({ received: true });
});

app.listen(5658, () => {
    log("💳 Stripe billing service running on port 5658");
});
EOF

echo "✅ Stripe setup complete"
echo "Billing service will run on port 5658"
echo "Stripe keys configured from environment variables"
