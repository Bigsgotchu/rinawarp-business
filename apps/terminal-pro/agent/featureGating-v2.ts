/**
 * Feature Gating System V2 - Integrates with real Stripe entitlements
 * Uses offline license validation with signed blobs for fast checking
 */

import { offlineValidator, validateLicenseBlob } from '../../../audit/functions/lib/license-service.js';

export enum Tier {
  FREE = 'free',
  TERMINAL_PRO = 'terminal-pro', 
  AGENT_PRO = 'agent-pro'
}

export interface Feature {
  name: string;
  tier: Tier;
  description: string;
}

export interface UserEntitlements {
  terminal_pro_lifetime: boolean;
  agent_pro_status: 'none' | 'active' | 'grace' | 'past_due' | 'canceled';
  agent_pro_ends_at?: number;
  agent_memory: boolean;
  ghost_text: boolean;
  tool_registry_level: 'basic' | 'pro';
  ai_cloud: boolean;
  grace_period_ends_at?: number;
  updated_at?: number;
}

export interface FeatureCheckResult {
  hasAccess: boolean;
  reason?: string;
  upgradeTier?: Tier;
  isExpired?: boolean;
}

// Feature definitions
export const FEATURES: Record<string, Feature> = {
  // Free Tier Features
  TERMINAL_BASIC: {
    name: 'Terminal Basic',
    tier: Tier.FREE,
    description: 'Basic terminal functionality'
  },
  SHELL_EXECUTION: {
    name: 'Shell Execution',
    tier: Tier.FREE,
    description: 'Run shell commands'
  },
  GIT_STATUS: {
    name: 'Git Status',
    tier: Tier.FREE,
    description: 'View git repository status'
  },
  PLAN_NEXT_STEP_BASIC: {
    name: 'Basic Planning',
    tier: Tier.FREE,
    description: 'Basic next step heuristics (limited context)'
  },

  // Terminal Pro Features
  PLAN_NEXT_STEP_ADVANCED: {
    name: 'Advanced Planning',
    tier: Tier.TERMINAL_PRO,
    description: 'Enhanced heuristics with full context awareness'
  },
  GHOST_TEXT_SUGGESTIONS: {
    name: 'Ghost Text Suggestions',
    tier: Tier.TERMINAL_PRO,
    description: 'Inline command suggestions with Tab-accept'
  },
  MEMORY_PERSISTENCE: {
    name: 'Memory Persistence',
    tier: Tier.TERMINAL_PRO,
    description: 'Remember preferences and sessions locally'
  },

  // Agent Pro Features
  TOOL_REGISTRY: {
    name: 'Tool Registry',
    tier: Tier.AGENT_PRO,
    description: 'Permission-based tool access (fs, process, network)'
  },
  MULTI_STEP_PLANNING: {
    name: 'Multi-Step Planning',
    tier: Tier.AGENT_PRO,
    description: 'Complex workflow planning and execution'
  },
  CRASH_SUPERVISION: {
    name: 'Crash Supervision',
    tier: Tier.AGENT_PRO,
    description: 'Agent health monitoring and recovery'
  },
  ENHANCED_MEMORY: {
    name: 'Enhanced Memory',
    tier: Tier.AGENT_PRO,
    description: 'Advanced memory patterns and learning'
  },
  FUTURE_AI_LOOP: {
    name: 'AI Reasoning Loop',
    tier: Tier.AGENT_PRO,
    description: 'Future AI-powered reasoning capabilities'
  }
};

export class FeatureGate {
  private entitlements: UserEntitlements;

  constructor(entitlements: UserEntitlements) {
    this.entitlements = entitlements;
  }

  /**
   * Check if user has access to a feature with detailed result
   */
  checkFeature(featureName: string): FeatureCheckResult {
    const feature = FEATURES[featureName];
    if (!feature) {
      console.warn(`[FeatureGate] Unknown feature: ${featureName}`);
      return { hasAccess: false, reason: 'Unknown feature' };
    }

    return this.isFeatureAccessible(feature);
  }

  /**
   * Simple boolean check for performance-critical paths
   */
  hasFeature(featureName: string): boolean {
    return this.checkFeature(featureName).hasAccess;
  }

