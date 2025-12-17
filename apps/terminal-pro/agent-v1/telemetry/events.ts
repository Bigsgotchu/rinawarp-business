export type TelemetryEvent =
  | { type: 'app:start' }
  | { type: 'intent:received'; intent: string }
  | { type: 'tool:used'; tool: string }
  | { type: 'tool:failed'; tool: string; error: string }
  | { type: 'license:verified'; tier: string }
  | { type: 'license:invalid'; reason: string }
  | { type: 'onboarding:completed' }
  | { type: 'confirmation:requested'; tool: string; reason: string }
  | { type: 'confirmation:accepted'; tool: string }
  | { type: 'confirmation:rejected'; tool: string }
  | { type: 'session:start'; sessionId: string }
  | { type: 'session:end'; sessionId: string; duration: number }
  | { type: 'feature:used'; feature: string }
  | { type: 'error:occurred'; error: string; context?: string };

/**
 * Events that are NEVER collected (LOCKED):
 * - No keystrokes
 * - No file contents
 * - No commands
 * - No network calls
 * - No auto-upload
 */

// Utility type for events with metadata
export type EventWithMetadata = TelemetryEvent & {
  ts: string; // ISO timestamp
  sessionId?: string;
  userAgent?: string;
  platform?: string;
};
