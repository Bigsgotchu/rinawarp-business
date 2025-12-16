/**
 * RinaWarp Terminal Pro - Production Feature Limits System
 * PROPERLY LIMITED VERSION - For distribution to customers
 */

class FeatureLimitsProduction {
  constructor() {
    this.limits = {
      free: {
        aiQueries: 10,
        macros: 2,
        voiceCommands: 5,
        deviceLicenses: 1,
        themes: 3,
        support: 'community',
        analytics: false,
        priority: false,
      },
      basic: {
        aiQueries: 100,
        macros: 5,
        voiceCommands: 50,
        deviceLicenses: 2,
        themes: 10,
        support: 'email',
        analytics: 'basic',
        priority: false,
      },
      professional: {
        aiQueries: 1000,
        macros: 25,
        voiceCommands: 500,
        deviceLicenses: 5,
        themes: 'unlimited',
        support: 'priority',
        analytics: 'advanced',
        priority: true,
      },
      business: {
        aiQueries: 5000,
        macros: 100,
        voiceCommands: 2000,
        deviceLicenses: 20,
        themes: 'unlimited',
        support: 'dedicated',
        analytics: 'enterprise',
        priority: true,
      },
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
    // PRODUCTION VERSION - Check for valid license or subscription

    // Check for license key
    const licenseKey = localStorage.getItem('rinawarp_license');
    if (licenseKey) {
      try {
        const decoded = atob(licenseKey);
        const data = JSON.parse(decoded);
        return data.tier || 'free';
      } catch (error) {
        console.error('Invalid license key:', error);
        return 'free';
      }
    }

    // Check for subscription status
    const subscription = localStorage.getItem('rinawarp_subscription');
    if (subscription) {
      try {
        const sub = JSON.parse(subscription);
        return sub.tier || 'free';
      } catch (error) {
        console.error('Invalid subscription data:', error);
        return 'free';
      }
    }

    // Default to free tier for production
    return 'free';
  }

  canUseFeature(feature) {
    const tier = this.getUserTier();
    const limit = this.limits[tier][feature];

    if (limit === 'unlimited') {
      return { allowed: true, remaining: 'unlimited' };
    }

    const currentUsage = this.usage[feature] || 0;
    const remaining = Math.max(0, limit - currentUsage);

    return {
      allowed: remaining > 0,
      remaining: remaining,
      limit: limit,
      used: currentUsage,
    };
  }

  useFeature(feature) {
    const tier = this.getUserTier();
    const limit = this.limits[tier][feature];

    if (limit === 'unlimited') {
      return { success: true, remaining: 'unlimited' };
    }

    const currentUsage = this.usage[feature] || 0;

    if (currentUsage >= limit) {
      return {
        success: false,
        message: `You've reached your ${feature} limit for the ${tier} tier. Upgrade to continue.`,
        remaining: 0,
        limit: limit,
      };
    }

    this.usage[feature] = currentUsage + 1;
    this.saveUsage();

    return {
      success: true,
      remaining: limit - this.usage[feature],
      limit: limit,
      used: this.usage[feature],
    };
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
        remaining:
          limit === 'unlimited'
            ? 'unlimited'
            : Math.max(0, limit - currentUsage),
        percentage: limit === 'unlimited' ? 0 : (currentUsage / limit) * 100,
      };
    });

    return {
      tier: tier,
      stats: stats,
      lastReset: this.usage.lastReset,
      personal: false,
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
    const tier = this.getUserTier();
    const stats = this.getUsageStats();

    // Check if user is close to limits
    const featuresNearLimit = Object.keys(stats.stats).filter((feature) => {
      const stat = stats.stats[feature];
      return stat.percentage > 80 && stat.remaining !== 'unlimited';
    });

    if (featuresNearLimit.length > 0) {
      return {
        show: true,
        message: `You're using ${featuresNearLimit.length} features near their limit. Consider upgrading to ${this.getNextTier(tier)} for unlimited access.`,
        features: featuresNearLimit,
        nextTier: this.getNextTier(tier),
      };
    }

    return { show: false };
  }

  getNextTier(currentTier) {
    const tiers = ['free', 'basic', 'professional', 'business', 'lifetime'];
    const currentIndex = tiers.indexOf(currentTier);
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
  }

  getUpgradeBenefits(currentTier) {
    const nextTier = this.getNextTier(currentTier);
    if (!nextTier) return null;

    const current = this.limits[currentTier];
    const next = this.limits[nextTier];

    const benefits = [];
    Object.keys(next).forEach((feature) => {
      if (next[feature] !== current[feature]) {
        benefits.push({
          feature: feature,
          current: current[feature],
          next: next[feature],
        });
      }
    });

    return {
      nextTier: nextTier,
      benefits: benefits,
    };
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

export default FeatureLimitsProduction;
