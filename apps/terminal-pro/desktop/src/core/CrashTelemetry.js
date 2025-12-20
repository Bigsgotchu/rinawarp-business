import { app } from 'electron';
import { getCanaryStats } from './CanaryUpdateManager.js';

/**
 * Crash telemetry tracking for canary auto-promotion and rollback
 */
class CrashTelemetry {
  constructor() {
    this.crashCount = 0;
    this.lastCrashTime = null;
    this.setupGlobalHandlers();
  }

  setupGlobalHandlers() {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.trackCrash('uncaughtException', error.message);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      this.trackCrash('unhandledRejection', reason);
    });

    // Handle window unhandledrejection (for renderer crashes)
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        this.trackCrash('rendererUnhandledRejection', event.reason);
      });
    }
  }

  trackCrash(type, details) {
    this.crashCount++;
    this.lastCrashTime = new Date().toISOString();

    const cohortStats = getCanaryStats();
    
    const crashEvent = {
      event: 'app.crash',
      type: type,
      details: details?.toString().substring(0, 200), // Limit details length
      cohort: cohortStats.cohort,
      version: app.getVersion(),
      timestamp: this.lastCrashTime,
      crashCount: this.crashCount
    };

    // Send to telemetry
    this.sendTelemetry(crashEvent);

    console.error(`[CrashTelemetry] ${type}:`, details);
  }

  async sendTelemetry(crashEvent) {
    try {
      // Use the same telemetry endpoint as main app telemetry
      if (window && window.telemetry) {
        await window.telemetry.send(crashEvent);
      } else if (global.telemetryAPI) {
        await global.telemetryAPI.send(crashEvent);
      } else {
        // Fallback: direct HTTP request
        const response = await fetch('http://localhost:3000/api/telemetry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            schemaVersion: 1,
            appVersion: app.getVersion(),
            os: process.platform,
            agent: { status: 'online', crashEvent: true },
            license: { tier: 'unknown' },
            updateCohort: crashEvent.cohort,
            customEvent: crashEvent
          })
        });
        
        if (!response.ok) {
          console.error('Failed to send crash telemetry:', response.status);
        }
      }
    } catch (error) {
      console.error('Failed to send crash telemetry:', error);
    }
  }

  getCrashStats() {
    return {
      crashCount: this.crashCount,
      lastCrashTime: this.lastCrashTime,
      hasRecentCrash: this.lastCrashTime ? 
        (Date.now() - new Date(this.lastCrashTime).getTime()) < 60000 : false // Last minute
    };
  }

  reset() {
    this.crashCount = 0;
    this.lastCrashTime = null;
  }
}

// Create singleton instance
const crashTelemetry = new CrashTelemetry();

// Export for use in main process
export default crashTelemetry;

// Also export class for testing
export { CrashTelemetry };
