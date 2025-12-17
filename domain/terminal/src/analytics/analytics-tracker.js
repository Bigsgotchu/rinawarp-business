// RinaWarp Terminal - Analytics Tracker
// Comprehensive analytics for user behavior, conversions, and performance

class AnalyticsTracker {
  constructor() {
    this.apiEndpoint = '/api/analytics';
    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();
    this.startTime = Date.now();
    this.events = [];
    this.isEnabled = true;

    this.init();
  }

  init() {
    // Track page load
    this.track('page_view', {
      page: window.location.pathname,
      referrer: document.referrer,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });

    // Track user interactions
    this.setupEventListeners();

    // Track performance metrics
    this.trackPerformance();

    // Track conversion events
    this.trackConversions();
  }

  // Generate unique session ID
  generateSessionId() {
    return (
      'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    );
  }

  // Get or create user ID
  getUserId() {
    let userId = localStorage.getItem('rinawarp_user_id');
    if (!userId) {
      userId =
        'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('rinawarp_user_id', userId);
    }
    return userId;
  }

  // Track custom events
  track(eventName, properties = {}) {
    if (!this.isEnabled) return;

    const event = {
      event: eventName,
      properties: {
        ...properties,
        session_id: this.sessionId,
        user_id: this.userId,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        page: window.location.pathname,
      },
    };

    this.events.push(event);
    this.sendEvent(event);
  }

  // Send event to analytics API
  async sendEvent(event) {
    try {
      await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  // Setup event listeners for common interactions
  setupEventListeners() {
    // Track button clicks
    document.addEventListener('click', (e) => {
      if (e.target.matches('button, .btn, a[href]')) {
        this.track('button_click', {
          element: e.target.tagName,
          text: e.target.textContent?.trim(),
          href: e.target.href,
          class: e.target.className,
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (e) => {
      this.track('form_submit', {
        form_id: e.target.id,
        form_class: e.target.className,
        action: e.target.action,
      });
    });

    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
          100
      );
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        this.track('scroll_depth', {
          percent: scrollPercent,
        });
      }
    });

    // Track time on page
    window.addEventListener('beforeunload', () => {
      const timeOnPage = Date.now() - this.startTime;
      this.track('page_exit', {
        time_on_page: timeOnPage,
        max_scroll: maxScroll,
      });
    });
  }

  // Track performance metrics
  trackPerformance() {
    // Wait for page to fully load
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];

        this.track('performance', {
          load_time: perfData.loadEventEnd - perfData.loadEventStart,
          dom_content_loaded:
            perfData.domContentLoadedEventEnd -
            perfData.domContentLoadedEventStart,
          first_paint: this.getFirstPaint(),
          first_contentful_paint: this.getFirstContentfulPaint(),
          largest_contentful_paint: this.getLargestContentfulPaint(),
        });
      }, 1000);
    });
  }

  // Get First Paint time
  getFirstPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(
      (entry) => entry.name === 'first-paint'
    );
    return firstPaint ? firstPaint.startTime : null;
  }

  // Get First Contentful Paint time
  getFirstContentfulPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(
      (entry) => entry.name === 'first-contentful-paint'
    );
    return fcp ? fcp.startTime : null;
  }

  // Get Largest Contentful Paint time
  getLargestContentfulPaint() {
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    return lcpEntries.length > 0
      ? lcpEntries[lcpEntries.length - 1].startTime
      : null;
  }

  // Track conversion events
  trackConversions() {
    // Track pricing page views
    if (window.location.pathname.includes('pricing')) {
      this.track('pricing_page_view');
    }

    // Track download page views
    if (window.location.pathname.includes('download')) {
      this.track('download_page_view');
    }

    // Track dashboard views
    if (window.location.pathname.includes('dashboard')) {
      this.track('dashboard_view');
    }
  }

  // Track payment events
  trackPayment(plan, amount, currency = 'USD') {
    this.track('payment_initiated', {
      plan: plan,
      amount: amount,
      currency: currency,
    });
  }

  // Track successful payment
  trackPaymentSuccess(plan, amount, transactionId) {
    this.track('payment_success', {
      plan: plan,
      amount: amount,
      transaction_id: transactionId,
    });
  }

  // Track license validation
  trackLicenseValidation(success, plan = null) {
    this.track('license_validation', {
      success: success,
      plan: plan,
    });
  }

  // Track feature usage
  trackFeatureUsage(feature, action) {
    this.track('feature_usage', {
      feature: feature,
      action: action,
    });
  }

  // Track AI queries
  trackAIQuery(query, responseTime, success) {
    this.track('ai_query', {
      query_length: query.length,
      response_time: responseTime,
      success: success,
    });
  }

  // Track errors
  trackError(error, context = {}) {
    this.track('error', {
      error_message: error.message,
      error_stack: error.stack,
      context: context,
    });
  }

  // Track user engagement
  trackEngagement(action, details = {}) {
    this.track('engagement', {
      action: action,
      details: details,
    });
  }

  // Get analytics summary
  getAnalyticsSummary() {
    return {
      session_id: this.sessionId,
      user_id: this.userId,
      events_count: this.events.length,
      session_duration: Date.now() - this.startTime,
      page: window.location.pathname,
    };
  }

  // Enable/disable tracking
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }
}

// Initialize analytics
const analytics = new AnalyticsTracker();

// Export for use in other modules
window.RinaWarpAnalytics = analytics;

// Track specific RinaWarp events
document.addEventListener('DOMContentLoaded', () => {
  // Track page load completion
  analytics.track('page_loaded', {
    load_time: Date.now() - performance.timing.navigationStart,
  });

  // Track if user is on mobile
  if (window.innerWidth < 768) {
    analytics.track('mobile_user');
  }

  // Track if user has ad blocker
  if (window.outerHeight - window.innerHeight > 200) {
    analytics.track('ad_blocker_detected');
  }
});

export default AnalyticsTracker;
