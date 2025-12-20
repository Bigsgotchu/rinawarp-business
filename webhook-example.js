// webhook-example.js
// Example webhook endpoint for Stripe CLI monitoring

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Webhook endpoint - must use raw body for Stripe signature verification
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log(`⚠️  Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      console.log('✅ Payment succeeded:', event.data.object.id);
      // Your custom logic here
      break;
      
    case 'payment_intent.payment_failed':
      console.log('❌ Payment failed:', event.data.object.id);
      console.log('   Failure reason:', event.data.object.last_payment_error?.code);
      // Your custom logic here
      break;
      
    case 'customer.created':
      console.log('👤 New customer:', event.data.object.id);
      // Your custom logic here
      break;
      
    case 'checkout.session.created':
      console.log('🛒 Checkout session created:', event.data.object.id);
      // Your custom logic here
      break;
      
    case 'checkout.session.completed':
      console.log('✅ Checkout session completed:', event.data.object.id);
      // Your custom logic here
      break;
      
    default:
      console.log(`🤔 Unhandled event type: ${event.type}`);
  }
  
  res.json({received: true});
});

// Regular JSON parsing for other routes
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test endpoint to trigger sample events
app.get('/test', async (req, res) => {
  try {
    // Create a test payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000, // $10.00
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    });
    
    res.json({
      message: 'Test payment intent created',
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Webhook server running on port ${PORT}`);
  console.log(`📡 Listening for webhooks at: http://localhost:${PORT}/webhook`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
});

module.exports = app;