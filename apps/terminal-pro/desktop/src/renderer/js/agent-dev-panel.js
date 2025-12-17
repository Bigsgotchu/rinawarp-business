/**
 * Agent Development Panel
 * Hidden behind a flag for debugging and monitoring agent state
 * Provides visibility into current state, execution IDs, and last IPC payloads
 */

export function createAgentDevPanel(agentState, agentAdapter) {
  // Check if dev panel is enabled (via URL param or localStorage)
  const isEnabled = (
    new URLSearchParams(window.location.search).has('agent-dev') ||
    localStorage.getItem('agent-dev-panel') === 'true'
  );

  if (!isEnabled) {
    return null;
  }

  // Create dev panel DOM
  const panel = document.createElement('div');
  panel.id = 'agent-dev-panel';
  panel.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    width: 300px;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 12px;
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
    font-size: 12px;
    color: #e0e0e0;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  `;

  panel.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <h3 style="margin: 0; font-size: 14px; color: #61dafb;">Agent Dev Panel</h3>
      <button id="dev-panel-close" style="background: none; border: none; color: #999; cursor: pointer; font-size: 16px;">×</button>
    </div>
    
    <div id="dev-panel-content" style="max-height: 400px; overflow-y: auto;">
      <div style="margin-bottom: 12px;">
        <strong style="color: #61dafb;">Current State:</strong>
        <div id="dev-current-state" style="margin-left: 8px;">idle</div>
      </div>
      
      <div style="margin-bottom: 12px;">
        <strong style="color: #61dafb;">Current Execution ID:</strong>
        <div id="dev-current-exec" style="margin-left: 8px; word-break: break-all;">-</div>
      </div>
      
      <div style="margin-bottom: 12px;">
        <strong style="color: #61dafb;">Last Execution ID:</strong>
        <div id="dev-last-exec" style="margin-left: 8px; word-break: break-all;">-</div>
      </div>
      
      <div style="margin-bottom: 12px;">
        <strong style="color: #61dafb;">Last IPC Payload:</strong>
        <pre id="dev-last-payload" style="margin-left: 8px; background: #2a2a2a; padding: 8px; border-radius: 4px; overflow-x: auto; max-height: 150px; white-space: pre-wrap;">-</pre>
      </div>
      
      <div style="margin-bottom: 12px;">
        <strong style="color: #61dafb;">Agent Health:</strong>
        <div id="dev-health" style="margin-left: 8px;">-</div>
      </div>
    </div>
    
    <div style="border-top: 1px solid #333; padding-top: 8px; margin-top: 8px;">
      <button id="dev-refresh" style="background: #333; border: 1px solid #555; color: #e0e0e0; padding: 4px 8px; border-radius: 4px; cursor: pointer; margin-right: 8px;">Refresh</button>
      <button id="dev-toggle-persistent" style="background: #333; border: 1px solid #555; color: #e0e0e0; padding: 4px 8px; border-radius: 4px; cursor: pointer;">Remember</button>
    </div>
  `;

  // Add to document
  document.body.appendChild(panel);

  // Wire up controls
  const closeBtn = panel.querySelector('#dev-panel-close');
  closeBtn.addEventListener('click', () => {
    panel.remove();
  });

  const refreshBtn = panel.querySelector('#dev-refresh');
  refreshBtn.addEventListener('click', () => {
    updatePanel();
    checkHealth();
  });

  const togglePersistentBtn = panel.querySelector('#dev-toggle-persistent');
  const isPersistent = localStorage.getItem('agent-dev-panel') === 'true';
  togglePersistentBtn.textContent = isPersistent ? 'Forget' : 'Remember';
  togglePersistentBtn.addEventListener('click', () => {
    const newValue = localStorage.getItem('agent-dev-panel') === 'true' ? 'false' : 'true';
    localStorage.setItem('agent-dev-panel', newValue);
    togglePersistentBtn.textContent = newValue === 'true' ? 'Forget' : 'Remember';
  });

  // Store last IPC payload for display
  let lastIpcPayload = null;

  // Intercept AgentAdapter calls to capture payloads
  const originalPlan = agentAdapter.plan.bind(agentAdapter);
  agentAdapter.plan = async (intent) => {
    lastIpcPayload = { method: 'plan', intent, timestamp: new Date().toISOString() };
    try {
      const result = await originalPlan(intent);
      if (lastIpcPayload) lastIpcPayload.result = result;
      return result;
    } catch (err) {
      lastIpcPayload.error = err.message;
      throw err;
    }
  };

  const originalExecute = agentAdapter.execute.bind(agentAdapter);
  agentAdapter.execute = async (actionId, params, executionId) => {
    lastIpcPayload = { method: 'execute', actionId, params, executionId, timestamp: new Date().toISOString() };
    try {
      const result = await originalExecute(actionId, params, executionId);
      if (lastIpcPayload) lastIpcPayload.result = result;
      return result;
    } catch (err) {
      lastIpcPayload.error = err.message;
      throw err;
    }
  };

  // Update panel content
  function updatePanel() {
    const currentStateEl = panel.querySelector('#dev-current-state');
    const currentExecEl = panel.querySelector('#dev-current-exec');
    const lastExecEl = panel.querySelector('#dev-last-exec');
    const lastPayloadEl = panel.querySelector('#dev-last-payload');

    currentStateEl.textContent = agentState.get();
    currentExecEl.textContent = agentState.getCurrentExecutionId() || '-';
    lastExecEl.textContent = agentState.getLastExecutionId() || '-';
    lastPayloadEl.textContent = lastIpcPayload ? JSON.stringify(lastIpcPayload, null, 2) : '-';
  }

  // Check agent health
  async function checkHealth() {
    const healthEl = panel.querySelector('#dev-health');
    try {
      const status = await agentAdapter.status();
      healthEl.textContent = status.healthy ? '✅ Healthy' : '❌ Unhealthy';
      if (status.error) {
        healthEl.textContent += ` (${status.error})`;
      }
    } catch (err) {
      healthEl.textContent = `❌ Error: ${err.message}`;
    }
  }

  // Watch for state changes
  const originalSet = agentState.onChange;
  if (typeof originalSet === 'function') {
    // If agent state machine has change callback, intercept it
    // This is a simplified approach - in production you'd wire this more carefully
  }

  // Initial update and health check
  updatePanel();
  checkHealth();

  // Periodic refresh (every 2 seconds)
  const refreshInterval = setInterval(() => {
    updatePanel();
    checkHealth();
  }, 2000);

  // Cleanup function
  return () => {
    clearInterval(refreshInterval);
    panel.remove();
    // Restore original methods (this is simplified)
    agentAdapter.plan = originalPlan;
    agentAdapter.execute = originalExecute;
  };
}