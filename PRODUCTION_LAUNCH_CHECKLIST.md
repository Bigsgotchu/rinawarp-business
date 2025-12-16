# 🚀 RinaWarp Production Launch Checklist

## 🎯 Mission: Transform "✅ completed" claims into provable, testable assertions

This checklist ensures every "completed" feature is actually working in production through automated validation.

---

## 🔐 Critical Security Validations (Must Pass 100%)

### ✅ Stripe Webhook Security

- [ ] **Raw body signature verification** - Uses `express.raw()` middleware correctly
- [ ] **Tampered payload rejection** - Invalid signatures return 400
- [ ] **Idempotency implementation** - Duplicate events are detected and skipped
- [ ] **Event allowlist enforcement** - Only processes expected event types
- [ ] **Customer ↔ User mapping** - Metadata includes `user_id` for renewals
- [ ] **Production webhook secret** - `STRIPE_WEBHOOK_SECRET` is set and correct

**Validation Command:**

```bash
node test/stripe-webhook-audit.js
```

### ✅ License System Security

- [ ] **Device-bound licenses** - Cannot be shared between devices
- [ ] **Signature verification** - Prevents license tampering
- [ ] **Offline validity window** - Subscriptions expire after 3 days offline
- [ ] **Refund handling** - `charge.refunded` revokes lifetime licenses
- [ ] **Cancellation logic** - Grace periods work correctly
- [ ] **Rate limiting** - License activation is abuse-protected

**Validation Command:**

```bash
node test/license-entitlements-test.js
```

### ✅ Feature Gating Matrix

- [ ] **Free tier** - Only basic features accessible
- [ ] **Terminal Pro Lifetime** - Ghost text, memory, advanced planning
- [ ] **Agent Pro Active** - AI loop, tools, crash supervision
- [ ] **Both Active** - All features accessible
- [ ] **Grace periods** - Past due subscriptions maintain access
- [ ] **Downgrades** - Expired subscriptions properly restricted

**Validation Command:**

```bash
node test/tier-gating-matrix.js
```

### ✅ AI Safety Compliance

- [ ] **No autonomous writes** - User approval required for all operations
- [ ] **Deterministic fallback** - Heuristics always work when AI fails
- [ ] **Risk guardrails** - Dangerous commands require approval
- [ ] **Plan structure** - Each step has tool + args + expected signal
- [ ] **Stop conditions** - AI stops when success signal detected

**Validation Command:**

```bash
node test/ai-safety-validation.js
```

---

## 🏗️ Infrastructure Requirements

### ✅ Webhook Endpoints

- [ ] **Endpoint configured** in Stripe dashboard
- [ ] **HTTPS endpoint** with valid SSL certificate
- [ ] **Raw body handling** - No middleware consumes body before signature verification
- [ ] **Error handling** - Proper HTTP status codes for different failure modes
- [ ] **Logging** - All webhook events are logged with sufficient detail

### ✅ Database & Storage

- [ ] **Idempotency table** - `processed_events` with unique constraint on `event_id`
- [ ] **License table** - Secure storage with encrypted license keys
- [ ] **User entitlements** - Real-time tier/feature mapping
- [ ] **Backup strategy** - Automated backups with tested recovery
- [ ] **Migration scripts** - All schema changes are versioned and tested

### ✅ Environment Configuration

- [ ] **Production Stripe keys** - `sk_live_*` (not test keys)
- [ ] **Webhook secret** - `STRIPE_WEBHOOK_SECRET` from Stripe dashboard
- [ ] **License encryption** - `LICENSE_ENCRYPTION_SECRET` is secure and rotated
- [ ] **Database URLs** - Production database connections configured
- [ ] **Monitoring keys** - Application monitoring and error tracking

---

## 🧪 End-to-End Testing

### ✅ Checkout Flow

- [ ] **Terminal Pro purchase** - Creates lifetime license correctly
- [ ] **Agent Pro subscription** - Sets up recurring billing
- [ ] **Payment failures** - Grace period and retry logic works
- [ ] **Refunds** - Lifetime purchases properly revoked
- [ ] **License activation** - Keys activate features immediately

### ✅ License Activation

- [ ] **Valid license key** - Activates correct tier and features
- [ ] **Invalid license key** - Rejected with appropriate error
- [ ] **Device binding** - Same license fails on different device
- [ ] **Offline activation** - Works for 3 days without network
- [ ] **Rate limiting** - Prevents brute force attacks

### ✅ Feature Gating

- [ ] **Free user experience** - Cannot access premium features
- [ ] **Terminal Pro features** - Ghost text and memory work
- [ ] **Agent Pro features** - AI reasoning loop and tools work
- [ ] **Upgrade prompts** - Correct suggestions for each tier
- [ ] **Graceful degradation** - Expired subscriptions show downgrade

### ✅ Webhook Processing

- [ ] **Checkout completion** - Creates license immediately
- [ ] **Subscription renewals** - Maintains active status
- [ ] **Payment failures** - Moves to past_due status
- [ ] **Cancellations** - Grace period then downgrade
- [ ] **Duplicates** - Idempotency prevents double-processing

---

## 📊 Monitoring & Observability

### ✅ Application Monitoring

- [ ] **Webhook delivery rate** - >99% success rate
- [ ] **Duplicate event rate** - <1% (indicates idempotency issues)
- [ ] **License activation success** - Track activation failures
- [ ] **Feature gate bypass attempts** - Security monitoring
- [ ] **API error rates** - All endpoints monitored

### ✅ Business Metrics

