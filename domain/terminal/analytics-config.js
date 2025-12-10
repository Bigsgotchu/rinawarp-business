// RinaWarp Terminal Pro - Analytics Configuration
// This file configures analytics tracking for revenue optimization

window.RINAWARP_ANALYTICS = {
  // Google Analytics 4 Configuration
  googleAnalytics: {
    measurementId: 'G-XXXXXXXXXX', // Replace with your GA4 measurement ID
    enabled: true,
    debug: false,
  },

  // Revenue tracking events
  revenue: {
    events: {
      // Trial and conversion events
      trial_started: {
        category: 'conversion',
        action: 'trial_started',
        label: '14_day_trial',
      },
      download_clicked: {
        category: 'conversion',
        action: 'download_clicked',
        label: 'platform_download',
      },
      pricing_viewed: {
        category: 'conversion',
        action: 'pricing_viewed',
        label: 'pricing_page',
      },
      purchase_intent: {
        category: 'conversion',
        action: 'purchase_intent',
        label: 'pricing_plan',
      },

      // User engagement events
      feature_interaction: {
        category: 'engagement',
        action: 'feature_used',
        label: 'terminal_feature',
      },
      page_scroll: {
        category: 'engagement',
        action: 'page_scroll',
        label: 'scroll_depth',
      },
      time_on_page: {
        category: 'engagement',
        action: 'time_spent',
        label: 'page_duration',
      },
    },

    // Conversion funnel tracking
    funnel: {
      steps: [
        'landing_page',
        'feature_exploration',
        'pricing_view',
        'trial_download',
        'purchase_completion',
      ],
      trackStep: function (step, data = {}) {
        if (typeof gtag !== 'undefined') {
          gtag('event', 'funnel_step', {
            event_category: 'conversion_funnel',
            event_label: step,
            value: this.steps.indexOf(step) + 1,
            custom_parameter: data,
          });
        }
      },
    },
  },

  // Performance monitoring
  performance: {
    trackPageLoad: true,
    trackCoreWebVitals: true,
    trackResourceTiming: true,

    // Performance thresholds (for alerts)
    thresholds: {
      firstContentfulPaint: 1800, // ms
      largestContentfulPaint: 2500, // ms
      firstInputDelay: 100, // ms
      cumulativeLayoutShift: 0.1, // score
    },
  },

  // Error tracking
  errorTracking: {
    enabled: true,
    sampleRate: 1.0, // Track 100% of errors in production

    // Error categorization
    categorizeError: function (error, errorInfo) {
      const errorType = error.name || 'Unknown';
      const errorMessage = error.message || 'No message';

      return {
        category: 'javascript_error',
        action: errorType,
        label: errorMessage,
        custom_parameter: {
          stack: error.stack,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        },
      };
    },
  },

  // A/B testing configuration
  abTesting: {
    enabled: true,

    // Test variations
    variations: {
      pricing_display: {
        id: 'pricing_display_test',
        variants: ['original', 'simplified', 'detailed'],
        traffic: 0.33, // 33% of users in test
      },

      cta_button: {
        id: 'cta_button_test',
        variants: ['download_now', 'start_free_trial', 'try_free'],
        traffic: 0.25, // 25% of users in test
      },
    },

    // Track conversion by variant
    trackConversion: function (testId, variant, conversionType) {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'ab_test_conversion', {
          event_category: 'ab_testing',
          event_label: `${testId}_${variant}`,
          dimension1: testId,
          dimension2: variant,
          dimension3: conversionType,
        });
      }
    },
  },

  // Privacy compliance
  privacy: {
    // GDPR/CCPA compliance
    gdprCompliant: true,
    ccpaCompliant: true,

    // Cookie consent
    cookieConsent: {
      required: ['essential'],
      optional: ['analytics', 'marketing'],
      defaultConsent: 'essential',
    },

    // Data retention
    retention: {
      analytics: 26, // months
      errorLogs: 90, // days
      userData: 12, // months
    },
  },

  // Custom tracking functions
  track: {
    // Track custom events
    event: function (action, category, label, value) {
      if (typeof gtag !== 'undefined') {
        gtag('event', action, {
          event_category: category,
          event_label: label,
          value: value,
        });
      }
    },

    // Track page views
    pageView: function (pagePath, pageTitle) {
      if (typeof gtag !== 'undefined') {
        gtag(
          'config',
          window.RINAWARP_ANALYTICS.googleAnalytics.measurementId,
          {
            page_path: pagePath,
            page_title: pageTitle,
          }
        );
      }
    },

    // Track conversions
    conversion: function (conversionType, value, currency = 'USD') {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'conversion', {
          event_category: 'ecommerce',
          event_label: conversionType,
          value: value,
          currency: currency,
        });
      }
    },
  },
};

// Initialize analytics when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  // Initialize Google Analytics
  if (window.RINAWARP_ANALYTICS.googleAnalytics.enabled) {
    // Google Analytics initialization will be handled by gtag script in HTML
    console.log('RinaWarp Analytics initialized');
  }

  // Track initial page load
  window.RINAWARP_ANALYTICS.track.pageView(
    window.location.pathname,
    document.title
  );

  // Track performance metrics
  if (window.RINAWARP_ANALYTICS.performance.trackPageLoad) {
    window.addEventListener('load', function () {
      setTimeout(function () {
        const perfData = performance.getEntriesByType('navigation')[0];
        if (perfData) {
          window.RINAWARP_ANALYTICS.track.event(
            'page_load_time',
            'performance',
            'page_load',
            Math.round(perfData.loadEventEnd - perfData.loadEventStart)
          );
        }
      }, 0);
    });
  }

  // Track JavaScript errors
  if (window.RINAWARP_ANALYTICS.errorTracking.enabled) {
    window.addEventListener('error', function (event) {
      const errorData = window.RINAWARP_ANALYTICS.errorTracking.categorizeError(
        event.error,
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        }
      );

      window.RINAWARP_ANALYTICS.track.event(
        errorData.action,
        errorData.category,
        errorData.label
      );
    });
  }
});
