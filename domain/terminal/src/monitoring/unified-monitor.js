/**
 * RinaWarp Terminal Pro - Unified Monitoring System
 * Integrated monitoring dashboard for the terminal application
 */

class UnifiedMonitor {
  constructor(terminal) {
    this.terminal = terminal;
    this.stats = {
      totalRequests: 0,
      paymentAttempts: 0,
      successfulPayments: 0,
      errors: 0,
      startTime: new Date(),
      stripeStatus: 'unknown',
      rateLimits: {
        currentMinute: 0,
        currentHour: 0,
        requestsPerMinute: 100,
        requestsPerHour: 1000,
      },
    };

    this.alerts = [];
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.alertInterval = null;

    this.initializeMonitoring();
  }

  initializeMonitoring() {
    // Add monitoring commands to terminal
    this.terminal.addCommand('monitor', this.showDashboard.bind(this));
    this.terminal.addCommand('monitor-start', this.startMonitoring.bind(this));
    this.terminal.addCommand('monitor-stop', this.stopMonitoring.bind(this));
    this.terminal.addCommand('monitor-status', this.showStatus.bind(this));
    this.terminal.addCommand('monitor-alerts', this.showAlerts.bind(this));
    this.terminal.addCommand(
      'monitor-stripe',
      this.showStripeStatus.bind(this)
    );

    // Add monitoring to help
    this.terminal.addHelp('monitor', 'Show real-time monitoring dashboard');
    this.terminal.addHelp('monitor-start', 'Start monitoring system');
    this.terminal.addHelp('monitor-stop', 'Stop monitoring system');
    this.terminal.addHelp('monitor-status', 'Show current system status');
    this.terminal.addHelp('monitor-alerts', 'Show active alerts');
    this.terminal.addHelp('monitor-stripe', 'Show Stripe-specific status');

    this.terminal.output(
      '📊 Monitoring system initialized. Use "monitor" to view dashboard.'
    );
  }

  startMonitoring() {
    if (this.isMonitoring) {
      this.terminal.output('⚠️ Monitoring is already running');
      return;
    }

    this.isMonitoring = true;
    this.terminal.output('🚀 Starting unified monitoring system...');

    // Start monitoring intervals
    this.monitoringInterval = setInterval(() => {
      this.updateStats();
    }, 5000);

    this.alertInterval = setInterval(() => {
      this.checkAlerts();
    }, 10000);

    this.terminal.output('✅ Monitoring system started');
  }

  stopMonitoring() {
    if (!this.isMonitoring) {
      this.terminal.output('⚠️ Monitoring is not running');
      return;
    }

    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    if (this.alertInterval) {
      clearInterval(this.alertInterval);
      this.alertInterval = null;
    }

    this.terminal.output('🛑 Monitoring system stopped');
  }

  updateStats() {
    // Simulate server activity
    this.stats.totalRequests++;

    if (Math.random() < 0.1) {
      this.stats.paymentAttempts++;
      this.terminal.output('💳 Payment attempt detected', 'info');
    }

    if (Math.random() < 0.05) {
      this.stats.errors++;
      this.terminal.output('❌ Error detected', 'error');
    }

    if (Math.random() < 0.02) {
      this.stats.successfulPayments++;
      this.terminal.output('✅ Successful payment processed', 'success');
    }

    // Update rate limits
    this.stats.rateLimits.currentMinute++;
    this.stats.rateLimits.currentHour++;

    // Check Stripe status
    this.checkStripeStatus();
  }

  checkStripeStatus() {
    const recentErrors = this.stats.errors;

    if (recentErrors > 5) {
      this.stats.stripeStatus = 'overloaded';
      this.createAlert(
        'STRIPE_OVERLOADED',
        'Stripe Dashboard is overloaded - reduce API calls'
      );
    } else if (recentErrors > 2) {
      this.stats.stripeStatus = 'slow';
      this.createAlert(
        'STRIPE_SLOW',
        'Stripe Dashboard is slow - monitor closely'
      );
    } else {
      this.stats.stripeStatus = 'healthy';
    }
  }

