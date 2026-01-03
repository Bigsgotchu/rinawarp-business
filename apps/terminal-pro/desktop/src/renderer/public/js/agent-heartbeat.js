/**
 * Agent Heartbeat + State Sync
 * Monitors agent health and syncs status with UI
 * Uses existing agent status IPC channels
 */

import { AgentState } from './agent-state.js';

export function attachAgentHeartbeat(agent) {
  if (!window.rinaAgent) {
    console.warn('Agent heartbeat: rinaAgent IPC not available');
    return () => {}; // Return no-op cleanup
  }

  let heartbeatInterval = null;
  const HEARTBEAT_INTERVAL = 30000; // 30 seconds

  // Handle agent status updates
  const handleStatusUpdate = (_event, status) => {
    if (!status) return;

    if (status.healthy === false) {
      agent.error(status.lastError || 'Agent offline');
    } else if (status.healthy === true && agent.get() === AgentState.ERROR) {
      // Agent recovered from error state
      agent.idle();
    }
  };

  // Initial status check on boot
  const checkInitialStatus = async () => {
    try {
      const status = await window.rinaAgent.invoke('agent:get-status');
      handleStatusUpdate(null, status);
    } catch (err) {
      console.warn('Initial agent status check failed:', err);
    }
  };

  // Periodic heartbeat check
  const performHeartbeat = async () => {
    try {
      const status = await window.rinaAgent.invoke('agent:get-status');
      handleStatusUpdate(null, status);
    } catch (err) {
      console.warn('Agent heartbeat failed:', err);
    }
  };

  // Register status listener
  window.rinaAgent.on('agent:status', handleStatusUpdate);

  // Start periodic heartbeat
  heartbeatInterval = setInterval(performHeartbeat, HEARTBEAT_INTERVAL);

  // Initial check
  checkInitialStatus();

  // Return cleanup function
  return () => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
    window.rinaAgent.removeListener('agent:status', handleStatusUpdate);
  };
}