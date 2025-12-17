import {
  logEvent,
  readEvents,
  clearTelemetry,
  getTelemetrySize,
  startSession,
  endSession,
} from './store';
import type { TelemetryEvent } from './events';

export class TelemetryManager {
  private enabled: boolean;
  private sessionId: string;

  constructor(enabled: boolean = true) {
    this.enabled = enabled;
    this.sessionId = this.generateSessionId();
    startSession(this.sessionId);
  }

  /**
   * Log a telemetry event (if enabled)
   */
  async log(event: TelemetryEvent): Promise<void> {
    if (!this.enabled) {
      return;
    }

    await logEvent(event);
  }

  /**
   * Enable telemetry collection
   */
  enable(): void {
    this.enabled = true;
  }

  /**
   * Disable telemetry collection
   */
  disable(): void {
    this.enabled = false;
  }

  /**
   * Check if telemetry is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get recent events for debugging/analytics
   */
  async getRecentEvents(limit: number = 50): Promise<any[]> {
    return await readEvents(limit);
  }

  /**
   * Clear all telemetry data
   */
  async clear(): Promise<void> {
    await clearTelemetry();
  }

  /**
   * Get telemetry storage size in bytes
   */
  async getStorageSize(): Promise<number> {
    return await getTelemetrySize();
  }

  /**
   * Start a new session
   */
  startNewSession(): void {
    endSession();
    this.sessionId = this.generateSessionId();
    startSession(this.sessionId);
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Convenience methods for common events

  async logAppStart(): Promise<void> {
    await this.log({ type: 'app:start' });
  }

  async logIntentReceived(intent: string): Promise<void> {
    await this.log({ type: 'intent:received', intent });
  }

  async logToolUsed(tool: string): Promise<void> {
    await this.log({ type: 'tool:used', tool });
  }

  async logToolFailed(tool: string, error: string): Promise<void> {
    await this.log({ type: 'tool:failed', tool, error });
  }

  async logLicenseVerified(tier: string): Promise<void> {
    await this.log({ type: 'license:verified', tier });
  }

  async logLicenseInvalid(reason: string): Promise<void> {
    await this.log({ type: 'license:invalid', reason });
  }

  async logOnboardingCompleted(): Promise<void> {
    await this.log({ type: 'onboarding:completed' });
  }

  async logConfirmationRequested(tool: string, reason: string): Promise<void> {
    await this.log({ type: 'confirmation:requested', tool, reason });
  }

  async logConfirmationAccepted(tool: string): Promise<void> {
    await this.log({ type: 'confirmation:accepted', tool });
  }

  async logConfirmationRejected(tool: string): Promise<void> {
    await this.log({ type: 'confirmation:rejected', tool });
  }

  async logFeatureUsed(feature: string): Promise<void> {
    await this.log({ type: 'feature:used', feature });
  }

  async logError(error: string, context?: string): Promise<void> {
    await this.log({ type: 'error:occurred', error, context });
  }
}

/**
 * Default telemetry manager instance
 * Can be enabled/disabled based on user preference
 */
export const defaultTelemetryManager = new TelemetryManager(
  process.env.TELEMETRY_ENABLED === 'true',
);