  checkAlerts() {
    // Check for critical alerts
    const errorRate = (this.stats.errors / this.stats.totalRequests) * 100;

    if (errorRate > 10) {
      this.createAlert(
        'HIGH_ERROR_RATE',
        `Error rate is ${errorRate.toFixed(2)}% - investigate issues`
      );
    }

    if (
      this.stats.rateLimits.currentMinute >
      this.stats.rateLimits.requestsPerMinute * 0.8
    ) {
      this.createAlert('RATE_LIMIT_WARNING', 'Approaching minute rate limit');
    }

    if (
      this.stats.rateLimits.currentHour >
      this.stats.rateLimits.requestsPerHour * 0.8
    ) {
      this.createAlert('RATE_LIMIT_WARNING', 'Approaching hour rate limit');
    }
  }

  createAlert(type, message) {
    const alert = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date().toISOString(),
      severity: this.getSeverity(type),
      resolved: false,
    };

    // Check if alert already exists
    const existingAlert = this.alerts.find(
      (a) => a.type === type && !a.resolved
    );
    if (!existingAlert) {
      this.alerts.push(alert);
      this.terminal.output(`🚨 ALERT: ${message}`, 'error');
    }
  }

  getSeverity(type) {
    const criticalTypes = [
      'STRIPE_OVERLOADED',
      'HIGH_ERROR_RATE',
      'RATE_LIMIT_WARNING',
    ];
    return criticalTypes.includes(type) ? 'CRITICAL' : 'WARNING';
  }

  showDashboard() {
    const uptime = Math.round(
      (Date.now() - this.stats.startTime.getTime()) / 1000 / 60
    );
    const memoryUsage = process.memoryUsage();
    const errorRate =
      this.stats.totalRequests > 0
        ? ((this.stats.errors / this.stats.totalRequests) * 100).toFixed(2)
        : 0;

    this.terminal.output(
      '\n╔══════════════════════════════════════════════════════════════════════════════════════╗'
    );
    this.terminal.output(
      '║                        RinaWarp Terminal Pro - Monitor Dashboard                    ║'
    );
    this.terminal.output(
      '╚══════════════════════════════════════════════════════════════════════════════════════╝'
    );

    // System Overview
    this.terminal.output('\n📊 System Overview:');
    this.terminal.output(`   Uptime: ${uptime} minutes`);
    this.terminal.output(`   Total Requests: ${this.stats.totalRequests}`);
    this.terminal.output(
      `   Memory Usage: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`
    );
    this.terminal.output(
      `   Active Alerts: ${this.alerts.filter((a) => !a.resolved).length}`
    );

    // Server Status
    this.terminal.output('\n🖥️ Server Status:');
    this.terminal.output(`   Payment Attempts: ${this.stats.paymentAttempts}`);
    this.terminal.output(
      `   Successful Payments: ${this.stats.successfulPayments}`
    );
    this.terminal.output(`   Errors: ${this.stats.errors}`);
    this.terminal.output(`   Error Rate: ${errorRate}%`);

    // Stripe Status
    this.terminal.output('\n💳 Stripe Status:');
    const stripeColor =
      this.stats.stripeStatus === 'healthy'
        ? '✅'
        : this.stats.stripeStatus === 'slow'
          ? '⚠️'
          : '🚨';
    this.terminal.output(
      `   Dashboard: ${stripeColor} ${this.stats.stripeStatus.toUpperCase()}`
    );
    this.terminal.output(
      `   Rate Limit: ${this.stats.rateLimits.currentMinute}/${this.stats.rateLimits.requestsPerMinute}`
    );

    // Active Alerts
    this.terminal.output('\n🚨 Active Alerts:');
    const activeAlerts = this.alerts.filter((a) => !a.resolved);
    if (activeAlerts.length === 0) {
      this.terminal.output('   ✅ No active alerts');
    } else {
      activeAlerts.forEach((alert) => {
        const severityIcon = alert.severity === 'CRITICAL' ? '🚨' : '⚠️';
        this.terminal.output(
          `   ${severityIcon} ${alert.type}: ${alert.message}`
        );
      });
    }

    // Recommendations
    this.terminal.output('\n💡 Recommendations:');
    this.getRecommendations().forEach((rec) => {
      this.terminal.output(`   ${rec}`);
    });

    this.terminal.output(
      '\n💡 Commands: monitor-start, monitor-stop, monitor-status, monitor-alerts, monitor-stripe'
    );
  }

  showStatus() {
    const uptime = Math.round(
      (Date.now() - this.stats.startTime.getTime()) / 1000 / 60
    );
    const errorRate =
      this.stats.totalRequests > 0
        ? ((this.stats.errors / this.stats.totalRequests) * 100).toFixed(2)
        : 0;

    this.terminal.output('\n📊 Quick Status:');
    this.terminal.output(
      `   Monitoring: ${this.isMonitoring ? '✅ Active' : '❌ Inactive'}`
    );
    this.terminal.output(`   Uptime: ${uptime} minutes`);
    this.terminal.output(`   Requests: ${this.stats.totalRequests}`);
    this.terminal.output(`   Payments: ${this.stats.successfulPayments}`);
    this.terminal.output(`   Errors: ${this.stats.errors} (${errorRate}%)`);
    this.terminal.output(`   Stripe: ${this.stats.stripeStatus.toUpperCase()}`);
    this.terminal.output(
      `   Alerts: ${this.alerts.filter((a) => !a.resolved).length}`
    );
  }

  showAlerts() {
    this.terminal.output('\n🚨 Alert History:');
    if (this.alerts.length === 0) {
      this.terminal.output('   ✅ No alerts recorded');
    } else {
      this.alerts.forEach((alert) => {
        const severityIcon = alert.severity === 'CRITICAL' ? '🚨' : '⚠️';
        const statusIcon = alert.resolved ? '✅' : '🔴';
        this.terminal.output(
          `   ${severityIcon} ${statusIcon} ${alert.type}: ${alert.message}`
        );
        this.terminal.output(`      Time: ${alert.timestamp}`);
      });
    }
  }

  showStripeStatus() {
    this.terminal.output('\n💳 Stripe Status Details:');
    this.terminal.output(
      `   Dashboard: ${this.stats.stripeStatus.toUpperCase()}`
    );
    this.terminal.output(
      `   Rate Limit (min): ${this.stats.rateLimits.currentMinute}/${this.stats.rateLimits.requestsPerMinute}`
    );
    this.terminal.output(
      `   Rate Limit (hour): ${this.stats.rateLimits.currentHour}/${this.stats.rateLimits.requestsPerHour}`
    );
    this.terminal.output(`   Payment Attempts: ${this.stats.paymentAttempts}`);
    this.terminal.output(
      `   Successful Payments: ${this.stats.successfulPayments}`
    );

    if (this.stats.stripeStatus === 'overloaded') {
      this.terminal.output('\n🚨 Stripe Dashboard Overload Detected!');
      this.terminal.output('   • Stop making API calls for 5-10 minutes');
      this.terminal.output('   • Check Stripe Dashboard status page');
      this.terminal.output('   • Implement rate limiting');
    }
  }

  getRecommendations() {
    const recommendations = [];

    if (this.stats.stripeStatus === 'overloaded') {
      recommendations.push('🚨 Reduce API call frequency immediately');
      recommendations.push('⏰ Wait 5-10 minutes before making more calls');
      recommendations.push('📊 Check Stripe Dashboard status page');
    }

    if (
      this.stats.rateLimits.currentMinute >
      this.stats.rateLimits.requestsPerMinute * 0.8
    ) {
      recommendations.push('⚠️ Approaching minute rate limit');
    }

    if (
      this.stats.rateLimits.currentHour >
      this.stats.rateLimits.requestsPerHour * 0.8
    ) {
      recommendations.push('⚠️ Approaching hour rate limit');
    }

    const errorRate = (this.stats.errors / this.stats.totalRequests) * 100;
    if (errorRate > 5) {
      recommendations.push(`🔍 High error rate: ${errorRate.toFixed(2)}%`);
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ All systems operating normally');
    }

    return recommendations;
  }

  // Method to be called when payment is attempted
  recordPaymentAttempt(success = false) {
    this.stats.paymentAttempts++;
    if (success) {
      this.stats.successfulPayments++;
    } else {
      this.stats.errors++;
    }
  }

  // Method to be called when API call is made
  recordApiCall(success = true) {
    this.stats.totalRequests++;
    if (!success) {
      this.stats.errors++;
    }
  }

  // Get current stats for external use
  getStats() {
    return {
      ...this.stats,
      isMonitoring: this.isMonitoring,
      activeAlerts: this.alerts.filter((a) => !a.resolved).length,
      totalAlerts: this.alerts.length,
    };
  }
}

export default UnifiedMonitor;
