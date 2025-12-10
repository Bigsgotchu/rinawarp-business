/**
 * Atomic Execution Mode Test Suite
 * Validates all components work together correctly
 */

const RiskDetector = require('./risk-detection-system.js');
const MemoryGuardrails = require('./memory-guardrails.js');
const ModeToggleSystem = require('./mode-toggle-system.js');
const SmartTaskSplitter = require('./smart-task-splitter.js');

class AtomicModeTester {
  constructor() {
    this.testResults = [];
    this.passedTests = 0;
    this.failedTests = 0;
  }

  /**
   * Run all tests
   */
  runAllTests() {
    console.log('🧪 Starting Atomic Execution Mode Test Suite...');

    this.testRiskDetectionSystem();
    this.testMemoryGuardrails();
    this.testModeToggleSystem();
    this.testSmartTaskSplitter();
    this.testIntegration();

    this._printTestSummary();
  }

  /**
   * Test Risk Detection System
   */
  testRiskDetectionSystem() {
    console.log('\n🔍 Testing Risk Detection System...');

    const testCases = [
      {
        name: 'File overwrite detection',
        operation: {
          type: 'file_write',
          mode: 'overwrite',
          id: 'test-overwrite'
        },
        expectedRisk: true
      },
      {
        name: 'Large output detection',
        operation: {
          type: 'code_generation',
          outputSize: 1500,
          id: 'test-large-output'
        },
        expectedRisk: true
      },
      {
        name: 'Safe operation',
        operation: {
          type: 'read_file',
          paths: [{ path: '/test/file.txt', validated: true }],
          id: 'test-safe'
        },
        expectedRisk: false
      }
    ];

    for (const testCase of testCases) {
      const result = RiskDetector.performRiskScan(testCase.operation);
      const isRisky = result.recommendation !== 'PROCEED';
      const passed = isRisky === testCase.expectedRisk;

      this._recordTestResult('Risk Detection', testCase.name, passed);
      console.log(`  ${passed ? '✅' : '❌'} ${testCase.name}: ${result.recommendation}`);
    }
  }

  /**
   * Test Memory Guardrails
   */
  testMemoryGuardrails() {
    console.log('\n🧠 Testing Memory Guardrails...');

    // Add some verified knowledge
    MemoryGuardrails.addVerifiedKnowledge('File paths must be validated before use', {
      source: 'system_requirement'
    });

    const testCases = [
      {
        name: 'Hallucination pattern detection',
        statement: 'I invented a new file called config.json',
        expectedValid: false
      },
      {
        name: 'Verified knowledge validation',
        statement: 'File paths must be validated before use',
        expectedValid: true
      },
      {
        name: 'Unknown statement detection',
        statement: 'The system has unlimited memory',
        expectedValid: false
      }
    ];

    for (const testCase of testCases) {
      const result = MemoryGuardrails.validateMemory(testCase.statement);
      const passed = result.isValid === testCase.expectedValid;

      this._recordTestResult('Memory Guardrails', testCase.name, passed);
      console.log(`  ${passed ? '✅' : '❌'} ${testCase.name}: ${result.isValid ? 'Valid' : 'Invalid'}`);
    }
  }

  /**
   * Test Mode Toggle System
   */
  testModeToggleSystem() {
    console.log('\n🎛️ Testing Mode Toggle System...');

    const testCases = [
      {
        name: 'Default mode is atomic',
        test: () => ModeToggleSystem.getCurrentMode() === 'atomic',
        expected: true
      },
      {
        name: 'Switch to one-shot mode',
        test: () => {
          ModeToggleSystem.enableOneShotMode();
          return ModeToggleSystem.getCurrentMode() === 'one_shot';
        },
        expected: true
      },
      {
        name: 'Switch to safe mode',
        test: () => {
          ModeToggleSystem.enableSafeMode();
          return ModeToggleSystem.getCurrentMode() === 'safe';
        },
        expected: true
      },
      {
        name: 'Mode command processing',
        test: () => {
          const result = ModeToggleSystem.processModeCommand('atomic mode on');
          return result.success && result.newMode === 'atomic';
        },
        expected: true
      }
    ];

    for (const testCase of testCases) {
      const result = testCase.test();
      const passed = result === testCase.expected;

      this._recordTestResult('Mode Toggle System', testCase.name, passed);
      console.log(`  ${passed ? '✅' : '❌'} ${testCase.name}: ${result}`);
    }

    // Reset to atomic mode
    ModeToggleSystem.enableAtomicMode();
  }

