const path = require('path');

// Test configuration for RinaWarp Terminal Pro
module.exports = {
  // Test environment settings
  testEnvironment: {
    headless: true,
    showDevTools: false,
    timeout: 30000,
    debug: false
  },

  // Test coverage settings
  coverage: {
    enabled: true,
    reporters: ['text', 'html'],
    outputDir: path.join(__dirname, 'coverage')
  },

  // Test reporting settings
  reporting: {
    outputDir: path.join(__dirname, 'test-results'),
    formats: ['json', 'html'],
    screenshotOnFailure: true
  },

  // Test data and mocks
  testData: {
    validLicenseKey: 'TEST-LICENSE-KEY-12345',
    invalidLicenseKey: 'INVALID-KEY-00000',
    testCommands: [
      'ls -la',
      'echo "Hello World"',
      'npm --version'
    ]
  },

  // Test suites configuration
  testSuites: {
    mainApplication: {
      enabled: true,
      description: 'Tests core application functionality'
    },
    terminalManagement: {
      enabled: true,
      description: 'Tests terminal creation and management'
    },
    licenseGate: {
      enabled: true,
      description: 'Tests license verification and gate functionality'
    },
    autoUpdater: {
      enabled: true,
      description: 'Tests auto-update functionality'
    },
    aiIntegration: {
      enabled: true,
      description: 'Tests AI agent integration'
    },
    voiceFunctionality: {
      enabled: true,
      description: 'Tests voice command functionality'
    },
    commandPalette: {
      enabled: true,
      description: 'Tests command palette functionality'
    },
    updateBanner: {
      enabled: true,
      description: 'Tests update banner functionality'
    },
    agentStatus: {
      enabled: true,
      description: 'Tests agent status indicator'
    }
  },

  // Test dependencies
  dependencies: {
    electron: '^29.0.0',
    chai: '^4.3.7',
    mocha: '^10.2.0',
    sinon: '^15.0.0',
    'electron-mocha': '^10.0.0'
  },

  // Test execution settings
  execution: {
    parallel: false,
    retryFailedTests: true,
    maxRetries: 2,
    bailOnFirstFailure: false
  }
};