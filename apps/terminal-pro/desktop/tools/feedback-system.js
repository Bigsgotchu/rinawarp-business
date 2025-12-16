/**
 * RinaWarp Terminal Pro - User Feedback Collection System
 * Comprehensive feedback management for desktop applications
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

class FeedbackCollectionSystem {
  constructor() {
    this.appName = 'RinaWarp Terminal Pro';
    this.version = require('../package.json').version;
    this.feedbackEndpoint = 'https://api.rinawarptech.com/feedback';
    this.supportEmail = 'support@rinawarptech.com';
    this.feedbackFile = path.join(os.homedir(), '.rinawarp', 'feedback.json');
    this.maxFeedbackAge = 30 * 24 * 60 * 60 * 1000; // 30 days
  }

  /**
   * Initialize feedback system
   */
  initialize() {
    this.ensureFeedbackDirectory();
    this.setupFeedbackHandlers();
    this.startPeriodicCollection();
  }

  /**
   * Create feedback directory if it doesn't exist
   */
  ensureFeedbackDirectory() {
    const feedbackDir = path.dirname(this.feedbackFile);
    if (!fs.existsSync(feedbackDir)) {
      fs.mkdirSync(feedbackDir, { recursive: true });
    }
  }

  /**
   * Setup feedback event handlers
   */
  setupFeedbackHandlers() {
    // Application launch feedback
    this.trackEvent('app_launch', {
      timestamp: Date.now(),
      version: this.version,
      platform: process.platform,
      architecture: process.arch,
    });

    // Feature usage tracking (implemented in app)
    this.setupFeatureTracking();

    // Error tracking (implemented in app)
    this.setupErrorTracking();

    // Performance tracking (implemented in app)
    this.setupPerformanceTracking();
  }

  /**
   * Track feature usage
   */
  trackEvent(eventName, data) {
    const event = {
      id: this.generateId(),
      type: 'feature_usage',
      event: eventName,
      data: data,
      timestamp: Date.now(),
      session_id: this.getSessionId(),
      user_agent: process.platform + ' ' + process.arch,
    };

    this.storeEvent(event);
  }

  /**
   * Setup feature-specific tracking
   */
  setupFeatureTracking() {
    const features = [
      'terminal_command',
      'ai_assistant',
      'voice_command',
      'terminal_theme',
      'plugin_usage',
      'export_import',
      'settings_change',
    ];

    features.forEach((feature) => {
      this.setupFeatureHandler(feature);
    });
  }

  /**
   * Setup individual feature tracking
   */
  setupFeatureHandler(featureName) {
    // This would be integrated into the main app
    const handler = (data) => {
      this.trackEvent(`feature_${featureName}`, data);
    };

    return handler;
  }

  /**
   * Setup error tracking
   */
  setupErrorTracking() {
    process.on('uncaughtException', (error) => {
      this.trackError('uncaught_exception', error);
    });

    process.on('unhandledRejection', (reason, promise) => {
      this.trackError('unhandled_rejection', { reason, promise });
    });
  }

  /**
   * Track application errors
   */
  trackError(errorType, error) {
    const errorEvent = {
      id: this.generateId(),
      type: 'error',
      error_type: errorType,
      error: {
        message: error.message || error,
        stack: error.stack,
        code: error.code,
      },
      system_info: {
        platform: process.platform,
        arch: process.arch,
        node_version: process.version,
        memory: process.memoryUsage(),
        uptime: process.uptime(),
      },
      timestamp: Date.now(),
      session_id: this.getSessionId(),
    };

    this.storeEvent(errorEvent);
    this.notifySupport(errorEvent);
  }

  /**
   * Setup performance tracking
   */
  setupPerformanceTracking() {
    // Memory usage tracking
    setInterval(() => {
      this.trackPerformance('memory_usage', {
        heap_used: process.memoryUsage().heapUsed,
        heap_total: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external,
      });
    }, 30000); // Every 30 seconds

    // CPU usage tracking
    setInterval(() => {
      this.trackPerformance('cpu_usage', {
        usage: this.getCPUUsage(),
      });
    }, 60000); // Every minute
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metricName, data) {
    const perfEvent = {
      id: this.generateId(),
      type: 'performance',
      metric: metricName,
      data: data,
      timestamp: Date.now(),
      session_id: this.getSessionId(),
    };

    this.storeEvent(perfEvent);
  }

  /**
   * Get CPU usage percentage
   */
  getCPUUsage() {
    const cpus = os.cpus();
    let user = 0,
      nice = 0,
      sys = 0,
      idle = 0,
      irq = 0;

    cpus.forEach((cpu) => {
      user += cpu.times.user;
      nice += cpu.times.nice;
      sys += cpu.times.sys;
      idle += cpu.times.idle;
      irq += cpu.times.irq;
    });

    const total = user + nice + sys + idle + irq;
    return (((total - idle) / total) * 100).toFixed(2);
  }

  /**
   * Store feedback event locally
   */
  storeEvent(event) {
    try {
      let events = [];
      if (fs.existsSync(this.feedbackFile)) {
        events = JSON.parse(fs.readFileSync(this.feedbackFile, 'utf8'));
      }

      events.push(event);

      // Clean old events
      const cutoffTime = Date.now() - this.maxFeedbackAge;
      events = events.filter((event) => event.timestamp > cutoffTime);

      fs.writeFileSync(this.feedbackFile, JSON.stringify(events, null, 2));
    } catch (error) {
      console.error('Failed to store feedback event:', error);
    }
  }

  /**
   * Send feedback to server
   */
  async sendFeedbackToServer() {
    if (!fs.existsSync(this.feedbackFile)) {
      return;
    }

    try {
      const events = JSON.parse(fs.readFileSync(this.feedbackFile, 'utf8'));
      const unsentEvents = events.filter((event) => !event.sent);

      if (unsentEvents.length === 0) {
        return;
      }

      const response = await fetch(this.feedbackEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `${this.appName}/${this.version}`,
        },
        body: JSON.stringify({
          app_name: this.appName,
          app_version: this.version,
          platform: process.platform,
          events: unsentEvents,
        }),
      });

      if (response.ok) {
        // Mark events as sent
        unsentEvents.forEach((event) => {
          event.sent = true;
          event.sent_at = Date.now();
        });

        fs.writeFileSync(this.feedbackFile, JSON.stringify(events, null, 2));
      }
    } catch (error) {
      console.error('Failed to send feedback to server:', error);
    }
  }

  /**
   * Start periodic feedback collection
   */
  startPeriodicCollection() {
    // Send feedback every 5 minutes
    setInterval(
      () => {
        this.sendFeedbackToServer();
      },
      5 * 60 * 1000,
    );

    // Clean old feedback daily
    setInterval(
      () => {
        this.cleanOldFeedback();
      },
      24 * 60 * 60 * 1000,
    );
  }

  /**
   * Clean old feedback files
   */
  cleanOldFeedback() {
    try {
      if (fs.existsSync(this.feedbackFile)) {
        const events = JSON.parse(fs.readFileSync(this.feedbackFile, 'utf8'));
        const cutoffTime = Date.now() - this.maxFeedbackAge;
        const recentEvents = events.filter((event) => event.timestamp > cutoffTime);

        if (recentEvents.length !== events.length) {
          fs.writeFileSync(this.feedbackFile, JSON.stringify(recentEvents, null, 2));
        }
      }
    } catch (error) {
      console.error('Failed to clean old feedback:', error);
    }
  }

  /**
   * Generate unique ID for events
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Get or create session ID
   */
  getSessionId() {
    const sessionFile = path.join(os.homedir(), '.rinawarp', 'session.json');
    let sessionData = {};

    if (fs.existsSync(sessionFile)) {
      sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
    }

    const now = Date.now();
    const sessionTimeout = 30 * 60 * 1000; // 30 minutes

    if (!sessionData.id || now - sessionData.created > sessionTimeout) {
      sessionData.id = this.generateId();
      sessionData.created = now;
      fs.writeFileSync(sessionFile, JSON.stringify(sessionData, null, 2));
    }

    return sessionData.id;
  }

  /**
   * Send error notification to support
   */
  async notifySupport(errorEvent) {
    // For critical errors, notify support immediately
    if (this.isCriticalError(errorEvent)) {
      try {
        await fetch('https://api.rinawarptech.com/support/notify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + process.env.SUPPORT_API_TOKEN,
          },
          body: JSON.stringify({
            subject: `Critical Error in ${this.appName}`,
            error: errorEvent,
            priority: 'high',
            source: 'desktop_app',
          }),
        });
      } catch (error) {
        console.error('Failed to notify support:', error);
      }
    }
  }

  /**
   * Check if error is critical
   */
  isCriticalError(errorEvent) {
    const criticalErrorTypes = ['uncaught_exception', 'segmentation_fault', 'out_of_memory'];

    return criticalErrorTypes.includes(errorEvent.error_type);
  }

  /**
   * Collect user feedback manually
   */
  collectUserFeedback(feedback) {
    const userFeedback = {
      id: this.generateId(),
      type: 'user_feedback',
      feedback: feedback,
      user_info: {
        version: this.version,
        platform: process.platform,
        arch: process.arch,
        locale: process.env.LANG || 'en_US',
      },
      timestamp: Date.now(),
      session_id: this.getSessionId(),
    };

    this.storeEvent(userFeedback);

    // Send immediately for user feedback
    this.sendFeedbackToServer();
  }

  /**
   * Get feedback statistics
   */
  getFeedbackStats() {
    try {
      if (!fs.existsSync(this.feedbackFile)) {
        return null;
      }

      const events = JSON.parse(fs.readFileSync(this.feedbackFile, 'utf8'));
      const now = Date.now();
      const dayAgo = now - 24 * 60 * 60 * 1000;
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

      return {
        total_events: events.length,
        events_last_24h: events.filter((e) => e.timestamp > dayAgo).length,
        events_last_week: events.filter((e) => e.timestamp > weekAgo).length,
        error_count: events.filter((e) => e.type === 'error').length,
        performance_samples: events.filter((e) => e.type === 'performance').length,
        feedback_count: events.filter((e) => e.type === 'user_feedback').length,
      };
    } catch (error) {
      console.error('Failed to get feedback stats:', error);
      return null;
    }
  }
}

