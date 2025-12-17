/**
 * Performance Monitoring System
 * Real-time performance tracking and analytics
 */

import os from 'os';
import process from 'process';

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: 0,
      responses: 0,
      errors: 0,
      averageResponseTime: 0,
      peakMemory: 0,
      startTime: Date.now(),
    };

    this.responseTimes = [];
    this.recentMetrics = [];
    this.isMonitoring = false;
    this.maxMetricsHistory = 1000; // Keep last 1000 metrics
  }

  // Start monitoring
  start() {
    if (this.isMonitoring) return;
    this.isMonitoring = true;

    console.log('🔍 Performance Monitor started');

    // Monitor system metrics every 30 seconds
    setInterval(() => {
      this.collectSystemMetrics();
    }, 30000);

    // Clean old metrics every 5 minutes
    setInterval(() => {
      this.cleanOldMetrics();
    }, 300000);
  }

  // Middleware to track HTTP requests
  trackRequest() {
    return (req, res, next) => {
      const startTime = Date.now();
      this.metrics.requests++;

      // Track response
      res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        this.recordResponse(req, res, responseTime);
      });

      next();
    };
  }

  // Record response metrics
  recordResponse(req, res, responseTime) {
    this.metrics.responses++;
    this.responseTimes.push(responseTime);

    // Update average response time
    const total = this.responseTimes.reduce((sum, time) => sum + time, 0);
    this.metrics.averageResponseTime = Math.round(
      total / this.responseTimes.length
    );

    // Track errors
    if (res.statusCode >= 400) {
      this.metrics.errors++;
    }

    // Record detailed metrics
    const metric = {
      timestamp: Date.now(),
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    };

    this.recentMetrics.push(metric);

    // Keep only recent metrics
    if (this.recentMetrics.length > this.maxMetricsHistory) {
      this.recentMetrics = this.recentMetrics.slice(-this.maxMetricsHistory);
    }

    // Keep only recent response times
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-1000);
    }
  }

  // Collect system metrics
  collectSystemMetrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    const systemMetrics = {
      timestamp: Date.now(),
      memory: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        external: memUsage.external,
        rss: memUsage.rss,
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      uptime: process.uptime(),
      loadAverage: os.loadavg(),
      freeMemory: os.freemem(),
      totalMemory: os.totalmem(),
    };

    // Update peak memory
    if (memUsage.heapUsed > this.metrics.peakMemory) {
      this.metrics.peakMemory = memUsage.heapUsed;
    }

    console.log('📊 System metrics:', {
      memory: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      uptime: `${Math.round(process.uptime())}s`,
      loadAvg: os.loadavg()[0].toFixed(2),
    });
  }

  // Clean old metrics
  cleanOldMetrics() {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

    // Keep only metrics from last 5 minutes
    this.recentMetrics = this.recentMetrics.filter(
      (metric) => metric.timestamp > fiveMinutesAgo
    );

    console.log(
      `🧹 Cleaned old metrics. Current count: ${this.recentMetrics.length}`
    );
  }

  // Get performance summary
  getSummary() {
    const uptime = Date.now() - this.metrics.startTime;
    const uptimeHours = Math.round((uptime / (1000 * 60 * 60)) * 100) / 100;

    return {
      ...this.metrics,
      uptime: uptimeHours,
      currentMemory: process.memoryUsage().heapUsed,
      responseTimeStats: this.getResponseTimeStats(),
      errorRate:
        this.metrics.requests > 0
          ? Math.round(
            (this.metrics.errors / this.metrics.requests) * 100 * 100
          ) / 100
          : 0,
    };
  }

  // Get response time statistics
  getResponseTimeStats() {
    if (this.responseTimes.length === 0) {
      return { min: 0, max: 0, avg: 0, p95: 0, p99: 0 };
    }

    const sorted = [...this.responseTimes].sort((a, b) => a - b);
    const len = sorted.length;

    return {
      min: sorted[0],
      max: sorted[len - 1],
      avg: Math.round(this.metrics.averageResponseTime),
      p95: sorted[Math.floor(len * 0.95)],
      p99: sorted[Math.floor(len * 0.99)],
    };
  }

  // Get recent metrics (last N minutes)
  getRecentMetrics(minutes = 5) {
    const cutoff = Date.now() - minutes * 60 * 1000;
    return this.recentMetrics.filter((metric) => metric.timestamp > cutoff);
  }

  // Get health status
  getHealthStatus() {
    const summary = this.getSummary();
    const responseTimeStats = this.getResponseTimeStats();

    const health = {
      status: 'healthy',
      timestamp: Date.now(),
      metrics: summary,
      checks: {
        responseTime: responseTimeStats.avg < 1000 ? 'ok' : 'slow',
        errorRate: summary.errorRate < 5 ? 'ok' : 'high',
        memory: summary.currentMemory < 100 * 1024 * 1024 ? 'ok' : 'high', // 100MB
        uptime: summary.uptime > 0 ? 'ok' : 'error',
      },
    };

    // Determine overall status
    const checkValues = Object.values(health.checks);
    if (checkValues.includes('error')) {
      health.status = 'unhealthy';
    } else if (checkValues.includes('high') || checkValues.includes('slow')) {
      health.status = 'degraded';
    }

    return health;
  }

  // Reset metrics
  reset() {
    this.metrics = {
      requests: 0,
      responses: 0,
      errors: 0,
      averageResponseTime: 0,
      peakMemory: 0,
      startTime: Date.now(),
    };

    this.responseTimes = [];
    this.recentMetrics = [];

    console.log('🔄 Performance metrics reset');
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor;
