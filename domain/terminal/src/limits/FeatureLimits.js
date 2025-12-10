// Feature Limits System for Basic Tier
// Implements usage limits and tier-based restrictions

export class FeatureLimits {
  constructor() {
    this.limits = {
      free: {
        aiQueries: 10,
        macros: 2,
        themes: 2,
        workflows: 1,
        sessions: 1,
        integrations: 0,
        voiceCommands: 5,
      },
      basic: {
        aiQueries: 100,
        macros: 5,
        themes: 5,
        workflows: 3,
        sessions: 3,
        integrations: 2,
        voiceCommands: 50,
      },
      professional: {
        aiQueries: 1000,
        macros: 20,
        themes: 10,
        workflows: 10,
        sessions: 10,
        integrations: 5,
        voiceCommands: 500,
      },
      business: {
        aiQueries: 5000,
        macros: 50,
        themes: 20,
        workflows: 25,
        sessions: 25,
        integrations: 10,
        voiceCommands: 2000,
      },
      enterprise: {
        aiQueries: -1, // unlimited
        macros: -1,
        themes: -1,
        workflows: -1,
        sessions: -1,
        integrations: -1,
        voiceCommands: -1,
      },
    };

    this.usage = {
      aiQueries: 0,
      macros: 0,
      themes: 0,
      workflows: 0,
      sessions: 0,
      integrations: 0,
      voiceCommands: 0,
    };

    this.currentTier = 'free';
    this.loadUsage();
  }

  loadUsage() {
    const saved = localStorage.getItem('rinawarp_usage');
    if (saved) {
      this.usage = { ...this.usage, ...JSON.parse(saved) };
    }
  }

  saveUsage() {
    localStorage.setItem('rinawarp_usage', JSON.stringify(this.usage));
  }

  setTier(tier) {
    this.currentTier = tier;
    this.saveUsage();
  }

  getTier() {
    return this.currentTier;
  }

  getLimits() {
    return this.limits[this.currentTier] || this.limits.free;
  }

  getUsage() {
    return this.usage;
  }

  canUse(feature) {
    const limits = this.getLimits();
    const limit = limits[feature];

    if (limit === -1) return true; // unlimited
    if (limit === undefined) return true; // no limit defined

    return this.usage[feature] < limit;
  }

  use(feature) {
    if (!this.canUse(feature)) {
      return false;
    }

    this.usage[feature]++;
    this.saveUsage();
    return true;
  }

  getRemaining(feature) {
    const limits = this.getLimits();
    const limit = limits[feature];

    if (limit === -1) return 'unlimited';
    if (limit === undefined) return 'unlimited';

    return Math.max(0, limit - this.usage[feature]);
  }

  getUsagePercentage(feature) {
    const limits = this.getLimits();
    const limit = limits[feature];

    if (limit === -1) return 0; // unlimited
    if (limit === undefined) return 0;

    return Math.min(100, (this.usage[feature] / limit) * 100);
  }

  isNearLimit(feature, threshold = 80) {
    return this.getUsagePercentage(feature) >= threshold;
  }

  isAtLimit(feature) {
    return this.getUsagePercentage(feature) >= 100;
  }

  getUpgradeMessage(feature) {
    const currentTier = this.currentTier;
    const limits = this.limits;

    let nextTier = null;
    let nextLimit = null;

    const tiers = ['free', 'basic', 'professional', 'business', 'enterprise'];
    const currentIndex = tiers.indexOf(currentTier);

    for (let i = currentIndex + 1; i < tiers.length; i++) {
      const tier = tiers[i];
      const limit = limits[tier][feature];
      if (limit > limits[currentTier][feature]) {
        nextTier = tier;
        nextLimit = limit;
        break;
      }
    }

    if (!nextTier) {
      return `You've reached the maximum limit for ${feature}.`;
    }

    return `Upgrade to ${nextTier} tier to get ${nextLimit === -1 ? 'unlimited' : nextLimit} ${feature} per month.`;
  }

  resetUsage() {
    this.usage = {
      aiQueries: 0,
      macros: 0,
      themes: 0,
      workflows: 0,
      sessions: 0,
      integrations: 0,
      voiceCommands: 0,
    };
    this.saveUsage();
  }

  getStatus() {
    const limits = this.getLimits();
    const status = {};

    Object.keys(limits).forEach((feature) => {
      status[feature] = {
        used: this.usage[feature],
        limit: limits[feature],
        remaining: this.getRemaining(feature),
        percentage: this.getUsagePercentage(feature),
        nearLimit: this.isNearLimit(feature),
        atLimit: this.isAtLimit(feature),
      };
    });

    return {
      tier: this.currentTier,
      limits: limits,
      usage: this.usage,
      status: status,
    };
  }

  // Feature-specific methods
  canUseAI() {
    return this.canUse('aiQueries');
  }

  useAI() {
    return this.use('aiQueries');
  }

  canCreateMacro() {
    return this.canUse('macros');
  }

  useMacro() {
    return this.use('macros');
  }

  canUseTheme() {
    return this.canUse('themes');
  }

  useTheme() {
    return this.use('themes');
  }

  canCreateWorkflow() {
    return this.canUse('workflows');
  }

  useWorkflow() {
    return this.use('workflows');
  }

  canCreateSession() {
    return this.canUse('sessions');
  }

  useSession() {
    return this.use('sessions');
  }

  canUseIntegration() {
    return this.canUse('integrations');
  }

  useIntegration() {
    return this.use('integrations');
  }

  canUseVoice() {
    return this.canUse('voiceCommands');
  }

  useVoice() {
    return this.use('voiceCommands');
  }
}

// Global instance
window.featureLimits = new FeatureLimits();
