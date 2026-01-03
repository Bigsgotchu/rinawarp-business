/**
 * Single License Resolver Function
 * Centralized license state resolution - single source of truth
 * This replaces scattered license checks across the UI
 */

class LicenseResolver {
  constructor() {
    this.licenseCache = null;
    this.lastCheck = 0;
    this.checkInterval = 24 * 60 * 60 * 1000; // 24 hours
    this.backendUrl = 'https://api.rinawarptech.com';
  }

  /**
   * Single source of truth for license resolution
   * @returns {Promise<Object>} License state object
   */
  async resolveLicense() {
    try {
      // Check if we have recent cached data
      if (this.licenseCache && (Date.now() - this.lastCheck) < this.checkInterval) {
        return this.licenseCache;
      }

      // Get license key from secure storage
      const licenseKey = await this.getStoredLicenseKey();
      
      if (!licenseKey) {
        const freeLicense = {
          status: 'none',
          tier: 'free',
          valid: false,
          features: this.getFreeTierFeatures(),
          lastChecked: new Date().toISOString()
        };
        this.licenseCache = freeLicense;
        this.lastCheck = Date.now();
        return freeLicense;
      }

      // Validate license with backend
      const licenseData = await this.validateLicenseWithBackend(licenseKey);
      
      const resolvedLicense = {
        status: licenseData.valid ? 'active' : 'invalid',
        tier: licenseData.tier || 'free',
        valid: licenseData.valid,
        features: this.getFeaturesForTier(licenseData.tier || 'free'),
        licenseKey: licenseData.licenseKey,
        expiresAt: licenseData.expiresAt,
        lastChecked: new Date().toISOString()
      };

      this.licenseCache = resolvedLicense;
      this.lastCheck = Date.now();
      
      return resolvedLicense;

    } catch (error) {
      console.warn('License resolution failed, falling back to free tier:', error);
      
      const fallbackLicense = {
        status: 'error',
        tier: 'free',
        valid: false,
        features: this.getFreeTierFeatures(),
        error: error.message,
        lastChecked: new Date().toISOString()
      };

      this.licenseCache = fallbackLicense;
      this.lastCheck = Date.now();
      
      return fallbackLicense;
    }
  }

  /**
   * Get stored license key from secure storage
   */
  async getStoredLicenseKey() {
    if (window.electronAPI) {
      return await window.electronAPI.getSetting('license_key');
    }
    return null;
  }

  /**
   * Validate license with backend
   */
  async validateLicenseWithBackend(licenseKey) {
    try {
      const response = await fetch(`${this.backendUrl}/license/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ licenseKey }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        valid: data.success && data.license?.status === 'active',
        tier: data.license?.tier || 'free',
        licenseKey: licenseKey,
        expiresAt: data.license?.expiresAt
      };

    } catch (error) {
      // Network error or backend unavailable
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network unavailable - license check failed');
      }
      throw error;
    }
  }

  /**
   * Get features for specific tier
   */
  getFeaturesForTier(tier) {
    const featureMap = {
      free: this.getFreeTierFeatures(),
      pro: [
        ...this.getFreeTierFeatures(),
        'Advanced AI Features',
        'Priority Support',
        'Custom Themes',
        'Advanced Terminal Features'
      ],
      enterprise: [
        ...this.getFreeTierFeatures(),
        'Advanced AI Features',
        'Priority Support',
        'Custom Themes',
        'Advanced Terminal Features',
        'Team Collaboration',
        'Custom Integrations',
        'Bulk License Management'
      ]
    };

    return featureMap[tier] || this.getFreeTierFeatures();
  }

  /**
   * Free tier features
   */
  getFreeTierFeatures() {
    return [
      'Basic Terminal',
      'File Management',
      'Standard Commands'
    ];
  }

  /**
   * Check if user has specific feature access
   * @param {string} featureName - Name of the feature to check
   * @returns {Promise<boolean>}
   */
  async hasFeature(featureName) {
    const license = await this.resolveLicense();
    return license.features.includes(featureName);
  }

  /**
   * Check if user is Pro user
   * @returns {Promise<boolean>}
   */
  async isProUser() {
    const license = await this.resolveLicense();
    return ['pro', 'enterprise'].includes(license.tier);
  }

  /**
   * Get current license tier
   * @returns {Promise<string>}
   */
  async getLicenseTier() {
    const license = await this.resolveLicense();
    return license.tier;
  }

  /**
   * Clear cached license data (force refresh)
   */
  clearCache() {
    this.licenseCache = null;
    this.lastCheck = 0;
  }

  /**
   * Store new license key
   * @param {string} licenseKey 
   */
  async setLicenseKey(licenseKey) {
    if (window.electronAPI) {
      await window.electronAPI.setSetting('license_key', licenseKey);
    }
    this.clearCache(); // Clear cache to force refresh
  }

  /**
   * Remove stored license key
   */
  async clearLicenseKey() {
    if (window.electronAPI) {
      await window.electronAPI.setSetting('license_key', '');
    }
    this.clearCache(); // Clear cache to force refresh
  }
}

// Export singleton instance
const licenseResolver = new LicenseResolver();

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.LicenseResolver = LicenseResolver;
  window.resolveLicense = () => licenseResolver.resolveLicense();
  window.hasFeature = (feature) => licenseResolver.hasFeature(feature);
  window.isProUser = () => licenseResolver.isProUser();
  window.getLicenseTier = () => licenseResolver.getLicenseTier();
  window.setLicenseKey = (key) => licenseResolver.setLicenseKey(key);
  window.clearLicenseKey = () => licenseResolver.clearLicenseKey();
}

module.exports = { LicenseResolver, licenseResolver };