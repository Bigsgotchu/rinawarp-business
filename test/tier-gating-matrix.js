#!/usr/bin/env node

/**
 * Tier Gating Matrix Validation
 * Tests all combinations of Terminal Pro and Agent Pro tiers
 * 
 * Run: node test/tier-gating-matrix.js
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Colors for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  log(`🎚️ ${title}`, 'blue');
  console.log('='.repeat(80));
}

function logMatrix(testName, expected, actual, passed) {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const color = passed ? 'green' : 'red';
  log(`${status} ${testName}`, color);
  
  if (!passed) {
    console.log(`   Expected: Terminal Pro=${expected.terminalPro}, Agent Pro=${expected.agentPro}`);
    console.log(`   Actual:   Terminal Pro=${actual.terminalPro}, Agent Pro=${actual.agentPro}`);
  } else {
    console.log(`   Terminal Pro=${actual.terminalPro}, Agent Pro=${actual.agentPro}`);
  }
}

/**
 * Feature Gate Implementation (from the actual codebase)
 */
class FeatureGate {
  constructor(entitlements) {
    this.entitlements = entitlements;
  }

  hasFeature(featureName) {
    const feature = FEATURES[featureName];
    if (!feature) {
      console.warn(`[FeatureGate] Unknown feature: ${featureName}`);
      return false;
    }

    return this.isFeatureAccessible(feature);
  }

  isFeatureAccessible(feature) {
    switch (feature.tier) {
      case 'free':
        return true; // Always accessible

      case 'terminal-pro':
        return this.entitlements.terminal_pro_lifetime === true || 
               this.entitlements.agent_pro_status === 'active';

      case 'agent-pro':
        return this.entitlements.agent_pro_status === 'active';

      default:
        return false;
    }
  }

  shouldShowUpgradePrompt() {
    return this.entitlements.terminal_pro_lifetime !== true && 
           this.entitlements.agent_pro_status !== 'active';
  }

  getUpgradeRecommendation() {
    if (this.entitlements.terminal_pro_lifetime !== true && 
        this.entitlements.agent_pro_status !== 'active') {
      return 'terminal-pro-lifetime';
    }
    if (this.entitlements.agent_pro_status !== 'active') {
      return 'agent-pro-subscription';
    }
    return null;
  }
}

// Feature definitions from the actual codebase
const FEATURES = {
  // Free Tier Features
  TERMINAL_BASIC: {
    name: 'Terminal Basic',
    tier: 'free',
    description: 'Basic terminal functionality'
  },
  SHELL_EXECUTION: {
    name: 'Shell Execution',
    tier: 'free',
    description: 'Run shell commands'
  },
  GIT_STATUS: {
    name: 'Git Status',
    tier: 'free',
    description: 'View git repository status'
  },
  PLAN_NEXT_STEP_BASIC: {
    name: 'Basic Planning',
    tier: 'free',
    description: 'Basic next step heuristics (limited context)'
  },

  // Terminal Pro Features
  PLAN_NEXT_STEP_ADVANCED: {
    name: 'Advanced Planning',
    tier: 'terminal-pro',
    description: 'Enhanced heuristics with full context awareness'
  },
  GHOST_TEXT_SUGGESTIONS: {
    name: 'Ghost Text Suggestions',
    tier: 'terminal-pro',
    description: 'Inline command suggestions with Tab-accept'
  },
  MEMORY_PERSISTENCE: {
    name: 'Memory Persistence',
    tier: 'terminal-pro',
    description: 'Remember preferences and sessions locally'
  },

  // Agent Pro Features
  TOOL_REGISTRY: {
    name: 'Tool Registry',
    tier: 'agent-pro',
    description: 'Permission-based tool access (fs, process, network)'
  },
  MULTI_STEP_PLANNING: {
    name: 'Multi-Step Planning',
    tier: 'agent-pro',
    description: 'Complex workflow planning and execution'
  },
  CRASH_SUPERVISION: {
    name: 'Crash Supervision',
    tier: 'agent-pro',
    description: 'Agent health monitoring and recovery'
  },
  ENHANCED_MEMORY: {
    name: 'Enhanced Memory',
    tier: 'agent-pro',
    description: 'Advanced memory patterns and learning'
  },
  FUTURE_AI_LOOP: {
    name: 'AI Reasoning Loop',
    tier: 'agent-pro',
    description: 'Future AI-powered reasoning capabilities'
  }
};

/**
 * Test Matrix - All possible tier combinations
 */
