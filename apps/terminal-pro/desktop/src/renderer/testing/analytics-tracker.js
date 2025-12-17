/**
 * RinaWarp Analytics & Metrics System
 * Real-time tracking of user behavior and interface performance
 */

class AnalyticsTracker {
  constructor(options = {}) {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.metricsBuffer = [];
    this.userJourney = [];
    this.performanceMetrics = {};
    this.isEnabled = options.enabled || false;

    this.config = {
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
      enablePerformanceTracking: true,
      enableJourneyMapping: true,
      enableRealTimeReporting: true,
      ...options,
    };

    this.approachabilityScore = {
      total: 0,
      factors: {
        timeToFirstInteraction: null,
        taskCompletionRate: null,
        helpSeekingFrequency: null,
        comprehensionScore: null,
        comfortLevel: null,
      },
    };

    this.initializeAnalytics();
  }

  generateSessionId() {
    return `analytics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  initializeAnalytics() {
    if (!this.isEnabled) return;

    // Start performance monitoring
    if (this.config.enablePerformanceTracking) {
      this.initializePerformanceTracking();
    }

    // Start journey mapping
    if (this.config.enableJourneyMapping) {
      this.initializeJourneyMapping();
    }

    // Set up real-time reporting
    if (this.config.enableRealTimeReporting) {
      this.initializeRealTimeReporting();
    }

    // Start periodic metrics flushing
    this.startMetricsFlushing();

    // Track page visibility for engagement metrics
    this.setupVisibilityTracking();
  }

  initializePerformanceTracking() {
    // Core Web Vitals tracking
    this.trackCoreWebVitals();

    // Custom performance markers
    this.setupPerformanceMarkers();

    // Memory usage tracking
    this.startMemoryTracking();
  }

  trackCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('LCP', lastEntry.startTime, 'performance');
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.recordMetric('FID', entry.processingStart - entry.startTime, 'performance');
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsScore = 0;
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
          }
        });
        this.recordMetric('CLS', clsScore, 'performance');
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  }

  setupPerformanceMarkers() {
    // Custom performance markers for key interface interactions
    const performanceMarkers = [
      'interface_loaded',
      'first_message_sent',
      'action_proposal_shown',
      'terminal_toggled',
      'help_accessed',
    ];

    performanceMarkers.forEach((marker) => {
      this.addPerformanceMarker(marker);
    });
  }

  addPerformanceMarker(name) {
    if ('performance' in window && 'mark' in window.performance) {
      window.performance.mark(name);
    }
  }

  startMemoryTracking() {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        this.recordMetric('memory_used', memory.usedJSHeapSize, 'performance');
        this.recordMetric('memory_total', memory.totalJSHeapSize, 'performance');
        this.recordMetric('memory_limit', memory.jsHeapSizeLimit, 'performance');
      }, 5000);
    }
  }

  initializeJourneyMapping() {
    this.journeyStages = [
      { id: 'landing', name: 'Landing Page', threshold: 0 },
      { id: 'first_impression', name: 'First Impression', threshold: 5000 },
      { id: 'first_interaction', name: 'First Interaction', threshold: 30000 },
      { id: 'conversation_flow', name: 'Conversation Flow', threshold: 60000 },
      { id: 'feature_discovery', name: 'Feature Discovery', threshold: 120000 },
      { id: 'task_completion', name: 'Task Completion', threshold: 300000 },
    ];

    this.currentJourneyStage = 0;
    this.startJourneyTracking();
  }

  startJourneyTracking() {
    setInterval(() => {
      this.updateJourneyStage();
    }, 1000);
  }

  updateJourneyStage() {
    const elapsed = Date.now() - this.startTime;
    const currentStage = this.journeyStages[this.currentJourneyStage];

    if (currentStage && elapsed >= currentStage.threshold) {
      this.recordJourneyEvent('stage_reached', {
        stage: currentStage.id,
        name: currentStage.name,
        elapsed: elapsed,
      });
      this.currentJourneyStage++;
    }
  }

  initializeRealTimeReporting() {
    // Set up WebSocket or Server-Sent Events for real-time updates
    this.setupRealTimeConnection();
  }

  setupRealTimeConnection() {
    // In a real implementation, this would connect to your analytics service
    // For now, we'll simulate real-time reporting
    this.realTimeInterval = setInterval(() => {
      this.reportRealTimeMetrics();
    }, 5000);
  }

  reportRealTimeMetrics() {
    const realTimeData = {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      activeUsers: this.getActiveUserCount(),
      currentJourneyStage: this.journeyStages[this.currentJourneyStage]?.name || 'Unknown',
      frictionEvents: this.getRecentFrictionEvents(),
      feedbackPending: this.getPendingFeedbackCount(),
    };

    // In real implementation, send to analytics dashboard
    console.log('Real-time metrics:', realTimeData);
  }

  setupVisibilityTracking() {
    document.addEventListener('visibilitychange', () => {
      this.recordMetric('page_visible', !document.hidden ? 1 : 0, 'engagement');

      if (document.hidden) {
        this.recordJourneyEvent('page_hidden', { timestamp: Date.now() });
      } else {
        this.recordJourneyEvent('page_visible', { timestamp: Date.now() });
      }
    });
  }

  startMetricsFlushing() {
    setInterval(() => {
      this.flushMetrics();
    }, this.config.flushInterval);

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flushMetrics(true);
    });
  }

  // Core tracking methods
  recordEvent(eventName, data = {}) {
    const event = {
      sessionId: this.sessionId,
      event: eventName,
      timestamp: Date.now(),
      data: data,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    this.metricsBuffer.push(event);

    // Update approachability score
    this.updateApproachabilityScore(eventName, data);

    // Add to user journey
    this.addToJourney(eventName, data);

    // Check if we should flush
    if (this.metricsBuffer.length >= this.config.batchSize) {
      this.flushMetrics();
    }

    return event;
  }

  recordMetric(name, value, category = 'custom') {
    const metric = {
      sessionId: this.sessionId,
      metric: name,
      value: value,
      category: category,
      timestamp: Date.now(),
    };

    this.metricsBuffer.push(metric);
    return metric;
  }

  recordJourneyEvent(eventType, data = {}) {
    const journeyEvent = {
      type: eventType,
      timestamp: Date.now(),
      sessionDuration: Date.now() - this.startTime,
      data: data,
    };

    this.userJourney.push(journeyEvent);
    this.recordEvent('journey_event', journeyEvent);
  }

  // Approachability scoring
  updateApproachabilityScore(eventName, data) {
    switch (eventName) {
      case 'first_interaction':
        // Score based on time to first interaction
        const timeToFirst = data.duration || 0;
        if (timeToFirst < 5000) {
          this.approachabilityScore.factors.timeToFirstInteraction = 10;
        } else if (timeToFirst < 15000) {
          this.approachabilityScore.factors.timeToFirstInteraction = 8;
        } else if (timeToFirst < 30000) {
          this.approachabilityScore.factors.timeToFirstInteraction = 6;
        } else {
          this.approachabilityScore.factors.timeToFirstInteraction = 4;
        }
        break;

      case 'task_completed':
        // Score based on task completion success
        this.approachabilityScore.factors.taskCompletionRate = data.success ? 9 : 3;
        break;

      case 'help_seeking':
        // Inverse score - more help seeking indicates lower approachability
        const helpCount = this.metricsBuffer.filter((e) => e.event === 'help_seeking').length;
        this.approachabilityScore.factors.helpSeekingFrequency = Math.max(10 - helpCount * 2, 1);
        break;

      case 'feedback_submitted':
        // Use feedback ratings
        if (data.ratings) {
          const overall = this.calculateOverallRating(data.ratings);
          this.approachabilityScore.factors.comfortLevel = overall;
        }
        break;
    }

    this.calculateOverallApproachabilityScore();
  }

  calculateOverallRating(ratings) {
    const values = Object.values(ratings);
    if (values.length === 0) return 5;
    return Math.round(values.reduce((sum, val) => sum + val, 0) / values.length);
  }

  calculateOverallApproachabilityScore() {
    const factors = this.approachabilityScore.factors;
    const validFactors = Object.values(factors).filter((score) => score !== null);

    if (validFactors.length === 0) return;

    this.approachabilityScore.total = Math.round(
      validFactors.reduce((sum, score) => sum + score, 0) / validFactors.length,
    );
  }

  addToJourney(eventName, data) {
    const journeyPoint = {
      event: eventName,
      timestamp: Date.now(),
      sessionDuration: Date.now() - this.startTime,
      data: data,
    };

    this.userJourney.push(journeyPoint);
  }

  // Utility methods
  flushMetrics(immediate = false) {
    if (this.metricsBuffer.length === 0) return;

    const metricsToFlush = [...this.metricsBuffer];
    this.metricsBuffer = [];

    // In real implementation, send to analytics service
    console.log('Flushing metrics:', {
      sessionId: this.sessionId,
      count: metricsToFlush.length,
      metrics: metricsToFlush,
    });

    // Store locally for session summary
    if (!window.analyticsData) {
      window.analyticsData = {};
    }

    if (!window.analyticsData[this.sessionId]) {
      window.analyticsData[this.sessionId] = [];
    }

    window.analyticsData[this.sessionId].push(...metricsToFlush);
  }

  getActiveUserCount() {
    // In real implementation, this would query your analytics service
    return Math.floor(Math.random() * 10) + 1; // Mock data
  }

  getRecentFrictionEvents() {
    return this.metricsBuffer
      .filter(
        (event) =>
          event.event === 'hesitation' ||
          event.event === 'help_seeking' ||
          event.event === 'abandonment',
      )
      .slice(-5);
  }

  getPendingFeedbackCount() {
    return window.feedbackCollector
      ? !window.feedbackCollector.feedbackState.feedbackGiven
        ? 1
        : 0
      : 0;
  }

  // Public API methods
  trackUserAction(action, element, context = {}) {
    this.recordEvent('user_action', {
      action: action,
      element: element,
      context: context,
      page: this.getCurrentPage(),
    });
  }

  trackFriction(type, severity, context = {}) {
    this.recordEvent('friction_detected', {
      type: type,
      severity: severity,
      context: context,
    });
  }

  trackApproachabilityFeedback(ratings, text = '') {
    this.recordEvent('approachability_feedback', {
      ratings: ratings,
      text: text,
      overallRating: this.calculateOverallRating(ratings),
    });
  }

  getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('conversation')) return 'conversation';
    if (path.includes('settings')) return 'settings';
    if (path.includes('help')) return 'help';
    return 'main';
  }

  generateSessionReport() {
    const duration = Date.now() - this.startTime;
    const totalEvents = this.metricsBuffer.length + this.userJourney.length;

    return {
      sessionId: this.sessionId,
      duration: this.formatDuration(duration),
      totalEvents: totalEvents,
      approachabilityScore: this.approachabilityScore,
      journey: this.userJourney,
      frictionEvents: this.getRecentFrictionEvents(),
      performanceMetrics: this.performanceMetrics,
      recommendations: this.generateRecommendations(),
    };
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.approachabilityScore.total < 6) {
      recommendations.push('Interface approachability needs improvement');
    }

    const frictionCount = this.metricsBuffer.filter((e) => e.event === 'friction_detected').length;
    if (frictionCount > 5) {
      recommendations.push('High friction detected - review interface design');
    }

    const helpSeekingCount = this.metricsBuffer.filter((e) => e.event === 'help_seeking').length;
    if (helpSeekingCount > 3) {
      recommendations.push('Users are seeking help frequently - improve onboarding');
    }

    return recommendations;
  }

  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  // Cleanup
  destroy() {
    if (this.realTimeInterval) {
      clearInterval(this.realTimeInterval);
    }
    this.flushMetrics();
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize in testing mode or when explicitly enabled
  if (
    window.location.search.includes('testing=true') ||
    localStorage.getItem('enableAnalytics') === 'true' ||
    localStorage.getItem('enableUserTesting') === 'true'
  ) {
    window.analyticsTracker = new AnalyticsTracker({
      enabled: true,
      enablePerformanceTracking: true,
      enableJourneyMapping: true,
      enableRealTimeReporting: true,
    });

    console.log('Analytics Tracker initialized for user testing');
  }
});

// Export for manual initialization
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnalyticsTracker;
}
