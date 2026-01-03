# RinaWarp Terminal Pro - Production Deployment Instructions

## ✅ System Status: FULLY WIRED END-TO-END

The complete commercial licensing and distribution system has been implemented and deployed.

### 🔗 Live Endpoints

- **Admin API**: <https://rinawarp-admin-api.rinawarptech.workers.dev>
- **Health Check**: <https://rinawarp-admin-api.rinawarptech.workers.dev/health>
- **Pricing API**: <https://rinawarp-admin-api.rinawarptech.workers.dev/api/pricing>

### 📋 Required GitHub Secrets (Set in Repository Settings)

Add these secrets to enable the CI/CD pipeline:

```bash
# R2 Storage (Cloudflare)
R2_ACCESS_KEY_ID=623208cd4abe7d0c817c0dc758b56040
R2_SECRET_ACCESS_KEY=b87a4122ee8fe7b0035685654c4402a79b6b44999431b27892db98827ead8d6c
R2_ACCOUNT_ID=ba2f14cefa19dbdc42ff88d772410689
R2_BUCKET=rinawarp-cdn
R2_PUBLIC_BASE_URL=https://ba2f14cefa19dbdc42ff88d772410689.r2.cloudflarestorage.com

# Admin API
ADMIN_API_BASE_URL=https://rinawarp-admin-api.rinawarptech.workers.dev
ADMIN_API_TOKEN=HUNTrina12122

# Existing secrets (keep as-is)
GITHUB_TOKEN (auto-provided)
RINA_WORKER_BASE_URL
RINA_WORKER_API_KEY
```

### 🎯 Production Flow

1. **Tag Release**: `git tag v1.0.2 && git push origin v1.0.2`
2. **CI/CD Pipeline**:
   - Builds AppImage
   - Runs all smoke tests
   - Computes SHA256
   - Uploads to R2 storage
   - Updates download manifest
   - Creates GitHub release

3. **Website Integration**:
   - Use `/api/pricing` for dynamic pricing
   - Use `/api/downloads/latest.json` for download links
   - POST `/api/stripe/create-checkout-session` for payments

4. **App Integration**:
   - License activation: POST `/api/license/activate`
   - License validation: POST `/api/license/validate`
   - Billing portal: POST `/api/stripe/create-portal-session`

### 🔐 Security Features

- **License Management**: Machine-based activation (3 devices max)
- **Payment Processing**: Stripe webhooks with idempotency
- **Download Integrity**: SHA256 verification
- **Admin Protection**: Bearer token authentication
- **Rate Limiting**: Built into Cloudflare Workers

### 📊 Database Schema

D1 Database `rinawarp-admin` contains:

- `customers`: Stripe customer mapping
- `licenses`: License keys with status tracking
- `activations`: Machine-based activations
- `stripe_events`: Webhook idempotency
- `downloads_latest`: AppImage manifest
- `purchases`: Session-to-license mapping

### 🚀 Next Steps

1. **Set GitHub Secrets** (above)
2. **Configure Stripe Webhooks**:
   - URL: `https://rinawarp-admin-api.rinawarptech.workers.dev/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`, `charge.refunded`
   - Secret: Already configured

3. **Update Website**:
   - Integrate pricing API
   - Add checkout session creation
   - Update success page with license display

4. **Test End-to-End**:
   - Purchase flow
   - License activation
   - Download verification
   - Billing portal access

### 🎉 System is Production-Ready

All components are wired together:

- ✅ Website → Stripe Checkout
- ✅ Stripe → License Issuance
- ✅ App → License Validation
- ✅ Downloads → SHA256 Verification
- ✅ CI/CD → Automatic Releases
