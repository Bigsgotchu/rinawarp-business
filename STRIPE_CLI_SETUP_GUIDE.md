# STRIPE CLI INSTALLATION & SETUP GUIDE

## Prerequisites

1. **Install Stripe CLI**
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Linux
   curl -L https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_amd64.tar.gz | tar xvz
   sudo mv stripe /usr/local/bin/stripe
   
   # Windows (using Chocolatey)
   choco install stripe.cli
   ```

2. **Authenticate with Stripe**
   ```bash
   stripe login
   ```

3. **Verify Installation**
   ```bash
   stripe --version
   stripe status
   ```

## Setup Steps

### 1. Initialize the Monitoring System
```bash
# Make the script executable
chmod +x stripe-cli-monitor.sh

# Start the monitoring system
./stripe-cli-monitor.sh start
```

### 2. Configure Your Webhook Endpoint

Make sure your application has a webhook endpoint that can receive Stripe events. The monitoring script will forward events to `localhost:3000/webhook` by default.

### 3. Start Monitoring

Run the dashboard:
```bash
./stripe-cli-monitor.sh
```

Choose option `1` to start monitoring.

## Key Stripe CLI Commands Used

### Event Listening
```bash
# Start listening to webhooks
stripe listen --forward-to localhost:3000/webhook

# Listen to specific events
stripe listen --events payment_intent.succeeded,payment_intent.payment_failed --forward-to localhost:3000/webhook

# Listen with API key
stripe listen --forward-to localhost:3000/webhook --api-key sk_test_xxx
```

### Manual Event Testing
```bash
# Trigger a test payment
stripe trigger payment_intent.succeeded

# Trigger a failed payment
stripe trigger payment_intent.payment_failed

# Trigger customer creation
stripe trigger customer.created

# Trigger checkout session
stripe trigger checkout.session.completed
```

## Environment Variables

Set these environment variables for enhanced monitoring:

```bash
# Stripe API Key
export STRIPE_API_KEY=sk_test_xxx

# Webhook Secret (for signature verification)
export STRIPE_WEBHOOK_SECRET=whsec_xxx

# Your domain
export STRIPE_DOMAIN=yourdomain.com
```

## Troubleshooting

### Common Issues

1. **Stripe CLI not found**
   - Ensure Stripe CLI is in your PATH
   - Try `which stripe` to verify installation

2. **Authentication failed**
   - Run `stripe login` again
   - Check your Stripe account permissions

3. **Webhook forwarding issues**
   - Ensure your webhook endpoint is running
   - Check that port 3000 is available
   - Verify firewall settings

4. **JSON parsing errors**
   - Ensure `jq` is installed: `brew install jq` or `apt-get install jq`
   - Check metrics file permissions

### Debug Commands

```bash
# Check Stripe CLI status
stripe status

# Test webhook delivery
stripe listen --forward-to localhost:3000/webhook --verbose

# View recent events
stripe events list --limit 10

# Test specific event
stripe trigger payment_intent.succeeded --amount 1000
```

## File Structure

After running, you'll have:
- `stripe-metrics.json` - Real-time metrics data
- `stripe-metrics.log` - Event logs
- `stripe-cli.log` - Stripe CLI output
- `stripe-monitor.pid` - Process ID file

## Next Steps

1. Set up the webhook endpoint in your application
2. Configure SSL/TLS for production
3. Set up monitoring alerts
4. Integrate with your existing analytics