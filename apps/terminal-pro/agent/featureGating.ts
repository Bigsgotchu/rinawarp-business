/**
 * Feature Gating System - Clean separation between Free and Pro tiers
 * This enables the pricing model and prevents feature leakage
 */

export enum Tier {
  FREE = 'free',
  TERMINAL_PRO = 'terminal-pro',
  AGENT_PRO = 'agent-pro',
}

export interface Feature {
  name: string;
  tier: Tier;
  description: string;
}

export interface UserEntitlements {
  tier: Tier;
  features: Set<string>;
  expiresAt?: number;
}

// Feature definitions
export const FEATURES: Record<string, Feature> = {
  // Free Tier Features
  TERMINAL_BASIC: {
    name: 'Terminal Basic',
    tier: Tier.FREE,
    description: 'Basic terminal functionality',
  },
  SHELL_EXECUTION: {
    name: 'Shell Execution',
    tier: Tier.FREE,
    description: 'Run shell commands',
  },
  GIT_STATUS: {
    name: 'Git Status',
    tier: Tier.FREE,
    description: 'View git repository status',
  },
  PLAN_NEXT_STEP_BASIC: {
    name: 'Basic Planning',
    tier: Tier.FREE,
    description: 'Basic next step heuristics (limited context)',
  },

  // Terminal Pro Features
  PLAN_NEXT_STEP_ADVANCED: {
    name: 'Advanced Planning',
    tier: Tier.TERMINAL_PRO,
    description: 'Enhanced heuristics with full context awareness',
  },
  GHOST_TEXT_SUGGESTIONS: {
    name: 'Ghost Text Suggestions',
    tier: Tier.TERMINAL_PRO,
    description: 'Inline command suggestions with Tab-accept',
  },
  MEMORY_PERSISTENCE: {
    name: 'Memory Persistence',
    tier: Tier.TERMINAL_PRO,
    description: 'Remember preferences and sessions locally',
  },

  // Agent Pro Features
  TOOL_REGISTRY: {
    name: 'Tool Registry',
    tier: Tier.AGENT_PRO,
    description: 'Permission-based tool access (fs, process, network)',
  },
  MULTI_STEP_PLANNING: {
    name: 'Multi-Step Planning',
    tier: Tier.AGENT_PRO,
    description: 'Complex workflow planning and execution',
  },
  CRASH_SUPERVISION: {
    name: 'Crash Supervision',
    tier: Tier.AGENT_PRO,
    description: 'Agent health monitoring and recovery',
  },
  ENHANCED_MEMORY: {
    name: 'Enhanced Memory',
    tier: Tier.AGENT_PRO,
    description: 'Advanced memory patterns and learning',
  },
  FUTURE_AI_LOOP: {
    name: 'AI Reasoning Loop',
    tier: Tier.AGENT_PRO,
    description: 'Future AI-powered reasoning capabilities',
  },
};

export class FeatureGate {
  private entitlements: UserEntitlements;

  constructor(entitlements: UserEntitlements) {
    this.entitlements = entitlements;
  }

  /**
   * Check if user has access to a feature
   */
  hasFeature(featureName: string): boolean {
    const feature = FEATURES[featureName];
    if (!feature) {
      console.warn(`[FeatureGate] Unknown feature: ${featureName}`);
      return false;
    }

    return this.isFeatureAccessible(feature);
  }

  /**
   * Check if feature is accessible based on tier
   */
  private isFeatureAccessible(feature: Feature): boolean {
    switch (feature.tier) {
      case Tier.FREE:
        return true; // Always accessible

      case Tier.TERMINAL_PRO:
        return (
          this.entitlements.tier === Tier.TERMINAL_PRO || this.entitlements.tier === Tier.AGENT_PRO
        );

      case Tier.AGENT_PRO:
        return this.entitlements.tier === Tier.AGENT_PRO;

      default:
        return false;
    }
  }

  /**
   * Get features available to current tier
   */
  getAvailableFeatures(): Feature[] {
    return Object.values(FEATURES).filter((feature) => this.isFeatureAccessible(feature));
  }

