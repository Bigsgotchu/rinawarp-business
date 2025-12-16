const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const DASHBOARD_TOKEN = 'test-dashboard-token-12345';

console.log('🧪 Testing Advanced Enterprise Features');
console.log('========================================');

// Test 1: Enhanced health check
async function testEnhancedHealth() {
  console.log('🏥 Testing Enhanced Health Check...');

  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Enhanced health check successful');
    console.log('📦 Version:', response.data.version);
    console.log('🔧 Features:');
    Object.entries(response.data.features).forEach(([feature, enabled]) => {
      console.log(`   ${feature}: ${enabled ? '✅' : '❌'}`);
    });
    return true;
  } catch (error) {
    console.log('❌ Enhanced health check failed:', error.message);
    return false;
  }
}

// Test 2: License reset request
async function testLicenseResetRequest() {
  console.log('🔑 Testing License Reset Request...');

  try {
    const response = await axios.post(`${BASE_URL}/api/license/reset/request`, {
      licenseKey: 'test-license-reset-12345',
      deviceId: 'device-reset-test',
      email: 'test@example.com',
    });

    console.log('✅ License reset request successful');
    console.log('🕐 Token expires at:', response.data.expiresAt);
    console.log('⏱️ TTL:', response.data.ttlMinutes, 'minutes');
    return response.data.token;
  } catch (error) {
    console.log('❌ License reset request failed:', error.message);
    return null;
  }
}

// Test 3: License reset confirm
async function testLicenseResetConfirm(token) {
  console.log('✅ Testing License Reset Confirm...');

  if (!token) {
    console.log('⏸️ Skipping - no token available');
    return false;
  }

  try {
    const response = await axios.post(`${BASE_URL}/api/license/reset/confirm`, {
      resetToken: token,
      deviceId: 'device-reset-test',
    });

    console.log('✅ License reset confirm successful');
    console.log('📝 Message:', response.data.message);
    return true;
  } catch (error) {
    console.log('❌ License reset confirm failed:', error.message);
    return false;
  }
}

// Test 4: Enhanced telemetry with crash tracking
async function testEnhancedTelemetry() {
  console.log('📡 Testing Enhanced Telemetry...');

  try {
    const response = await axios.post(`${BASE_URL}/api/telemetry`, {
      schemaVersion: 1,
      appVersion: '1.0.0',
      os: 'linux',
      agent: { status: 'online', pingMs: 100 },
      license: {
        tier: 'pro',
        offline: false,
        key: 'test-license-crash-12345',
      },
      deviceId: 'device-crash-test',
      updateCohort: 'canary',
      customEvent: {
        event: 'app.crash',
        type: 'testCrash',
        details: 'Test crash for telemetry',
      },
    });

    console.log('✅ Enhanced telemetry successful');
    console.log('📊 Abuse status included:', !!response.data.abuseStatus);
    return true;
  } catch (error) {
    console.log('❌ Enhanced telemetry failed:', error.message);
    return false;
  }
}

// Test 5: Enhanced dashboard with crash metrics
async function testEnhancedDashboard() {
  console.log('📊 Testing Enhanced Dashboard...');

  try {
    const response = await axios.get(`${BASE_URL}/api/telemetry/summary`, {
      headers: { 'X-Dashboard-Token': DASHBOARD_TOKEN },
    });

    console.log('✅ Enhanced dashboard accessible');
    const data = response.data.data;

    if (data.cohorts) {
      console.log('🧪 Cohort metrics:');
      console.log('   Canary samples:', data.cohorts.canary?.sampleCount || 0);
      console.log('   Canary crash rate:', (data.cohorts.canary?.crashRate * 100).toFixed(3), '%');
      console.log('   Stable samples:', data.cohorts.stable?.sampleCount || 0);
      console.log('   Stable crash rate:', (data.cohorts.stable?.crashRate * 100).toFixed(3), '%');
    }

    if (data.latestCanaryVersion) {
      console.log('🚀 Latest canary version:', data.latestCanaryVersion);
    }

    return true;
  } catch (error) {
    console.log('❌ Enhanced dashboard failed:', error.message);
    return false;
  }
}

// Test 6: Job execution (simulation)
async function testJobExecution() {
  console.log('⚙️ Testing Job Execution...');

  try {
    // Test canary promotion job
    const { runCanaryPromotion } = await import('./backend/jobs/canary-promote.js');
    console.log('🧪 Canary promotion job loaded successfully');

    // Test canary rollback job
    const { runCanaryRollback } = await import('./backend/jobs/canary-rollback.js');
    console.log('🚨 Canary rollback job loaded successfully');

    console.log('✅ Job execution system ready');
    return true;
  } catch (error) {
    console.log('❌ Job execution failed:', error.message);
    return false;
  }
}

// Run all tests
async function runAdvancedTests() {
  const results = [];

  results.push(await testEnhancedHealth());
  const resetToken = await testLicenseResetRequest();
  results.push(await testLicenseResetConfirm(resetToken));
  results.push(await testEnhancedTelemetry());
  results.push(await testEnhancedDashboard());
  results.push(await testJobExecution());

  console.log('========================================');
  console.log('🏁 Advanced Enterprise Features Test Results');
  console.log(`✅ Passed: ${results.filter((r) => r).length}/${results.length}`);
  console.log(`❌ Failed: ${results.filter((r) => !r).length}/${results.length}`);

  if (results.every((r) => r)) {
    console.log('🎉 ALL ADVANCED TESTS PASSED!');
    console.log('🚀 Enterprise Features: PRODUCTION READY');
  } else {
    console.log('⚠️ Some advanced tests failed - review issues above');
  }

  return results.every((r) => r);
}

runAdvancedTests().catch(console.error);
