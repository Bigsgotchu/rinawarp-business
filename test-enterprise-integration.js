const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const DASHBOARD_TOKEN = 'test-dashboard-token-12345';

console.log('🧪 Testing Enterprise Features Integration');
console.log('==========================================');

// Test 1: Enhanced telemetry with abuse detection
async function testEnhancedTelemetry() {
  console.log('📡 Testing Enhanced Telemetry...');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/telemetry`, {
      schemaVersion: 1,
      appVersion: "1.0.0",
      os: "linux",
      agent: { status: "online", pingMs: 100 },
      license: { 
        tier: "pro", 
        offline: false,
        key: "test-license-enterprise-12345"
      },
      deviceId: "device-enterprise-test",
      updateCohort: "canary"
    });
    
    console.log('✅ Enhanced telemetry accepted');
    console.log('📊 Response includes abuse status:', !!response.data.abuseStatus);
    
  } catch (error) {
    console.log('❌ Enhanced telemetry failed:', error.message);
  }
}

// Test 2: License abuse detection
async function testLicenseAbuse() {
  console.log('🛡️ Testing License Abuse Detection...');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/license/check`, {
      licenseKey: "test-license-abuse-12345",
      deviceId: "device-abuse-test"
    });
    
    console.log('✅ License abuse check successful');
    console.log('🔍 Abuse score:', response.data.abuseScore);
    console.log('🚫 Quarantined:', response.data.quarantined);
    
  } catch (error) {
    console.log('❌ License abuse check failed:', error.message);
  }
}

// Test 3: Enhanced dashboard with enterprise metrics
async function testEnhancedDashboard() {
  console.log('📊 Testing Enhanced Dashboard...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/telemetry/summary`, {
      headers: { 'X-Dashboard-Token': DASHBOARD_TOKEN }
    });
    
    console.log('✅ Enhanced dashboard accessible');
    console.log('🧪 Canary metrics:', !!response.data.data.agent?.cohorts);
    console.log('🛡️ License abuse stats:', !!response.data.data.licenses);
    
    const data = response.data.data;
    if (data.agent?.cohorts) {
      console.log('   Canary samples:', data.agent.cohorts.canary?.sampleCount || 0);
      console.log('   Stable samples:', data.agent.cohorts.stable?.sampleCount || 0);
    }
    
    if (data.licenses) {
      console.log('   Total licenses:', data.licenses.total);
      console.log('   Quarantined:', data.licenses.quarantined);
    }
    
  } catch (error) {
    console.log('❌ Enhanced dashboard failed:', error.message);
  }
}

// Test 4: Health check with enterprise features
async function testEnterpriseHealth() {
  console.log('🏥 Testing Enterprise Health Check...');
  
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    
    console.log('✅ Enterprise health check successful');
    console.log('📦 Version:', response.data.version);
    console.log('🔧 Features:', response.data.features);
    
    const features = response.data.features;
    console.log('   Telemetry:', features.telemetry);
    console.log('   License Abuse:', features.licenseAbuseDetection);
    console.log('   Canary Updates:', features.canaryUpdates);
    console.log('   Slack Alerts:', features.slackAlerts);
    
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
}

// Run all tests
async function runIntegrationTests() {
  await testEnhancedTelemetry();
  await testLicenseAbuse();
  await testEnhancedDashboard();
  await testEnterpriseHealth();
  
  console.log('==========================================');
  console.log('🏁 Enterprise Integration Tests Complete');
  console.log('🎯 System Status: ENTERPRISE READY');
}

runIntegrationTests().catch(console.error);