  /**
   * Test Smart Task Splitter
   */
  testSmartTaskSplitter() {
    console.log('\n🔪 Testing Smart Task Splitter...');

    const complexTask = 'Create a new configuration file and then update the existing build script to use it, also add validation checks for the new configuration format';

    const steps = SmartTaskSplitter.splitTask(complexTask);

    const testCases = [
      {
        name: 'Task splitting produces multiple steps',
        test: () => steps.length >= 2,
        expected: true
      },
      {
        name: 'Each step is atomic',
        test: () => steps.every(step => step.isAtomic),
        expected: true
      },
      {
        name: 'Steps require confirmation',
        test: () => steps.every(step => step.requiresConfirmation),
        expected: true
      }
    ];

    console.log(`  Task split into ${steps.length} steps:`);
    steps.forEach((step, index) => {
      console.log(`    ${index + 1}. ${step.description} (complexity: ${step.complexity.toFixed(2)})`);
    });

    for (const testCase of testCases) {
      const result = testCase.test();
      const passed = result === testCase.expected;

      this._recordTestResult('Smart Task Splitter', testCase.name, passed);
      console.log(`  ${passed ? '✅' : '❌'} ${testCase.name}: ${result}`);
    }
  }

  /**
   * Test Integration
   */
  testIntegration() {
    console.log('\n🔗 Testing System Integration...');

    // Test a complete workflow
    const workflowSteps = [
      'Validate file paths before execution',
      'Check for risky operations',
      'Split complex task into atomic steps',
      'Execute in atomic mode with confirmations'
    ];

    let integrationPassed = true;

    for (const step of workflowSteps) {
      const memoryCheck = MemoryGuardrails.validateMemory(step);
      if (!memoryCheck.isValid) {
        integrationPassed = false;
        console.log(`  ❌ Memory validation failed for: ${step}`);
        break;
      }

      const riskOperation = {
        type: 'workflow_step',
        description: step,
        id: `integration-${step.substring(0, 10)}`
      };

      const riskCheck = RiskDetector.isOperationSafe(riskOperation);
      if (!riskCheck) {
        integrationPassed = false;
        console.log(`  ❌ Risk detection failed for: ${step}`);
        break;
      }
    }

    const passed = integrationPassed;
    this._recordTestResult('System Integration', 'Complete workflow validation', passed);
    console.log(`  ${passed ? '✅' : '❌'} Complete workflow validation: ${passed ? 'Passed' : 'Failed'}`);
  }

  /**
   * Record test result
   * @private
   */
  _recordTestResult(component, testName, passed) {
    this.testResults.push({
      component,
      testName,
      passed,
      timestamp: new Date().toISOString()
    });

    if (passed) {
      this.passedTests++;
    } else {
      this.failedTests++;
    }
  }

  /**
   * Print test summary
   * @private
   */
  _printTestSummary() {
    console.log('\n📊 Test Summary:');
    console.log(`  Total Tests: ${this.testResults.length}`);
    console.log(`  Passed: ${this.passedTests} ✅`);
    console.log(`  Failed: ${this.failedTests} ❌`);
    console.log(`  Success Rate: ${((this.passedTests / this.testResults.length) * 100).toFixed(1)}%`);

    if (this.failedTests === 0) {
      console.log('\n🎉 All tests passed! Atomic Execution Mode is ready for production.');
    } else {
      console.log('\n⚠️  Some tests failed. Review the failures before production use.');
    }
  }
}

// Run the tests
const tester = new AtomicModeTester();
tester.runAllTests();

module.exports = AtomicModeTester;