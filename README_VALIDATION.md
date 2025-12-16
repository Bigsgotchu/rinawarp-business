# 🔍 RinaWarp Production Validation Framework

## 🎯 Quick Start

Transform your "✅ completed" claims into provably true assertions with automated validation.

```bash
# Run critical validations (5 minutes)
./scripts/production-validate.sh --quick

# Run full validation suite (15 minutes)
./scripts/production-validate.sh --full
```

## 📁 What's Included

### 🧪 Test Suites

- **`test/stripe-webhook-audit.js`** - Webhook security and signature verification
- **`test/license-entitlements-test.js`** - License system security and entitlements
- **`test/tier-gating-matrix.js`** - Feature gating matrix validation
- **`test/ai-safety-validation.js`** - AI reasoning loop v1-safety compliance

### 🛠️ Scripts

- **`scripts/production-validate.sh`** - End-to-end validation runner
- **Executable** with `--quick` and `--full` modes

### 📋 Documentation

- **`VALIDATION_FRAMEWORK.md`** - Complete validation methodology
- **`PRODUCTION_LAUNCH_CHECKLIST.md`** - Comprehensive launch checklist

## 🚀 Validation Categories

### 1. Stripe Webhook Security Audit

✅ **Raw body signature verification**  
✅ **Idempotency implementation**  
✅ **Customer ↔ user mapping**  
✅ **Event type allowlist**

### 2. License Activation & Entitlements

✅ **Device-bound licenses**  
✅ **Signature verification**  
✅ **Offline validity window**  
✅ **Refund/cancellation logic**

### 3. Tier Gating Matrix

✅ **Free tier restrictions**  
✅ **Terminal Pro features**  
✅ **Agent Pro features**  
✅ **Grace period handling**

### 4. AI Reasoning Loop Safety

✅ **No autonomous writes**  
✅ **Deterministic fallback**  
✅ **Risk guardrails**  
✅ **User approval system**

## 🎛️ Individual Component Testing

Test specific components independently:

```bash
# Webhook security only
node test/stripe-webhook-audit.js

# License system only
node test/license-entitlements-test.js

# Feature gating only
node test/tier-gating-matrix.js

# AI safety only
node test/ai-safety-validation.js
```

## 📊 Understanding Results

### ✅ All Tests Pass

```
🎉 ALL VALIDATIONS PASSED
🚀 SYSTEM IS PRODUCTION READY
```

### ❌ Tests Fail

```
❌ VALIDATION FAILED
⚠️ Fix failing tests before production deployment
```

Each test provides detailed feedback:

- ✅ **PASS** - Component working correctly
- ❌ **FAIL** - Critical issue found
- ⚠️ **WARNING** - Non-critical issue

## 🔧 Environment Setup

### Required Environment Variables

```bash
export STRIPE_SECRET_KEY="sk_live_..."        # Production Stripe key
export STRIPE_WEBHOOK_SECRET="whsec_..."      # From Stripe dashboard
export LICENSE_ENCRYPTION_SECRET="secure-key" # For license encryption
```

### Optional Tools

```bash
# Stripe CLI for webhook testing
npm install -g @stripe/stripe-cli

# For advanced testing
stripe listen --forward-to localhost:3000/webhook
```

## 🛡️ Security Validation

The framework validates these critical security requirements:

### Webhook Security

- **Raw body handling** - No middleware consumes body before signature check
- **Signature verification** - Uses Stripe's `constructEvent` correctly
- **Idempotency** - Prevents duplicate event processing
- **Allowlist enforcement** - Only processes expected event types

### License Security

- **Device binding** - Licenses tied to specific devices
- **Signature verification** - Prevents license tampering
- **Offline expiration** - Subscriptions expire after 3 days offline
- **Abuse protection** - Rate limiting on activation endpoints

### Feature Security

- **Tier enforcement** - Users cannot access unauthorized features
- **Client-side validation** - Server-side authorization required
- **Graceful degradation** - Expired subscriptions properly restricted

## 📈 CI/CD Integration

Add to your deployment pipeline:

```yaml
# .github/workflows/production-validate.yml
name: Production Validation
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2

        with:
          node-version: '18'

      - name: Install dependencies

        run: npm install

      - name: Run validation

        run: ./scripts/production-validate.sh --full
        env:
          STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
          STRIPE_WEBHOOK_SECRET: ${{ secrets.STRIPE_WEBHOOK_SECRET }}
          LICENSE_ENCRYPTION_SECRET: ${{ secrets.LICENSE_ENCRYPTION_SECRET }}
```

## 🆘 Troubleshooting

### Common Issues

**❌ "Node.js not found"**

```bash
# Install Node.js 16+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**❌ "Permission denied"**

```bash
# Make script executable
chmod +x scripts/production-validate.sh
```

**❌ "Environment variables not set"**

```bash
# Check environment
echo $STRIPE_SECRET_KEY
echo $STRIPE_WEBHOOK_SECRET

# Set temporarily
export STRIPE_SECRET_KEY="your_key"
```

**❌ "Module not found"**

```bash
# Install dependencies
npm install
```

### Debug Mode

Run individual tests with verbose output:

```bash
node test/stripe-webhook-audit.js --debug
```

## 📞 Support

### Getting Help

1. Check the detailed logs in test output
2. Review `VALIDATION_FRAMEWORK.md` for methodology
3. Check `PRODUCTION_LAUNCH_CHECKLIST.md` for procedures
4. Verify environment variables are set correctly

### Reporting Issues

When reporting validation failures, include:

- Full test output
- Environment details (Node.js version, OS)
- Environment variable status (without secrets)
- Steps to reproduce

## 🎯 Success Metrics

### Target Metrics

- **100% test pass rate** for all critical security validations
- **<1% webhook delivery failure rate** in production
- **<0.1% license activation failure rate**
- **Zero unauthorized feature access attempts**

### Continuous Monitoring

After launch, monitor these metrics:

- Webhook delivery success rate
- Duplicate event processing rate
- License activation success rate
- Feature gate bypass attempts
- API error rates

---

## 🏆 Next Steps

1. **Run validation**: `./scripts/production-validate.sh --quick`
2. **Fix any failures** - Address critical issues first
3. **Full validation**: `./scripts/production-validate.sh --full`
4. **Deploy with confidence** - All tests passing
5. **Monitor production** - Track key metrics

**Remember**: This framework turns subjective "✅ completed" claims into objective, testable assertions. Every feature is validated through automated tests before production deployment.
