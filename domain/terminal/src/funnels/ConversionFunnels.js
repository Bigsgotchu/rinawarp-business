// Conversion Funnels System
// Optimizes user journey from Free → Basic → Professional → Business

export class ConversionFunnels {
  constructor() {
    this.funnels = {
      freeToBasic: {
        name: 'Free to Basic',
        steps: [
          'signup',
          'first_ai_query',
          'theme_change',
          'macro_creation',
          'upgrade_prompt',
        ],
        conversionRate: 0,
        totalUsers: 0,
        convertedUsers: 0,
      },
      basicToProfessional: {
        name: 'Basic to Professional',
        steps: [
          'basic_signup',
          'workflow_creation',
          'integration_usage',
          'advanced_features',
          'upgrade_prompt',
        ],
        conversionRate: 0,
        totalUsers: 0,
        convertedUsers: 0,
      },
      professionalToBusiness: {
        name: 'Professional to Business',
        steps: [
          'pro_signup',
          'team_features',
          'enterprise_inquiry',
          'custom_branding',
          'upgrade_prompt',
        ],
        conversionRate: 0,
        totalUsers: 0,
        convertedUsers: 0,
      },
    };

    this.userJourneys = new Map();
    this.analytics = {
      pageViews: 0,
      signups: 0,
      conversions: 0,
      revenue: 0,
    };

    this.initializeFunnels();
  }

  initializeFunnels() {
    // Load saved data
    this.loadFunnelData();

    // Set up tracking
    this.setupTracking();

    // Set up conversion optimization
    this.setupConversionOptimization();
  }

  loadFunnelData() {
    const saved = localStorage.getItem('rinawarp_funnels');
    if (saved) {
      const data = JSON.parse(saved);
      this.funnels = { ...this.funnels, ...data.funnels };
      this.analytics = { ...this.analytics, ...data.analytics };
    }
  }

  saveFunnelData() {
    localStorage.setItem(
      'rinawarp_funnels',
      JSON.stringify({
        funnels: this.funnels,
        analytics: this.analytics,
      })
    );
  }

  setupTracking() {
    // Track page views
    this.trackPageView();

    // Track user interactions
    this.trackInteractions();

    // Track conversion events
    this.trackConversions();
  }

  trackPageView() {
    this.analytics.pageViews++;
    this.saveFunnelData();
  }