const TEST_MATRIX = [
  {
    name: 'Free Tier User',
    entitlements: {
      terminal_pro_lifetime: false,
      agent_pro_status: 'none'
    },
    expected: {
      terminalPro: false,
      agentPro: false,
      freeFeatures: ['TERMINAL_BASIC', 'SHELL_EXECUTION', 'GIT_STATUS', 'PLAN_NEXT_STEP_BASIC'],
      terminalProFeatures: [],
      agentProFeatures: [],
      shouldShowUpgrade: true,
      upgradeTo: 'terminal-pro-lifetime'
    }
  },
  {
    name: 'Terminal Pro Lifetime',
    entitlements: {
      terminal_pro_lifetime: true,
      agent_pro_status: 'none'
    },
    expected: {
      terminalPro: true,
      agentPro: false,
      freeFeatures: ['TERMINAL_BASIC', 'SHELL_EXECUTION', 'GIT_STATUS', 'PLAN_NEXT_STEP_BASIC'],
      terminalProFeatures: ['PLAN_NEXT_STEP_ADVANCED', 'GHOST_TEXT_SUGGESTIONS', 'MEMORY_PERSISTENCE'],
      agentProFeatures: [],
      shouldShowUpgrade: true,
      upgradeTo: 'agent-pro-subscription'
    }
  },
  {
    name: 'Agent Pro Active Subscription',
    entitlements: {
      terminal_pro_lifetime: false,
      agent_pro_status: 'active'
    },
    expected: {
      terminalPro: true, // Agent Pro includes Terminal Pro features
      agentPro: true,
      freeFeatures: ['TERMINAL_BASIC', 'SHELL_EXECUTION', 'GIT_STATUS', 'PLAN_NEXT_STEP_BASIC'],
      terminalProFeatures: ['PLAN_NEXT_STEP_ADVANCED', 'GHOST_TEXT_SUGGESTIONS', 'MEMORY_PERSISTENCE'],
      agentProFeatures: ['TOOL_REGISTRY', 'MULTI_STEP_PLANNING', 'CRASH_SUPERVISION', 'ENHANCED_MEMORY', 'FUTURE_AI_LOOP'],
      shouldShowUpgrade: false,
      upgradeTo: null
    }
  },
  {
    name: 'Both Terminal Pro and Agent Pro',
    entitlements: {
      terminal_pro_lifetime: true,
      agent_pro_status: 'active'
    },
    expected: {
      terminalPro: true,
      agentPro: true,
      freeFeatures: ['TERMINAL_BASIC', 'SHELL_EXECUTION', 'GIT_STATUS', 'PLAN_NEXT_STEP_BASIC'],
      terminalProFeatures: ['PLAN_NEXT_STEP_ADVANCED', 'GHOST_TEXT_SUGGESTIONS', 'MEMORY_PERSISTENCE'],
      agentProFeatures: ['TOOL_REGISTRY', 'MULTI_STEP_PLANNING', 'CRASH_SUPERVISION', 'ENHANCED_MEMORY', 'FUTURE_AI_LOOP'],
      shouldShowUpgrade: false,
      upgradeTo: null
    }
  },
  {
    name: 'Agent Pro Past Due (Grace Period)',
    entitlements: {
      terminal_pro_lifetime: false,
      agent_pro_status: 'past_due',
      grace_period_end: Date.now() + (2 * 24 * 60 * 60 * 1000) // 2 days from now
    },
    expected: {
      terminalPro: true, // During grace period, maintain access
      agentPro: true,
      freeFeatures: ['TERMINAL_BASIC', 'SHELL_EXECUTION', 'GIT_STATUS', 'PLAN_NEXT_STEP_BASIC'],
      terminalProFeatures: ['PLAN_NEXT_STEP_ADVANCED', 'GHOST_TEXT_SUGGESTIONS', 'MEMORY_PERSISTENCE'],
      agentProFeatures: ['TOOL_REGISTRY', 'MULTI_STEP_PLANNING', 'CRASH_SUPERVISION', 'ENHANCED_MEMORY', 'FUTURE_AI_LOOP'],
      shouldShowUpgrade: false,
      upgradeTo: null,
      graceBehavior: true
    }
  },
  {
    name: 'Agent Pro Cancelled (Period Active)',
    entitlements: {
      terminal_pro_lifetime: false,
      agent_pro_status: 'active', // Still active until period end
      current_period_end: Date.now() + (5 * 24 * 60 * 60 * 1000), // 5 days from now
      cancelled_at: Date.now()
    },
    expected: {
      terminalPro: true,
      agentPro: true,
      freeFeatures: ['TERMINAL_BASIC', 'SHELL_EXECUTION', 'GIT_STATUS', 'PLAN_NEXT_STEP_BASIC'],
      terminalProFeatures: ['PLAN_NEXT_STEP_ADVANCED', 'GHOST_TEXT_SUGGESTIONS', 'MEMORY_PERSISTENCE'],
      agentProFeatures: ['TOOL_REGISTRY', 'MULTI_STEP_PLANNING', 'CRASH_SUPERVISION', 'ENHANCED_MEMORY', 'FUTURE_AI_LOOP'],
      shouldShowUpgrade: false,
      upgradeTo: null,
      periodActive: true
    }
  },
  {
    name: 'Agent Pro Period Ended (Downgraded)',
    entitlements: {
      terminal_pro_lifetime: false,
      agent_pro_status: 'cancelled',
      current_period_end: Date.now() - (1 * 24 * 60 * 60 * 1000) // 1 day ago
    },
    expected: {
      terminalPro: false,
      agentPro: false,
      freeFeatures: ['TERMINAL_BASIC', 'SHELL_EXECUTION', 'GIT_STATUS', 'PLAN_NEXT_STEP_BASIC'],
      terminalProFeatures: [],
      agentProFeatures: [],
      shouldShowUpgrade: true,
      upgradeTo: 'agent-pro-subscription',
      downgraded: true
    }
  }
];

