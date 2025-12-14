/**
 * Agent Pro Eligibility - MVR-4: Check Agent Pro eligibility
 * Sets user.isEligibleForAgentPro === true when conditions are met
 * Conditions: ≥3 accepted suggestions, ≥1 memory write, ≥8 minutes elapsed
 */

import { SessionState, getSessionDuration } from './sessionState.js';

export interface UserState {
  isEligibleForAgentPro: boolean;
}

export function checkAgentProEligibility(sessionState: SessionState): boolean {
  return (
    sessionState.acceptedSuggestions >= 3 &&
    sessionState.memoryWrites >= 1 &&
    getSessionDuration(sessionState) >= 8 * 60 * 1000 // 8 minutes in milliseconds
  );
}

export function setAgentProEligibility(sessionState: SessionState, userState: UserState): void {
  userState.isEligibleForAgentPro = checkAgentProEligibility(sessionState);
}

// Global user state instance
export const userState: UserState = {
  isEligibleForAgentPro: false,
};

// Make it available globally for terminal.js
if (typeof window !== 'undefined') {
  (window as any).userState = userState;
}
