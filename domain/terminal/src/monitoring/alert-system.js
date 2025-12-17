/**
 * RinaWarp Terminal Pro - Automated Alert System
 * Sends notifications for critical issues
 */

class AlertSystem {
  constructor(terminal) {
    this.terminal = terminal;
    this.alerts = [];
    this.notificationSettings = {
      email: false,
      desktop: true,
      terminal: true,
      webhook: false,
    };

    this.alertThresholds = {
      errorRate: 5, // 5%
      memoryUsage: 200, // 200MB
      stripeOverload: 5, // 5 errors in 5 minutes
      rateLimit: 80, // 80% of limit
    };

    this.initializeAlertSystem();
  }

  initializeAlertSystem() {
    // Add alert commands
    this.terminal.addCommand('alerts-config', this.showConfig.bind(this));
    this.terminal.addCommand('alerts-test', this.testAlerts.bind(this));
    this.terminal.addCommand('alerts-clear', this.clearAlerts.bind(this));

    // Add help
    this.terminal.addHelp('alerts-config', 'Show alert configuration');
    this.terminal.addHelp('alerts-test', 'Test alert system');
    this.terminal.addHelp('alerts-clear', 'Clear all alerts');

    this.terminal.output('🚨 Alert system initialized');
  }

  createAlert(type, message, severity = 'WARNING', data = {}) {
    const alert = {
      id: Date.now(),
      type,
      message,
      severity,
      timestamp: new Date().toISOString(),
      data,
      resolved: false,
      notifications: [],
    };

    this.alerts.push(alert);

    // Send notifications
    this.sendNotifications(alert);

    // Log to terminal
    if (this.notificationSettings.terminal) {
      const severityIcon = severity === 'CRITICAL' ? '🚨' : '⚠️';
      this.terminal.output(`${severityIcon} ALERT: ${message}`, 'error');
    }

    return alert;
  }

  sendNotifications(alert) {
    const notifications = [];

    // Terminal notification
    if (this.notificationSettings.terminal) {
      notifications.push('terminal');
    }

    // Desktop notification
    if (this.notificationSettings.desktop) {
      this.sendDesktopNotification(alert);
      notifications.push('desktop');
    }

    // Email notification
    if (this.notificationSettings.email) {
      this.sendEmailNotification(alert);
      notifications.push('email');
    }

    // Webhook notification
    if (this.notificationSettings.webhook) {
      this.sendWebhookNotification(alert);
      notifications.push('webhook');
    }

    alert.notifications = notifications;
  }

