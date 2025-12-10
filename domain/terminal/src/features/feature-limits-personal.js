/**
 * RinaWarp Terminal Pro - Personal Feature Limits System
 * FULLY UNLOCKED VERSION - For personal use only
 */

class FeatureLimitsPersonal {
  constructor() {
    this.limits = {
      lifetime: {
        aiQueries: 'unlimited',
        macros: 'unlimited',
        voiceCommands: 'unlimited',
        deviceLicenses: 'unlimited',
        themes: 'unlimited',
        support: 'dedicated',
        analytics: 'enterprise',
        priority: true,
      },
    };

    this.usage = this.loadUsage();
  }

  loadUsage() {
    try {
      const stored = localStorage.getItem('rinawarp_usage');
      return stored
        ? JSON.parse(stored)
        : {
          aiQueries: 0,
          macros: 0,
          voiceCommands: 0,
          deviceLicenses: 0,
          lastReset: Date.now(),
        };
    } catch (error) {
      console.error('Error loading usage data:', error);
      return {
        aiQueries: 0,
        macros: 0,
        voiceCommands: 0,
        deviceLicenses: 0,
        lastReset: Date.now(),
      };
    }
  }

  saveUsage() {
    try {
      localStorage.setItem('rinawarp_usage', JSON.stringify(this.usage));
    } catch (error) {
      console.error('Error saving usage data:', error);
    }
  }

  getUserTier() {
    // PERSONAL VERSION - Always return lifetime tier (fully unlocked)
    return 'lifetime';
  }

  canUseFeature(feature) {
    // PERSONAL VERSION - All features always allowed
    return { allowed: true, remaining: 'unlimited' };
  }

  useFeature(feature) {
    // PERSONAL VERSION - All features always allowed
    return { success: true, remaining: 'unlimited' };
  }

  getUsageStats() {
    const tier = this.getUserTier();
    const stats = {};

    Object.keys(this.limits[tier]).forEach((feature) => {
      const limit = this.limits[tier][feature];
      const currentUsage = this.usage[feature] || 0;

      stats[feature] = {
        limit: limit,
        used: currentUsage,
        remaining: 'unlimited',
        percentage: 0,
      };
    });

    return {
      tier: tier,
      stats: stats,
      lastReset: this.usage.lastReset,
      personal: true,
    };
  }

  resetUsage() {
    this.usage = {
      aiQueries: 0,
      macros: 0,
      voiceCommands: 0,
      deviceLicenses: 0,
      lastReset: Date.now(),
    };
    this.saveUsage();
  }

  checkUpgradePrompt() {
    // PERSONAL VERSION - No upgrade prompts needed
    return { show: false };
  }

  getNextTier(currentTier) {
    // PERSONAL VERSION - Already at highest tier
    return null;
  }

  getUpgradeBenefits(currentTier) {
    // PERSONAL VERSION - No upgrades needed
    return null;
  }

  // Feature-specific methods
  canUseAI() {
    return this.canUseFeature('aiQueries');
  }

  useAI() {
    return this.useFeature('aiQueries');
  }

  canCreateMacro() {
    return this.canUseFeature('macros');
  }

  useMacro() {
    return this.useFeature('macros');
  }

  canUseVoice() {
    return this.canUseFeature('voiceCommands');
  }

  useVoice() {
    return this.useFeature('voiceCommands');
  }

  canAddDevice() {
    return this.canUseFeature('deviceLicenses');
  }

  useDevice() {
    return this.useFeature('deviceLicenses');
  }
}

export default FeatureLimitsPersonal;
