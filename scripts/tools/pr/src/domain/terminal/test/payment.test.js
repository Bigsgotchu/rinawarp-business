/* eslint-env jest */
// src/domain/terminal/test/payment.test.js
// Example Jest (ESM) test skeleton; adjust imports to your project structure.
import Stripe from 'stripe'; // will be auto-mocked via __mocks__/stripe.js if jest.mock('stripe')
jest.mock('stripe');

// Example: import your payment module
// import { createPaymentIntent, processTerminalPayment } from '../payment.js';

describe('payment flows', () => {
  test('creates and confirms a payment intent', async () => {
    const stripe = new Stripe('sk_test_123');
    const pi = await stripe.paymentIntents.create({ amount: 100, currency: 'usd' });
    expect(pi.id).toBe('pi_123');
    const confirm = await stripe.paymentIntents.confirm(pi.id);
    expect(confirm.status).toBe('succeeded');
  });

  test('processes terminal payment via reader', async () => {
    const stripe = new Stripe('sk_test_123');
    const result = await stripe.terminal.readers.processPaymentIntent('tmr_123', {
      payment_intent: 'pi_123',
    });
    expect(result.status).toBe('succeeded');
  });
});
