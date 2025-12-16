/**
 * RinaWarp Terminal Pro - Performance Monitor
 * Real-time performance tracking and optimization
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      // Memory metrics
      memoryUsage: [],
      memoryPeak: 0,
      memoryTrend: [],

      // Performance metrics
      frameRate: [],
      renderTime: [],
      responseTime: [],

      // Application metrics
      terminalCount: [],
      activeTerminals: [],
      commandCount: [],

      // Error tracking
      errors: [],
      warnings: [],

      // Resource usage
      cpuUsage: [],
      networkRequests: 0,
      networkErrors: 0,
    };

    this.thresholds = {
      memoryWarning: 100 * 1024 * 1024, // 100MB
      memoryCritical: 200 * 1024 * 1024, // 200MB
      responseTimeWarning: 100, // 100ms
      responseTimeCritical: 500, // 500ms
      frameRateWarning: 30, // 30 FPS
      terminalCountWarning: 15,
    };

    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.alertCallbacks = [];
    this.startTime = Date.now();

    this.initializeObserver();
  }

  initializeObserver() {
    // Performance Observer for web vitals
    if ('PerformanceObserver' in window) {
      // Monitor navigation timing
      try {
        const navObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordNavigationTiming(entry);
          }
        });
        navObserver.observe({ entryTypes: ['navigation'] });
      } catch (e) {
        console.warn('Navigation timing not supported');
      }

      // Monitor resource timing
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordResourceTiming(entry);
          }
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
      } catch (e) {
        console.warn('Resource timing not supported');
      }

      // Monitor paint timing
      try {
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordPaintTiming(entry);
          }
        });
        paintObserver.observe({ entryTypes: ['paint'] });
      } catch (e) {
        console.warn('Paint timing not supported');
      }
    }
  }

  startMonitoring() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;

    // Monitor every 2 seconds
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
      this.checkThresholds();
      this.generateAlerts();
    }, 2000);

    console.log('Performance monitoring started');
  }

  stopMonitoring() {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.log('Performance monitoring stopped');
  }

  collectMetrics() {
    // Memory metrics
    if (performance.memory) {
      const memInfo = {
        timestamp: Date.now(),
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
      };

      this.metrics.memoryUsage.push(memInfo);
      this.metrics.memoryPeak = Math.max(this.metrics.memoryPeak, memInfo.used);

      // Keep only last 100 entries
      if (this.metrics.memoryUsage.length > 100) {
        this.metrics.memoryUsage.shift();
      }
    }

    // Frame rate estimation
    if (performance.now()) {
      const now = performance.now();
      if (this.lastFrameTime) {
        const delta = now - this.lastFrameTime;
        const fps = 1000 / delta;
        this.metrics.frameRate.push({
          timestamp: now,
          fps: Math.min(fps, 144), // Cap at 144Hz
        });

        if (this.metrics.frameRate.length > 50) {
          this.metrics.frameRate.shift();
        }
      }
      this.lastFrameTime = now;
    }

    // Terminal metrics
    if (window.terminalManager) {
      this.metrics.terminalCount.push({
        timestamp: Date.now(),
        count: window.terminalManager.getTerminalCount(),
      });

      if (this.metrics.terminalCount.length > 50) {
        this.metrics.terminalCount.shift();
      }
    }
  }

  recordNavigationTiming(entry) {
    this.metrics.navigationTiming = {
      domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      loadComplete: entry.loadEventEnd - entry.loadEventStart,
      totalTime: entry.loadEventEnd - entry.fetchStart,
    };
  }

  recordResourceTiming(entry) {
    this.metrics.networkRequests++;

    if (entry.responseStatus >= 400) {
      this.metrics.networkErrors++;
    }

    // Track slow resources
    if (entry.duration > 1000) {
      this.recordWarning(
        'Slow Resource',
        `Resource ${entry.name} took ${entry.duration.toFixed(2)}ms to load`,
      );
    }
  }

  recordPaintTiming(entry) {
    this.metrics.paintTiming = this.metrics.paintTiming || {};
    this.metrics.paintTiming[entry.name] = entry.startTime;
  }

  checkThresholds() {
    const latestMemory = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];

    if (latestMemory && latestMemory.used > this.thresholds.memoryCritical) {
      this.recordError(
        'Memory Critical',
        `Memory usage critical: ${this.formatBytes(latestMemory.used)}`,
      );
    } else if (latestMemory && latestMemory.used > this.thresholds.memoryWarning) {
      this.recordWarning(
        'Memory Warning',
        `Memory usage high: ${this.formatBytes(latestMemory.used)}`,
      );
    }

    // Check response times
    const recentResponseTimes = this.metrics.responseTime.slice(-10);
    if (recentResponseTimes.length > 0) {
      const avgResponseTime =
        recentResponseTimes.reduce((a, b) => a + b, 0) / recentResponseTimes.length;

      if (avgResponseTime > this.thresholds.responseTimeCritical) {
        this.recordError(
          'Response Time Critical',
          `Average response time: ${avgResponseTime.toFixed(2)}ms`,
        );
      } else if (avgResponseTime > this.thresholds.responseTimeWarning) {
        this.recordWarning(
          'Response Time Warning',
          `Average response time: ${avgResponseTime.toFixed(2)}ms`,
        );
      }
    }

    // Check frame rate
    const recentFrameRates = this.metrics.frameRate.slice(-10);
    if (recentFrameRates.length > 0) {
      const avgFrameRate =
        recentFrameRates.reduce((a, b) => a + b.fps, 0) / recentFrameRates.length;

      if (avgFrameRate < this.thresholds.frameRateWarning) {
        this.recordWarning('Frame Rate Low', `Average FPS: ${avgFrameRate.toFixed(1)}`);
      }
    }
  }

  generateAlerts() {
    const alerts = [];

    // Memory alerts
    const latestMemory = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
    if (latestMemory) {
      const memPercentage = (latestMemory.used / latestMemory.limit) * 100;

      if (memPercentage > 90) {
        alerts.push({
          type: 'error',
          category: 'Memory',
          message: `Memory usage at ${memPercentage.toFixed(1)}%`,
          timestamp: Date.now(),
        });
      } else if (memPercentage > 75) {
        alerts.push({
          type: 'warning',
          category: 'Memory',
          message: `Memory usage at ${memPercentage.toFixed(1)}%`,
          timestamp: Date.now(),
        });
      }
    }

    // Performance alerts
    const terminalCount = this.getCurrentTerminalCount();
    if (terminalCount > this.thresholds.terminalCountWarning) {
      alerts.push({
        type: 'warning',
        category: 'Performance',
        message: `High terminal count: ${terminalCount}`,
        timestamp: Date.now(),
      });
    }

    // Emit alerts
    alerts.forEach((alert) => {
      this.emitAlert(alert);
    });
  }

  emitAlert(alert) {
    this.alertCallbacks.forEach((callback) => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Error in alert callback:', error);
      }
    });
  }

  recordError(category, message) {
    const error = {
      category,
      message,
      timestamp: Date.now(),
      stack: new Error().stack,
    };

    this.metrics.errors.push(error);

    // Keep only last 50 errors
    if (this.metrics.errors.length > 50) {
      this.metrics.errors.shift();
    }

    console.error(`[${category}] ${message}`);
  }

  recordWarning(category, message) {
    const warning = {
      category,
      message,
      timestamp: Date.now(),
    };

    this.metrics.warnings.push(warning);

    // Keep only last 50 warnings
    if (this.metrics.warnings.length > 50) {
      this.metrics.warnings.shift();
    }

    console.warn(`[${category}] ${message}`);
  }

  recordResponseTime(time) {
    this.metrics.responseTime.push(time);

    // Keep only last 100 response times
    if (this.metrics.responseTime.length > 100) {
      this.metrics.responseTime.shift();
    }
  }

  // Utility methods
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getCurrentTerminalCount() {
    const latest = this.metrics.terminalCount[this.metrics.terminalCount.length - 1];
    return latest ? latest.count : 0;
  }

  getMetrics() {
    return {
      ...this.metrics,
      uptime: Date.now() - this.startTime,
      isMonitoring: this.isMonitoring,
    };
  }

  getPerformanceReport() {
    const report = {
      summary: {
        uptime: this.formatDuration(Date.now() - this.startTime),
        memoryUsage: this.getCurrentMemoryUsage(),
        peakMemory: this.formatBytes(this.metrics.memoryPeak),
        averageFrameRate: this.getAverageFrameRate(),
        totalErrors: this.metrics.errors.length,
        totalWarnings: this.metrics.warnings.length,
      },
      trends: {
        memoryTrend: this.getMemoryTrend(),
        performanceTrend: this.getPerformanceTrend(),
      },
      recent: {
        errors: this.metrics.errors.slice(-5),
        warnings: this.metrics.warnings.slice(-5),
      },
    };

    return report;
  }

  getCurrentMemoryUsage() {
    const latest = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
    return latest ? this.formatBytes(latest.used) : 'Unknown';
  }

  getAverageFrameRate() {
    if (this.metrics.frameRate.length === 0) return 0;
    const sum = this.metrics.frameRate.reduce((acc, entry) => acc + entry.fps, 0);
    return (sum / this.metrics.frameRate.length).toFixed(1);
  }

  getMemoryTrend() {
    if (this.metrics.memoryUsage.length < 2) return 'stable';

    const recent = this.metrics.memoryUsage.slice(-5);
    const first = recent[0].used;
    const last = recent[recent.length - 1].used;
    const change = ((last - first) / first) * 100;

    if (Math.abs(change) < 5) return 'stable';
    return change > 0 ? 'increasing' : 'decreasing';
  }

  getPerformanceTrend() {
    if (this.metrics.frameRate.length < 2) return 'stable';

    const recent = this.metrics.frameRate.slice(-5);
    const first = recent[0].fps;
    const last = recent[recent.length - 1].fps;
    const change = last - first;

    if (Math.abs(change) < 5) return 'stable';
    return change > 0 ? 'improving' : 'degrading';
  }

  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  // Public API
  onAlert(callback) {
    this.alertCallbacks.push(callback);
  }

  removeAlertCallback(callback) {
    const index = this.alertCallbacks.indexOf(callback);
    if (index > -1) {
      this.alertCallbacks.splice(index, 1);
    }
  }

  exportMetrics() {
    const data = {
      metrics: this.getMetrics(),
      report: this.getPerformanceReport(),
      exportedAt: new Date().toISOString(),
    };

    return JSON.stringify(data, null, 2);
  }

  clearMetrics() {
    Object.keys(this.metrics).forEach((key) => {
      if (Array.isArray(this.metrics[key])) {
        this.metrics[key] = [];
      }
    });

    this.metrics.memoryPeak = 0;
    this.metrics.errors = [];
    this.metrics.warnings = [];
    this.startTime = Date.now();
  }

  destroy() {
    this.stopMonitoring();
    this.alertCallbacks = [];
  }
}

// Export performance monitor
window.PerformanceMonitor = PerformanceMonitor;
window.performanceMonitor = new PerformanceMonitor();
