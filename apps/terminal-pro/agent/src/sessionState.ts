/**
 * Session State - MVR-3: Session tracking for Agent Pro eligibility
 * Tracks exactly 4 counters: startTime, acceptedSuggestions, memoryWrites, commandsExecuted
 */

export interface SessionState {
  startTime: number;
  acceptedSuggestions: number;
  memoryWrites: number;
  commandsExecuted: number;
}

export function createSessionState(): SessionState {
  return {
    startTime: Date.now(),
    acceptedSuggestions: 0,
    memoryWrites: 0,
    commandsExecuted: 0,
  };
}

export function incrementAcceptedSuggestions(sessionState: SessionState): void {
  sessionState.acceptedSuggestions++;
}

export function incrementMemoryWrites(sessionState: SessionState): void {
  sessionState.memoryWrites++;
}

export function incrementCommandsExecuted(sessionState: SessionState): void {
  sessionState.commandsExecuted++;
}

export function getSessionDuration(sessionState: SessionState): number {
  return Date.now() - sessionState.startTime;
}

export function getSessionDurationMinutes(sessionState: SessionState): number {
  return Math.floor(getSessionDuration(sessionState) / (1000 * 60));
}

// Global session state instance
export const sessionState: SessionState = createSessionState();

// Make it available globally for terminal.js
if (typeof window !== 'undefined') {
  (window as any).sessionState = sessionState;
}