  /**
   * Check if feature is accessible based on entitlements
   */
  private isFeatureAccessible(feature: Feature): FeatureCheckResult {
    // Always allow free features
    if (feature.tier === Tier.FREE) {
      return { hasAccess: true };
    }

    // Check Terminal Pro features
    if (feature.tier === Tier.TERMINAL_PRO) {
      if (this.entitlements.terminal_pro_lifetime) {
        return { hasAccess: true };
      }
      return { 
        hasAccess: false, 
        upgradeTier: Tier.TERMINAL_PRO,
        reason: 'Requires Terminal Pro lifetime license'
      };
    }

    // Check Agent Pro features
    if (feature.tier === Tier.AGENT_PRO) {
      // Check if user has active Agent Pro subscription
      if (this.entitlements.agent_pro_status === 'active') {
        return { hasAccess: true };
      }
      
      // Check grace period
      if (this.entitlements.agent_pro_status === 'grace' && this.entitlements.grace_period_ends_at) {
        const now = Date.now();
        if (now < this.entitlements.grace_period_ends_at) {
          return { 
            hasAccess: true,
            reason: 'Available during grace period'
          };
        } else {
          return {
            hasAccess: false,
            upgradeTier: Tier.AGENT_PRO,
            reason: 'Grace period expired'
          };
        }
      }
      
      return { 
        hasAccess: false, 
        upgradeTier: Tier.AGENT_PRO,
        reason: `Requires Agent Pro subscription (current status: ${this.entitlements.agent_pro_status})`
      };
    }

    return { hasAccess: false, reason: 'Unknown tier' };
  }

  /**
   * Get current effective tier based on entitlements
   */
  getCurrentTier(): Tier {
    if (this.entitlements.agent_pro_status === 'active') {
      return Tier.AGENT_PRO;
    }
    
    if (this.entitlements.terminal_pro_lifetime) {
      return Tier.TERMINAL_PRO;
    }
    
    return Tier.FREE;
  }

  /**
   * Get features available to current tier
   */
  getAvailableFeatures(): Feature[] {
    return Object.values(FEATURES).filter(feature => 
      this.isFeatureAccessible(feature).hasAccess
    );
  }

  /**
   * Get features gated behind current tier
   */
  getGatedFeatures(): { features: Feature[]; upgradeTier: Tier }[] {
    const terminalGated = Object.values(FEATURES).filter(feature => 
      feature.tier === Tier.TERMINAL_PRO && !this.hasFeature(feature.name)
    );
    
    const agentGated = Object.values(FEATURES).filter(feature => 
      feature.tier === Tier.AGENT_PRO && !this.hasFeature(feature.name)
    );

    const result = [];
    if (terminalGated.length > 0) {
      result.push({ features: terminalGated, upgradeTier: Tier.TERMINAL_PRO });
    }
    if (agentGated.length > 0) {
      result.push({ features: agentGated, upgradeTier: Tier.AGENT_PRO });
    }
    
    return result;
  }

  /**
   * Check if user should see upgrade prompt
   */
  shouldShowUpgradePrompt(): boolean {
    return this.getCurrentTier() === Tier.FREE;
  }

  /**
   * Get upgrade path recommendation
   */
  getUpgradeRecommendation(): Tier | null {
    switch (this.getCurrentTier()) {
      case Tier.FREE:
        return Tier.TERMINAL_PRO;
      case Tier.TERMINAL_PRO:
        return Tier.AGENT_PRO;
      default:
        return null;
    }
  }

  /**
   * Check if feature access is expired
   */
  isAccessExpired(): boolean {
    if (this.entitlements.agent_pro_status === 'active') {
      return false;
    }
    
    if (this.entitlements.grace_period_ends_at) {
      return Date.now() > this.entitlements.grace_period_ends_at;
    }
    
    if (this.entitlements.agent_pro_ends_at) {
      return Date.now() > this.entitlements.agent_pro_ends_at;
    }
    
    return false;
  }

