#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { program } = require('commander');

// Parse command line arguments
program
  .name('generate-test-report')
  .description('Generate HTML test report from test results')
  .option('-i, --input <file>', 'Input JSON file with test results')
  .option('-o, --output <file>', 'Output HTML file (default: test-report.html)')
  .option('-t, --template <file>', 'Custom HTML template file')
  .parse(process.argv);

const options = program.opts();

// Validate input
if (!options.input) {
  console.error('❌ Error: Input file is required');
  program.help();
  process.exit(1);
}

// Set default output file
const outputFile = options.output || path.join(__dirname, 'test-report.html');
const templateFile = options.template || path.join(__dirname, 'test-report-template.html');

// Read test results
let testResults;
try {
  const resultsContent = fs.readFileSync(options.input, 'utf-8');
  testResults = JSON.parse(resultsContent);
  console.log('✅ Successfully read test results from', options.input);
} catch (error) {
  console.error('❌ Failed to read test results:', error.message);
  process.exit(1);
}

// Read template
let templateContent;
try {
  templateContent = fs.readFileSync(templateFile, 'utf-8');
  console.log('✅ Successfully loaded template from', templateFile);
} catch (error) {
  console.error('❌ Failed to read template:', error.message);
  process.exit(1);
}

// Generate report data
function generateReportData() {
  const reportDate = new Date().toISOString().split('T')[0];
  const reportTime = new Date().toLocaleTimeString();
  const reportTimestamp = new Date().toLocaleString();

  // Calculate summary
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  const testSuites = [];

  // Group tests by suite
  const testsBySuite = {};

  testResults.tests.forEach((test) => {
    if (!testsBySuite[test.test]) {
      testsBySuite[test.test] = [];
    }
    testsBySuite[test.test].push({
      name: test.test,
      passed: test.passed,
      message: test.message,
      error: test.passed ? null : test.message,
    });
  });

  // Create test suites
  for (const [suiteName, tests] of Object.entries(testsBySuite)) {
    const allPassed = tests.every((test) => test.passed);
    testSuites.push({
      name: suiteName,
      allPassed,
      tests,
    });

    tests.forEach((test) => {
      totalTests++;
      if (test.passed) passedTests++;
    });
  }

  failedTests = totalTests - passedTests;
  const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) + '%' : '0%';

  return {
    reportInfo: {
      date: reportDate,
      duration: '00:02:45', // This would be calculated in a real implementation
      environment: 'Development',
      version: '1.0.0',
      timestamp: reportTimestamp,
    },
    summary: {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      successRate: successRate,
    },
    testSuites: testSuites,
  };
}

// Generate the HTML report
function generateHtmlReport() {
  const reportData = generateReportData();

  // Replace placeholders in template
  let htmlReport = templateContent;

  // Replace metadata
  htmlReport = htmlReport.replace(
    'id="report-date">2025-12-11',
    `id="report-date">${reportData.reportInfo.date}`,
  );
  htmlReport = htmlReport.replace(
    'id="report-duration">00:00:00',
    `id="report-duration">${reportData.reportInfo.duration}`,
  );
  htmlReport = htmlReport.replace(
    'id="report-environment">Development',
    `id="report-environment">${reportData.reportInfo.environment}`,
  );
  htmlReport = htmlReport.replace(
    'id="report-version">1.0.0',
    `id="report-version">${reportData.reportInfo.version}`,
  );
  htmlReport = htmlReport.replace(
    'id="footer-timestamp">2025-12-11 09:30:00',
    `id="footer-timestamp">${reportData.reportInfo.timestamp}`,
  );

  // Replace summary
  htmlReport = htmlReport.replace(
    'id="total-tests">0',
    `id="total-tests">${reportData.summary.total}`,
  );
  htmlReport = htmlReport.replace(
    'id="passed-tests">0',
    `id="passed-tests">${reportData.summary.passed}`,
  );
  htmlReport = htmlReport.replace(
    'id="failed-tests">0',
    `id="failed-tests">${reportData.summary.failed}`,
  );
  htmlReport = htmlReport.replace(
    'id="success-rate">0%',
    `id="success-rate">${reportData.summary.successRate}`,
  );
  htmlReport = htmlReport.replace(
    'style="width: 0%"',
    `style="width: ${reportData.summary.successRate}"`,
  );

  // Generate test suites HTML
  let testSuitesHtml = '';

  reportData.testSuites.forEach((suite) => {
    testSuitesHtml += `
      <div class="test-suite">
        <div class="test-suite-header">
          <div>${suite.name}</div>
          <div class="status ${suite.allPassed ? 'passed' : 'failed'}">${suite.allPassed ? 'PASSED' : 'FAILED'}</div>
        </div>
        <div class="test-suite-body">
    `;

    suite.tests.forEach((test) => {
      testSuitesHtml += `
        <div class="test-case ${test.passed ? 'passed' : 'failed'}">
          <div class="test-case-header">
            <div class="test-case-name">${test.name}</div>
            <div class="status ${test.passed ? 'passed' : 'failed'}">${test.passed ? 'PASS' : 'FAIL'}</div>
          </div>
          <div class="test-case-details">${test.message}</div>
      `;

      if (!test.passed && test.error) {
        testSuitesHtml += `<div class="test-case-error">${test.error}</div>`;
      }

      testSuitesHtml += '</div>';
    });

    testSuitesHtml += `
        </div>
      </div>
    `;
  });

  // Replace test results container
  htmlReport = htmlReport.replace(
    '<div id="test-results-container">',
    `<div id="test-results-container">${testSuitesHtml}`,
  );

  return htmlReport;
}

// Write the HTML report
function writeHtmlReport(htmlContent) {
  try {
    fs.writeFileSync(outputFile, htmlContent, 'utf-8');
    console.log('✅ Successfully generated HTML report:', outputFile);
    console.log('📊 Report Summary:');
    console.log(`   Total Tests: ${testResults.tests.length}`);
    console.log(`   Passed: ${testResults.passed || 0}`);
    console.log(`   Failed: ${testResults.failed || 0}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to write HTML report:', error.message);
    return false;
  }
}

// Main execution
function main() {
  console.log('📊 Generating Test Report');
  console.log('========================');

  try {
    const htmlReport = generateHtmlReport();
    const success = writeHtmlReport(htmlReport);

    if (success) {
      console.log('\n🎉 Report generation completed successfully!');
      console.log(`📁 Output file: ${outputFile}`);
      console.log('💡 You can open this file in any web browser to view the report.');
    } else {
      console.log('\n❌ Report generation failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Report generation error:', error);
    process.exit(1);
  }
}

// Run the report generator
main();
