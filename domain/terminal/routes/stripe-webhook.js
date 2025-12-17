import express from 'express';
import { handleWebhook } from '../src/backend/stripe-production.js';

const router = express.Router();

// Handle Stripe webhooks
router.post('/stripe-webhook', handleWebhook);

export default router;
