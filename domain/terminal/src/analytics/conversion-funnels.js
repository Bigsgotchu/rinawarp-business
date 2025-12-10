/**
 * RinaWarp Terminal Pro - Conversion Funnels
 * Tracks user journey and optimizes conversion rates
 */

class ConversionFunnels {
  constructor() {
    this.funnels = {
      freeToBasic: {
        name: 'Free to Basic',
        steps: [
          'landing_page',
          'pricing_view',
          'basic_plan_click',
          'checkout_start',
          'payment_complete',
        ],
        currentStep: 0,
        conversions: 0,
        dropoffs: {},
      },
      basicToProfessional: {
        name: 'Basic to Professional',
        steps: [
          'basic_plan_active',
          'feature_limit_reached',
          'upgrade_prompt_view',
          'professional_plan_click',
          'checkout_start',
          'payment_complete',
        ],
        currentStep: 0,
        conversions: 0,
        dropoffs: {},
      },
      professionalToBusiness: {
        name: 'Professional to Business',
        steps: [
          'professional_plan_active',
          'team_features_needed',
          'business_plan_view',
          'business_plan_click',
          'checkout_start',
          'payment_complete',
        ],
        currentStep: 0,
        conversions: 0,
        dropoffs: {},
      },
      anyToLifetime: {
        name: 'Any Plan to Lifetime',
        steps: [
          'pricing_page_view',
          'lifetime_plan_view',
          'lifetime_plan_click',
          'checkout_start',
          'payment_complete',
        ],
        currentStep: 0,
        conversions: 0,
        dropoffs: {},
      },
    };

    this.userJourney = [];
    this.sessionStart = Date.now();
    this.initializeTracking();
  }

  initializeTracking() {
    // Track page views
    this.trackPageView();

    // Track button clicks
    this.trackButtonClicks();

    // Track form interactions
    this.trackFormInteractions();

    // Track scroll depth
    this.trackScrollDepth();

    // Track time on page
    this.trackTimeOnPage();
  }

  trackPageView() {
    const page = window.location.pathname;
    const timestamp = Date.now();

    this.addToJourney({
      action: 'page_view',
      page: page,
      timestamp: timestamp,
      sessionId: this.getSessionId(),
    });

    // Track specific funnel steps
    if (page.includes('pricing')) {
      this.trackFunnelStep('freeToBasic', 'pricing_view');
      this.trackFunnelStep('anyToLifetime', 'pricing_page_view');
    }
  }

  trackButtonClicks() {
    document.addEventListener('click', (event) => {
      const button = event.target.closest('button, a');
      if (!button) return;

      const buttonText = button.textContent.trim();
      const buttonClass = button.className;
      const timestamp = Date.now();

      this.addToJourney({
        action: 'button_click',
        buttonText: buttonText,
        buttonClass: buttonClass,
        timestamp: timestamp,
        sessionId: this.getSessionId(),
      });

      // Track specific funnel steps
      if (buttonText.includes('Basic') || buttonText.includes('$19.99')) {
        this.trackFunnelStep('freeToBasic', 'basic_plan_click');
      } else if (
        buttonText.includes('Professional') ||
        buttonText.includes('$79.99')
      ) {
        this.trackFunnelStep('basicToProfessional', 'professional_plan_click');
      } else if (
        buttonText.includes('Business') ||
        buttonText.includes('$149.99')
      ) {
        this.trackFunnelStep('professionalToBusiness', 'business_plan_click');
      } else if (
        buttonText.includes('Lifetime') ||
        buttonText.includes('$999.99')
      ) {
        this.trackFunnelStep('anyToLifetime', 'lifetime_plan_click');
      }
    });
  }

  trackFormInteractions() {
    document.addEventListener('input', (event) => {
      if (event.target.type === 'email' || event.target.type === 'text') {
        this.addToJourney({
          action: 'form_input',
          field: event.target.type,
          timestamp: Date.now(),
          sessionId: this.getSessionId(),
        });
      }
    });

    document.addEventListener('submit', (event) => {
      this.addToJourney({
        action: 'form_submit',
        form: event.target.id || 'unknown',
        timestamp: Date.now(),
        sessionId: this.getSessionId(),
      });
    });
  }

