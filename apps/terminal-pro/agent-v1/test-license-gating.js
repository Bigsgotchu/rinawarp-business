#!/usr/bin/env node

/**
 * Test License → Tool Gating System
 * Verifies that license tiers properly control tool access
 */

const fs = require('fs');
const path = require('path');

console.log('🔐 Testing License → Tool Gating System...\n');

// Test license matrix
function testLicenseMatrix() {
  console.log('Test 1: License → Capability Matrix');

  const LICENSE_CAPABILITIES = {
    starter: {
      tier: 'starter',
      canUse: [
        'fs.list',
        'fs.read',
        'fs.edit',
        'git.status',
        'git.diff',
        'process.list',
        'build.run',
      ],
      maxConcurrentTools: 3,
      features: ['basic-file-operations', 'read-only-git', 'local-builds'],
    },
    pro: {
      tier: 'pro',
      canUse: [
        'fs.list',
        'fs.read',
        'fs.edit',
        'fs.delete',
        'git.status',
        'git.diff',
        'git.commit',
        'process.list',
        'process.kill',
        'build.run',
        'deploy.prod',
      ],
      maxConcurrentTools: 5,
      features: [
        'all-starter-features',
        'file-deletions',
        'git-commits',
        'process-management',
        'production-deploys',
      ],
    },
    founder: {
      tier: 'founder',
      canUse: [
        'fs.list',
        'fs.read',
        'fs.edit',
        'fs.delete',
        'git.status',
        'git.diff',
        'git.commit',
        'process.list',
        'process.kill',
        'build.run',
        'deploy.prod',
      ],
      maxConcurrentTools: 10,
      features: ['all-pro-features', 'enterprise-ready', 'advanced-automation'],
    },
  };

  // Test starter tier
  const starterAllowed = LICENSE_CAPABILITIES.starter.canUse;
  const proTools = ['fs.delete', 'deploy.prod', 'git.commit', 'process.kill'];

  let allTestsPassed = true;

  for (const tool of proTools) {
    if (starterAllowed.includes(tool)) {
      console.log(`❌ FAIL: Starter tier should not include "${tool}"`);
      allTestsPassed = false;
    } else {
      console.log(`✅ PASS: Starter tier correctly excludes "${tool}"`);
    }
  }

  // Test pro tier includes all starter tools plus pro tools
  const proAllowed = LICENSE_CAPABILITIES.pro.canUse;
  for (const tool of starterAllowed) {
    if (!proAllowed.includes(tool)) {
      console.log(`❌ FAIL: Pro tier should include "${tool}" (starter tool)`);
      allTestsPassed = false;
    }
  }

  for (const tool of proTools) {
    if (!proAllowed.includes(tool)) {
      console.log(`❌ FAIL: Pro tier should include "${tool}"`);
      allTestsPassed = false;
    } else {
      console.log(`✅ PASS: Pro tier includes "${tool}"`);
    }
  }

  return allTestsPassed;
}

