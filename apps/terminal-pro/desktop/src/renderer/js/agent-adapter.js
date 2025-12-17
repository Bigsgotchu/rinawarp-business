/**
 * Agent IPC Adapter (IPC Communication Only)
 * Uses the existing authoritative IPC channels from main process
 */

export const AgentAdapter = {
  /**
   * Plan: convert user intent into actionable proposals
   * Uses: agent:v1:plan IPC channel
   */
  async plan(intent) {
    if (typeof intent !== 'string' || !intent.trim()) {
      return { ok: false, error: 'Invalid intent' };
    }

    try {
      // Use existing rinaAgent IPC bridge
      return await window.rinaAgent.invoke('agent:v1:plan', { intent });
    } catch (err) {
      return { ok: false, error: err.message || 'Planning failed' };
    }
  },

  /**
   * Execute: perform the confirmed action
   * Uses: agent:v1:execute IPC channel
   */
  async execute(actionId, params, executionId) {
    if (typeof actionId !== 'string' || !actionId) {
      return { ok: false, error: 'Invalid actionId' };
    }

    try {
      return await window.rinaAgent.invoke('agent:v1:execute', {
        actionId,
        params,
        executionId
      });
    } catch (err) {
      return { ok: false, error: err.message || 'Execution failed' };
    }
  },

  /**
   * Status: get current agent health and status
   * Uses: agent:get-status IPC channel
   */
  async status() {
    try {
      return await window.rinaAgent.invoke('agent:get-status');
    } catch (err) {
      return { healthy: false, error: err.message || 'Status check failed' };
    }
  },

  /**
   * General agent communication
   * Uses: agent:ask IPC channel (Cloudflare Worker)
   */
  async ask(payload) {
    try {
      return await window.rinaAgent.invoke('agent:ask', payload);
    } catch (err) {
      return { ok: false, error: err.message || 'Agent request failed' };
    }
  }
};