  /**
   * Get remaining access time for subscription features
   */
  getRemainingAccessTime(): string {
    if (this.entitlements.agent_pro_status === 'active' && this.entitlements.agent_pro_ends_at) {
      const remaining = this.entitlements.agent_pro_ends_at - Date.now();
      if (remaining <= 0) return 'Expired';
      
      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (days > 0) return `${days}d ${hours}h`;
      return `${hours}h`;
    }
    
    if (this.entitlements.grace_period_ends_at) {
      const remaining = this.entitlements.grace_period_ends_at - Date.now();
      if (remaining <= 0) return 'Grace period ended';
      
      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      return `Grace: ${days}d ${hours}h`;
    }
    
    return 'Unlimited';
  }

  /**
   * Check if we're in a grace period
   */
  isInGracePeriod(): boolean {
    return this.entitlements.agent_pro_status === 'grace' && 
           this.entitlements.grace_period_ends_at &&
           Date.now() < this.entitlements.grace_period_ends_at;
  }
}

// Default entitlements (Free tier)
export const DEFAULT_ENTITLEMENTS: UserEntitlements = {
  terminal_pro_lifetime: false,
  agent_pro_status: 'none',
  agent_memory: false,
  ghost_text: false,
  tool_registry_level: 'basic',
  ai_cloud: false
};

/**
 * Load entitlements from cached license blob (for offline use)
 */
export async function loadEntitlementsFromCache(): Promise<UserEntitlements> {
  try {
    const result = await offlineValidator.validateCachedLicense();
    if (result.valid) {
      return result.entitlements;
    }
  } catch (error) {
    console.warn('[FeatureGate] Failed to load cached entitlements:', error);
  }
  
  return DEFAULT_ENTITLEMENTS;
}

/**
 * Load entitlements from server (online validation)
 */
export async function loadEntitlementsFromServer(licenseBlob: string): Promise<UserEntitlements> {
  try {
    const result = await validateLicenseBlob(licenseBlob);
    if (result.valid) {
      // Cache the successful validation
      offlineValidator.setCachedLicense(licenseBlob);
      return result.entitlements;
    }
  } catch (error) {
    console.error('[FeatureGate] Failed to validate license blob:', error);
  }
  
  return DEFAULT_ENTITLEMENTS;
}

/**
 * Create FeatureGate instance with entitlements
 */
export function createFeatureGate(entitlements: UserEntitlements): FeatureGate {
  return new FeatureGate(entitlements);
}

/**
 * Middleware for feature-g */
export function requireated API endpoints
Feature(featureName: string) {
  return async (req: any, res: any, next: any) => {
    try {
      // Get entitlements from request (should be set by auth middleware)
      const entitlements = req.user?.entitlements || DEFAULT_ENTITLEMENTS;
      const gate = new FeatureGate(entitlements);
      
      const check = gate.checkFeature(featureName);
      if (!check.hasAccess) {
        const feature = FEATURES[featureName];
        
        return res.status(402).json({
          error: 'Feature requires upgrade',
          feature: feature?.name || featureName,
          requiredTier: feature?.tier,
          upgradeTo: check.upgradeTier,
          reason: check.reason,
          message: check.reason || `This feature requires ${feature?.tier} tier`
        });
      }
      
      next();
    } catch (error) {
      console.error('[FeatureGate] Middleware error:', error);
      res.status(500).json({ error: 'Feature check failed' });
    }
  };
}

/**
 * Client-side feature check helper for React components
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
    
    const terminalGated = gated.find(g => g.upgradeTier === Tier.TERMINAL_PRO);
    const agentGated = gated.find(g => g.upgradeTier === Tier.AGENT_PRO);
    
    let message = 'Upgrade to access: ';
    const parts = [];
    
    if (terminalGated) {
      parts.push(`Terminal Pro (${terminalGated.features.map(f => f.name).join(', ')})`);
    }
    if (agentGated) {
      parts.push(`Agent Pro (${agentGated.features.map(f => f.name).join(', ')})`);
    }
    
    message += parts.join(' and ');
    return message;
  }

  getCurrentTier(): string {
    const gate = new FeatureGate(this.entitlements);
    return gate.getCurrentTier();
  }

  getRemainingTime(): string {
    const gate = new FeatureGate(this.entitlements);
    return gate.getRemainingAccessTime();
  }
}