  trackInteractions() {
    // Track clicks on upgrade buttons
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-upgrade]')) {
        this.trackUpgradeClick(event.target.dataset.upgrade);
      }
    });

    // Track feature usage
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-feature]')) {
        this.trackFeatureUsage(event.target.dataset.feature);
      }
    });
  }

  trackConversions() {
    // Track signups
    window.addEventListener('signup', (event) => {
      this.trackSignup(event.detail.tier);
    });

    // Track upgrades
    window.addEventListener('upgrade', (event) => {
      this.trackUpgrade(event.detail.from, event.detail.to);
    });
  }

  trackSignup(tier) {
    this.analytics.signups++;

    // Initialize user journey
    const userId = this.generateUserId();
    this.userJourneys.set(userId, {
      tier: tier,
      startTime: Date.now(),
      steps: ['signup'],
      currentStep: 0,
    });

    this.saveFunnelData();
  }

  trackUpgrade(from, to) {
    this.analytics.conversions++;

    // Calculate revenue
    const revenue = this.calculateRevenue(to);
    this.analytics.revenue += revenue;

    // Update funnel data
    this.updateFunnelData(from, to);

    this.saveFunnelData();
  }

  trackUpgradeClick(tier) {
    // Track upgrade button clicks
    this.trackEvent('upgrade_click', { tier: tier });
  }

  trackFeatureUsage(feature) {
    // Track feature usage for funnel optimization
    this.trackEvent('feature_usage', { feature: feature });
  }

  trackEvent(eventType, data) {
    // Send to analytics
    if (window.analytics) {
      window.analytics.track(eventType, data);
    }

    // Send to Google Analytics
    if (window.gtag) {
      window.gtag('event', eventType, data);
    }
  }

  updateFunnelData(from, to) {
    const funnelKey = `${from}To${to.charAt(0).toUpperCase() + to.slice(1)}`;

    if (this.funnels[funnelKey]) {
      this.funnels[funnelKey].convertedUsers++;
      this.funnels[funnelKey].conversionRate =
        this.funnels[funnelKey].convertedUsers /
        this.funnels[funnelKey].totalUsers;
    }
  }

  calculateRevenue(tier) {
    const pricing = {
      basic: 9.99,
      professional: 29.99,
      business: 99.99,
      enterprise: 299.99,
    };

    return pricing[tier] || 0;
  }

  generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }

  setupConversionOptimization() {
    // Set up A/B testing
    this.setupABTesting();

    // Set up personalized messaging
    this.setupPersonalizedMessaging();

    // Set up exit intent detection
    this.setupExitIntent();
  }

  setupABTesting() {
    // A/B test different upgrade prompts
    const variants = ['standard', 'urgent', 'benefit_focused'];
    const variant = variants[Math.floor(Math.random() * variants.length)];

    this.setUpgradePromptVariant(variant);
  }

  setUpgradePromptVariant(variant) {
    const prompts = {
      standard: {
        title: 'Upgrade to unlock more features',
        message: 'Get access to advanced AI, more themes, and unlimited usage.',
        cta: 'Upgrade Now',
      },
      urgent: {
        title: 'Limited time offer!',
        message: 'Upgrade now and save 20% on your first month.',
        cta: 'Claim Offer',
      },
      benefit_focused: {
        title: 'Boost your productivity',
        message: 'Join thousands of developers who upgraded to Basic tier.',
        cta: 'Join Them',
      },
    };

    const prompt = prompts[variant];
    this.currentPrompt = prompt;
  }

  setupPersonalizedMessaging() {
    // Personalize messages based on user behavior
    this.personalizedMessages = {
      heavy_ai_user:
        'You\'ve used AI queries 50+ times this month. Upgrade for unlimited access!',
      theme_lover:
        'You love customizing themes. Get access to 20+ premium themes!',
      workflow_user:
        'You\'re creating workflows. Upgrade for advanced automation!',
      team_user: 'Working with a team? Get team collaboration features!',
    };
  }

  setupExitIntent() {
    let exitIntentShown = false;

    document.addEventListener('mouseleave', (event) => {
      if (event.clientY <= 0 && !exitIntentShown) {
        this.showExitIntentOffer();
        exitIntentShown = true;
      }
    });
  }

  showExitIntentOffer() {
    // Show exit intent popup
    const popup = document.createElement('div');
    popup.className = 'exit-intent-popup';
    popup.innerHTML = `
      <div class="popup-content">
        <h3>Wait! Don't miss out!</h3>
        <p>Get 20% off your first month when you upgrade to Basic tier.</p>
        <button class="upgrade-btn" data-upgrade="basic">Upgrade Now</button>
        <button class="close-btn">No Thanks</button>
      </div>
    `;

    document.body.appendChild(popup);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      popup.remove();
    }, 10000);
  }

  // Funnel analysis methods
  getFunnelMetrics() {
    return {
      funnels: this.funnels,
      analytics: this.analytics,
      conversionRates: this.calculateConversionRates(),
    };
  }

  calculateConversionRates() {
    const rates = {};

    Object.keys(this.funnels).forEach((funnelKey) => {
      const funnel = this.funnels[funnelKey];
      rates[funnelKey] = {
        conversionRate: funnel.conversionRate,
        totalUsers: funnel.totalUsers,
        convertedUsers: funnel.convertedUsers,
      };
    });

    return rates;
  }

  getOptimizationSuggestions() {
    const suggestions = [];

    // Analyze conversion rates
    Object.keys(this.funnels).forEach((funnelKey) => {
      const funnel = this.funnels[funnelKey];

      if (funnel.conversionRate < 0.15) {
        suggestions.push({
          funnel: funnelKey,
          issue: 'Low conversion rate',
          suggestion: 'Optimize the upgrade flow and messaging',
          priority: 'high',
        });
      }
    });

    return suggestions;
  }

  // Public API
  trackUserStep(userId, step) {
    const journey = this.userJourneys.get(userId);
    if (journey) {
      journey.steps.push(step);
      journey.currentStep = journey.steps.length - 1;
    }
  }

  getConversionFunnel(funnelKey) {
    return this.funnels[funnelKey];
  }

  getAllFunnels() {
    return this.funnels;
  }

  getAnalytics() {
    return this.analytics;
  }
}

// Global instance
window.conversionFunnels = new ConversionFunnels();
