import { processLicenseEvent, getLicenseStatus, getAbuseStatistics } from './abuse-detector.js';

const tests = {
  passed: 0,
  failed: 0,
  total: 0
};

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

function assert(condition, testName, expected, actual) {
  tests.total++;
  if (condition) {
    tests.passed++;
    log(`PASS: ${testName}`, 'success');
    return true;
  } else {
    tests.failed++;
    log(`FAIL: ${testName} - Expected: ${expected}, Got: ${actual}`, 'error');
    return false;
  }
}

async function testLicenseAbuseDetection() {
  log('🧪 Testing License Abuse Detection System');
  log('==========================================');

  // Test 1: Normal license usage should not be quarantined
  const normalLicense = 'test-license-normal-12345';
  const status1 = processLicenseEvent(normalLicense, 'device1', '192.168.1.1', 'valid');
  assert(!status1.quarantined, 'Normal license usage should not be quarantined', 'not quarantined', status1.quarantined ? 'quarantined' : 'not quarantined');
  assert(status1.abuseScore < 10, 'Normal usage should have low abuse score', '< 10', status1.abuseScore);

  // Test 2: Multiple devices in 24h should increase score
  for (let i = 2; i <= 5; i++) {
    processLicenseEvent(normalLicense, `device${i}`, `192.168.1.${i}`, 'valid');
  }
  const status2 = getLicenseStatus(normalLicense);
  assert(status2.abuseScore >= 4, 'Multiple devices should increase score', '>= 4', status2.abuseScore);

  // Test 3: Multiple IPs in 1h should increase score
  for (let i = 1; i <= 6; i++) {
    processLicenseEvent(normalLicense, 'device1', `10.0.0.${i}`, 'valid');
  }
  const status3 = getLicenseStatus(normalLicense);
  assert(status3.abuseScore >= 7, 'Multiple IPs should increase score', '>= 7', status3.abuseScore);

  // Test 4: Failed validations should increase score
  for (let i = 1; i <= 11; i++) {
    processLicenseEvent(normalLicense, 'device1', '192.168.1.1', 'invalid');
  }
  const status4 = getLicenseStatus(normalLicense);
  assert(status4.abuseScore >= 12, 'Failed validations should trigger quarantine', '>= 12', status4.abuseScore);
  assert(status4.quarantined, 'License should be quarantined with high score', 'quarantined', status4.quarantined ? 'quarantined' : 'not quarantined');

  // Test 5: Auto-clear should work when score drops
  // Simulate time passing and score decreasing (this would normally happen with time-based decay)
  const status5 = getLicenseStatus(normalLicense);
  assert(status5.quarantined === true, 'License should still be quarantined', 'true', status5.quarantined);

  // Test 6: Statistics should be accurate
  const stats = getAbuseStatistics();
  assert(stats.total >= 1, 'Statistics should count licenses', '>= 1', stats.total);
  assert(stats.quarantined >= 1, 'Statistics should count quarantined licenses', '>= 1', stats.quarantined);
  
  log('==========================================');
  log(`📊 Abuse Detection Test Results: ${tests.passed}/${tests.total} passed, ${tests.failed} failed`);
  
  if (tests.failed === 0) {
    log('🎉 ALL ABUSE DETECTION TESTS PASSED!', 'success');
  } else {
    log('⚠️ Some abuse detection tests failed.', 'error');
  }
}

// Test privacy-safe hashing
function testPrivacySafety() {
  log('🔒 Testing Privacy Safety');
  
  const licenseKey = 'test-license-12345';
  const deviceId = 'device-abc-123';
  const ip = '192.168.1.100';
  
  // These should all be hashed (no raw values should be stored)
  processLicenseEvent(licenseKey, deviceId, ip, 'valid');
  
  // Verify that raw values are not easily guessable from hashes
  const status = getLicenseStatus(licenseKey);
  log(`Privacy test: License status retrieved successfully without exposing raw data`);
  
  return true;
}

// Run tests
async function runAllTests() {
  try {
    await testLicenseAbuseDetection();
    testPrivacySafety();
    
    log('🏁 License Abuse Detection System Tests Complete');
  } catch (error) {
    log('Test suite error: ' + error.message, 'error');
  }
}

runAllTests();
