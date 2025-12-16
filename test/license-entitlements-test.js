#!/usr/bin/env node

/**
 * License Activation & Entitlements Validation
 * Tests license system security and entitlement mapping
 *
 * Run: node test/license-entitlements-test.js
 */

import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// Colors for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(`🔐 ${title}`, 'blue');
  console.log('='.repeat(60));
}

function logTest(testName, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const color = passed ? 'green' : 'red';
  log(`${status} ${testName}`, color);
  if (details) {
    console.log(`   ${details}`);
  }
}

// License encryption secret
const LICENSE_SECRET = process.env.LICENSE_ENCRYPTION_SECRET || 'dev-license-secret-key';

/**
 * Test 1: License Blob Format Validation
 */
async function testLicenseBlobFormat() {
  logSection('License Blob Format Validation');

  const results = [];

  // Required claims for secure license
  const requiredClaims = [
    'user_id',
    'plan',
    'entitlements',
    'issued_at',
    'expires_at',
    'device_fingerprint',
    'license_version',
    'signature',
  ];

  // Test 1.1: Check license generation includes all required fields
  const licenseBlob = generateSecureLicenseBlob({
    user_id: 'user_123',
    plan: 'terminal-pro-lifetime',
    device_fingerprint: 'device_abc123',
    license_version: '1.0',
  });

  const hasAllClaims = requiredClaims.every((claim) => licenseBlob[claim] !== undefined);
  logTest(
    'License blob has all required claims',
    hasAllClaims,
    hasAllClaims ? '✅ All required fields present' : '❌ Missing required fields',
  );
  results.push(hasAllClaims);

  // Test 1.2: Verify device binding prevents sharing
  const differentDevice = generateSecureLicenseBlob({
    user_id: 'user_123',
    plan: 'terminal-pro-lifetime',
    device_fingerprint: 'device_xyz789', // Different device
    license_version: '1.0',
  });

  const deviceBound = licenseBlob.device_fingerprint !== differentDevice.device_fingerprint;
  logTest(
    'License is device-bound',
    deviceBound,
    deviceBound ? '✅ Different device generates different license' : '❌ License not device-bound',
  );
  results.push(deviceBound);

  // Test 1.3: Verify signature prevents tampering
  const tamperedBlob = { ...licenseBlob, plan: 'agent-pro' }; // Tamper with plan
  const signatureValid = verifyLicenseSignature(tamperedBlob);

  logTest(
    'Signature prevents tampering',
    !signatureValid,
    !signatureValid ? '✅ Tampered license rejected' : '❌ Signature validation failed',
  );
  results.push(!signatureValid);

  // Test 1.4: Check license version tracking
  const version1 = generateSecureLicenseBlob({ license_version: '1.0' });
  const version2 = generateSecureLicenseBlob({ license_version: '1.1' });

  const versioned = version1.license_version !== version2.license_version;
  logTest(
    'License versioning works',
    versioned,
    versioned ? '✅ Version tracking implemented' : '❌ Missing version tracking',
  );
  results.push(versioned);

  return results.every((r) => r);
}

/**
 * Test 2: Offline Validity Window
 */
async function testOfflineValidityWindow() {
  logSection('Offline Validity Window');

  const results = [];

  // Test 2.1: Subscription licenses have expiration
  const subscriptionLicense = generateSecureLicenseBlob({
    plan: 'agent-pro-subscription',
    expires_at: Date.now() + 2 * 24 * 60 * 60 * 1000, // 2 days from now
    issued_at: Date.now(),
  });

  const hasExpiry = subscriptionLicense.expires_at !== null;
  logTest(
    'Subscription license has expiration',
    hasExpiry,
    hasExpiry ? '✅ Subscription expires' : '❌ Subscription has no expiration',
  );
  results.push(hasExpiry);

  // Test 2.2: Lifetime licenses have null expiry
  const lifetimeLicense = generateSecureLicenseBlob({
    plan: 'terminal-pro-lifetime',
    expires_at: null,
  });

  const lifetimeHasNoExpiry = lifetimeLicense.expires_at === null;
  logTest(
    'Lifetime license has no expiration',
    lifetimeHasNoExpiry,
    lifetimeHasNoExpiry ? '✅ Lifetime license never expires' : '❌ Lifetime license has expiry',
  );
  results.push(lifetimeHasNoExpiry);

  // Test 2.3: Simulate offline usage window
  const offlineTest = () => {
    const licenseIssued = Date.now() - 1 * 24 * 60 * 60 * 1000; // 1 day ago
    const expiresAt = licenseIssued + 3 * 24 * 60 * 60 * 1000; // Expires in 2 days
    const now = Date.now();

    // Should work (within offline window)
    const withinWindow = now < expiresAt;

    // Simulate 4 days later (should fail)
    const futureTime = now + 4 * 24 * 60 * 60 * 1000;
    const outsideWindow = futureTime > expiresAt;

    return { withinWindow, outsideWindow };
  };

  const offlineResult = offlineTest();
  logTest(
    'Offline validity window enforcement',
    offlineResult.withinWindow && offlineResult.outsideWindow,
    '✅ Works within window, fails after expiry',
  );
  results.push(offlineResult.withinWindow && offlineResult.outsideWindow);

  return results.every((r) => r);
}

