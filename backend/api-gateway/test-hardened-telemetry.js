import axios from 'axios';

const BASE_URL = 'http://localhost:3000';
const DASHBOARD_TOKEN = 'test-dashboard-token-12345';

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

async function testSchemaVersionValidation() {
  log('Testing Schema Version Validation...');
  
  // Test 1: Missing schemaVersion
  try {
    const response = await axios.post(`${BASE_URL}/api/telemetry`, {
      appVersion: "1.0.0",
      os: "linux",
      agent: { status: "online", pingMs: 100 },
      license: { tier: "pro", offline: false }
    });
    
    assert(response.status === 400 && response.data.error.includes('schemaVersion'), 
           'Missing schemaVersion should return 400', 
           '400 error', `Status: ${response.status}`);
  } catch (error) {
    assert(error.response?.status === 400, 'Missing schemaVersion HTTP status', '400', error.response?.status);
  }

  // Test 2: Invalid schemaVersion
  try {
    const response = await axios.post(`${BASE_URL}/api/telemetry`, {
      schemaVersion: 999,
      appVersion: "1.0.0",
      os: "linux",
      agent: { status: "online", pingMs: 100 },
      license: { tier: "pro", offline: false }
    });
    
    assert(response.status === 400 && response.data.error.includes('Unsupported schemaVersion'), 
           'Invalid schemaVersion should return 400', 
           '400 error', `Status: ${response.status}`);
  } catch (error) {
    assert(error.response?.status === 400, 'Invalid schemaVersion HTTP status', '400', error.response?.status);
  }

  // Test 3: Valid schemaVersion
  try {
    const response = await axios.post(`${BASE_URL}/api/telemetry`, {
      schemaVersion: 1,
      appVersion: "1.0.0",
      os: "linux",
      agent: { status: "online", pingMs: 100 },
      license: { tier: "pro", offline: false }
    });
    
    assert(response.status === 200 && response.data.success === true, 
           'Valid schemaVersion should return 200', 
           '200 success', `Status: ${response.status}`);
  } catch (error) {
    assert(false, 'Valid schemaVersion should not error', 'Success', error.message);
  }
}

async function testRequiredFieldsValidation() {
  log('Testing Required Fields Validation...');
  
  const requiredFields = ["appVersion", "os", "agent", "license", "schemaVersion"];
  
  for (const field of requiredFields) {
    const testPayload = {
      schemaVersion: 1,
      appVersion: "1.0.0",
      os: "linux",
      agent: { status: "online", pingMs: 100 },
      license: { tier: "pro", offline: false }
    };
    delete testPayload[field];
    
    try {
      const response = await axios.post(`${BASE_URL}/api/telemetry`, testPayload);
      assert(false, `Missing ${field} should return 400`, '400 error', `Status: ${response.status}`);
    } catch (error) {
      assert(error.response?.status === 400 && error.response?.data?.error?.includes(`Missing required field: ${field}`), 
             `Missing ${field} validation`, 
             '400 error with correct message', 
             `Status: ${error.response?.status}, Error: ${error.response?.data?.error}`);
    }
  }
}

async function testDashboardAuthentication() {
  log('Testing Dashboard Authentication...');
  
  // Test 1: No token
  try {
    const response = await axios.get(`${BASE_URL}/api/telemetry/summary`);
    assert(false, 'No token should return 401', '401', `Status: ${response.status}`);
  } catch (error) {
    assert(error.response?.status === 401, 'No token HTTP status', '401', error.response?.status);
  }

  // Test 2: Invalid token
  try {
    const response = await axios.get(`${BASE_URL}/api/telemetry/summary`, {
      headers: { 'X-Dashboard-Token': 'invalid-token' }
    });
    assert(false, 'Invalid token should return 403', '403', `Status: ${response.status}`);
  } catch (error) {
    assert(error.response?.status === 403, 'Invalid token HTTP status', '403', error.response?.status);
  }

  // Test 3: Valid token (will fail without proper env setup, but should reach auth check)
  try {
    const response = await axios.get(`${BASE_URL}/api/telemetry/summary`, {
      headers: { 'X-Dashboard-Token': DASHBOARD_TOKEN }
    });
    // This might succeed or fail depending on env setup, but shouldn't be auth error
    assert(response.status !== 401 && response.status !== 403, 
           'Valid token should not return auth errors', 
           'Not 401/403', `Status: ${response.status}`);
  } catch (error) {
    assert(error.response?.status !== 401 && error.response?.status !== 403, 
           'Valid token should not return auth errors', 
           'Not 401/403', `Status: ${error.response?.status}`);
  }
}

async function testTelemetryEndpointStructure() {
  log('Testing Telemetry Endpoint Structure...');
  
  const validPayload = {
    schemaVersion: 1,
    appVersion: "1.0.0",
    os: "linux",
    agent: { status: "online", pingMs: 100 },
    license: { tier: "pro", offline: false }
  };

  try {
    const response = await axios.post(`${BASE_URL}/api/telemetry`, validPayload);
    
    assert(response.status === 200, 'Valid telemetry should return 200', '200', response.status);
    assert(response.data.success === true, 'Response should have success: true', 'true', response.data.success);
    assert(response.data.message === 'Telemetry received', 'Response should have correct message', 'Telemetry received', response.data.message);
    assert(response.data.timestamp, 'Response should include timestamp', 'timestamp present', response.data.timestamp ? 'present' : 'missing');
  } catch (error) {
    assert(false, 'Valid telemetry should not error', 'Success', error.message);
  }
}

async function testRateLimiting() {
  log('Testing Rate Limiting...');
  
  const validPayload = {
    schemaVersion: 1,
    appVersion: "1.0.0",
    os: "linux",
    agent: { status: "online", pingMs: 100 },
    license: { tier: "pro", offline: false }
  };

  // Send multiple requests to test rate limiting
  const promises = [];
  for (let i = 0; i < 15; i++) {
    promises.push(axios.post(`${BASE_URL}/api/telemetry`, validPayload).catch(err => err));
  }

  try {
    const results = await Promise.all(promises);
    const rateLimited = results.filter(r => r.response?.status === 429).length;
    
    assert(rateLimited > 0, 'Rate limiting should trigger', 'Some requests limited', `${rateLimited}/15 requests limited`);
  } catch (error) {
    log('Rate limiting test encountered error: ' + error.message);
  }
}

async function runAllTests() {
  log('🧪 Starting Hardened Telemetry Tests');
  log('====================================');
  
  try {
    // Test if server is running
    await axios.get(`${BASE_URL}/health`);
    log('✅ Server is running');
  } catch (error) {
    log('❌ Server is not running. Please start the server first.', 'error');
    return;
  }

  await testSchemaVersionValidation();
  await testRequiredFieldsValidation();
  await testDashboardAuthentication();
  await testTelemetryEndpointStructure();
  await testRateLimiting();

  log('====================================');
  log(`📊 Test Results: ${tests.passed}/${tests.total} passed, ${tests.failed} failed`);
  
  if (tests.failed === 0) {
    log('🎉 ALL TESTS PASSED! System is production ready.', 'success');
  } else {
    log('⚠️ Some tests failed. Please review the issues above.', 'error');
  }
}

// Run tests
runAllTests().catch(error => {
  log('Test suite error: ' + error.message, 'error');
});
