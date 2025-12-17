/**
 * Conversation UI Bootstrap (Modular Architecture)
 * Wires together: State Machine + IPC Adapter + Renderer + Bridges
 * CSP-safe, no inline scripts, no globals
 */

import { AgentAdapter } from './agent-adapter.js';
import { createAgentDevPanel } from './agent-dev-panel.js';
import { attachAgentHeartbeat } from './agent-heartbeat.js';
import { createAgentStateMachine, AgentState } from './agent-state.js';
import { createConversationRenderer } from './conversation-renderer.js';
import { attachTerminalBridge } from './terminal-bridge.js';

document.addEventListener('DOMContentLoaded', () => {
  const root = document;
  const input = root.querySelector('#intentInput');
  const terminalToggle = root.querySelector('#terminalToggle');
  const terminalOutput = root.querySelector('#terminalOutput');

  // Initialize UI components
  const ui = createConversationRenderer(root);

  // Initialize agent state machine with callbacks
  const agent = createAgentStateMachine((state, meta) => {
    // Update body data attribute for CSS styling
    document.body.setAttribute('data-agent-state', state);

    // Handle state transitions with appropriate messages
    switch (state) {
      case AgentState.PLANNING:
        ui.addMessage('Let me think that through…', 'rina');
        break;
        
      case AgentState.ACTING:
        ui.addMessage('Okay — I\'m doing it now.', 'rina');
        break;
        
      case AgentState.ERROR:
        ui.addMessage(`Something went wrong: ${meta?.err}`, 'system');
        break;
        
      case AgentState.IDLE:
        // Idle state - no automatic message to avoid noise
        break;
    }
  });

  // Setup terminal toggle
  if (terminalToggle && terminalOutput) {
    terminalToggle.addEventListener('click', () => {
      const isCollapsed = terminalOutput.classList.contains('collapsed');
      ui.setTerminalCollapsed(!isCollapsed);
      terminalToggle.textContent = isCollapsed ? '▼' : '▲';
    });
  }

  // Handle intent input (Enter to submit)
  input?.addEventListener('keydown', async (e) => {
    if (e.key !== 'Enter' || e.shiftKey) return;
    e.preventDefault();

    const intent = input.value.trim();
    if (!intent) return;

    // Clear input and show user message
    input.value = '';
    ui.addMessage(intent, 'user');

    // Start planning phase
    agent.planning(intent);

    try {
      // Get proposals from agent
      const planResult = await AgentAdapter.plan(intent);
      
      if (!planResult.ok) {
        agent.error(planResult.error || 'Planning failed');
        return;
      }

      // Show planning response
      if (planResult.reply) {
        ui.addMessage(planResult.reply, 'rina');
      }

      // Show proposals for user selection
      const proposals = Array.isArray(planResult.proposals) ? planResult.proposals : [];
      if (proposals.length === 0) {
        ui.addMessage('No actions proposed. Tell me what you want to do next.', 'rina');
        agent.idle();
        return;
      }

      // Show proposals with handlers
      ui.showProposals(proposals, 
        // Confirm handler
        async (proposal) => {
          agent.acting(proposal.id);
          const executionId = agent.getCurrentExecutionId();
          
          try {
            const execResult = await AgentAdapter.execute(proposal.id, proposal.params, executionId);
            
            if (!execResult.ok) {
              agent.error(execResult.error || 'Execution failed');
              return;
            }

            // Show execution response
            if (execResult.reply) {
              ui.addMessage(execResult.reply, 'rina', { executionId });
            }

            // Show terminal output if provided
            if (execResult.terminal) {
              ui.appendTerminal(execResult.terminal, { executionId });
            }

            agent.completeExecution();
          } catch (err) {
            agent.error(err.message || 'Execution failed');
          }
        },
        // Cancel handler
        () => {
          ui.clearProposals();
          ui.addMessage('Cancelled. Tell me what you want instead.', 'rina');
          agent.idle();
        }
      );

      // Return to idle state after showing proposals
      agent.idle();
      
    } catch (err) {
      agent.error(err.message || 'Planning failed');
    }
  });

  // Setup bridges
  const cleanupTerminal = attachTerminalBridge(ui, agent);
  const cleanupHeartbeat = attachAgentHeartbeat(agent);
  const cleanupDevPanel = createAgentDevPanel(agent, AgentAdapter);

  // Setup cleanup on page unload
  window.addEventListener('beforeunload', () => {
    cleanupTerminal?.();
    cleanupHeartbeat?.();
    cleanupDevPanel?.();
  });

  // Initial greeting
  ui.addMessage(
    window.rinaAgent 
      ? 'Hey. What do you want to work on today?'
      : 'Agent not connected (mock mode). UI is live; IPC wiring will activate when preload is set.',
    'system'
  );
});