/**
 * Test Individual Tier Combinations
 */
function testTierCombination(testCase) {
  logSection(`Testing: ${testCase.name}`);
  
  const featureGate = new FeatureGate(testCase.entitlements);
  const results = [];
  
  // Test terminal pro access
  const hasTerminalPro = featureGate.hasFeature('PLAN_NEXT_STEP_ADVANCED');
  const actualTerminalPro = hasTerminalPro;
  const expectedTerminalPro = testCase.expected.terminalPro;
  
  logMatrix(
    'Terminal Pro Access',
    { terminalPro: expectedTerminalPro, agentPro: false },
    { terminalPro: actualTerminalPro, agentPro: false },
    actualTerminalPro === expectedTerminalPro
  );
  results.push(actualTerminalPro === expectedTerminalPro);
  
  // Test agent pro access
  const hasAgentPro = featureGate.hasFeature('TOOL_REGISTRY');
  const actualAgentPro = hasAgentPro;
  const expectedAgentPro = testCase.expected.agentPro;
  
  logMatrix(
    'Agent Pro Access',
    { terminalPro: false, agentPro: expectedAgentPro },
    { terminalPro: false, agentPro: actualAgentPro },
    actualAgentPro === expectedAgentPro
  );
  results.push(actualAgentPro === expectedAgentPro);
  
  // Test free features (should always be accessible)
  const freeFeatureTests = testCase.expected.freeFeatures.map(featureName => {
    const hasFeature = featureGate.hasFeature(featureName);
    logTest(`Free Feature: ${featureName}`, hasFeature, hasFeature ? '✅ Accessible' : '❌ Not accessible');
    return hasFeature;
  });
  results.push(...freeFeatureTests);
  
  // Test terminal pro features
  const terminalFeatureTests = testCase.expected.terminalProFeatures.map(featureName => {
    const hasFeature = featureGate.hasFeature(featureName);
    const shouldHave = testCase.expected.terminalPro;
    logTest(`Terminal Pro Feature: ${featureName}`, hasFeature === shouldHave, 
            hasFeature ? '✅ Accessible' : '❌ Not accessible');
    return hasFeature === shouldHave;
  });
  results.push(...terminalFeatureTests);
  
  // Test agent pro features
  const agentFeatureTests = testCase.expected.agentProFeatures.map(featureName => {
    const hasFeature = featureGate.hasFeature(featureName);
    const shouldHave = testCase.expected.agentPro;
    logTest(`Agent Pro Feature: ${featureName}`, hasFeature === shouldHave,
            hasFeature ? '✅ Accessible' : '❌ Not accessible');
    return hasFeature === shouldHave;
  });
  results.push(...agentFeatureTests);
  
  // Test upgrade prompt logic
  const shouldShowUpgrade = featureGate.shouldShowUpgradePrompt();
  logTest(
    'Upgrade Prompt Logic',
    shouldShowUpgrade === testCase.expected.shouldShowUpgrade,
    shouldShowUpgrade ? '✅ Should show upgrade' : '✅ Should not show upgrade'
  );
  results.push(shouldShowUpgrade === testCase.expected.shouldShowUpgrade);
  
  // Test upgrade recommendation
  const upgradeTo = featureGate.getUpgradeRecommendation();
  logTest(
    'Upgrade Recommendation',
    upgradeTo === testCase.expected.upgradeTo,
    upgradeTo ? `✅ Recommends: ${upgradeTo}` : '✅ No upgrade needed'
  );
  results.push(upgradeTo === testCase.expected.upgradeTo);
  
  // Special case tests
  if (testCase.expected.graceBehavior) {
    const gracePeriodEnd = testCase.entitlements.grace_period_end;
    const inGracePeriod = Date.now() < gracePeriodEnd;
    logTest(
      'Grace Period Behavior',
      inGracePeriod && actualAgentPro,
      inGracePeriod ? '✅ Grace period active, features maintained' : '❌ Grace period not handled'
    );
    results.push(inGracePeriod && actualAgentPro);
  }
  
  if (testCase.expected.periodActive) {
    const periodEnd = testCase.entitlements.current_period_end;
    const periodStillActive = Date.now() < periodEnd;
    logTest(
      'Period End Logic',
      periodStillActive && actualAgentPro,
      periodStillActive ? '✅ Period still active, features maintained' : '❌ Period end not handled'
    );
    results.push(periodStillActive && actualAgentPro);
  }
  
  if (testCase.expected.downgraded) {
    logTest(
      'Downgrade Logic',
      !actualTerminalPro && !actualAgentPro,
      '✅ Successfully downgraded to free tier'
    );
    results.push(!actualTerminalPro && !actualAgentPro);
  }
  
  return results.every(r => r);
}

