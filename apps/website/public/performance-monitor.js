// RinaWarp Performance Monitor
// Tracks and reports performance metrics for optimization

(function () {
  'use strict';

  const PerformanceMonitor = {
    // Configuration
    config: {
      enabled: true,
      reportInterval: 30000, // 30 seconds
      slowResourceThreshold: 1000, // 1 second
      slowPageThreshold: 3000, // 3 seconds
      sampleRate: 1.0, // 100% sampling
    },

    // Metrics storage
    metrics: {
      pageLoad: null,
      resources: [],
      interactions: [],
      errors: [],
    },

    // Initialize performance monitoring
    init: function () {
      if (!this.config.enabled) return;

      try {
        this.trackPageLoad();
        this.trackResourceTiming();
        this.trackUserInteractions();
        this.trackErrors();
        this.startPeriodicReporting();

        console.log('✅ Performance monitoring initialized');
      } catch (error) {
        console.warn('Performance monitoring initialization failed:', error);
      }
    },

    // Track page load performance
    trackPageLoad: function () {
      if ('performance' in window && 'timing' in performance) {
        const timing = performance.timing;
        const navigationStart = timing.navigationStart;

        this.metrics.pageLoad = {
          dns: timing.domainLookupEnd - timing.domainLookupStart,
          connection: timing.connectEnd - timing.connectStart,
          response: timing.responseEnd - timing.responseStart,
          dom: timing.domContentLoadedEventEnd - navigationStart,
          load: timing.loadEventEnd - navigationStart,
          total: timing.loadEventEnd - navigationStart,
          timestamp: new Date().toISOString(),
        };

        // Report slow page loads
        if (this.metrics.pageLoad.total > this.config.slowPageThreshold) {
          this.reportMetric('slow_page_load', {
            duration: this.metrics.pageLoad.total,
            url: window.location.href,
          });
        }
      }
    },

    // Track resource loading performance
    trackResourceTiming: function () {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();

          entries.forEach((entry) => {
            const resource = {
              name: entry.name,
              duration: entry.duration,
              size: entry.transferSize || 0,
              type: entry.initiatorType,
              timestamp: new Date().toISOString(),
            };

            this.metrics.resources.push(resource);

            // Report slow resources
            if (entry.duration > this.config.slowResourceThreshold) {
              this.reportMetric('slow_resource', {
                name: entry.name,
                duration: entry.duration,
                type: entry.initiatorType,
              });
            }
          });
        });

        try {
          observer.observe({ entryTypes: ['resource'] });
        } catch (error) {
          console.warn('Resource timing observation failed:', error);
        }
      }
    },

    // Track user interactions
    trackUserInteractions: function () {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();

          entries.forEach((entry) => {
            const interaction = {
              type: entry.name,
              duration: entry.duration,
              timestamp: new Date().toISOString(),
            };

            this.metrics.interactions.push(interaction);
          });
        });

        try {
          observer.observe({ entryTypes: ['measure'] });
        } catch (error) {
          console.warn('Interaction tracking observation failed:', error);
        }
      }

      // Track clicks manually for better coverage
      document.addEventListener(
        'click',
        (event) => {
          const interaction = {
            type: 'click',
            target: event.target.tagName,
            timestamp: new Date().toISOString(),
          };

          this.metrics.interactions.push(interaction);
        },
        true,
      );
    },

    // Track JavaScript errors
    trackErrors: function () {
      window.addEventListener('error', (event) => {
        const error = {
          message: event.message,
          filename: event.filename,
          line: event.lineno,
          column: event.colno,
          timestamp: new Date().toISOString(),
        };

        this.metrics.errors.push(error);

        this.reportMetric('javascript_error', {
          message: event.message,
          filename: event.filename,
          line: event.lineno,
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        const error = {
          message: event.reason,
          type: 'unhandled_promise_rejection',
          timestamp: new Date().toISOString(),
        };

        this.metrics.errors.push(error);

        this.reportMetric('unhandled_rejection', {
          message: event.reason,
        });
      });
    },

    // Report metrics to analytics
    reportMetric: function (metricName, data) {
      try {
        // Report to Google Analytics if available
        if (window.gtag) {
          window.gtag('event', metricName, {
            event_category: 'Performance',
            value: data.duration || 1,
            custom_parameters: data,
          });
        }

        // Report to custom endpoint if configured
        if (window.RinaWarpAnalytics && window.RinaWarpAnalytics.trackEvent) {
          window.RinaWarpAnalytics.trackEvent(metricName, data);
        }

        console.log(`📊 Performance metric: ${metricName}`, data);
      } catch (error) {
        console.warn('Failed to report performance metric:', error);
      }
    },

    // Start periodic performance reporting
    startPeriodicReporting: function () {
      setInterval(() => {
        this.reportPeriodicMetrics();
      }, this.config.reportInterval);
    },

    // Report periodic metrics
    reportPeriodicMetrics: function () {
      try {
        const now = Date.now();
        const recentResources = this.metrics.resources.filter(
          (r) => new Date(r.timestamp).getTime() > now - this.config.reportInterval,
        );

        const recentErrors = this.metrics.errors.filter(
          (e) => new Date(e.timestamp).getTime() > now - this.config.reportInterval,
        );

        if (recentResources.length > 0 || recentErrors.length > 0) {
          this.reportMetric('performance_summary', {
            resources: recentResources.length,
            errors: recentErrors.length,
            period: this.config.reportInterval / 1000 + 's',
          });
        }
      } catch (error) {
        console.warn('Failed to report periodic metrics:', error);
      }
    },

    // Get performance summary
    getSummary: function () {
      return {
        pageLoad: this.metrics.pageLoad,
        totalResources: this.metrics.resources.length,
        totalInteractions: this.metrics.interactions.length,
        totalErrors: this.metrics.errors.length,
        slowResources: this.metrics.resources.filter(
          (r) => r.duration > this.config.slowResourceThreshold,
        ).length,
      };
    },
  };

  // Initialize performance monitoring
  PerformanceMonitor.init();

  // Export for use in other scripts
  window.RinaWarpPerformance = PerformanceMonitor;
})();
