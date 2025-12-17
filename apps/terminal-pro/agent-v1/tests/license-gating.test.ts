import { describe, it, expect } from 'vitest';
import { getTool } from '../policy/registry';
import {
  isToolAllowed,
  getUpgradePath,
  LICENSE_CAPABILITIES,
  isValidLicenseTier,
} from '../policy/license-gating';

describe('License → Tool Gating Security', () => {
  describe('Tier Access Control', () => {
    it('starter tier can only access allowed tools', () => {
      // Should allow starter tools
      expect(isToolAllowed('fs.list', 'starter')).toBe(true);
      expect(isToolAllowed('fs.read', 'starter')).toBe(true);
      expect(isToolAllowed('fs.edit', 'starter')).toBe(true);
      expect(isToolAllowed('git.status', 'starter')).toBe(true);
      expect(isToolAllowed('git.diff', 'starter')).toBe(true);
      expect(isToolAllowed('process.list', 'starter')).toBe(true);
      expect(isToolAllowed('build.run', 'starter')).toBe(true);

      // Should NOT allow pro tools
      expect(isToolAllowed('fs.delete', 'starter')).toBe(false);
      expect(isToolAllowed('deploy.prod', 'starter')).toBe(false);
      expect(isToolAllowed('git.commit', 'starter')).toBe(false);
      expect(isToolAllowed('process.kill', 'starter')).toBe(false);
    });

    it('pro tier can access pro tools', () => {
      // Should allow pro tools
      expect(isToolAllowed('fs.delete', 'pro')).toBe(true);
      expect(isToolAllowed('deploy.prod', 'pro')).toBe(true);
      expect(isToolAllowed('git.commit', 'pro')).toBe(true);
      expect(isToolAllowed('process.kill', 'pro')).toBe(true);

      // Should still allow starter tools
      expect(isToolAllowed('fs.list', 'pro')).toBe(true);
      expect(isToolAllowed('fs.read', 'pro')).toBe(true);
      expect(isToolAllowed('fs.edit', 'pro')).toBe(true);
    });

    it('founder tier can access all tools', () => {
      // Should allow all tools
      expect(isToolAllowed('fs.list', 'founder')).toBe(true);
      expect(isToolAllowed('fs.delete', 'founder')).toBe(true);
      expect(isToolAllowed('deploy.prod', 'founder')).toBe(true);
      expect(isToolAllowed('git.commit', 'founder')).toBe(true);
      expect(isToolAllowed('process.kill', 'founder')).toBe(true);
    });
  });

  describe('Upgrade Path Detection', () => {
    it('starter gets upgrade path for pro tools', () => {
      const upgradePath = getUpgradePath('fs.delete', 'starter');

      expect(upgradePath).not.toBeNull();
      expect(upgradePath?.requiredTier).toBe('pro');
      expect(upgradePath?.reason).toContain('fs.delete');
      expect(upgradePath?.reason).toContain('pro');
    });

    it('starter gets upgrade path for deploy.prod', () => {
      const upgradePath = getUpgradePath('deploy.prod', 'starter');

      expect(upgradePath).not.toBeNull();
      expect(upgradePath?.requiredTier).toBe('pro');
      expect(upgradePath?.upgradeMessage).toContain('deploy.prod');
      expect(upgradePath?.upgradeMessage).toContain('pro');
    });

    it('pro gets no upgrade path for starter tools', () => {
      const upgradePath = getUpgradePath('fs.list', 'pro');
      expect(upgradePath).toBeNull();
    });

    it('founder gets no upgrade path for any tool', () => {
      const upgradePath = getUpgradePath('deploy.prod', 'founder');
      expect(upgradePath).toBeNull();
    });
  });

  describe('License Validation', () => {
    it('validates correct license tiers', () => {
      expect(isValidLicenseTier('starter')).toBe(true);
      expect(isValidLicenseTier('pro')).toBe(true);
      expect(isValidLicenseTier('founder')).toBe(true);
    });

    it('rejects invalid license tiers', () => {
      expect(isValidLicenseTier('free')).toBe(false);
      expect(isValidLicenseTier('enterprise')).toBe(false);
      expect(isValidLicenseTier('invalid')).toBe(false);
      expect(isValidLicenseTier('')).toBe(false);
    });
  });

  describe('Tier Security', () => {
    it('no tier escalation possible', () => {
      // Test that lower tiers cannot access higher tier tools
      const proTools = LICENSE_CAPABILITIES.pro.canUse;
      const starterTools = LICENSE_CAPABILITIES.starter.canUse;

      // Every pro tool should NOT be in starter tools
      for (const tool of proTools) {
        if (!starterTools.includes(tool)) {
          expect(isToolAllowed(tool, 'starter')).toBe(false);
        }
      }
    });

    it('concurrent tool limits enforced', () => {
      expect(LICENSE_CAPABILITIES.starter.maxConcurrentTools).toBe(3);
      expect(LICENSE_CAPABILITIES.pro.maxConcurrentTools).toBe(5);
      expect(LICENSE_CAPABILITIES.founder.maxConcurrentTools).toBe(10);
    });

    it('feature flags properly assigned', () => {
      // Starter should have basic features only
      const starterFeatures = LICENSE_CAPABILITIES.starter.features;
      expect(starterFeatures).toContain('basic-file-operations');
      expect(starterFeatures).toContain('read-only-git');
      expect(starterFeatures).not.toContain('production-deploys');

      // Pro should have all starter features plus pro features
      const proFeatures = LICENSE_CAPABILITIES.pro.features;
      expect(proFeatures).toContain('all-starter-features');
      expect(proFeatures).toContain('production-deploys');
      expect(proFeatures).not.toContain('enterprise-ready');
    });
  });

  describe('Tool Registration Consistency', () => {
    it('high-impact tools require pro license', () => {
      const highImpactTools = ['fs.delete', 'deploy.prod', 'process.kill'];

      for (const toolName of highImpactTools) {
        const tool = getTool(toolName);
        expect(tool).toBeDefined();
        expect(tool?.category).toBe('high-impact');
        expect(tool?.requiredLicense).toBe('pro');

        // Should be blocked for starter
        expect(isToolAllowed(toolName, 'starter')).toBe(false);

        // Should be allowed for pro
        expect(isToolAllowed(toolName, 'pro')).toBe(true);
      }
    });

    it('write operations properly gated', () => {
      // git.commit should require pro (write operation)
      const gitCommit = getTool('git.commit');
      expect(gitCommit?.requiredLicense).toBe('pro');
      expect(isToolAllowed('git.commit', 'starter')).toBe(false);
      expect(isToolAllowed('git.commit', 'pro')).toBe(true);
    });

    it('read operations available to all tiers', () => {
      const readTools = ['fs.list', 'fs.read', 'git.status', 'git.diff', 'process.list'];

      for (const toolName of readTools) {
        const tool = getTool(toolName);
        expect(tool?.category).toBe('read');

        // Should be available to all tiers
        expect(isToolAllowed(toolName, 'starter')).toBe(true);
        expect(isToolAllowed(toolName, 'pro')).toBe(true);
        expect(isToolAllowed(toolName, 'founder')).toBe(true);
      }
    });
  });
});