// Integration with main application
class AppFeedbackIntegration {
  constructor(app) {
    this.feedback = new FeedbackCollectionSystem();
    this.app = app;
  }

  /**
   * Initialize feedback integration in Electron app
   */
  initializeElectron() {
    const { app } = require('electron');

    this.feedback.initialize();

    // Track app lifecycle events
    app.on('ready', () => {
      this.feedback.trackEvent('app_ready');
    });

    app.on('window-all-closed', () => {
      this.feedback.trackEvent('app_closed');
    });

    // Track window events
    app.on('browser-window-created', (event, window) => {
      this.feedback.trackEvent('window_created', {
        width: window.getBounds().width,
        height: window.getBounds().height,
      });
    });

    return this.feedback;
  }

  /**
   * Setup renderer process feedback
   */
  setupRendererFeedback(ipcMain) {
    // Listen for feedback events from renderer
    ipcMain.handle('feedback:collect', async (event, feedback) => {
      this.feedback.collectUserFeedback(feedback);
      return { success: true };
    });

    ipcMain.handle('feedback:stats', async () => {
      return this.feedback.getFeedbackStats();
    });

    // Track feature usage
    ipcMain.handle('feature:track', async (event, featureName, data) => {
      this.feedback.trackEvent(featureName, data);
      return { success: true };
    });
  }
}

module.exports = {
  FeedbackCollectionSystem,
  AppFeedbackIntegration,
};

// Example usage in main process:
// const { AppFeedbackIntegration } = require('./feedback-system');
// const feedbackIntegration = new AppFeedbackIntegration(app);
// feedbackIntegration.initializeElectron();