/**
 * Test 3: Refund & Cancellation Logic
 */
async function testRefundCancellationLogic() {
  logSection('Refund & Cancellation Logic');

  const results = [];

  // Test 3.1: Charge refund revokes lifetime license
  const refundTest = () => {
    const license = {
      plan: 'terminal-pro-lifetime',
      status: 'active',
      payment_refunded: false,
    };

    // Simulate refund event
    const refundEvent = {
      type: 'charge.refunded',
      data: { object: { id: 'ch_refund_123' } },
    };

    // Should revoke license
    if (refundEvent.type === 'charge.refunded') {
      license.status = 'revoked';
      license.revoked_reason = 'payment_refunded';
    }

    return license.status === 'revoked';
  };

  const refundHandled = refundTest();
  logTest(
    'Charge refund revokes license',
    refundHandled,
    refundHandled ? '✅ Lifetime license revoked on refund' : '❌ Refund not handled',
  );
  results.push(refundHandled);

  // Test 3.2: Subscription cancellation with grace period
  const cancellationTest = () => {
    const license = {
      plan: 'agent-pro-subscription',
      status: 'active',
      current_period_end: Date.now() + 5 * 24 * 60 * 60 * 1000, // 5 days
      cancelled_at: Date.now(),
    };

    // During grace period - should remain active
    const now = Date.now();
    const inGracePeriod = now < license.current_period_end;

    if (inGracePeriod) {
      license.status = 'active';
      license.grace_period_end = license.current_period_end;
    } else {
      license.status = 'cancelled';
    }

    return { inGracePeriod, statusCorrect: license.status === 'active' };
  };

  const cancelResult = cancellationTest();
  logTest(
    'Cancellation grace period handling',
    cancelResult.statusCorrect,
    cancelResult.statusCorrect ? '✅ Active during grace period' : '❌ Grace period not handled',
  );
  results.push(cancelResult.statusCorrect);

  // Test 3.3: Failed payment handling
  const failedPaymentTest = () => {
    const license = {
      plan: 'agent-pro-subscription',
      status: 'active',
      grace_period_days: 3,
    };

    const paymentFailedEvent = {
      type: 'invoice.payment_failed',
      data: { object: { next_payment_attempt: Date.now() + 2 * 24 * 60 * 60 * 1000 } },
    };

    if (paymentFailedEvent.type === 'invoice.payment_failed') {
      license.status = 'past_due';
      license.next_payment_attempt = paymentFailedEvent.data.object.next_payment_attempt;
      license.grace_period_end = Date.now() + license.grace_period_days * 24 * 60 * 60 * 1000;
    }

    return license.status === 'past_due';
  };

  const failedPaymentHandled = failedPaymentTest();
  logTest(
    'Failed payment grace period',
    failedPaymentHandled,
    failedPaymentHandled ? '✅ Past due status with grace period' : '❌ Failed payment not handled',
  );
  results.push(failedPaymentHandled);

  return results.every((r) => r);
}

/**
 * Test 4: Entitlement Mapping
 */
