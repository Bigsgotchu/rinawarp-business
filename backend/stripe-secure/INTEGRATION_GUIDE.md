# STRIPE WEBHOOK INTEGRATION GUIDE

## 🚀 QUICK START (Drop-in Replacement)

### Step 1: Replace Your Current Webhook

Replace the webhook section in `backend/billing-service/server.js` with:

```javascript
import stripeWebhookRouter from './stripe-secure/webhook.js';

// Use the secure webhook router
app.use('/webhook', stripeWebhookRouter);
```

### Step 2: Database Setup

Run the SQL schema in `database-schema.sql` to create required tables:

```bash
psql your_database < database-schema.sql
```

### Step 3: Environment Variables

Add to your `.env`:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# License encryption (generate a strong secret)
LICENSE_ENCRYPTION_SECRET=your-32-character-secret-key-here

# Database (if not already set)
DATABASE_URL=postgresql://user:pass@localhost/dbname
```

### Step 4: Implement Database Functions

Replace the placeholder functions in `webhook.js` with your database calls:

```javascript
// Example with PostgreSQL
import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function wasEventProcessed(eventId) {
  const result = await pool.query(
    'SELECT COUNT(*) FROM processed_events WHERE stripe_event_id = $1',
    [eventId],
  );
  return parseInt(result.rows[0].count) > 0;
}

async function markEventProcessed(eventId) {
  await pool.query('INSERT INTO processed_events (stripe_event_id, event_type) VALUES ($1, $2)', [
    eventId,
    'checkout.session.completed',
  ]);
}

async function createLicense({
  licenseHash,
  encryptedLicense,
  tier,
  stripeSessionId,
  stripePaymentIntentId,
}) {
  await pool.query(
    `
    INSERT INTO licenses (
      license_hash, license_key_encrypted, license_iv, license_auth_tag,
      tier, stripe_session_id, stripe_payment_intent_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
  `,
    [
      licenseHash,
      encryptedLicense.encrypted,
      encryptedLicense.iv,
      encryptedLicense.authTag,
      tier,
      stripeSessionId,
      stripePaymentIntentId,
    ],
  );
}

async function getLicenseBySessionId(sessionId) {
  const result = await pool.query(
    `
    SELECT license_key_encrypted, license_iv, license_auth_tag, tier
    FROM licenses WHERE stripe_session_id = $1
  `,
    [sessionId],
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    licenseKey: decryptLicenseKey(
      {
        encrypted: row.license_key_encrypted,
        iv: row.license_iv,
        authTag: row.license_auth_tag,
      },
      process.env.LICENSE_ENCRYPTION_SECRET,
    ),
    tier: row.tier,
  };
}
```

## 🔒 SECURITY FEATURES IMPLEMENTED

### ✅ Signature Verification

- Uses `stripe.webhooks.constructEvent()` with raw body
- Validates `Stripe-Signature` header exists
- Rejects invalid signatures with 400 status

### ✅ Idempotency Protection

- Checks `processed_events` table before handling
- Prevents duplicate license generation
- Uses unique constraints to guarantee uniqueness

### ✅ Payment Status Verification

- Only fulfills `checkout.session.completed` if `payment_status === "paid"`
- Skips unpaid/failed sessions gracefully
- Prevents activation without payment

### ✅ Strict Event Allowlist

- Only handles `checkout.session.completed` and `checkout.session.expired`
- Ignores other event types to reduce attack surface
- Still marks as processed to prevent retries

### ✅ Fast Response Pattern

- Returns 200 immediately after processing
- Does slow work (email, notifications) asynchronously
- Prevents Stripe from retrying successful events

### ✅ Encrypted License Storage

- Stores license keys encrypted with AES-256-GCM
- Only stores hashes for verification
- Keys can be decrypted for license reveal

## 🧪 TESTING YOUR IMPLEMENTATION

### 1. Test Signature Verification

```bash
curl -X POST http://localhost:3005/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
# Should return 400 with signature error
```

### 2. Test License Generation

Use Stripe CLI to test webhooks:

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3005/webhook

# Trigger test event
stripe trigger checkout.session.completed
```

### 3. Test License Reveal

```bash
curl "http://localhost:3005/license/reveal?session_id=cs_test_123"
# Should return license key if session is valid and paid
```

## 🔧 MIGRATION FROM CURRENT IMPLEMENTATION

### What Changes:

1. **New license format**: `RWTP-XXXX-XXXX-XXXX-XXXX-XXXX`
2. **Encrypted storage**: License keys stored encrypted
3. **Better idempotency**: Prevents duplicate licenses
4. **Payment verification**: Only activates paid sessions

### What Stays the Same:

- Your existing license verification logic
- Frontend license activation flow
- Stripe product/price configuration
- API structure (mostly)

## 🚨 ROLLBACK PLAN

If you need to rollback:

1. **Keep your old webhook endpoint**: `/webhook-old`
2. **Test new implementation thoroughly**
3. **Switch Stripe webhook URL** to new endpoint
4. **Monitor for issues** for 24-48 hours

## 📊 MONITORING

Add monitoring for:

- Webhook success rate (should be >99%)
- Duplicate event rate (should be <1%)
- License generation count
- Payment failure rate

## 🎯 SUCCESS CRITERIA

Your implementation is working if:

- ✅ Signature verification blocks invalid requests
- ✅ Idempotency prevents duplicate licenses
- ✅ Payment status verification works
- ✅ License reveal returns keys for paid sessions
- ✅ Failed events trigger Stripe retries
- ✅ Success events don't trigger retries

---

**Next Step**: Replace your webhook with this secure implementation and test thoroughly.
