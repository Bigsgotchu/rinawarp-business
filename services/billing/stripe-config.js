const stripe = require('stripe')("${STRIPE_SECRET_KEY}");

module.exports = {
    stripe,
    webhookSecret: "${STRIPE_WEBHOOK_SECRET:-whsec_test_secret}"
};
