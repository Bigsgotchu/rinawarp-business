// __mocks__/stripe.js
// Basic Stripe client mock covering Terminal and Webhooks API surfaces used in tests.
export default function Stripe() {
  return {
    terminals: {
      readers: {
        list: jest.fn().mockResolvedValue({ data: [] }),
      },
    },
    terminal: {
      readers: {
        processPaymentIntent: jest.fn().mockResolvedValue({ status: 'succeeded' }),
        cancelAction: jest.fn().mockResolvedValue({ status: 'canceled' }),
      },
    },
    paymentIntents: {
      create: jest.fn().mockResolvedValue({ id: 'pi_123', status: 'requires_payment_method' }),
      confirm: jest.fn().mockResolvedValue({ id: 'pi_123', status: 'succeeded' }),
    },
    webhooks: {
      constructEvent: jest.fn((buf, sig, secret) => ({
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_123' } },
      })),
    },
  };
}
