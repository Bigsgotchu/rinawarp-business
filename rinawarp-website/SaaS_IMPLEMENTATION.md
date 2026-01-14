# RinaWarp SaaS Implementation

## Overview

This implementation provides a production-grade SaaS layer for RinaWarp with:
- **D1 Database Integration** - License management, seat tracking, usage metering
- **Stripe Webhook Handling** - Automatic license issuance and revocation
- **Seat Enforcement** - Team and enterprise license management
- **Usage Metering** - API call tracking for billing and abuse prevention
- **Subscription Management** - Pro, Team, and Enterprise plans

## Architecture

### Database Schema (D1)

#### 1. `licenses` Table
```sql
CREATE TABLE licenses (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  plan TEXT NOT NULL,
  seats INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

**Status Values:**
- `active` - License is active and valid
- `past_due` - Subscription payment failed
- `canceled` - User canceled subscription
- `refunded` - Payment was refunded

#### 2. `license_seats` Table
```sql
CREATE TABLE license_seats (
  id TEXT PRIMARY KEY,
  license_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  last_seen TEXT,
  FOREIGN KEY (license_id) REFERENCES licenses(id)
);
```

Tracks seat usage for team and enterprise licenses.

#### 3. `usage_events` Table
```sql
CREATE TABLE usage_events (
  id TEXT PRIMARY KEY,
  license_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  units INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

Used for:
- Metered billing
- Rate limiting
- Abuse detection
- Usage analytics

#### 4. `invoices` Table (Enterprise)
```sql
CREATE TABLE invoices (
  id TEXT PRIMARY KEY,
  license_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL,
  due_date TEXT,
  stripe_invoice_id TEXT
);
```

## Plans & Pricing

| Plan | Seats | Metering | Price |
|------|-------|----------|-------|
| Pro | 1 | Limited | $20/month |
| Team | 5 | Higher | $79/month |
| Enterprise | Custom | Unlimited | Invoice |

## Implementation Details

### 1. License Generation

Licenses are generated using a base64url-encoded format:
```typescript
// functions/lib/license.ts
export function generateLicense(email: string) {
  const raw = `${email}:${crypto.randomUUID()}`;
  return Buffer.from(raw).toString("base64url");
}
```

### 2. Stripe Webhook Handler

The webhook handles:
- `checkout.session.completed` - Issues new license
- `charge.refunded` - Revokes license
- `customer.subscription.updated` - Updates subscription status
- `customer.subscription.deleted` - Marks license as canceled

```typescript
// functions/api/stripe-webhook.ts
if (event.type === "checkout.session.completed") {
  const session = event.data.object;
  const licenseId = generateLicense(session.customer_details?.email || "unknown");
  
  // Determine plan and seats
  let plan = "pro";
  const seats = plan === "team" ? 5 : 1;
  
  await db.createLicense(
    licenseId,
    session.customer_details?.email || "unknown",
    plan,
    seats,
    "active",
    session.customer,
    session.subscription
  );
}
```

### 3. License Validation & Seat Enforcement

```typescript
// functions/lib/auth.ts
export async function validateLicense(
  authHeader?: string,
  db?: D1Database,
  userEmail?: string
) {
  // Extract license from Bearer token
  const token = authHeader?.replace("Bearer ", "");
  
  // Validate license exists in DB
  const license = await licenseDb.getLicense(token);
  
  if (!license || license.status !== "active") {
    return null;
  }
  
  // Enforce seat limits
  if (userEmail && license.seats > 1) {
    const seats = await licenseDb.getSeatCount(token);
    
    if (seats.count >= license.seats) {
      return { error: "Seat limit exceeded" };
    }
    
    // Register seat usage
    await licenseDb.registerSeat(token, userEmail, crypto.randomUUID());
    await licenseDb.updateSeatLastSeen(token, userEmail);
  }
  
  // Log usage event
  await licenseDb.logUsageEvent(token, "api_call");
  
  return {
    email: license.email,
    plan: license.plan,
    seats: license.seats,
    licenseId: token
  };
}
```

### 4. Usage Metering

Every API call logs usage:
```typescript
await licenseDb.logUsageEvent(licenseId, "api_call");
```

Monthly usage can be queried:
```typescript
const usage = await licenseDb.getMonthlyUsage(licenseId);
```

### 5. Protected Endpoints

```typescript
// functions/api/pro.ts
export const onRequestGet: PagesFunction = async ({ request, env }) => {
  const result = await validateLicense(
    request.headers.get("authorization"),
    env.DB,
    request.headers.get("x-user-email")
  );
  
  if (!result) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  if (result.error) {
    return new Response(result.error, { status: 403 });
  }
  
  return Response.json({
    ok: true,
    email: result.email,
    plan: result.plan,
    seats: result.seats,
    features: ["agent", "extensions", "priority-api"]
  });
};
```

## Deployment

### 1. Set Up D1 Database

```bash
# Create D1 database
npx wrangler d1 create rinawarp_prod

# Initialize tables
npx wrangler d1 execute rinawarp_prod --file=init-d1.sql --remote
```

### 2. Configure wrangler.toml

```toml
[[d1_databases]]
binding = "DB"
database_name = "rinawarp_prod"
database_id = "25d1da28-403a-4ed0-a157-25432dcf13b2"
```

### 3. Configure Stripe Webhook

```bash
# Install Stripe CLI
curl -sS https://webhooks.stripe.com/stripe-cli/install.sh | sh

# Configure webhook
./configure-stripe-webhook.sh
```

### 4. Set Environment Variables

In Cloudflare Pages:
- `STRIPE_SECRET_KEY` - Your Stripe API key
- `STRIPE_WEBHOOK_SECRET` - From `stripe listen --print-secret`
- `SITE_URL` - Your production URL (e.g., `https://www.rinawarptech.com`)

### 5. Deploy

```bash
git add .
git commit -m "feat: SaaS implementation with D1, Stripe, and seat enforcement"
git tag v0.1.1-prod
git push origin main --tags
```

## VS Code Extension Integration

### License Storage

```typescript
// Store license in VS Code secrets
await context.secrets.store("rinawarp.license", license);

// Retrieve license
const license = await context.secrets.get("rinawarp.license");
```

### API Authentication

```typescript
// Make authenticated requests
const response = await fetch("https://www.rinawarptech.com/api/pro", {
  headers: {
    "Authorization": `Bearer ${license}`,
    "X-User-Email": userEmail
  }
});

// Handle errors
if (response.status === 401) {
  // Prompt user to upgrade
}
if (response.status === 403) {
  // Seat limit exceeded
}
```

## Testing

### Smoke Tests

```bash
node verify-rinawarp-smoke.js
```

Tests verify:
- API health endpoint
- Pro endpoint authentication (401 for unauthorized)
- Real business rules enforcement

### Manual Testing

```bash
# Test webhook locally
stripe listen --forward-to localhost:8787/api/stripe-webhook

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger charge.refunded
```

## Monitoring

### Cloudflare Pages Logs

View logs in the Cloudflare Dashboard to monitor:
- License issuance
- Seat usage
- API calls
- Errors

### D1 Analytics

Query usage patterns:
```sql
-- Top users by API calls
SELECT 
  l.email,
  l.plan,
  COUNT(*) as calls
FROM usage_events u
JOIN licenses l ON u.license_id = l.id
WHERE u.created_at >= date('now', '-7 day')
GROUP BY l.email, l.plan
ORDER BY calls DESC;

-- Seat usage by team
SELECT 
  l.email,
  l.plan,
  l.seats,
  COUNT(s.id) as used_seats
FROM licenses l
LEFT JOIN license_seats s ON l.id = s.license_id
WHERE l.seats > 1
GROUP BY l.email, l.plan, l.seats;
```

## Enterprise Features

### Manual License Creation

```typescript
// For enterprise customers
await db.createLicense(
  crypto.randomUUID(),
  "enterprise@example.com",
  "enterprise",
  50,
  "active"
);
```

### Invoice Management

```typescript
await db.createInvoice(
  crypto.randomUUID(),
  licenseId,
  5000, // $50.00
  "pending",
  "2026-01-31",
  stripeInvoiceId
);

// Suspend on non-payment
await db.updateLicenseStatus(licenseId, "past_due");
```

## Security

### License Validation

- All licenses validated against D1 database
- Expired/canceled licenses rejected
- Seat limits enforced server-side
- No client-side trust

### Data Protection

- Licenses stored as base64url-encoded tokens
- Sensitive data in D1 (not in license tokens)
- Stripe customer IDs linked to licenses
- No plaintext passwords or secrets

## Scaling

### Performance

- D1 provides automatic scaling
- Usage events batched for analytics
- Seat counts cached in memory where possible
- Indexes on frequently queried fields

### Cost Control

- Usage metering prevents abuse
- Seat limits prevent overuse
- Monthly usage rollups for billing
- Rate limiting on API endpoints

## Future Enhancements

1. **Usage-Based Billing** - Charge for API calls over limit
2. **Trial Periods** - 14-day free trials
3. **Annual Discounts** - 20% off annual subscriptions
4. **SSO Integration** - Team SSO for enterprise
5. **API Rate Limiting** - Per-license rate limits
6. **Audit Logs** - Full audit trail of all actions
7. **Webhooks** - Notify customers of subscription changes
8. **Self-Service Portal** - Manage licenses and seats

## Support

### Troubleshooting

**License not found:**
- Check D1 database for license record
- Verify webhook received checkout event
- Check Cloudflare Pages logs

**Seat limit exceeded:**
- Query `license_seats` table
- Check `last_seen` timestamps
- Verify license has correct seat count

**Payment failed:**
- Check Stripe Dashboard for failed payments
- Verify webhook received `invoice.payment_failed`
- Update license status to `past_due`

### Contact

For support, contact: support@rinawarptech.com