  sendDesktopNotification(alert) {
    try {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(`RinaWarp Alert: ${alert.type}`, {
            body: alert.message,
            icon: '/favicon.ico',
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
              new Notification(`RinaWarp Alert: ${alert.type}`, {
                body: alert.message,
                icon: '/favicon.ico',
              });
            }
          });
        }
      }
    } catch (error) {
      console.error('Desktop notification failed:', error);
    }
  }

  sendEmailNotification(alert) {
    // This would integrate with your email service
    // For now, just log the alert
    console.log(`Email Alert: ${alert.type} - ${alert.message}`);
  }

  sendWebhookNotification(alert) {
    // This would send to your webhook endpoint
    // For now, just log the alert
    console.log(`Webhook Alert: ${alert.type} - ${alert.message}`);
  }

  checkThresholds(stats) {
    // Check error rate
    const errorRate = (stats.errors / stats.totalRequests) * 100;
    if (errorRate > this.alertThresholds.errorRate) {
      this.createAlert(
        'HIGH_ERROR_RATE',
        `Error rate is ${errorRate.toFixed(2)}% (threshold: ${this.alertThresholds.errorRate}%)`,
        'CRITICAL',
        { errorRate, threshold: this.alertThresholds.errorRate }
      );
    }

    // Check memory usage
    const memoryMB = stats.memoryUsage
      ? stats.memoryUsage.heapUsed / 1024 / 1024
      : 0;
    if (memoryMB > this.alertThresholds.memoryUsage) {
      this.createAlert(
        'HIGH_MEMORY_USAGE',
        `Memory usage is ${memoryMB.toFixed(2)}MB (threshold: ${this.alertThresholds.memoryUsage}MB)`,
        'WARNING',
        { memoryMB, threshold: this.alertThresholds.memoryUsage }
      );
    }

    // Check Stripe status
    if (stats.stripeStatus === 'overloaded') {
      this.createAlert(
        'STRIPE_OVERLOADED',
        'Stripe Dashboard is overloaded - reduce API calls immediately',
        'CRITICAL',
        { stripeStatus: stats.stripeStatus }
      );
    }

    // Check rate limits
    const rateLimitPercent =
      (stats.rateLimits.currentMinute / stats.rateLimits.requestsPerMinute) *
      100;
    if (rateLimitPercent > this.alertThresholds.rateLimit) {
      this.createAlert(
        'RATE_LIMIT_WARNING',
        `Rate limit at ${rateLimitPercent.toFixed(1)}% (threshold: ${this.alertThresholds.rateLimit}%)`,
        'WARNING',
        { rateLimitPercent, threshold: this.alertThresholds.rateLimit }
      );
    }
  }

  resolveAlert(alertId) {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date().toISOString();
      this.terminal.output(`✅ Alert resolved: ${alert.type}`, 'success');
    }
  }

  clearAlerts() {
    this.alerts = [];
    this.terminal.output('🧹 All alerts cleared');
  }

  showConfig() {
    this.terminal.output('\n🚨 Alert Configuration:');
    this.terminal.output(
      `   Error Rate Threshold: ${this.alertThresholds.errorRate}%`
    );
    this.terminal.output(
      `   Memory Usage Threshold: ${this.alertThresholds.memoryUsage}MB`
    );
    this.terminal.output(
      `   Stripe Overload Threshold: ${this.alertThresholds.stripeOverload} errors`
    );
    this.terminal.output(
      `   Rate Limit Threshold: ${this.alertThresholds.rateLimit}%`
    );

    this.terminal.output('\n📧 Notification Settings:');
    this.terminal.output(
      `   Terminal: ${this.notificationSettings.terminal ? '✅' : '❌'}`
    );
    this.terminal.output(
      `   Desktop: ${this.notificationSettings.desktop ? '✅' : '❌'}`
    );
    this.terminal.output(
      `   Email: ${this.notificationSettings.email ? '✅' : '❌'}`
    );
    this.terminal.output(
      `   Webhook: ${this.notificationSettings.webhook ? '✅' : '❌'}`
    );

    this.terminal.output('\n📊 Current Alerts:');
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
  }

  testAlerts() {
    this.terminal.output('🧪 Testing alert system...');

    // Test different alert types
    this.createAlert('TEST_ALERT', 'This is a test alert', 'WARNING');
    this.createAlert(
      'TEST_CRITICAL',
      'This is a test critical alert',
      'CRITICAL'
    );

    this.terminal.output('✅ Test alerts sent');
  }

  getActiveAlerts() {
    return this.alerts.filter((a) => !a.resolved);
  }

  getAlertStats() {
    const total = this.alerts.length;
    const active = this.alerts.filter((a) => !a.resolved).length;
    const critical = this.alerts.filter(
      (a) => !a.resolved && a.severity === 'CRITICAL'
    ).length;

    return {
      total,
      active,
      critical,
      resolved: total - active,
    };
  }

  // Method to update thresholds
  updateThreshold(type, value) {
    if (this.alertThresholds.hasOwnProperty(type)) {
      this.alertThresholds[type] = value;
      this.terminal.output(`✅ Threshold updated: ${type} = ${value}`);
    } else {
      this.terminal.output(`❌ Unknown threshold type: ${type}`);
    }
  }

  // Method to update notification settings
  updateNotificationSetting(type, enabled) {
    if (this.notificationSettings.hasOwnProperty(type)) {
      this.notificationSettings[type] = enabled;
      this.terminal.output(
        `✅ Notification setting updated: ${type} = ${enabled}`
      );
    } else {
      this.terminal.output(`❌ Unknown notification type: ${type}`);
    }
  }
}

export default AlertSystem;
