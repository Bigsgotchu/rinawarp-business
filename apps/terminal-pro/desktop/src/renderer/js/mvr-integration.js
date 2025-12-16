/**
 * MVR Integration - Wires together all 4 MVR components
 * Phase-1 patch plan implementation for RinaWarp Terminal Pro
 */

// Import components
import { setAgentProEligibility } from '../../agent/src/agentProEligibility.js';
import { rememberProject, resetMemorySession } from '../../agent/src/memory-enhanced.js';

// Global state
let sessionStarted = false;

// Initialize MVR components
export function initializeMVR() {
  if (sessionStarted) return;

  // Reset memory session
  resetMemorySession();

  // Start session state if not already started
  if (!window.sessionState) {
    window.sessionState = {
      startTime: Date.now(),
      acceptedSuggestions: 0,
      memoryWrites: 0,
      commandsExecuted: 0,
    };
  }

  // Initialize user state
  if (!window.userState) {
    window.userState = {
      isEligibleForAgentPro: false,
    };
  }

  sessionStarted = true;
  console.log('MVR Phase-1 components initialized');
}

// Handle command execution
export function handleCommandExecution(command, cwd) {
  // Initialize if needed
  if (!sessionStarted) {
    initializeMVR();
  }

  // Update session state
  if (window.sessionState) {
    window.sessionState.commandsExecuted++;
  }

  // Trigger memory moment on first few commands
  if (window.sessionState && window.sessionState.commandsExecuted <= 3) {
    rememberProject(cwd, command);
  }

  // Check Agent Pro eligibility
  if (window.sessionState && window.userState) {
    setAgentProEligibility(window.sessionState, window.userState);
  }

  // Log for debugging
  console.log('MVR Session State:', window.sessionState);
  console.log('Agent Pro Eligible:', window.userState.isEligibleForAgentPro);
}

// Handle ghost text acceptance
export function handleGhostTextAcceptance() {
  if (window.sessionState) {
    window.sessionState.acceptedSuggestions++;
  }

  // Check eligibility after acceptance
  if (window.sessionState && window.userState) {
    setAgentProEligibility(window.sessionState, window.userState);
  }
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMVR);
  } else {
    initializeMVR();
  }
}