  /**
   * Get features gated behind current tier
   */
  getGatedFeatures(): Feature[] {
    return Object.values(FEATURES).filter(
      (feature) => !this.isFeatureAccessible(feature) && feature.tier !== Tier.FREE,
    );
  }

  /**
   * Check if user should see upgrade prompt
   */
  shouldShowUpgradePrompt(): boolean {
    return this.entitlements.tier === Tier.FREE;
  }

  /**
   * Get upgrade path recommendation
   */
  getUpgradeRecommendation(): Tier | null {
    switch (this.entitlements.tier) {
      case Tier.FREE:
        return Tier.TERMINAL_PRO; // Next logical upgrade
      case Tier.TERMINAL_PRO:
        return Tier.AGENT_PRO; // Next logical upgrade
      default:
        return null; // Already at highest tier
    }
  }

  /**
   * Check if feature access is expired
   */
  isAccessExpired(): boolean {
    if (!this.entitlements.expiresAt) return false;
    return Date.now() > this.entitlements.expiresAt;
  }

  /**
   * Get remaining access time for subscription features
   */
  getRemainingAccessTime(): string {
    if (!this.entitlements.expiresAt) return 'Unlimited';

    const remaining = this.entitlements.expiresAt - Date.now();
    if (remaining <= 0) return 'Expired';

    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  }
}

// Default entitlements (Free tier)
export const DEFAULT_ENTITLEMENTS: UserEntitlements = {
  tier: Tier.FREE,
  features: new Set(['TERMINAL_BASIC', 'SHELL_EXECUTION', 'GIT_STATUS', 'PLAN_NEXT_STEP_BASIC']),
};

/**
 * Create entitlements from license key or user ID
 */
export async function getUserEntitlements(userId?: string): Promise<UserEntitlements> {
  // TODO: Integrate with actual license system
  // For now, return default entitlements

  if (userId) {
    // Check license database for user entitlements
    // This would integrate with your actual licensing system
    console.log(`[FeatureGate] Checking entitlements for user: ${userId}`);
  }

  return DEFAULT_ENTITLEMENTS;
}

/**
 * Middleware for feature-gated API endpoints
 */
export function requireFeature(featureName: string) {
  return (req: any, res: any, next: any) => {
    const entitlements = req.user?.entitlements || DEFAULT_ENTITLEMENTS;
    const gate = new FeatureGate(entitlements);

    if (!gate.hasFeature(featureName)) {
      const upgradeTier = gate.getUpgradeRecommendation();
      const feature = FEATURES[featureName];

      return res.status(402).json({
        error: 'Feature requires upgrade',
        feature: feature?.name || featureName,
        requiredTier: feature?.tier,
        upgradeTo: upgradeTier,
        message: `This feature requires ${feature?.tier} tier`,
      });
    }

    next();
  };
}

/**
 * Client-side feature check helper
 */
export class ClientFeatureGate {
  private entitlements: UserEntitlements;

  constructor(entitlements: UserEntitlements) {
    this.entitlements = entitlements;
  }

  shouldShowFeature(featureName: string): boolean {
    const gate = new FeatureGate(this.entitlements);
    return gate.hasFeature(featureName);
  }

  shouldShowUpgradePrompt(): boolean {
    const gate = new FeatureGate(this.entitlements);
    return gate.shouldShowUpgradePrompt();
  }

  getGatedFeaturesMessage(): string {
    const gate = new FeatureGate(this.entitlements);
    const gated = gate.getGatedFeatures();

    if (gated.length === 0) return '';

    const proFeatures = gated.filter((f) => f.tier === Tier.AGENT_PRO);
    const terminalFeatures = gated.filter((f) => f.tier === Tier.TERMINAL_PRO);

    let message = 'Upgrade to access: ';
    if (terminalFeatures.length > 0) {
      message += `Terminal Pro (${terminalFeatures.map((f) => f.name).join(', ')})`;
    }
    if (proFeatures.length > 0) {
      if (terminalFeatures.length > 0) message += ' and ';
      message += `Agent Pro (${proFeatures.map((f) => f.name).join(', ')})`;
    }

    return message;
  }
}
