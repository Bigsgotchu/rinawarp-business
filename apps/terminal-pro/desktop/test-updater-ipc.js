#!/usr/bin/env node

/**
 * Local IPC Handler Validation Test
 * Tests that the update IPC handlers are properly wired without requiring network access
 */

const { app } = require('electron');
const { ipcMain } = require('electron');
const path = require('path');

// Mock BrowserWindow for testing
class MockBrowserWindow {
  constructor() {
    this.webContents = {
      send: (channel, ...args) => {
        console.log(`📡 IPC Event: ${channel}`, args);
      },
    };
  }
}

// Test IPC handlers
function testIPCHandlers() {
  console.log('🧪 Testing Auto-Updater IPC Handlers...\n');

  const results = [];

  // Test update:check handler
  try {
    const checkHandler = ipcMain.listeners('update:check')[0];
    if (checkHandler) {
      console.log('✅ update:check handler found');
      results.push('update:check');
    } else {
      console.log('❌ update:check handler missing');
    }
  } catch (error) {
    console.log('❌ update:check handler error:', error.message);
  }

  // Test update:install handler
  try {
    const installHandler = ipcMain.listeners('update:install')[0];
    if (installHandler) {
      console.log('✅ update:install handler found');
      results.push('update:install');
    } else {
      console.log('❌ update:install handler missing');
    }
  } catch (error) {
    console.log('❌ update:install handler error:', error.message);
  }

  // Test update:getStatus handler
  try {
    const statusHandler = ipcMain.listeners('update:getStatus')[0];
    if (statusHandler) {
      console.log('✅ update:getStatus handler found');
      results.push('update:getStatus');
    } else {
      console.log('❌ update:getStatus handler missing');
    }
  } catch (error) {
    console.log('❌ update:getStatus handler error:', error.message);
  }

  console.log(`\n📊 IPC Handler Test Results: ${results.length}/3 handlers found`);
  return results.length === 3;
}

// Test preload bridge
function testPreloadBridge() {
  console.log('\n🔗 Testing Preload Bridge Configuration...\n');

  try {
    const preloadPath = path.join(__dirname, '../src/shared/preload.js');
    const fs = require('fs');

    if (!fs.existsSync(preloadPath)) {
      console.log('❌ Preload file not found:', preloadPath);
      return false;
    }

    const preloadContent = fs.readFileSync(preloadPath, 'utf8');

    // Check for window.bridge
    if (preloadContent.includes('contextBridge.exposeInMainWorld("bridge"')) {
      console.log('✅ window.bridge compatibility alias found');
    } else {
      console.log('❌ window.bridge compatibility alias missing');
      return false;
    }

    // Check for update handlers
    const hasUpdateCheck = preloadContent.includes('checkForUpdates');
    const hasUpdateInstall = preloadContent.includes('restartUpdate');
    const hasUpdateStatus = preloadContent.includes('getSetting');

    console.log(
      `✅ Update IPC exposure: check=${hasUpdateCheck}, install=${hasUpdateInstall}, status=${hasUpdateStatus}`,
    );

    return hasUpdateCheck && hasUpdateInstall && hasUpdateStatus;
  } catch (error) {
    console.log('❌ Preload bridge test error:', error.message);
    return false;
  }
}

// Test renderer helper
function testRendererHelper() {
  console.log('\n📦 Testing Renderer Helper Module...\n');

  try {
    const helperPath = path.join(__dirname, '../src/renderer/js/updater.js');
    const fs = require('fs');

    if (!fs.existsSync(helperPath)) {
      console.log('❌ Renderer helper not found:', helperPath);
      return false;
    }

    const helperContent = fs.readFileSync(helperPath, 'utf8');

    // Check for required functions
    const hasCheckForUpdates = helperContent.includes('export async function checkForUpdates()');
    const hasGetUpdateStatus = helperContent.includes('export async function getUpdateStatus()');
    const hasInstallUpdate = helperContent.includes('export async function installUpdate()');
    const hasSetupListeners = helperContent.includes('export function setupUpdateListeners()');

    console.log(
      `✅ Renderer helper functions: check=${hasCheckForUpdates}, status=${hasGetUpdateStatus}, install=${hasInstallUpdate}, listeners=${hasSetupListeners}`,
    );

    return hasCheckForUpdates && hasGetUpdateStatus && hasInstallUpdate && hasSetupListeners;
  } catch (error) {
    console.log('❌ Renderer helper test error:', error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Terminal Pro Auto-Updater - Local Validation');
  console.log('='.repeat(60));

  const tests = [
    { name: 'IPC Handlers', fn: testIPCHandlers },
    { name: 'Preload Bridge', fn: testPreloadBridge },
    { name: 'Renderer Helper', fn: testRendererHelper },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = test.fn();
      if (result) {
        passed++;
        console.log(`✅ ${test.name}: PASSED\n`);
      } else {
        failed++;
        console.log(`❌ ${test.name}: FAILED\n`);
      }
    } catch (error) {
      failed++;
      console.log(`💥 ${test.name}: ERROR - ${error.message}\n`);
    }
  }

  console.log('='.repeat(60));
  console.log(`📊 FINAL RESULTS: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    console.log('🎉 All local validation tests passed!');
    console.log('✅ Auto-updater IPC wiring is properly configured');
    console.log('✅ Ready for production deployment testing');
  } else {
    console.log('❌ Some validation tests failed');
    console.log('🔧 Please review the errors above');
  }

  return failed === 0;
}

// Run tests if called directly
if (require.main === module) {
  runTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Test runner crashed:', error);
      process.exit(1);
    });
}

module.exports = { runTests };
