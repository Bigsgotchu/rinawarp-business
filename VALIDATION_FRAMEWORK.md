# RinaWarp Production Validation Framework

## 🎯 Mission: Make "✅ completed" claims provably true

This framework provides automated validation for all critical production systems to eliminate the gap between "claimed complete" and "actually working."

## 📋 Validation Categories

### 1. Stripe Webhook Security Audit
### 2. License Activation & Entitlements
### 3. Tier Gating Matrix
### 4. AI Reasoning Loop Safety
### 5. Production Launch Checklist

---

## 🔒 1. Stripe Webhook Security Audit

### A. Raw Body Signature Verification

**What must be true:**
- Handler reads request body as raw bytes (Buffer), not req.body JSON
- No middleware has consumed/parsed body before signature verification
- Uses `express.raw({ type: 'application/json' })` middleware
- Signature verification happens before any body parsing

**Critical Test Cases:**
```javascript
// Test 1: Valid signature with correct raw body
const validEvent = {
  id: 'evt_test',
  type: 'checkout.session.completed',
  data: { object: { id: 'cs_test', payment_status: 'paid' } }
};

// Test 2: Tampered payload must fail
const tamperedPayload = modifyPayload(validEvent);

// Test 3: Missing signature header must fail
const missingSignature = { headers: {} };
```

**Automated Validation Script:**
```bash
# Use Stripe CLI to forward events
stripe listen --forward-to https://YOUR_DOMAIN/api/stripe-webhook-v2

# In another terminal, trigger test events
stripe trigger checkout.session.completed
stripe trigger invoice.payment_succeeded
stripe trigger customer.subscription.updated
```

### B. Idempotency Verification

**What must be true:**
- Event ID is stored in database with unique constraint
- Duplicate events are detected and skipped
- No database writes occur for duplicate events
- Stripe retry attempts are properly handled

**Critical Test:**
```javascript
// Replay same event ID - second hit must log "duplicate → skipped"
const duplicateEvent = await sendWebhookEvent(testEvent);
assert(duplicateEvent.deduped === true);
assert(database.writes === 1); // Only first event writes
```

### C. Customer ↔ User Mapping

**What must be true:**
- Checkout Session includes `client_reference_id` with user ID
- Session metadata includes `user_id`
- Subscription metadata includes `user_id` (most commonly missed)
- Renewal events can map to users without Checkout Session

**Critical Validation:**
```javascript
// On subscription creation, verify all metadata fields:
const session = await stripe.checkout.sessions.create({
  client_reference_id: userId,
  metadata: { user_id: userId },
  subscription_data: { 
    metadata: { user_id: userId } // ← This is the one people miss
  }
});
```

---

## 📜 2. License Activation & Entitlements

### A. Signed License Blob Format

**Required Claims:**
- `user_id` - User identifier
- `plan` - License plan (terminal-pro, agent-pro, etc.)
- `entitlements` - Normalized feature keys
- `issued_at` - Creation timestamp
- `expires_at` - Expiration (nullable for lifetime)
- `device_fingerprint` - Device binding
- `license_version` - Schema version
- `signature` - HMAC signature

**Common Failure Points:**
- License blob doesn't bind to device → easy sharing
- Missing `expires_at` for subscriptions → no offline cutoff
- Weak signature algorithm → tampering possible

### B. Offline Validity Window

**What must be true:**
- Subscriptions have bounded offline usage (typically 3 days)
- Agent degrades gracefully after `expires_at`
- "Phone home" renews offline window on success

**Validation Test:**
```javascript
// Turn off network, verify agent works until expires_at
await simulateNetworkOffline();
const startTime = Date.now();
await agent.waitForFeatureDegradation();
const degradationTime = Date.now() - startTime;
assert(degradationTime <= 3 * 24 * 60 * 60 * 1000); // ≤ 3 days
```

### C. Refund & Cancellation Logic

**Critical Events to Handle:**
- `charge.refunded` - Revoke lifetime entitlements
- `customer.subscription.deleted` - Downgrade subscription
- `invoice.payment_failed` - Grace period management

---

## 🎚️ 3. Tier Gating Matrix Validation

**Complete Matrix that must work:**

