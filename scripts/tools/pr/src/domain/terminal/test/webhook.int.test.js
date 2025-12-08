/* eslint-env jest */
// src/domain/terminal/test/webhook.int.test.js
// Integration-style test using supertest; adjust app import to your server entry.
import request from 'supertest';
import Stripe from 'stripe';
jest.mock('stripe');

// Dummy express app with a webhook route example
import express from 'express';
import bodyParser from 'body-parser';

function buildApp() {
  const app = express();

  // Stripe recommends using raw body for signature verification
  app.post('/webhook', bodyParser.raw({ type: 'application/json' }), (req, res) => {
    const stripe = new Stripe('sk_test_123');
    const event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'] || '',
      'whsec_123',
    );
    if (event.type === 'payment_intent.succeeded') {
      return res.status(200).send('ok');
    }
    return res.status(400).send('unhandled');
  });

  return app;
}

describe('webhook route', () => {
  test('returns 200 on payment_intent.succeeded', async () => {
    const app = buildApp();
    const res = await request(app)
      .post('/webhook')
      .set('Stripe-Signature', 't=1,v1=deadbeef')
      .send(Buffer.from(JSON.stringify({}))); // raw body
    expect(res.status).toBe(200);
  });
});
