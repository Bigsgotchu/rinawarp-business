import fs from 'node:fs/promises';
import path from 'node:path';
import type { TelemetryEvent } from './events';

const TELEMETRY_DIR = path.join(process.env.HOME || process.env.USERPROFILE || '', '.rinawarp');

const TELEMETRY_PATH = path.join(TELEMETRY_DIR, 'telemetry.log');

export async function logEvent(event: TelemetryEvent): Promise<void> {
  try {
    const eventWithMetadata = {
      ...event,
      ts: new Date().toISOString(),
      sessionId: getCurrentSessionId(),
      platform: process.platform,
      nodeVersion: process.version,
    };

    const line = JSON.stringify(eventWithMetadata) + '\n';

    // Ensure directory exists
    await fs.mkdir(TELEMETRY_DIR, { recursive: true });

    // Append to log file
    await fs.appendFile(TELEMETRY_PATH, line);
  } catch (error) {
    // Silently fail - telemetry should never break the app
    console.debug('Telemetry logging failed:', error);
  }
}

/**
 * Read telemetry events from local storage
 * Returns the most recent N events
 */
export async function readEvents(limit: number = 100): Promise<any[]> {
  try {
    const content = await fs.readFile(TELEMETRY_PATH, 'utf8');
    const lines = content
      .trim()
      .split('\n')
      .filter((line) => line.trim());
    const events = lines
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .slice(-limit); // Get most recent events

    return events.reverse(); // Most recent first
  } catch (error) {
    // No telemetry file or read error
    return [];
  }
}

/**
 * Clear telemetry data (for privacy/testing)
 */
export async function clearTelemetry(): Promise<void> {
  try {
    await fs.unlink(TELEMETRY_PATH);
  } catch {
    // File doesn't exist or couldn't be deleted - that's fine
  }
}

/**
 * Get telemetry file size (for storage monitoring)
 */
export async function getTelemetrySize(): Promise<number> {
  try {
    const stats = await fs.stat(TELEMETRY_PATH);
    return stats.size;
  } catch {
    return 0;
  }
}

// Simple session tracking
let currentSessionId: string | null = null;

function getCurrentSessionId(): string | undefined {
  return currentSessionId || undefined;
}

export function startSession(sessionId: string): void {
  currentSessionId = sessionId;
}

export function endSession(): void {
  currentSessionId = null;
}
