import Stripe from 'stripe';

// Initialize Stripe with your secret key
// This should come from environment variables in production
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-11-17.clover',
});

export { stripe };
