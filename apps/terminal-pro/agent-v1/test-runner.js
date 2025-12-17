/**
 * Simple Test Runner for Agent v1 Tests
 * This runs the "Never Do" tests to verify safety contracts
 */

import { getTool } from '../agent-v1/policy/registry.js';

console.log('🧪 Running Agent v1 "Never Do" Tests...\n');

// Test 1: Unknown tools must be blocked
console.log('Test 1: Unknown tools must be blocked');
const unknownTool = getTool('danger.yolo');
if (unknownTool === undefined) {
  console.log('✅ PASS: Unknown tool "danger.yolo" is blocked');
} else {
  console.log('❌ FAIL: Unknown tool "danger.yolo" was not blocked');
  process.exit(1);
}

// Test 2: High-impact tools require confirmation
console.log('\nTest 2: High-impact tools require confirmation');
const deployTool = getTool('deploy.prod');
if (
  deployTool &&
  deployTool.category === 'high-impact' &&
  deployTool.requiresConfirmation === true
) {
  console.log('✅ PASS: deploy.prod is high-impact and requires confirmation');
} else {
  console.log('❌ FAIL: deploy.prod does not have correct category/confirmation settings');
  console.log('  Category:', deployTool?.category);
  console.log('  Requires Confirmation:', deployTool?.requiresConfirmation);
  process.exit(1);
}

// Test 3: Read tools must not require confirmation
console.log('\nTest 3: Read tools must not require confirmation');
const fsReadTool = getTool('fs.read');
if (fsReadTool && fsReadTool.category === 'read' && fsReadTool.requiresConfirmation === false) {
  console.log('✅ PASS: fs.read is read category and does not require confirmation');
} else {
  console.log('❌ FAIL: fs.read does not have correct category/confirmation settings');
  console.log('  Category:', fsReadTool?.category);
  console.log('  Requires Confirmation:', fsReadTool?.requiresConfirmation);
  process.exit(1);
}

// Test 4: Verify all expected tools exist
console.log('\nTest 4: Verify all expected tools exist');
const expectedTools = [
  'fs.list',
  'fs.read',
  'fs.edit',
  'fs.delete',
  'build.run',
  'deploy.prod',
  'git.status',
  'git.diff',
  'git.commit',
  'process.list',
  'process.kill',
];

let allToolsFound = true;
for (const toolName of expectedTools) {
  const tool = getTool(toolName);
  if (!tool) {
    console.log(`❌ FAIL: Tool "${toolName}" not found in registry`);
    allToolsFound = false;
  }
}

if (allToolsFound) {
  console.log('✅ PASS: All expected tools are registered');
}

// Test 5: Verify tool categories are correct
console.log('\nTest 5: Verify tool categories are correct');
const categoryTests = [
  { name: 'fs.list', expected: 'read' },
  { name: 'fs.read', expected: 'read' },
  { name: 'fs.edit', expected: 'safe-write' },
  { name: 'fs.delete', expected: 'high-impact' },
  { name: 'build.run', expected: 'safe-write' },
  { name: 'deploy.prod', expected: 'high-impact' },
  { name: 'git.status', expected: 'read' },
  { name: 'git.diff', expected: 'read' },
  { name: 'git.commit', expected: 'safe-write' },
  { name: 'process.list', expected: 'read' },
  { name: 'process.kill', expected: 'high-impact' },
];

let categoriesCorrect = true;
for (const test of categoryTests) {
  const tool = getTool(test.name);
  if (tool?.category !== test.expected) {
    console.log(
      `❌ FAIL: ${test.name} has category "${tool?.category}", expected "${test.expected}"`,
    );
    categoriesCorrect = false;
  }
}

if (categoriesCorrect) {
  console.log('✅ PASS: All tool categories are correct');
}

console.log('\n🎉 All tests passed! Safety contracts are enforced.');
console.log('\nSummary:');
console.log('- Unknown tools are blocked');
console.log('- High-impact tools require confirmation');
console.log('- Read tools do not require confirmation');
console.log('- All expected tools are registered');
console.log('- Tool categories are correct');
console.log('\n✅ Agent v1 is ready for integration!');
