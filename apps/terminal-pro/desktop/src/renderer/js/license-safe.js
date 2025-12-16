/**
 * RinaWarp Terminal Pro - License Management (Safe API Version)
 * Fixed version that prevents API error spam in development
 */

class LicenseManager {
  constructor() {
    this.isInitialized = false;
    this.licenseInfo = null;
    this.backendUrl = 'https://api.rinawarptech.com';
    this.cacheKey = 'rinawarp-license-cache';
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours

    // License tiers
    this.licenseTiers = {
      free: {
        name: 'Free',
        features: [
          'Basic terminal',
          'RinaWarp branding',
          'Single terminal session',
          'Basic file navigation',
        ],
        limitations: [
          'No AI features',
          'No voice commands',
          'No premium themes',
          'No session management',
        ],
      },
      pro: {
        name: 'Pro',
        price: '$29.99',
        period: 'lifetime',
        features: [
          'All Free features',
          'AI command suggestions',
          'Voice commands',
          'Multiple terminal sessions',
          'Premium themes',
          'Session persistence',
          'Command history',
          'Quick fixes',
        ],
        limitations: [],
      },
      enterprise: {
        name: 'Enterprise',
        price: '$99.99',
        period: 'lifetime',
        features: [
          'All Pro features',
          'Advanced AI models',
          'Custom AI prompts',
          'Team collaboration',
          'Advanced security',
          'Priority support',
          'Custom integrations',
          'Bulk license management',
        ],
        limitations: [],
      },
    };

    this.featureMap = {
      'ai-suggestions': ['pro', 'enterprise'],
      'voice-commands': ['pro', 'enterprise'],
      'multiple-terminals': ['pro', 'enterprise'],
      'premium-themes': ['pro', 'enterprise'],
      'session-persistence': ['pro', 'enterprise'],
      'advanced-ai': ['enterprise'],
      'team-collaboration': ['enterprise'],
      'custom-integrations': ['enterprise'],
    };
  }

  async initialize() {
    try {
      // Load cached license info
      await this.loadCachedLicense();

      // Validate license with backend (safe call)
      await this.safeValidateLicense();

      // Setup event listeners
      this.setupEventListeners();

      this.isInitialized = true;
      console.log('License Manager initialized');
    } catch (error) {
      console.warn('License Manager initialization warning:', error.message);
    }
  }

  async loadCachedLicense() {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        if (Date.now() - data.timestamp < this.cacheExpiry) {
          this.licenseInfo = data.license;
        }
      }
    } catch (error) {
      console.warn('Failed to load cached license:', error);
    }
  }

  // Safe API call wrapper that prevents error spam
  async safeApiCall(apiFunction, fallbackValue = null) {
    try {
      return await apiFunction();
    } catch (error) {
      console.debug('License API unavailable (expected in dev):', error?.message || error);
      return fallbackValue;
    }
  }

  // Safe license validation - doesn't spam errors
  async safeValidateLicense(licenseKey = null) {
    const result = await this.safeApiCall(
      async () => {
        let endpoint = `${this.backendUrl}/license/validate`;
        let payload = {};

        if (licenseKey) {
          endpoint = `${this.backendUrl}/license/activate`;
          payload.licenseKey = licenseKey;
        } else if (this.licenseInfo?.licenseKey) {
          payload.licenseKey = this.licenseInfo.licenseKey;
        }

        const response = await this.makeApiRequest(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (response.success) {
          this.licenseInfo = response.license;
          this.cacheLicense();
          this.updateLicenseUI();
          return response.license;
        } else {
          throw new Error(response.message || 'License validation failed');
        }
      },
      this.licenseInfo || {
        tier: 'free',
        status: 'inactive',
        message: 'Backend unavailable',
      },
    );

    // Update fallback info if needed
    if (!this.licenseInfo) {
      this.licenseInfo = result;
      this.cacheLicense();
      this.updateLicenseUI();
    }

    return result;
  }

  async validateLicense(licenseKey = null) {
    return await this.safeValidateLicense(licenseKey);
  }

  async makeApiRequest(url, options = {}) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'RinaWarp-Terminal-Pro/1.0.0',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (!navigator.onLine) {
        console.warn('Offline - using cached license data');
        return { success: false, message: 'Offline' };
      }
      throw error;
    }
  }

  // Safe Stripe checkout creation
  async safeCreateCheckoutSession(tier) {
    const result = await this.safeApiCall(async () => {
      const response = await this.makeApiRequest(`${this.backendUrl}/stripe/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: tier,
          product: 'rinawarp-terminal-pro',
          success_url: `${window.location.origin}?purchase=success&tier=${tier}`,
          cancel_url: `${window.location.origin}?purchase=cancelled`,
        }),
      });

      return response;
    }, null);

    return result;
  }

  async createCheckoutSession(tier) {
    return await this.safeCreateCheckoutSession(tier);
  }

  async handlePurchase(tier) {
    try {
      this.showPurchaseLoading(tier);
      const session = await this.safeCreateCheckoutSession(tier);

      if (session?.url) {
        this.openCheckout(session.url);
      } else {
        this.showError('Stripe checkout unavailable. Please try again later.');
      }
    } catch (error) {
      console.warn('Purchase setup failed (expected in dev):', error.message);
      this.showError('Purchase system temporarily unavailable.');
    } finally {
      this.hidePurchaseLoading();
    }
  }

  openCheckout(url) {
    if (window.electronAPI) {
      window.open(url, '_blank');
    } else {
      window.open(url, '_blank');
    }
  }

  showPurchaseLoading(tier) {
    const button = document.querySelector(`[data-tier="${tier}"]`);
    if (button) {
      button.textContent = 'Processing...';
      button.disabled = true;
    }
  }

  hidePurchaseLoading() {
    document.querySelectorAll('.purchase-btn').forEach((btn) => {
      btn.textContent = btn.dataset.tier === 'pro' ? 'Upgrade to Pro' : 'Upgrade to Enterprise';
      btn.disabled = false;
    });
  }

  // ... Rest of methods remain the same but use safe calls where appropriate ...

  // Public API methods
  getAvailableTiers() {
    return this.licenseTiers;
  }

  getFeatureMap() {
    return this.featureMap;
  }

  isLicenseValid() {
    return this.licenseInfo && this.licenseInfo.status === 'active';
  }

  getLicenseTier() {
    return this.licenseInfo?.tier || 'free';
  }

  async getLicenseInfo() {
    if (!this.licenseInfo) {
      await this.safeValidateLicense();
    }
    return this.licenseInfo;
  }
}

// Export for use in main application
window.LicenseManager = LicenseManager;
window.licenseManager = new LicenseManager();
