// Advanced Performance Monitoring System
// Application Performance Metrics (APM), user analytics, and performance optimization

export class AdvancedPerformanceMonitor {
  constructor() {
    this.metrics = {
      performance: {
        loadTime: 0,
        renderTime: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        networkLatency: 0,
        errorRate: 0,
      },
      user: {
        sessionDuration: 0,
        featureUsage: {},
        clickEvents: [],
        scrollEvents: [],
        keystrokes: 0,
        commandsExecuted: 0,
      },
      business: {
        conversions: 0,
        revenue: 0,
        userRetention: 0,
        featureAdoption: {},
      },
    };

    this.observers = [];
    this.isMonitoring = false;
    this.sessionStart = Date.now();
    this.performanceObserver = null;
    this.userBehaviorObserver = null;

    this.initializeMonitoring();
  }

  initializeMonitoring() {
    // Performance monitoring
    this.setupPerformanceObserver();
    this.setupMemoryMonitoring();
    this.setupNetworkMonitoring();

    // User behavior monitoring and analytics
    this.setupUserBehaviorTracking();
    this.setupUserAnalytics();
    this.setupUserBehaviorAnalytics();
    this.setupFeatureUsageTracking();

    // Business metrics
    this.setupConversionTracking();
    this.setupRevenueTracking();

    // Error tracking
    this.setupErrorTracking();

    // Start monitoring
    this.startMonitoring();
  }

  setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.processPerformanceEntry(entry);
        });
      });

      // Observe different types of performance entries
      this.performanceObserver.observe({
        entryTypes: ['navigation', 'paint', 'measure', 'resource'],
      });
    }
  }

  processPerformanceEntry(entry) {
    switch (entry.entryType) {
      case 'navigation':
        this.metrics.performance.loadTime =
          entry.loadEventEnd - entry.loadEventStart;
        this.metrics.performance.renderTime =
          entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart;
        break;
      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          this.metrics.performance.firstContentfulPaint = entry.startTime;
        }
        break;
      case 'measure':
        this.metrics.performance[entry.name] = entry.duration;
        break;
      case 'resource':
        this.processResourceEntry(entry);
        break;
    }
  }

  processResourceEntry(entry) {
    const resourceType = this.getResourceType(entry.name);
    if (!this.metrics.performance.resources) {
      this.metrics.performance.resources = {};
    }
    if (!this.metrics.performance.resources[resourceType]) {
      this.metrics.performance.resources[resourceType] = [];
    }

    this.metrics.performance.resources[resourceType].push({
      name: entry.name,
      duration: entry.duration,
      size: entry.transferSize,
      startTime: entry.startTime,
    });
  }

  getResourceType(url) {
    if (url.includes('.js')) return 'javascript';
    if (url.includes('.css')) return 'css';
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.gif'))
      return 'images';
    if (url.includes('.woff') || url.includes('.ttf')) return 'fonts';
    return 'other';
  }

  setupMemoryMonitoring() {
    if ('memory' in performance) {
      setInterval(() => {
        this.metrics.performance.memoryUsage = {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit,
          percentage:
            (performance.memory.usedJSHeapSize /
              performance.memory.jsHeapSizeLimit) *
            100,
        };
      }, 5000);
    }
  }

  setupNetworkMonitoring() {
    // Monitor network requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const start = performance.now();
      try {
        const response = await originalFetch(...args);
        const end = performance.now();
        this.metrics.performance.networkLatency = end - start;
        return response;
      } catch (error) {
        this.trackError('network', error);
        throw error;
      }
    };
  }

  setupUserBehaviorTracking() {
    // Track clicks
    document.addEventListener('click', (event) => {
      this.metrics.user.clickEvents.push({
        timestamp: Date.now(),
        target: event.target.tagName,
        className: event.target.className,
        id: event.target.id,
        x: event.clientX,
        y: event.clientY,
      });
    });

    // Track scrolls
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.metrics.user.scrollEvents.push({
          timestamp: Date.now(),
          scrollY: window.scrollY,
          scrollX: window.scrollX,
        });
      }, 100);
    });

    // Track keystrokes
    document.addEventListener('keydown', () => {
      this.metrics.user.keystrokes++;
    });

    // Track session duration
    setInterval(() => {
      this.metrics.user.sessionDuration = Date.now() - this.sessionStart;
    }, 1000);
  }

  setupUserAnalytics() {
    // Set up user analytics tracking
    this.userAnalytics = {
      sessionStart: Date.now(),
      pageViews: 0,
      interactions: 0,
      errors: 0,
    };
  }

  setupUserBehaviorAnalytics() {
    // Set up comprehensive user behavior analytics
    this.userBehaviorAnalytics = {
      clickPatterns: [],
      scrollBehavior: [],
      timeOnPage: 0,
      featureAdoption: {},
      userJourney: [],
    };
  }

  setupFeatureUsageTracking() {
    // Track feature usage
    this.trackFeatureUsage = (featureName, data = {}) => {
      if (!this.metrics.user.featureUsage[featureName]) {
        this.metrics.user.featureUsage[featureName] = {
          count: 0,
          lastUsed: null,
          totalTime: 0,
          data: [],
        };
      }

      this.metrics.user.featureUsage[featureName].count++;
      this.metrics.user.featureUsage[featureName].lastUsed = Date.now();
      this.metrics.user.featureUsage[featureName].data.push({
        timestamp: Date.now(),
        ...data,
      });
    };
  }

  setupConversionTracking() {
    // Track conversions
    this.trackConversion = (conversionType, value = 0) => {
      this.metrics.business.conversions++;
      this.metrics.business.revenue += value;

      // Send to analytics
      this.sendToAnalytics('conversion', {
        type: conversionType,
        value: value,
        timestamp: Date.now(),
      });
    };
  }

  setupRevenueTracking() {
    // Track revenue events
    this.trackRevenue = (amount, source) => {
      this.metrics.business.revenue += amount;

      // Send to analytics
      this.sendToAnalytics('revenue', {
        amount: amount,
        source: source,
        timestamp: Date.now(),
      });
    };
  }

  setupErrorTracking() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.trackError('javascript', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError('promise', {
        reason: event.reason,
        stack: event.reason?.stack,
      });
    });
  }

  trackError(type, error) {
    this.metrics.performance.errorRate++;

    const errorData = {
      type: type,
      error: error,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Send to error tracking service
    this.sendToAnalytics('error', errorData);

    // Notify observers
    this.notifyObservers('error', errorData);
  }

  trackFeatureUsage(featureName, data = {}) {
    if (!this.metrics.user.featureUsage[featureName]) {
      this.metrics.user.featureUsage[featureName] = {
        count: 0,
        lastUsed: null,
        totalTime: 0,
        data: [],
      };
    }

    this.metrics.user.featureUsage[featureName].count++;
    this.metrics.user.featureUsage[featureName].lastUsed = Date.now();
    this.metrics.user.featureUsage[featureName].data.push({
      timestamp: Date.now(),
      ...data,
    });

    // Send to analytics
    this.sendToAnalytics('feature_usage', {
      feature: featureName,
      ...data,
    });
  }

  trackCommandExecution(command, duration, success) {
    this.metrics.user.commandsExecuted++;

    this.trackFeatureUsage('command_execution', {
      command: command,
      duration: duration,
      success: success,
    });
  }

  startMonitoring() {
    this.isMonitoring = true;
    this.sessionStart = Date.now();

    // Start performance monitoring
    if (this.performanceObserver) {
      this.performanceObserver.observe({
        entryTypes: ['navigation', 'paint', 'measure', 'resource'],
      });
    }

    // Start periodic metrics collection
    this.metricsInterval = setInterval(() => {
      this.collectMetrics();
    }, 10000); // Every 10 seconds

    // Notify observers
    this.notifyObservers('monitoring_started');
  }

  stopMonitoring() {
    this.isMonitoring = false;

    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }

    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }

    // Notify observers
    this.notifyObservers('monitoring_stopped');
  }

  collectMetrics() {
    // Collect current metrics
    const currentMetrics = this.getCurrentMetrics();

    // Send to analytics
    this.sendToAnalytics('metrics', currentMetrics);

    // Notify observers
    this.notifyObservers('metrics_updated', currentMetrics);
  }

  getCurrentMetrics() {
    return {
      performance: { ...this.metrics.performance },
      user: { ...this.metrics.user },
      business: { ...this.metrics.business },
      timestamp: Date.now(),
    };
  }

  getPerformanceScore() {
    const metrics = this.metrics.performance;
    let score = 100;

    // Deduct points for poor performance
    if (metrics.loadTime > 3000) score -= 20;
    if (metrics.renderTime > 1000) score -= 15;
    if (metrics.memoryUsage?.percentage > 80) score -= 10;
    if (metrics.errorRate > 5) score -= 25;

    return Math.max(0, score);
  }

  getOptimizationSuggestions() {
    const suggestions = [];
    const metrics = this.metrics.performance;

    if (metrics.loadTime > 3000) {
      suggestions.push({
        type: 'performance',
        priority: 'high',
        message:
          'Page load time is slow. Consider optimizing images and scripts.',
        impact: 'Load time: ' + Math.round(metrics.loadTime) + 'ms',
      });
    }

    if (metrics.memoryUsage?.percentage > 80) {
      suggestions.push({
        type: 'memory',
        priority: 'high',
        message:
          'High memory usage detected. Consider implementing memory optimization.',
        impact:
          'Memory usage: ' + Math.round(metrics.memoryUsage.percentage) + '%',
      });
    }

    if (metrics.errorRate > 5) {
      suggestions.push({
        type: 'stability',
        priority: 'critical',
        message: 'High error rate detected. Review error logs and fix issues.',
        impact: 'Error rate: ' + metrics.errorRate + ' errors',
      });
    }

    return suggestions;
  }

  trackEvent(eventType, data) {
    // Track event in performance monitor
    this.metrics.user.clickEvents.push({
      timestamp: Date.now(),
      type: eventType,
      data: data,
    });

    // Send to analytics
    this.sendToAnalytics(eventType, data);
  }

  sendToAnalytics(eventType, data) {
    // Send to Google Analytics
    if (window.gtag) {
      window.gtag('event', eventType, {
        event_category: 'performance',
        ...data,
      });
    }

    // Send to internal analytics
    if (window.analytics) {
      window.analytics.track(eventType, {
        category: 'performance',
        ...data,
      });
    }
  }

  // Observer pattern
  addObserver(callback) {
    this.observers.push(callback);
  }

  removeObserver(callback) {
    this.observers = this.observers.filter((obs) => obs !== callback);
  }

  notifyObservers(eventType, data) {
    this.observers.forEach((observer) => {
      try {
        observer(eventType, data);
      } catch (error) {
        console.error('Observer error:', error);
      }
    });
  }

  // Public API
  getMetrics() {
    return this.getCurrentMetrics();
  }

  getPerformanceReport() {
    return {
      score: this.getPerformanceScore(),
      metrics: this.getCurrentMetrics(),
      suggestions: this.getOptimizationSuggestions(),
      timestamp: Date.now(),
    };
  }

  exportMetrics() {
    return {
      session: {
        start: this.sessionStart,
        duration: Date.now() - this.sessionStart,
        isActive: this.isMonitoring,
      },
      metrics: this.getCurrentMetrics(),
      report: this.getPerformanceReport(),
    };
  }
}

// Global instance
window.performanceMonitor = new AdvancedPerformanceMonitor();
