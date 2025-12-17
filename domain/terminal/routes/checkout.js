// src/domain/terminal/routes/checkout.js
import express from 'express';
import Stripe from 'stripe';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Map your product tiers to live Stripe price IDs
const PRICE_IDS = {
  mermaid: {
    Standard: 'price_xxx_standard',
    Pro: 'price_xxx_pro',
    Team: 'price_xxx_team',
  },
  unicorn: {
    Creator: 'price_xxx_creator',
    Pro: 'price_xxx_pro_studio',
    Studio: 'price_xxx_studio',
  },
};

// POST /api/checkout/create-session
router.post('/create-session', async (req, res) => {
  try {
    const { tier, theme } = req.body;

    const priceId = PRICE_IDS[theme]?.[tier];
    if (!priceId) {
      return res.status(400).json({ error: `No price for ${theme}:${tier}` });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `https://${theme === 'unicorn' ? 'studio' : 'terminal'}.rinawarptech.com/success`,
      cancel_url: `https://${theme === 'unicorn' ? 'studio' : 'terminal'}.rinawarptech.com/cancel`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