  trackScrollDepth() {
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
          100
      );
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        this.addToJourney({
          action: 'scroll_depth',
          depth: scrollPercent,
          timestamp: Date.now(),
          sessionId: this.getSessionId(),
        });
      }
    });
  }

  trackTimeOnPage() {
    setInterval(() => {
      const timeOnPage = Math.round((Date.now() - this.sessionStart) / 1000);
      this.addToJourney({
        action: 'time_on_page',
        seconds: timeOnPage,
        timestamp: Date.now(),
        sessionId: this.getSessionId(),
      });
    }, 30000); // Every 30 seconds
  }

  addToJourney(event) {
    this.userJourney.push(event);

    // Keep only last 100 events
    if (this.userJourney.length > 100) {
      this.userJourney = this.userJourney.slice(-100);
    }

    // Send to analytics
    this.sendToAnalytics(event);
  }

  trackFunnelStep(funnelName, step) {
    const funnel = this.funnels[funnelName];
    if (!funnel) return;

    const stepIndex = funnel.steps.indexOf(step);
    if (stepIndex === -1) return;

    // Update current step
    if (stepIndex > funnel.currentStep) {
      funnel.currentStep = stepIndex;
    }

    // Track conversion if it's the last step
    if (stepIndex === funnel.steps.length - 1) {
      funnel.conversions++;
      this.trackConversion(funnelName, step);
    }
  }

  trackConversion(funnelName, step) {
    const conversion = {
      funnel: funnelName,
      step: step,
      timestamp: Date.now(),
      sessionId: this.getSessionId(),
      userJourney: [...this.userJourney],
    };

    // Send conversion event
    this.sendToAnalytics({
      action: 'conversion',
      ...conversion,
    });

    // Store locally
    this.storeConversion(conversion);
  }

  trackDropoff(funnelName, step) {
    const funnel = this.funnels[funnelName];
    if (!funnel) return;

    if (!funnel.dropoffs[step]) {
      funnel.dropoffs[step] = 0;
    }
    funnel.dropoffs[step]++;

    this.sendToAnalytics({
      action: 'dropoff',
      funnel: funnelName,
      step: step,
      timestamp: Date.now(),
      sessionId: this.getSessionId(),
    });
  }

  getFunnelStats(funnelName) {
    const funnel = this.funnels[funnelName];
    if (!funnel) return null;

    const totalUsers = this.getTotalUsersForFunnel(funnelName);
    const conversionRate =
      totalUsers > 0 ? (funnel.conversions / totalUsers) * 100 : 0;

    return {
      name: funnel.name,
      totalUsers: totalUsers,
      conversions: funnel.conversions,
      conversionRate: conversionRate,
      dropoffs: funnel.dropoffs,
      steps: funnel.steps.map((step, index) => ({
        step: step,
        index: index,
        dropoffs: funnel.dropoffs[step] || 0,
      })),
    };
  }

  getAllFunnelStats() {
    const stats = {};
    Object.keys(this.funnels).forEach((funnelName) => {
      stats[funnelName] = this.getFunnelStats(funnelName);
    });
    return stats;
  }

  getTotalUsersForFunnel(funnelName) {
    // This would typically come from your analytics system
    // For now, we'll estimate based on page views
    const pageViews = this.userJourney.filter(
      (event) => event.action === 'page_view'
    ).length;
    return Math.max(pageViews, 1);
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem('rinawarp_session_id');
    if (!sessionId) {
      sessionId =
        'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('rinawarp_session_id', sessionId);
    }
    return sessionId;
  }

  sendToAnalytics(event) {
    // Send to your analytics service
    if (typeof gtag !== 'undefined') {
      gtag('event', event.action, {
        event_category: 'conversion',
        event_label: event.step || event.page || 'unknown',
        value: event.value || 0,
      });
    }

    // Send to custom analytics endpoint
    fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }).catch((error) => {
      console.error('Analytics error:', error);
    });
  }

  storeConversion(conversion) {
    try {
      const conversions = JSON.parse(
        localStorage.getItem('rinawarp_conversions') || '[]'
      );
      conversions.push(conversion);
      localStorage.setItem('rinawarp_conversions', JSON.stringify(conversions));
    } catch (error) {
      console.error('Error storing conversion:', error);
    }
  }

  getConversionHistory() {
    try {
      return JSON.parse(localStorage.getItem('rinawarp_conversions') || '[]');
    } catch (error) {
      console.error('Error loading conversion history:', error);
      return [];
    }
  }

  // Optimization recommendations
  getOptimizationRecommendations() {
    const recommendations = [];
    const stats = this.getAllFunnelStats();

    Object.keys(stats).forEach((funnelName) => {
      const funnel = stats[funnelName];
      if (!funnel) return;

      // Check for high dropoff rates
      Object.keys(funnel.dropoffs).forEach((step) => {
        const dropoffRate = (funnel.dropoffs[step] / funnel.totalUsers) * 100;
        if (dropoffRate > 50) {
          recommendations.push({
            type: 'high_dropoff',
            funnel: funnelName,
            step: step,
            rate: dropoffRate,
            suggestion: `High dropoff rate (${dropoffRate.toFixed(1)}%) at ${step}. Consider improving this step.`,
          });
        }
      });

      // Check for low conversion rates
      if (funnel.conversionRate < 5) {
        recommendations.push({
          type: 'low_conversion',
          funnel: funnelName,
          rate: funnel.conversionRate,
          suggestion: `Low conversion rate (${funnel.conversionRate.toFixed(1)}%) for ${funnelName}. Consider A/B testing the funnel.`,
        });
      }
    });

    return recommendations;
  }
}

export default ConversionFunnels;
