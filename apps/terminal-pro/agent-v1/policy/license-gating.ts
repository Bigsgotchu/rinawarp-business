/**
 * License → Tool Gating System
 * Defines which tools/features each license tier can access
 */

export type LicenseTier = 'starter' | 'pro' | 'founder';

export interface LicenseCapabilities {
  tier: LicenseTier;
  canUse: string[]; // Array of tool names allowed
  maxConcurrentTools: number; // Safety limit
  features: string[]; // Feature flags
}

/**
 * License → Capability Matrix
 * Defines what each tier can access
 */
export const LICENSE_CAPABILITIES: Record<LicenseTier, LicenseCapabilities> = {
  starter: {
    tier: 'starter',
    canUse: [
      // File system - read operations only
      'fs.list',
      'fs.read',

      // Safe write operations
      'fs.edit',

      // Git - read operations only
      'git.status',
      'git.diff',

      // Process - read operations only
      'process.list',

      // Build operations (safe, local only)
      'build.run',
    ],
    maxConcurrentTools: 3,
    features: ['basic-file-operations', 'read-only-git', 'local-builds'],
  },

  pro: {
    tier: 'pro',
    canUse: [
      // All starter capabilities
      'fs.list',
      'fs.read',
      'fs.edit',
      'git.status',
      'git.diff',
      'process.list',
      'build.run',

      // High-impact file operations (with confirmation)
      'fs.delete',

      // Git write operations
      'git.commit',

      // Process management
      'process.kill',

      // Production deployments (with confirmation)
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
      // All pro capabilities
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

      // Future enterprise features will be added here
      // Examples:
      // 'enterprise.backup',
      // 'enterprise.monitoring',
      // 'enterprise.compliance',
    ],
    maxConcurrentTools: 10,
    features: [
      'all-pro-features',
      'enterprise-ready',
      'advanced-automation',
      // Future enterprise features
    ],
  },
};

/**
 * Check if a tool is allowed for a given license tier
 */
export function isToolAllowed(toolName: string, licenseTier: LicenseTier): boolean {
  const capabilities = LICENSE_CAPABILITIES[licenseTier];
  return capabilities.canUse.includes(toolName);
}

/**
 * Get license capabilities for a tier
 */
export function getLicenseCapabilities(licenseTier: LicenseTier): LicenseCapabilities {
  return LICENSE_CAPABILITIES[licenseTier];
}

/**
 * Check if a feature is enabled for a license tier
 */
export function isFeatureEnabled(feature: string, licenseTier: LicenseTier): boolean {
  const capabilities = LICENSE_CAPABILITIES[licenseTier];
  return capabilities.features.includes(feature);
}

/**
 * Validate license tier
 */
export function isValidLicenseTier(tier: string): tier is LicenseTier {
  return ['starter', 'pro', 'founder'].includes(tier);
}

/**
 * Get upgrade path for a tool request
 */
export function getUpgradePath(
  requestedTool: string,
  currentTier: LicenseTier,
): {
  requiredTier: LicenseTier;
  reason: string;
  upgradeMessage: string;
} | null {
  const tierOrder: LicenseTier[] = ['starter', 'pro', 'founder'];
  const currentIndex = tierOrder.indexOf(currentTier);

  // Check if current tier already has access
  if (isToolAllowed(requestedTool, currentTier)) {
    return null; // No upgrade needed
  }

  // Find the minimum tier that includes this tool
  let requiredTier: LicenseTier | null = null;

  for (let i = currentIndex + 1; i < tierOrder.length; i++) {
    const tier = tierOrder[i];
    if (isToolAllowed(requestedTool, tier)) {
      requiredTier = tier;
      break;
    }
  }

  if (requiredTier) {
    const capabilities = LICENSE_CAPABILITIES[requiredTier];
    return {
      requiredTier,
      reason: `Tool "${requestedTool}" requires ${requiredTier} license`,
      upgradeMessage: `Upgrade to ${requiredTier} to access "${requestedTool}" and ${capabilities.features.length - 1} other premium features`,
    };
  }

  return null;
}