| Scenario | Terminal Pro | Agent Pro | Features Accessible |
|----------|-------------|-----------|-------------------|
| Free tier | ❌ | ❌ | Basic terminal only |
| Terminal Pro Lifetime | ✅ | ❌ | +Ghost text, memory |
| Agent Pro Active | ❌ | ✅ | +AI loop, tools, crash supervision |
| Both Active | ✅ | ✅ | All features |
| Agent Past Due | ❌ | ⏳ | Grace behavior |
| Agent Cancelled (period active) | ❌ | ✅ | Until current_period_end |
| Period Ended | ❌ | ❌ | Downgraded to Free |

**Automated Test Matrix:**
```javascript
const testScenarios = [
  { entitlements: { tier: 'free' }, expected: { terminalPro: false, agentPro: false } },
  { entitlements: { tier: 'terminal-pro-lifetime' }, expected: { terminalPro: true, agentPro: false } },
  { entitlements: { tier: 'agent-pro', expiresAt: future }, expected: { terminalPro: true, agentPro: true } },
  // ... all scenarios
];
```

---

## 🤖 4. AI Reasoning Loop Safety (v1 Compliance)

**v1-Safe Rules:**
1. **No autonomous writes** - AI proposes, user confirms execution
2. **Deterministic fallback** - Heuristics always work when AI fails
3. **Risk guardrails** - Explicit approval for dangerous operations

**Minimum v1 Acceptance Criteria:**
- Can generate 3-7 step plans
- Each step has: tool + args + expected success signal
- Stops when success signal detected
- Never runs `sudo`, `rm`, installs packages without approval

**Safety Validation:**
```javascript
// Test dangerous command detection
const dangerousCommands = ['rm -rf', 'sudo', 'chmod 777', 'kill -9'];
dangerousCommands.forEach(cmd => {
  assert(aiLoop.requiresApproval(cmd) === true);
});

// Test deterministic fallback
const fallbackResult = aiLoop.runHeuristics(context);
assert(fallbackResult !== null); // Always returns something
```

---

## 🚀 5. Production Launch Checklist

### Pre-Launch Validation (Must Pass All)

**✅ Webhook Infrastructure:**
- [ ] Webhook endpoint live and configured in Stripe dashboard
- [ ] Webhook signing secret correct in prod environment
- [ ] Price IDs and product IDs are production (not test)
- [ ] Raw body middleware configured correctly
- [ ] Idempotency database table exists with unique constraint

**✅ License System:**
- [ ] License activation endpoint rate-limited
- [ ] Abuse protection enabled
- [ ] Offline validity window configured (3 days for subscriptions)
- [ ] Refund/cancellation logic tested

**✅ Feature Gating:**
- [ ] All tier combinations tested via automated matrix
- [ ] Client-side feature detection works
- [ ] Server-side authorization enforced

**✅ Demo Flow:**
- [ ] Reproducible on fresh VM
- [ ] Pricing page matches actual tiers/entitlements
- [ ] License activation flow tested end-to-end

**✅ AI Safety:**
- [ ] User approval required for risky operations
- [ ] Deterministic fallback tested
- [ ] No autonomous file system modifications

---

## 🔧 Implementation Files

1. `test/stripe-webhook-audit.js` - Comprehensive webhook validation
2. `test/license-ent` - License system validation
3.itlements-test.js `test/tier-gating-matrix.js` - Feature gating test suite
4. `test/ai-safety-validation.js` - AI reasoning loop safety tests
5. `scripts/production-validate.sh` - End-to-end validation script

---

## 🎯 Success Criteria

**To claim "✅ complete", all validation tests must pass:**

```bash
npm run validate:stripe-webhook
npm run validate:licensing  
npm run validate:feature-gating
npm run validate:ai-safety
npm run validate:production
```

**If any test fails, the system is NOT production-ready.**

---

## 📊 Monitoring & Alerts

**Production Monitoring Must Include:**
- Webhook delivery success rate (target: >99%)
- Duplicate event rate (target: <1%)
- License activation success rate
- Feature gate bypass attempts
- AI approval request frequency

This framework transforms subjective "completed" claims into objective, testable assertions.
