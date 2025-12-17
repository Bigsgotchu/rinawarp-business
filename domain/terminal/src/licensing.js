// RinaWarp Terminal Pro - Freemium Licensing System
export class LicenseManager {
  constructor() {
    this.tier = this.getCurrentTier();
    this.features = this.getTierFeatures();
  }

  getCurrentTier() {
    // Check if user has valid license
    const license = localStorage.getItem('rinawarp_license');
    if (license && this.validateLicense(license)) {
      return 'premium';
    }
    return 'free';
  }

  getTierFeatures() {
    const features = {
      free: {
        aiRequests: 10, // 10 AI requests per day
        voiceEnabled: false, // No voice features
        themes: ['basic'], // Only basic theme
        advancedCommands: false, // No advanced commands
        prioritySupport: false, // Community support only
        exportData: false, // No data export
        apiAccess: false, // No API access
        customIntegrations: false, // No custom integrations
      },
      premium: {
        aiRequests: 'unlimited', // Unlimited AI requests
        voiceEnabled: true, // Full voice features
        themes: 'all', // All themes available
        advancedCommands: true, // Advanced commands enabled
        prioritySupport: true, // Priority support
        exportData: true, // Data export enabled
        apiAccess: true, // Full API access
        customIntegrations: true, // Custom integrations
      },
    };
    return features[this.tier];
  }

  validateLicense(licenseKey) {
    // Validate license with your backend
    // For now, accept any non-empty key as valid
    return licenseKey && licenseKey.length > 10;
  }

  checkFeatureAccess(feature) {
    return this.features[feature] !== false;
  }

  getRemainingRequests() {
    if (this.tier === 'premium') return 'unlimited';
    const today = new Date().toDateString();
    const used = parseInt(localStorage.getItem(`requests_${today}`) || '0');
    return Math.max(0, this.features.aiRequests - used);
  }

  recordRequest() {
    if (this.tier === 'free') {
      const today = new Date().toDateString();
      const used = parseInt(localStorage.getItem(`requests_${today}`) || '0');
      localStorage.setItem(`requests_${today}`, (used + 1).toString());
    }
  }

  upgradePrompt() {
    return {
      title: '🚀 Upgrade to Premium',
      message: 'Get unlimited AI requests, voice features, and premium themes!',
      features: [
        'Unlimited AI requests per day',
        'Voice control and TTS',
        'All premium themes',
        'Advanced commands',
        'Priority support',
        'Data export capabilities',
      ],
      cta: 'Upgrade Now - $999.99 Lifetime',
    };
  }
}