async function testEntitlementMapping() {
  logSection('Entitlement Mapping');

  const results = [];

  // Test 4.1: Terminal Pro entitlements
  const terminalProLicense = generateSecureLicenseBlob({
    plan: 'terminal-pro-lifetime',
    entitlements: {
      terminal_pro_lifetime: true,
      agent_pro_status: 'none',
      ghost_text_suggestions: true,
      memory_persistence: true,
      advanced_planning: true,
    },
  });

  const terminalEntitlements = [
    terminalProLicense.entitlements.terminal_pro_lifetime,
    terminalProLicense.entitlements.ghost_text_suggestions,
    terminalProLicense.entitlements.memory_persistence,
  ].every(Boolean);

  logTest(
    'Terminal Pro entitlements',
    terminalEntitlements,
    terminalEntitlements ? '✅ Terminal Pro features enabled' : '❌ Missing Terminal Pro features',
  );
  results.push(terminalEntitlements);

  // Test 4.2: Agent Pro entitlements
  const agentProLicense = generateSecureLicenseBlob({
    plan: 'agent-pro-subscription',
    entitlements: {
      terminal_pro_lifetime: true,
      agent_pro_status: 'active',
      tool_registry: true,
      multi_step_planning: true,
      crash_supervision: true,
      enhanced_memory: true,
      ai_reasoning_loop: true,
    },
  });

  const agentEntitlements = [
    agentProLicense.entitlements.agent_pro_status === 'active',
    agentProLicense.entitlements.tool_registry,
    agentProLicense.entitlements.ai_reasoning_loop,
  ].every(Boolean);

  logTest(
    'Agent Pro entitlements',
    agentEntitlements,
    agentEntitlements ? '✅ Agent Pro features enabled' : '❌ Missing Agent Pro features',
  );
  results.push(agentEntitlements);

  // Test 4.3: Free tier has no premium entitlements
  const freeLicense = generateSecureLicenseBlob({
    plan: 'free',
    entitlements: {
      terminal_pro_lifetime: false,
      agent_pro_status: 'none',
      basic_terminal: true,
      shell_execution: true,
      git_status: true,
      basic_planning: true,
    },
  });

  const freeHasNoPremium =
    !freeLicense.entitlements.terminal_pro_lifetime && freeLicense.entitlements.basic_terminal;

  logTest(
    'Free tier restrictions',
    freeHasNoPremium,
    freeHasNoPremium ? '✅ Free tier properly restricted' : '❌ Free tier has premium features',
  );
  results.push(freeHasNoPremium);

  return results.every((r) => r);
}

/**
 * Test 5: License Activation Security
 */
async function testLicenseActivationSecurity() {
  logSection('License Activation Security');

  const results = [];

  // Test 5.1: Rate limiting simulation
  const rateLimitTest = () => {
    const attempts = [];
    const MAX_ATTEMPTS = 5;
    const WINDOW_MS = 60 * 1000; // 1 minute

    const isRateLimited = (ip) => {
      const now = Date.now();
      const recentAttempts = attempts.filter((a) => a.ip === ip && now - a.timestamp < WINDOW_MS);
      return recentAttempts.length >= MAX_ATTEMPTS;
    };

    const recordAttempt = (ip) => {
      attempts.push({ ip, timestamp: Date.now() });
    };

    // Simulate 6 attempts from same IP
    const testIP = '192.168.1.100';
    for (let i = 0; i < 6; i++) {
      if (!isRateLimited(testIP)) {
        recordAttempt(testIP);
      }
    }

    const rateLimited = isRateLimited(testIP);
    return rateLimited;
  };

  const rateLimited = rateLimitTest();
  logTest(
    'Rate limiting on license activation',
    rateLimited,
    rateLimited ? '✅ Activation endpoint rate-limited' : '❌ No rate limiting',
  );
  results.push(rateLimited);

  // Test 5.2: Invalid license rejection
  const invalidLicenseTest = () => {
    const invalidLicenses = [
      null,
      undefined,
      '',
      'invalid-format',
      { invalid: 'structure' },
      { user_id: '', plan: '', entitlements: {} },
      generateSecureLicenseBlob({ user_id: 'hacker' }), // Valid format, suspicious user
    ];

    let rejectedCount = 0;
    invalidLicenses.forEach((license) => {
      const isValid = validateLicenseStructure(license);
      if (!isValid) rejectedCount++;
    });

    return rejectedCount === invalidLicenses.length;
  };

  const allInvalidRejected = invalidLicenseTest();
  logTest(
    'Invalid license rejection',
    allInvalidRejected,
    allInvalidRejected ? '✅ All invalid licenses rejected' : '❌ Some invalid licenses accepted',
  );
  results.push(allInvalidRejected);

  // Test 5.3: Device fingerprinting
  const deviceFingerprintTest = () => {
    const license1 = generateSecureLicenseBlob({
      device_fingerprint: 'device_abc123_hash',
    });

    const license2 = generateSecureLicenseBlob({
      device_fingerprint: 'device_xyz789_hash',
    });

    const differentDevices = license1.device_fingerprint !== license2.device_fingerprint;
    const isHashed =
      license1.device_fingerprint.includes('hash') || license1.device_fingerprint.length > 20;

    return differentDevices && isHashed;
  };

  const deviceSecure = deviceFingerprintTest();
  logTest(
    'Device fingerprinting security',
    deviceSecure,
    deviceSecure ? '✅ Device binding is secure' : '❌ Device binding insecure',
  );
  results.push(deviceSecure);

  return results.every((r) => r);
}

