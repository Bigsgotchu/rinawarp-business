/**
 * Terminal → Conversation Bridge
 * Integrates PTY output into conversation UI
 * Uses existing terminal:* IPC channels
 */

export function attachTerminalBridge(ui, agentState) {
  if (!window.rinaAgent) {
    console.warn('Terminal bridge: rinaAgent IPC not available');
    return;
  }

  // Throttled output buffer for batch processing
  let outputBuffer = [];
  let flushTimeout = null;

  const flushOutput = (execId) => {
    if (outputBuffer.length === 0) return;
    
    const fullOutput = outputBuffer.join('\n');
    const executionId = execId || agentState?.getCurrentExecutionId();
    
    // Attach execution ID for correlation
    const displayText = fullOutput.length > 200
      ? fullOutput.substring(0, 200) + '...'
      : fullOutput;

    ui.addMessage(displayText, 'terminal', { executionId });
    outputBuffer = [];
  };

  // Listen for terminal data events
  const handleTerminalData = (_event, { data, executionId }) => {
    // Filter out noisy/empty output
    const trimmed = data.trim();
    if (!trimmed) return;

    // Add to buffer for throttled processing
    outputBuffer.push(trimmed);

    // Clear existing timeout
    if (flushTimeout) {
      clearTimeout(flushTimeout);
    }

    // Set new timeout for batch flush (50-100ms)
    flushTimeout = setTimeout(() => {
      flushOutput(executionId);
      flushTimeout = null;
    }, 75);
  };

  // Listen for terminal exit events
  const handleTerminalExit = (_event, { code, signal, executionId }) => {
    // Flush any pending output first
    if (flushTimeout) {
      clearTimeout(flushTimeout);
      flushOutput();
    }

    const exitMessage = signal
      ? `Terminal process terminated (signal ${signal})`
      : `Terminal process exited (code ${code})`;
    ui.addMessage(exitMessage, 'system', { executionId });
  };

  // Register listeners
  window.rinaAgent.on('terminal:data', handleTerminalData);
  window.rinaAgent.on('terminal:exit', handleTerminalExit);

  // Return cleanup function
  return () => {
    window.rinaAgent.removeListener('terminal:data', handleTerminalData);
    window.rinaAgent.removeListener('terminal:exit', handleTerminalExit);
    
    if (flushTimeout) {
      clearTimeout(flushTimeout);
    }
  };
}