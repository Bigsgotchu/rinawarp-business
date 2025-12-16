const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const { program } = require('commander');

// Parse command line arguments
program
  .name('run-tests')
  .description('RinaWarp Terminal Pro Test Runner')
  .option('-t, --test-type <type>', 'Type of test to run (basic, comprehensive, all)', 'all')
  .option('-d, --debug', 'Run tests in debug mode')
  .option('-c, --coverage', 'Generate test coverage report')
  .option('-r, --reporter <reporter>', 'Test reporter (spec, json, html)', 'spec')
  .option('-o, --output <directory>', 'Output directory for test results')
  .parse(process.argv);

const options = program.opts();

// Create output directory if specified
if (options.output) {
  try {
    fs.mkdirSync(options.output, { recursive: true });
    console.log(`📁 Created output directory: ${options.output}`);
  } catch (error) {
    console.error(`❌ Failed to create output directory: ${error.message}`);
    process.exit(1);
  }
}

// Set environment variables
const env = Object.create(process.env);
if (options.debug) {
  env.NODE_ENV = 'development';
  env.DEBUG = 'true';
  console.log('🔍 Running in debug mode');
}

// Determine which tests to run
const testScripts = [];

if (options.testType === 'basic' || options.testType === 'all') {
  testScripts.push({
    name: 'Basic Tests',
    script: 'test-basic.js',
    description: 'Basic application functionality tests',
  });
}

if (options.testType === 'comprehensive' || options.testType === 'all') {
  testScripts.push({
    name: 'Comprehensive Tests',
    script: 'test-comprehensive.js',
    description: 'Comprehensive functionality tests',
  });
}

if (testScripts.length === 0) {
  console.error('❌ No valid test type specified');
  program.help();
  process.exit(1);
}

// Run the tests
async function runTests() {
  console.log('🧪 RinaWarp Terminal Pro Test Runner');
  console.log('====================================');

  let allPassed = true;

  for (const testScript of testScripts) {
    console.log(`\n📋 Running ${testScript.name}`);
    console.log(`   Description: ${testScript.description}`);
    console.log(`   Script: ${testScript.script}`);

    try {
      const result = await runTestScript(testScript.script, env);
      if (!result.success) {
        allPassed = false;
      }
    } catch (error) {
      console.error(`❌ Failed to run ${testScript.name}: ${error.message}`);
      allPassed = false;
    }
  }

  // Final summary
  console.log('\n====================================');
  console.log('🏁 Test Runner Summary');
  console.log('====================================');

  if (allPassed) {
    console.log('✅ All tests completed successfully!');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed');
    process.exit(1);
  }
}

function runTestScript(scriptName, env) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const testProcess = spawn('node', [scriptName], {
      stdio: 'inherit',
      env: env,
      cwd: __dirname,
    });

    testProcess.on('close', (code) => {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`⏱️  ${scriptName} completed in ${duration} seconds`);

      if (code === 0) {
        console.log(`✅ ${scriptName}: PASSED`);
        resolve({ success: true, code });
      } else {
        console.log(`❌ ${scriptName}: FAILED with exit code ${code}`);
        resolve({ success: false, code });
      }
    });

    testProcess.on('error', (error) => {
      console.error(`❌ Failed to start test process: ${error.message}`);
      reject(error);
    });
  });
}

// Start the test runner
runTests().catch((error) => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});