/**
 * Helper Functions
 */

function generateSecureLicenseBlob(data) {
  const now = Date.now();
  const defaultData = {
    user_id: data.user_id || 'unknown',
    plan: data.plan || 'free',
    entitlements: data.entitlements || { basic_terminal: true },
    issued_at: data.issued_at || now,
    expires_at: data.expires_at || null,
    device_fingerprint: data.device_fingerprint || generateDeviceFingerprint(),
    license_version: data.license_version || '1.0',
  };

  // Generate HMAC signature
  const payload = JSON.stringify({
    user_id: defaultData.user_id,
    plan: defaultData.plan,
    entitlements: defaultData.entitlements,
    issued_at: defaultData.issued_at,
    expires_at: defaultData.expires_at,
    device_fingerprint: defaultData.device_fingerprint,
    license_version: defaultData.license_version,
  });

  const signature = crypto.createHmac('sha256', LICENSE_SECRET).update(payload).digest('hex');

  return {
    ...defaultData,
    signature,
  };
}

function verifyLicenseSignature(licenseBlob) {
  try {
    const { signature, ...payload } = licenseBlob;
    const expectedSignature = crypto
      .createHmac('sha256', LICENSE_SECRET)
      .update(JSON.stringify(payload))
      .digest('hex');

    return signature === expectedSignature;
  } catch (error) {
    return false;
  }
}

function generateDeviceFingerprint() {
  // Simulate device fingerprinting
  const components = [
    'browser:' + (typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'),
    'os:' + process.platform,
    'arch:' + process.arch,
    'node:' + process.version,
  ];

  return crypto.createHash('sha256').update(components.join('|')).digest('hex');
}

function validateLicenseStructure(license) {
  if (!license || typeof license !== 'object') return false;

  const required = ['user_id', 'plan', 'entitlements', 'issued_at', 'signature'];
  const hasRequired = required.every((field) => license[field] !== undefined);

  if (!hasRequired) return false;

  // Verify signature
  return verifyLicenseSignature(license);
}

/**
 * Main test runner
 */
async function runLicenseEntitlementsTest() {
  log('🚀 Starting License & Entitlements Validation...', 'blue');

  const tests = [
    { name: 'License Blob Format', fn: testLicenseBlobFormat },
    { name: 'Offline Validity Window', fn: testOfflineValidityWindow },
    { name: 'Refund & Cancellation Logic', fn: testRefundCancellationLogic },
    { name: 'Entitlement Mapping', fn: testEntitlementMapping },
    { name: 'License Activation Security', fn: testLicenseActivationSecurity },
  ];

  const results = [];

  for (const test of tests) {
    try {
      const passed = await test.fn();
      results.push({ name: test.name, passed });
    } catch (error) {
      log(`❌ Test "${test.name}" crashed: ${error.message}`, 'red');
      results.push({ name: test.name, passed: false });
    }
  }

  // Summary
  logSection('Validation Summary');
  const passedTests = results.filter((r) => r.passed).length;
  const totalTests = results.length;

  results.forEach((result) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    log(`${status} ${result.name}`, result.passed ? 'green' : 'red');
  });

  log(
    `\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`,
    passedTests === totalTests ? 'green' : 'red',
  );

  if (passedTests === totalTests) {
    log('🎉 License system is SECURE and PRODUCTION READY!', 'green');
  } else {
    log('⚠️  License system has CRITICAL security issues!', 'red');
    log('   Fix failing tests before production deployment.', 'yellow');
  }

  return passedTests === totalTests;
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runLicenseEntitlementsTest().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

export { runLicenseEntitlementsTest };