function logTest(testName, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const color = passed ? 'green' : 'red';
  log(`${status} ${testName}`, color);
  if (details) {
    console.log(`   ${details}`);
  }
}

/**
 * Test Edge Cases
 */
function testEdgeCases() {
  logSection('Edge Cases');
  
  const results = [];
  
  // Test 1: Unknown feature
  const unknownFeatureGate = new FeatureGate({
    terminal_pro_lifetime: true,
    agent_pro_status: 'active'
  });
  
  const handlesUnknownFeature = !unknownFeatureGate.hasFeature('UNKNOWN_FEATURE');
  logTest(
    'Unknown feature handling',
    handlesUnknownFeature,
    handlesUnknownFeature ? '✅ Unknown features rejected' : '❌ Unknown features accepted'
  );
  results.push(handlesUnknownFeature);
  
  // Test 2: Null/undefined entitlements
  const nullEntitlements = new FeatureGate(null);
  const handlesNull = !nullEntitlements.hasFeature('PLAN_NEXT_STEP_ADVANCED');
  logTest(
    'Null entitlements handling',
    handlesNull,
    handlesNull ? '✅ Gracefully handles null entitlements' : '❌ Crashes on null entitlements'
  );
  results.push(handlesNull);
  
  // Test 3: Malformed entitlements
  const malformedEntitlements = new FeatureGate({
    terminal_pro_lifetime: 'invalid',
    agent_pro_status: 123
  });
  
  const handlesMalformed = !malformedEntitlements.hasFeature('PLAN_NEXT_STEP_ADVANCED');
  logTest(
    'Malformed entitlements handling',
    handlesMalformed,
    handlesMalformed ? '✅ Gracefully handles malformed entitlements' : '❌ Crashes on malformed entitlements'
  );
  results.push(handlesMalformed);
  
  // Test 4: Future dates (expiration)
  const expiredEntitlements = new FeatureGate({
    terminal_pro_lifetime: true,
    agent_pro_status: 'active',
    expires_at: Date.now() - (24 * 60 * 60 * 1000) // Expired yesterday
  });
  
  const handlesExpiration = !expiredEntitlements.hasFeature('PLAN_NEXT_STEP_ADVANCED');
  logTest(
    'Expiration handling',
    handlesExpiration,
    handlesExpiration ? '✅ Expired entitlements rejected' : '❌ Expired entitlements accepted'
  );
  results.push(handlesExpiration);
  
  return results.every(r => r);
}

/**
 * Main test runner
 */
async function runTierGatingMatrixTest() {
  log('🚀 Starting Tier Gating Matrix Validation...', 'blue');
  
  const results = [];
  
  // Test all matrix combinations
  for (const testCase of TEST_MATRIX) {
    try {
      const passed = testTierCombination(testCase);
      results.push({ name: testCase.name, passed });
    } catch (error) {
      log(`❌ Test "${testCase.name}" crashed: ${error.message}`, 'red');
      results.push({ name: testCase.name, passed: false });
    }
  }
  
  // Test edge cases
  try {
    const edgeCasesPassed = testEdgeCases();
    results.push({ name: 'Edge Cases', passed: edgeCasesPassed });
  } catch (error) {
    log(`❌ Edge case tests crashed: ${error.message}`, 'red');
    results.push({ name: 'Edge Cases', passed: false });
  }
  
  // Summary
  logSection('Matrix Validation Summary');
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    log(`${status} ${result.name}`, result.passed ? 'green' : 'red');
  });
  
  log(`\n🎯 Overall Result: ${passedTests}/${totalTests} scenarios passed`, 
      passedTests === totalTests ? 'green' : 'red');
  
  if (passedTests === totalTests) {
    log('🎉 Tier gating matrix is CORRECT and PRODUCTION READY!', 'green');
    log('   All tier combinations work as expected.', 'green');
  } else {
    log('⚠️  Tier gating matrix has INCONSISTENCIES!', 'red');
    log('   Fix failing scenarios before production deployment.', 'yellow');
  }
  
  return passedTests === totalTests;
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTierGatingMatrixTest().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { runTierGatingMatrixTest };
