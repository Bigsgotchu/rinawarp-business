# RinaWarp Website - Stripe Integration

## Overview

This directory contains the complete Stripe backend integration for RinaWarp Terminal Pro using Cloudflare Pages Functions.

## Directory Structure

```
functions/
├── api/
│   ├── checkout-v2.js          # Creates Stripe Checkout Sessions
│   ├── license/
│   │   ├── verify.js           # Verifies license keys
│   │   └── by-email.js         # Looks up licenses by email
│   └── stripe/
│       └── webhook.js          # Handles Stripe webhooks
├── _license-generator.js       # License key generation utility
├── d1-schema.sql               # D1 database schema
└── wrangler.toml               # Cloudflare configuration
```

## Setup Instructions

### 1. Environment Variables

Create a `.dev.vars` file in the `apps/website` directory:

```ini
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
DOMAIN=https://rinawarptech.com
```

### 2. Install Dependencies

```bash
cd apps/website
npm install
```

### 3. Deploy to Cloudflare Pages

```bash
npm run deploy
```

### 4. Set up D1 Database

```bash
npm run db:migrate
```

## API Endpoints

### Checkout Session Creation

- **Endpoint**: `POST /api/checkout-v2`
- **Request Body**:

  ```json
  {
    "plan": "student|professional|enterprise",
    "email": "user@example.com"
  }
  ```

- **Response**:

  ```json
  {
    "url": "https://checkout.stripe.com/..."
  }
  ```

### License Verification

- **Endpoint**: `POST /api/license/verify`
- **Request Body**:

  ```json
  {
    "licenseKey": "RINA-XXXX-XXXX-XXXX-XXXX"
  }
  ```

- **Response**:

  ```json
  {
    "valid": true,
    "license": {
      "id": "lic-...",
      "email": "user@example.com",
      "plan": "professional",
      "status": "active",
      "expires": "2026-12-31",
      "features": ["pro", "voice-control", "ai-intelligence"]
    }
  }
  ```

### License Lookup by Email

- **Endpoint**: `GET /api/license/by-email?email=user@example.com`
- **Response**:

  ```json
  {
    "email": "user@example.com",
    "licenseKey": "RINA-XXXX-XXXX-XXXX-XXXX",
    "status": "active",
    "plan": "professional",
    "expires": "2026-12-31",
    "features": ["pro", "voice-control", "ai-intelligence"]
  }
  ```

### Stripe Webhook

- **Endpoint**: `POST /api/stripe/webhook`
- **Headers**: `Stripe-Signature: ...`
- **Body**: Stripe webhook payload
- **Response**: `{"received": true}`

## Testing

### Local Development

```bash
npm run dev
```

### Manual Testing

```bash
# Test checkout endpoint
curl -X POST http://localhost:8787/api/checkout-v2 \
  -H "Content-Type: application/json" \
  -d '{"plan": "student", "email": "test@example.com"}'

# Test license verification
curl -X POST http://localhost:8787/api/license/verify \
  -H "Content-Type: application/json" \
  -d '{"licenseKey": "RINA-TEST-KEY-12345"}'
```

## Deployment Checklist

- [ ] Cloudflare Pages project created
- [ ] Environment variables configured in Cloudflare
- [ ] D1 database created and migrated
- [ ] Stripe webhook endpoint configured in Stripe Dashboard
- [ ] Domain configured in wrangler.toml
- [ ] All endpoints tested and working

## Troubleshooting

### Common Issues

1. **404 on API endpoints**: Ensure `/functions` directory exists and wrangler.toml is configured
2. **Stripe errors**: Verify API keys and webhook secret
3. **Database errors**: Run `npm run db:migrate` to create tables
4. **CORS issues**: Ensure domain is correctly set in environment variables

### Logs

Check Cloudflare Pages function logs in the Cloudflare Dashboard for detailed error information.
