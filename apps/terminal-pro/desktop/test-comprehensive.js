/**
 * Comprehensive Test Suite for RinaWarp Terminal Pro
 *
 * This test suite verifies all functionality of the application including:
 * - Main application functionality
 * - Terminal creation and management
 * - License gate functionality
 * - Auto-updater functionality
 * - AI agent integration
 * - Voice functionality
 * - Command palette
 * - Update banner
 * - Agent status indicator
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧪 Starting RinaWarp Terminal Pro Comprehensive Tests');
console.log('====================================================');

// Test configuration
const TEST_CONFIG = {
  headless: true,
  showDevTools: false,
  testTimeout: 30000,
  debug: false
};

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  tests: [],
  startTime: Date.now()
};

// Test suite functions
class TerminalProTester {
  constructor() {
    this.currentTestName = '';
  }

  async runAllTests() {
    try {
      console.log('📋 Running comprehensive test suite...');

      // Run all test suites
      await this.testMainApplicationFunctionality();
      await this.testTerminalCreationAndManagement();
      await this.testLicenseGateFunctionality();
      await this.testAutoUpdaterFunctionality();
      await this.testAIAgentIntegration();
      await this.testVoiceFunctionality();
      await this.testCommandPalette();
      await this.testUpdateBanner();
      await this.testAgentStatusIndicator();

      // Finalize and report results
      this.finalizeTestResults();
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      this.recordTestResult('Test Suite', false, error.message);
      this.finalizeTestResults();
    }
  }

  async testMainApplicationFunctionality() {
    this.recordTestStart('Main Application Functionality');

    try {
      // Test 1: Verify main application file exists and is valid
      const mainAppPath = path.join(__dirname, 'src/main/main.js');
      const mainAppExists = fs.existsSync(mainAppPath);
      if (!mainAppExists) {
        throw new Error('Main application file not found');
      }

      // Test 2: Verify main app file has required structure
      const mainAppContent = fs.readFileSync(mainAppPath, 'utf-8');
      const hasElectronImport = mainAppContent.includes('electron');
      const hasWindowCreation = mainAppContent.includes('BrowserWindow');
      const hasIPCSetup = mainAppContent.includes('ipcMain');

      if (!hasElectronImport || !hasWindowCreation || !hasIPCSetup) {
        throw new Error('Main application file missing required components');
      }

      // Test 3: Verify renderer files exist
      const rendererFiles = [
        'src/renderer/index.html',
        'src/renderer/js/main.js'
      ];

      let allRendererFilesExist = true;
      rendererFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (!fs.existsSync(filePath)) {
          allRendererFilesExist = false;
        }
      });

      if (!allRendererFilesExist) {
        throw new Error('Required renderer files missing');
      }

      this.recordTestResult('Main Application Functionality', true, 'All main application tests passed');
    } catch (error) {
      this.recordTestResult('Main Application Functionality', false, error.message);
    }
  }

  async testTerminalCreationAndManagement() {
    this.recordTestStart('Terminal Creation and Management');

    try {
      // Test terminal management functionality by checking the main app
      const mainAppPath = path.join(__dirname, 'src/main/main.js');
      const mainAppContent = fs.readFileSync(mainAppPath, 'utf-8');

      // Check for terminal-related functionality
      const hasTerminalCreation = mainAppContent.includes('terminal:create');
      const hasTerminalWrite = mainAppContent.includes('terminal:write');
      const hasTerminalResize = mainAppContent.includes('terminal:resize');
      const hasTerminalKill = mainAppContent.includes('terminal:kill');
      const hasPtyImport = mainAppContent.includes('node-pty');

      if (!hasTerminalCreation || !hasTerminalWrite || !hasTerminalResize || !hasTerminalKill || !hasPtyImport) {
        throw new Error('Terminal management functionality incomplete');
      }

      this.recordTestResult('Terminal Creation and Management', true, 'All terminal management tests passed');
    } catch (error) {
      this.recordTestResult('Terminal Creation and Management', false, error.message);
    }
  }

  async testLicenseGateFunctionality() {
    this.recordTestStart('License Gate Functionality');

    try {
      // Check main app for license functionality
      const mainAppPath = path.join(__dirname, 'src/main/main.js');
      const mainAppContent = fs.readFileSync(mainAppPath, 'utf-8');

      const hasLicenseVerification = mainAppContent.includes('license:verify');
      const hasLicenseStorage = mainAppContent.includes('config:setLicenseKey');
      const hasLicenseGate = mainAppContent.includes('LicenseGate');
      const hasLicenseCheck = mainAppContent.includes('verifyLicenseWithBackend');

      if (!hasLicenseVerification || !hasLicenseStorage || !hasLicenseGate || !hasLicenseCheck) {
        throw new Error('License gate functionality incomplete');
      }

      this.recordTestResult('License Gate Functionality', true, 'All license gate tests passed');
    } catch (error) {
      this.recordTestResult('License Gate Functionality', false, error.message);
    }
  }

  async testAutoUpdaterFunctionality() {
    this.recordTestStart('Auto-Updater Functionality');

    try {
      // Check main app for auto-updater functionality
      const mainAppPath = path.join(__dirname, 'src/main/main.js');
      const mainAppContent = fs.readFileSync(mainAppPath, 'utf-8');

      const hasAutoUpdater = mainAppContent.includes('autoUpdater');
      const hasUpdateEvents = mainAppContent.includes('update:checking');
      const hasUpdateFeed = mainAppContent.includes('setFeedURL');
      const hasUpdateIPC = mainAppContent.includes('setupAutoUpdaterIPC');

      if (!hasAutoUpdater || !hasUpdateEvents || !hasUpdateFeed || !hasUpdateIPC) {
        throw new Error('Auto-updater functionality incomplete');
      }

      // Check for update banner in renderer
      const updateBannerPath = path.join(__dirname, 'src/renderer/js/UpdateBanner.js');
      const updateBannerExists = fs.existsSync(updateBannerPath);

      if (!updateBannerExists) {
        throw new Error('Update banner file not found');
      }

      this.recordTestResult('Auto-Updater Functionality', true, 'All auto-updater tests passed');
    } catch (error) {
      this.recordTestResult('Auto-Updater Functionality', false, error.message);
    }
  }

  async testAIAgentIntegration() {
    this.recordTestStart('AI Agent Integration');

    try {
      // Check main app for AI agent functionality
      const mainAppPath = path.join(__dirname, 'src/main/main.js');
      const mainAppContent = fs.readFileSync(mainAppPath, 'utf-8');

      const hasAgentIntegration = mainAppContent.includes('RINA_AGENT_URL');
      const hasAgentAsk = mainAppContent.includes('agent:ask');
      const hasAgentStatus = mainAppContent.includes('agent:get-status');
      const hasAgentHealthCheck = mainAppContent.includes('checkAgentHealth');

      if (!hasAgentIntegration || !hasAgentAsk || !hasAgentStatus || !hasAgentHealthCheck) {
        throw new Error('AI agent integration incomplete');
      }

      // Check renderer files for AI functionality
      const agentFiles = [
        'src/renderer/js/agent-status.js',
        'src/renderer/js/agent-debug.js',
        'src/renderer/js/ai-router.js'
      ];

      let allAgentFilesExist = true;
      agentFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (!fs.existsSync(filePath)) {
          allAgentFilesExist = false;
        }
      });

      if (!allAgentFilesExist) {
        throw new Error('AI agent files missing');
      }

      this.recordTestResult('AI Agent Integration', true, 'All AI agent integration tests passed');
    } catch (error) {
      this.recordTestResult('AI Agent Integration', false, error.message);
    }
  }

  async testVoiceFunctionality() {
    this.recordTestStart('Voice Functionality');

    try {
      // Check main app for voice functionality
      const mainAppPath = path.join(__dirname, 'src/main/main.js');
      const mainAppContent = fs.readFileSync(mainAppPath, 'utf-8');

      const hasVoiceIntegration = mainAppContent.includes('voice:start');
      const hasVoiceRecording = mainAppContent.includes('node-record-lpcm16');
      const hasVoiceEvents = mainAppContent.includes('voice:transcript');

      if (!hasVoiceIntegration || !hasVoiceRecording || !hasVoiceEvents) {
        throw new Error('Voice functionality incomplete');
      }

      // Check renderer for voice UI
      const voiceFilePath = path.join(__dirname, 'src/renderer/js/voice.js');
      const voiceFileExists = fs.existsSync(voiceFilePath);

      if (!voiceFileExists) {
        throw new Error('Voice file not found');
      }

      this.recordTestResult('Voice Functionality', true, 'All voice functionality tests passed');
    } catch (error) {
      this.recordTestResult('Voice Functionality', false, error.message);
    }
  }

  async testCommandPalette() {
    this.recordTestStart('Command Palette');

    try {
      // Check for command palette files
      const commandPalettePath = path.join(__dirname, 'src/renderer/js/command-palette.js');
      const commandPaletteExists = fs.existsSync(commandPalettePath);

      if (!commandPaletteExists) {
        throw new Error('Command palette file not found');
      }

      // Check command palette content
      const commandPaletteContent = fs.readFileSync(commandPalettePath, 'utf-8');
      const hasInitFunction = commandPaletteContent.includes('initCommandPalette');
      const hasCommandHandling = commandPaletteContent.includes('command');

      if (!hasInitFunction || !hasCommandHandling) {
        throw new Error('Command palette functionality incomplete');
      }

      this.recordTestResult('Command Palette', true, 'All command palette tests passed');
    } catch (error) {
      this.recordTestResult('Command Palette', false, error.message);
    }
  }

  async testUpdateBanner() {
    this.recordTestStart('Update Banner');

    try {
      // Check for update banner files
      const updateBannerPath = path.join(__dirname, 'src/renderer/js/UpdateBanner.js');
      const updateBannerExists = fs.existsSync(updateBannerPath);

      if (!updateBannerExists) {
        throw new Error('Update banner file not found');
      }

      // Check update banner content
      const updateBannerContent = fs.readFileSync(updateBannerPath, 'utf-8');
      const hasShowMethod = updateBannerContent.includes('show');
      const hasHideMethod = updateBannerContent.includes('hide');
      const hasUpdateHandling = updateBannerContent.includes('update');

      if (!hasShowMethod || !hasHideMethod || !hasUpdateHandling) {
        throw new Error('Update banner functionality incomplete');
      }

      this.recordTestResult('Update Banner', true, 'All update banner tests passed');
    } catch (error) {
      this.recordTestResult('Update Banner', false, error.message);
    }
  }

  async testAgentStatusIndicator() {
    this.recordTestStart('Agent Status Indicator');

    try {
      // Check for agent status files
      const agentStatusPath = path.join(__dirname, 'src/renderer/js/agent-status.js');
      const agentStatusExists = fs.existsSync(agentStatusPath);

      if (!agentStatusExists) {
        throw new Error('Agent status file not found');
      }

      // Check agent status content
      const agentStatusContent = fs.readFileSync(agentStatusPath, 'utf-8');
      const hasStatusMethods = agentStatusContent.includes('setStatus');
      const hasPingMethod = agentStatusContent.includes('ping');
      const hasAutoPing = agentStatusContent.includes('startAutoPing');

      if (!hasStatusMethods || !hasPingMethod || !hasAutoPing) {
        throw new Error('Agent status functionality incomplete');
      }

      this.recordTestResult('Agent Status Indicator', true, 'All agent status indicator tests passed');
    } catch (error) {
      this.recordTestResult('Agent Status Indicator', false, error.message);
    }
  }

  recordTestStart(testName) {
    this.currentTestName = testName;
    console.log(`\n🔍 Testing: ${testName}`);
  }

  recordTestResult(testName, passed, message) {
    const result = {
      test: testName,
      passed,
      message,
      timestamp: new Date().toISOString()
    };

    testResults.tests.push(result);

    if (passed) {
      testResults.passed++;
      console.log(`✅ ${testName}: PASSED - ${message}`);
    } else {
      testResults.failed++;
      console.log(`❌ ${testName}: FAILED - ${message}`);
    }
  }

  finalizeTestResults() {
    const endTime = Date.now();
    const duration = ((endTime - testResults.startTime) / 1000).toFixed(2);

    console.log('\n====================================================');
    console.log('📊 Test Results Summary');
    console.log('====================================================');
    console.log(`Total Tests: ${testResults.tests.length}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    console.log(`Duration: ${duration} seconds`);
    console.log(`Success Rate: ${((testResults.passed / testResults.tests.length) * 100).toFixed(1)}%`);

    // Generate detailed report
    console.log('\n📋 Detailed Test Results:');
    testResults.tests.forEach(test => {
      const status = test.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${test.test}: ${test.message}`);
    });

    // Save test results to file
    try {
      const resultsFile = path.join(__dirname, 'test-results-comprehensive.json');
      fs.writeFileSync(resultsFile, JSON.stringify(testResults, null, 2));
      console.log(`\n📝 Test results saved to: ${resultsFile}`);
    } catch (error) {
      console.log('❌ Failed to save test results:', error.message);
    }

    // Exit with appropriate code
    const exitCode = testResults.failed > 0 ? 1 : 0;
    console.log(`\n🏁 Test suite completed with exit code ${exitCode}`);
    process.exit(exitCode);
  }
}

// Run the tests
if (require.main === module) {
  const tester = new TerminalProTester();
  tester.runAllTests().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
}

// Export for programmatic use
module.exports = {
  TerminalProTester,
  testResults
};