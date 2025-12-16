// RinaWarp Analytics Configuration
// Handles Google Analytics, tracking, and performance monitoring

(function () {
  'use strict';

  // Google Analytics 4 Configuration
  const GA_MEASUREMENT_ID = 'G-SZK23HMCVP'; // Your actual GA ID

  // Analytics configuration
  const AnalyticsConfig = {
    // Google Analytics
    googleAnalytics: {
      enabled: true,
      measurementId: GA_MEASUREMENT_ID,
      debug: false,
    },

    // Custom tracking events
    events: {
      buttonClicks: true,
      pageViews: true,
      downloads: true,
      formSubmissions: true,
      errors: true,
    },

    // Performance monitoring
    performance: {
      enabled: true,
      trackCoreWebVitals: true,
      trackResourceTiming: true,
      sampleRate: 1.0, // 100% sampling
    },
  };

  // Utility functions
  const Utils = {
    // Safe function execution
    safeExecute: function (fn, fallback = null) {
      try {
        return fn();
      } catch (error) {
        console.warn('Analytics error:', error);
        return fallback;
      }
    },

    // Check if we're in development
    isDevelopment: function () {
      return (
        window.location.hostname === 'localhost' ||
        window.location.hostname.includes('netlify.app') ||
        window.location.hostname.includes('pages.dev')
      );
    },

    // Debounce function for performance
    debounce: function (func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },
  };

  // Google Analytics 4 implementation - FIXED VERSION
  const GoogleAnalytics = {
    init: function () {
      if (!AnalyticsConfig.googleAnalytics.enabled) return;

      Utils.safeExecute(() => {
        // Load Google Tag Manager script - FIXED VERSION
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${AnalyticsConfig.googleAnalytics.measurementId}`;
        document.head.appendChild(script);

        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        function gtag() {
          dataLayer.push(arguments);
        }
        window.gtag = gtag;

        gtag('js', new Date());
        gtag('config', AnalyticsConfig.googleAnalytics.measurementId, {
          debug_mode: AnalyticsConfig.googleAnalytics.debug && Utils.isDevelopment(),
        });

        console.log('✅ Google Analytics initialized');
      });
    },

    // Track custom events
    trackEvent: function (eventName, parameters = {}) {
      Utils.safeExecute(() => {
        if (window.gtag && AnalyticsConfig.events[eventName]) {
          window.gtag('event', eventName, parameters);
        }
      });
    },

    // Track page views
    trackPageView: function (pagePath) {
      Utils.safeExecute(() => {
        if (window.gtag) {
          window.gtag('config', AnalyticsConfig.googleAnalytics.measurementId, {
            page_path: pagePath,
          });
        }
      });
    },
  };

  // Performance monitoring
  const PerformanceMonitor = {
    init: function () {
      if (!AnalyticsConfig.performance.enabled) return;

      Utils.safeExecute(() => {
        // Track Core Web Vitals
        this.trackCoreWebVitals();

        // Track resource timing
        this.trackResourceTiming();

        // Track navigation timing
        this.trackNavigationTiming();

        console.log('✅ Performance monitoring initialized');
      });
    },

    trackCoreWebVitals: function () {
      // Largest Contentful Paint (LCP)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        GoogleAnalytics.trackEvent('web_vitals', {
          name: 'LCP',
          value: lastEntry.startTime,
          event_category: 'Web Vitals',
        });
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          GoogleAnalytics.trackEvent('web_vitals', {
            name: 'FID',
            value: entry.processingStart - entry.startTime,
            event_category: 'Web Vitals',
          });
        });
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            GoogleAnalytics.trackEvent('web_vitals', {
              name: 'CLS',
              value: clsValue,
              event_category: 'Web Vitals',
            });
          }
        });
      }).observe({ entryTypes: ['layout-shift'] });
    },

    trackResourceTiming: function () {
      Utils.safeExecute(() => {
        if ('performance' in window && 'getEntriesByType' in performance) {
          const resources = performance.getEntriesByType('resource');

          resources.forEach((resource) => {
            if (resource.duration > 1000) {
              // Only track slow resources
              GoogleAnalytics.trackEvent('resource_timing', {
                name: resource.name,
                duration: Math.round(resource.duration),
                event_category: 'Performance',
              });
            }
          });
        }
      });
    },

    trackNavigationTiming: function () {
      Utils.safeExecute(() => {
        if ('performance' in window && 'timing' in performance) {
          const timing = performance.timing;
          const navigationStart = timing.navigationStart;

          const metrics = {
            dns: timing.domainLookupEnd - timing.domainLookupStart,
            connection: timing.connectEnd - timing.connectStart,
            response: timing.responseEnd - timing.responseStart,
            dom: timing.domContentLoadedEventEnd - navigationStart,
            load: timing.loadEventEnd - navigationStart,
          };

          GoogleAnalytics.trackEvent('navigation_timing', {
            value: Math.round(metrics.load),
            event_category: 'Performance',
            custom_parameters: metrics,
          });
        }
      });
    },
  };

  // Error tracking
  const ErrorTracker = {
    init: function () {
      if (!AnalyticsConfig.events.errors) return;

      Utils.safeExecute(() => {
        // Track JavaScript errors
        window.addEventListener('error', (event) => {
          GoogleAnalytics.trackEvent('exception', {
            description: event.message,
            fatal: false,
            event_category: 'JavaScript Error',
          });
        });

        // Track unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
          GoogleAnalytics.trackEvent('exception', {
            description: event.reason,
            fatal: false,
            event_category: 'Unhandled Promise Rejection',
          });
        });

        console.log('✅ Error tracking initialized');
      });
    },
  };

  // Initialize analytics when DOM is ready
  function initializeAnalytics() {
    try {
      // Initialize Google Analytics
      GoogleAnalytics.init();

      // Initialize performance monitoring
      PerformanceMonitor.init();

      // Initialize error tracking
      ErrorTracker.init();

      // Track initial page view
      GoogleAnalytics.trackPageView(window.location.pathname);

      console.log('🎯 RinaWarp Analytics initialized successfully');
    } catch (error) {
      console.error('❌ Analytics initialization failed:', error);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAnalytics);
  } else {
    initializeAnalytics();
  }

  // Export for use in other scripts
  window.RinaWarpAnalytics = {
    trackEvent: GoogleAnalytics.trackEvent,
    trackPageView: GoogleAnalytics.trackPageView,
    config: AnalyticsConfig,
  };
})();
