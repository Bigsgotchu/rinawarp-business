/**
 * Agent State Machine (Pure Logic)
 * Real, deterministic state management for agent operations
 */

export const AgentState = Object.freeze({
  IDLE: 'idle',
  PLANNING: 'planning',
  ACTING: 'acting',
  ERROR: 'error',
});

/**
 * Generate unique execution correlation ID
 */
function generateExecutionId() {
  return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createAgentStateMachine(onChange) {
  let state = AgentState.IDLE;
  let currentExecutionId = null;
  let lastExecutionId = null;

  function set(next, meta) {
    state = next;
    onChange?.(state, { ...meta, executionId: currentExecutionId });
  }

  return {
    get: () => state,
    getCurrentExecutionId: () => currentExecutionId,
    getLastExecutionId: () => lastExecutionId,

    idle() {
      currentExecutionId = null;
      set(AgentState.IDLE);
    },

    planning(intent) {
      set(AgentState.PLANNING, { intent });
    },

    acting(action) {
      currentExecutionId = generateExecutionId();
      set(AgentState.ACTING, {
        action,
        executionId: currentExecutionId
      });
    },

    error(err) {
      set(AgentState.ERROR, {
        err,
        previousExecutionId: currentExecutionId
      });
      
      // Soft reset policy: return to idle after error
      setTimeout(() => {
        this.idle();
      }, 100);
    },

    completeExecution() {
      lastExecutionId = currentExecutionId;
      currentExecutionId = null;
      this.idle();
    }
  };
}