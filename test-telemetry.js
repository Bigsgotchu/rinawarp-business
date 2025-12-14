#!/usr/bin/env node

/**
 * Telemetry System Test Script
 * Tests the complete telemetry pipeline from client to dashboard
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000';
const TEST_DATA = {
  appVersion: '1.0.0',
  os: process.platform,
  agent: {
    status: 'online',
    pingMs: 42
  },
  license: {
    tier: 'pro',
    offline: false
  }
};

async function testTelemetryEndpoint() {
  console.log('🧪 Testing Telemetry Endpoint...\n');
  
  try {
    // Test health check
    console.log('1️⃣ Testing API Gateway health...');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ API Gateway healthy:', health.data.status);
    
    // Test telemetry endpoint
    console.log('\n2️⃣ Testing telemetry submission...');
    const telemetry = await axios.post(`${API_BASE}/api/telemetry`, TEST_DATA, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('✅ Telemetry submitted:', telemetry.data);
    
    // Test dashboard (just check if endpoint exists)
    console.log('\n3️⃣ Testing telemetry summary endpoint...');
    try {
      // This would require auth in production, but let's see the response
      const summary = await axios.get(`${API_BASE}/api/telemetry/summary`);
      console.log('✅ Dashboard endpoint accessible');
    } catch (authError) {
      if (authError.response?.status === 401) {
        console.log('✅ Dashboard endpoint requires authentication (expected)');
      } else {
        throw authError;
      }
    }
    
    console.log('\n🎉 All tests passed! Telemetry system is working.\n');
    
    console.log('📊 Next steps:');
    console.log('1. Launch desktop app with telemetry client');
    console.log('2. Open dashboard: apps/terminal-pro/desktop/dashboard/telemetry-dashboard.html');
    console.log('3. Monitor real-time data in dashboard');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Make sure API Gateway is running:');
      console.error('cd backend/api-gateway && npm start');
    }
    
    process.exit(1);
  }
}

// Run test
testTelemetryEndpoint();