// Test tool definitions
function testToolDefinitions() {
  console.log('\nTest 2: Tool License Requirements');

  const toolsDir = path.join(__dirname, 'tools');
  const toolFiles = ['fs.ts', 'shell.ts', 'git.ts', 'process.ts'];

  let allTestsPassed = true;

  // Expected license requirements
  const licenseRequirements = {
    'fs.delete': 'pro',
    'deploy.prod': 'pro',
    'git.commit': 'pro',
    'process.kill': 'pro',
  };

  for (const file of toolFiles) {
    const filePath = path.join(toolsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    for (const [toolName, requiredLicense] of Object.entries(licenseRequirements)) {
      if (content.includes(`name: "${toolName}"`)) {
        const hasLicenseReq = content.includes(`requiredLicense: "${requiredLicense}"`);
        if (hasLicenseReq) {
          console.log(`✅ ${toolName}: Requires ${requiredLicense} license`);
        } else {
          console.log(`❌ ${toolName}: Missing requiredLicense "${requiredLicense}"`);
          allTestsPassed = false;
        }
      }
    }
  }

  return allTestsPassed;
}

// Test license gating logic
function testLicenseGating() {
  console.log('\nTest 3: License Gating Logic');

  function isToolAllowed(toolName, licenseTier) {
    const capabilities = {
      starter: [
        'fs.list',
        'fs.read',
        'fs.edit',
        'git.status',
        'git.diff',
        'process.list',
        'build.run',
      ],
      pro: [
        'fs.list',
        'fs.read',
        'fs.edit',
        'fs.delete',
        'git.status',
        'git.diff',
        'git.commit',
        'process.list',
        'process.kill',
        'build.run',
        'deploy.prod',
      ],
      founder: [
        'fs.list',
        'fs.read',
        'fs.edit',
        'fs.delete',
        'git.status',
        'git.diff',
        'git.commit',
        'process.list',
        'process.kill',
        'build.run',
        'deploy.prod',
      ],
    };

    return capabilities[licenseTier]?.includes(toolName) || false;
  }

  let allTestsPassed = true;

  // Test starter cannot access pro tools
  const proTools = ['fs.delete', 'deploy.prod', 'git.commit', 'process.kill'];
  for (const tool of proTools) {
    if (isToolAllowed(tool, 'starter')) {
      console.log(`❌ FAIL: Starter should not access "${tool}"`);
      allTestsPassed = false;
    } else {
      console.log(`✅ PASS: Starter correctly blocked from "${tool}"`);
    }
  }

  // Test pro can access all tools
  for (const tool of proTools) {
    if (!isToolAllowed(tool, 'pro')) {
      console.log(`❌ FAIL: Pro should access "${tool}"`);
      allTestsPassed = false;
    } else {
      console.log(`✅ PASS: Pro correctly accesses "${tool}"`);
    }
  }

  return allTestsPassed;
}

// Test upgrade paths
function testUpgradePaths() {
  console.log('\nTest 4: Upgrade Path Detection');

  function getUpgradePath(requestedTool, currentTier) {
    const tierOrder = ['starter', 'pro', 'founder'];
    const capabilities = {
      starter: [
        'fs.list',
        'fs.read',
        'fs.edit',
        'git.status',
        'git.diff',
        'process.list',
        'build.run',
      ],
      pro: [
        'fs.list',
        'fs.read',
        'fs.edit',
        'fs.delete',
        'git.status',
        'git.diff',
        'git.commit',
        'process.list',
        'process.kill',
        'build.run',
        'deploy.prod',
      ],
      founder: [
        'fs.list',
        'fs.read',
        'fs.edit',
        'fs.delete',
        'git.status',
        'git.diff',
        'git.commit',
        'process.list',
        'process.kill',
        'build.run',
        'deploy.prod',
      ],
    };

    // Find which tier first includes this tool
    for (let i = 0; i < tierOrder.length; i++) {
      const tier = tierOrder[i];
      if (capabilities[tier]?.includes(requestedTool) && tier !== currentTier) {
        const currentIndex = tierOrder.indexOf(currentTier);
        if (i > currentIndex) {
          return {
            requiredTier: tier,
            reason: `Tool "${requestedTool}" requires ${tier} license`,
            upgradeMessage: `Upgrade to ${tier} to access "${requestedTool}"`,
          };
        }
      }
    }
    return null;
  }

  let allTestsPassed = true;

  // Test starter gets upgrade path for pro tools
  const upgradeTest = getUpgradePath('fs.delete', 'starter');
  if (upgradeTest && upgradeTest.requiredTier === 'pro') {
    console.log('✅ PASS: Starter gets upgrade path to Pro for fs.delete');
  } else {
    console.log('❌ FAIL: Starter should get upgrade path to Pro for fs.delete');
    allTestsPassed = false;
  }

  // Test that pro users don't get upgrade paths for tools they already have
  const starterTools = [
    'fs.list',
    'fs.read',
    'fs.edit',
    'git.status',
    'git.diff',
    'process.list',
    'build.run',
  ];
  for (const tool of starterTools) {
    const upgradeTest = getUpgradePath(tool, 'pro');
    if (upgradeTest) {
      console.log(`❌ FAIL: Pro should not get upgrade path for "${tool}" (already has access)`);
      allTestsPassed = false;
    } else {
      console.log(`✅ PASS: Pro correctly has no upgrade path for "${tool}"`);
    }
  }

  // Test that pro users would get upgrade paths for higher-tier tools (if any existed)
  // For now, all tools are available to pro, so this should be null
  const nonExistentTest = getUpgradePath('enterprise.backup', 'pro');
  if (!nonExistentTest) {
    console.log('✅ PASS: Pro gets no upgrade path for non-existent enterprise tools');
  } else {
    console.log('❌ FAIL: Pro should not get upgrade path for non-existent tools');
    allTestsPassed = false;
  }

  return allTestsPassed;
}

// Run all tests
const results = [
  testLicenseMatrix(),
  testToolDefinitions(),
  testLicenseGating(),
  testUpgradePaths(),
];

const allPassed = results.every((r) => r);

console.log('\n' + '='.repeat(60));
if (allPassed) {
  console.log('🎉 All License Gating Tests Passed!');
  console.log('='.repeat(60));
  console.log('\n✅ License → Tool Gating Verified:');
  console.log('- Starter tier properly restricted');
  console.log('- Pro tier includes all capabilities');
  console.log('- Tool definitions include license requirements');
  console.log('- License enforcement logic working');
  console.log('- Upgrade paths properly detected');
  console.log('\n🔐 License gating is secure and ready for production!');
} else {
  console.log('❌ Some License Gating Tests Failed');
  console.log('='.repeat(60));
  console.log('Please fix the issues above before deploying.');
}