- [ ] **Conversion funnel** - Checkout start to completion
- [ ] **License activation rate** - Keys activated vs issued
- [ ] **Feature usage by tier** - Validate pricing model
- [ ] **Subscription churn** - Monitor cancellation rates
- [ ] **Revenue tracking** - Real-time billing updates

### ✅ Alerting

- [ ] **Webhook failures** - Immediate alerts for delivery issues
- [ ] **High error rates** - Application errors >1%
- [ ] **Suspicious activity** - Brute force or license abuse
- [ ] **Payment failures** - Subscription payment issues
- [ ] **System resource alerts** - CPU, memory, disk usage

---

## 🚨 Risk Mitigation

### ✅ Security Incidents

- [ ] **License key compromise** - Revocation and reissue process
- [ ] **Webhook endpoint attack** - Rate limiting and DDoS protection
- [ ] **Database breach** - Encrypted data at rest and in transit
- [ ] **API abuse** - Rate limiting and usage quotas
- [ ] **Payment fraud** - Stripe Radar and manual review

### ✅ Operational Risks

- [ ] **Database failure** - Automated failover and recovery
- [ ] **Webhook delivery failures** - Retry logic and dead letter queues
- [ ] **License system downtime** - Grace period for offline usage
- [ ] **Payment processing issues** - Alternative payment methods
- [ ] **Scalability bottlenecks** - Load testing and auto-scaling

### ✅ Business Risks

- [ ] **Pricing model validation** - A/B test different price points
- [ ] **Feature adoption** - Track usage of premium features
- [ ] **Customer support** - Help desk integration for billing issues
- [ ] **Legal compliance** - Terms of service and privacy policy
- [ ] **International payments** - Currency support and tax handling

---

## 🔄 Launch Procedures

### ✅ Pre-Launch (T-1 Day)

- [ ] **Run full validation suite** - `./scripts/production-validate.sh --full`
- [ ] **Deploy to staging** - Complete end-to-end testing
- [ ] **Load testing** - Verify system handles expected load
- [ ] **Security audit** - Final review of security measures
- [ ] **Team notification** - Alert all stakeholders of launch timeline

### ✅ Launch Day (T-0)

- [ ] **Deploy to production** - Blue-green deployment strategy
- [ ] **Monitor key metrics** - Real-time dashboard monitoring
- [ ] **Test critical paths** - Manual verification of checkout flow
- [ ] **Enable monitoring alerts** - All production alerts active
- [ ] **Customer support ready** - Support team briefed and ready

### ✅ Post-Launch (T+1 to T+7)

- [ ] **Daily metrics review** - Conversion rates and error rates
- [ ] **Customer feedback monitoring** - Support tickets and reviews
- [ ] **Performance optimization** - Address any bottlenecks
- [ ] **Feature usage analysis** - Validate pricing model assumptions
- [ ] **Iterate and improve** - Based on real user behavior

---

## 📋 Validation Commands

### Quick Validation (5 minutes)

```bash
# Run only critical security validations
./scripts/production-validate.sh --quick
```

### Full Validation (15 minutes)

```bash
# Run complete validation suite
./scripts/production-validate.sh --full
```

### Individual Component Tests

```bash
# Test specific components
node test/stripe-webhook-audit.js          # Webhook security
node test/license-entitlements-test.js     # License system
node test/tier-gating-matrix.js            # Feature gating
node test/ai-safety-validation.js          # AI safety
```

---

## 🎯 Success Criteria

### Must Pass (Launch Blockers)

- ✅ All security validations pass (100%)
- ✅ All webhook tests pass (100%)
- ✅ All license system tests pass (100%)
- ✅ All feature gating tests pass (100%)
- ✅ All AI safety tests pass (100%)

### Should Pass (Quality Gates)

- ✅ Zero critical security vulnerabilities
- ✅ <1% webhook delivery failure rate
- ✅ <0.1% license activation failure rate
- ✅ Zero unauthorized feature access
- ✅ All monitoring alerts configured

### Nice to Have (Enhancements)

- ✅ Load testing completed
- ✅ Performance benchmarks established
- ✅ Customer support documentation complete
- ✅ Business metrics dashboard live

---

## 🆘 Emergency Procedures

### Rollback Plan

1. **Identify issue** - Determine scope and impact
2. **Activate rollback** - Switch to previous stable version
3. **Notify stakeholders** - Alert team and customers
4. **Fix and test** - Resolve issue in staging
5. **Redeploy** - Roll forward with fix
6. **Post-mortem** - Document lessons learned

### Emergency Contacts

- **Technical Lead**: [Your contact info]
- **Product Manager**: [Your contact info]
- **Customer Support**: [Your contact info]
- **Security Team**: [Your contact info]

---

## 📞 Support Resources

### Documentation

- [Stripe Webhook Documentation](https://stripe.com/docs/webhooks)
- [License System Architecture](./backend/stripe-secure/README.md)
- [Feature Gating Guide](./apps/terminal-pro/agent/featureGating.ts)
- [AI Safety Guidelines](./apps/terminal-pro/agent/aiReasoningLoop.ts)

### Tools

- **Stripe CLI**: `stripe listen --forward-to localhost:3000/webhook`
- **Validation Suite**: `./scripts/production-validate.sh`
- **Monitoring Dashboard**: [Your monitoring URL]
- **Error Tracking**: [Your error tracking URL]

---

## ✨ Final Validation

**Before marking this checklist complete, run:**

```bash
# Complete validation
./scripts/production-validate.sh --full

# If all tests pass, you're ready to launch! 🚀
```

**Remember**: This checklist transforms subjective "✅ completed" claims into objective, provable assertions. Every item must be validated through automated tests, not just code review.
