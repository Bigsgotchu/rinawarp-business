import express from 'express';
import { createCheckoutSession } from '../src/backend/stripe-production.js';

const router = express.Router();

// Create checkout session
router.post('/create-checkout-session', async (req, res) => {
  console.log('🔄 Checkout session request received:', {
    priceId: req.body.priceId,
    email: req.body.email,
    headers: req.headers,
  });

  try {
    const { priceId, email } = req.body;

    // Call the existing createCheckoutSession with the correct parameters
    req.body.customerEmail = email;
    req.body.success_url =
      'https://rinawarptech.com/success?session_id={CHECKOUT_SESSION_ID}';
    req.body.cancel_url = 'https://rinawarptech.com/cancel';

    await createCheckoutSession(req, res);
  } catch (error) {
    console.error('Checkout session error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
