/* conversation-ui.js
   CSP-perfect conversation UI + agent state machine + Agent v1 IPC wiring
   - No inline event handlers
   - No innerHTML injection for interactive elements
   - Defensive DOM guards
*/

(() => {
  'use strict';

  /** =============================
   *  Small DOM helpers
   *  ============================= */

  const $ = (id) => document.getElementById(id);
  const el = (tag, opts = {}) => {
    const node = document.createElement(tag);
    if (opts.className) node.className = opts.className;
    if (opts.text != null) node.textContent = String(opts.text);
    if (opts.attrs) {
      for (const [k, v] of Object.entries(opts.attrs)) node.setAttribute(k, String(v));
    }
    return node;
  };

  function nowTime() {
    try {
      return new Date().toLocaleTimeString();
    } catch {
      return new Date().toISOString();
    }
  }

  function safeScrollToBottom(container) {
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }

  /** =============================
   *  Agent State Machine
   *  ============================= */

  const AgentState = Object.freeze({
    IDLE: 'idle',
    PLANNING: 'planning',
    ACTING: 'acting',
  });

  function createStateMachine({ onChange } = {}) {
    let state = AgentState.IDLE;

    const setState = (next) => {
      if (state === next) return;
      state = next;
      onChange?.(state);
    };

    return {
      getState: () => state,
      idle: () => setState(AgentState.IDLE),
      planning: () => setState(AgentState.PLANNING),
      acting: () => setState(AgentState.ACTING),
    };
  }

  /** =============================
   *  Agent v1 IPC Adapter
   *  ============================= */

  /**
   * Expected (recommended) preload exposure:
   * window.rinaAgent.invoke(channel, payload) -> Promise<any>
   *
   * Suggested channels:
   * - 'agent:v1:plan'      { intent: string }
   * - 'agent:v1:execute'   { actionId: string, params?: any }
   * - 'agent:v1:chat'      { message: string }
   * - 'agent:v1:shell'     { command: string }
   *
   * If not present, we fallback to mock behavior so the UI still works.
   */
  function createAgentAdapter() {
    const api = window?.rinaAgent;

    const canInvoke = !!(api && typeof api.invoke === 'function');

    const invoke = async (channel, payload) => {
      if (!canInvoke) {
        // MOCK FALLBACK (dev-friendly, no crashes)
        await new Promise((r) => setTimeout(r, 450));
        if (channel === 'agent:v1:plan') {
          return {
            ok: true,
            reply: `Got it. Here's a plan for: "${payload.intent}"`,
            proposals: [
              {
                id: 'create-react-app',
                title: 'Create React Application',
                description: 'Initialize a new React project with TypeScript + linting.',
                consequences: 'Creates a new directory and installs dependencies.',
                params: { template: 'react-ts' },
              },
            ],
          };
        }
        if (channel === 'agent:v1:execute') {
          return {
            ok: true,
            reply: `Action executed: ${payload.actionId}`,
            terminal: `✅ Completed: ${payload.actionId}\n`,
          };
        }
        if (channel === 'agent:v1:chat') {
          return { ok: true, reply: `You said: "${payload.message}"` };
        }
        return { ok: false, error: 'No agent IPC available (mock mode).' };
      }

      // REAL IPC
      return api.invoke(channel, payload);
    };

    return { invoke, canInvoke: () => canInvoke };
  }

  /** =============================
   *  UI Controller
   *  ============================= */

  document.addEventListener('DOMContentLoaded', () => {
    const conversationMessages = $('conversationMessages');
    const intentInput = $('intentInput');
    const actionProposals = $('actionProposals');
    const terminalOutput = $('terminalOutput');
    const terminalToggle = $('terminalToggle');
    const btnPlan = $('btnPlan');

    // Hard guard: If core elements missing, do nothing (no runtime explosions).
    if (!conversationMessages || !intentInput) return;

    const agent = createAgentAdapter();
    const sm = createStateMachine({
      onChange: (state) => {
        // Optional: set a data attribute for CSS styling (e.g., show spinner in planning/acting)
        document.documentElement.setAttribute('data-agent-state', state);
      },
    });

    /** ---------- Rendering helpers ---------- */

    function addMessage(content, sender = 'rina') {
      const msg = el('div', { className: `message ${sender}` });

      const bubble = el('div', { className: 'message-bubble', text: content });
      const time = el('div', { className: 'message-time', text: nowTime() });

      msg.appendChild(bubble);
      msg.appendChild(time);

      conversationMessages.appendChild(msg);
      safeScrollToBottom(conversationMessages);
    }

    function clearProposals() {
      if (!actionProposals) return;
      actionProposals.textContent = '';
      actionProposals.style.display = 'none';
    }

    function appendTerminal(text) {
      if (!terminalOutput) return;
      // Prefer a <pre> inside terminalOutput; if not, just append text to terminalOutput
      const pre = terminalOutput.querySelector('pre') || terminalOutput;
      pre.textContent = (pre.textContent || '') + String(text);
      safeScrollToBottom(terminalOutput);
    }

    function setTerminalCollapsed(collapsed) {
      if (!terminalOutput || !terminalToggle) return;
      if (collapsed) {
        terminalOutput.classList.add('collapsed');
        terminalToggle.textContent = '▲';
      } else {
        terminalOutput.classList.remove('collapsed');
        terminalToggle.textContent = '▼';
      }
    }

    function renderProposalCard(proposal, { onConfirm, onCancel }) {
      const card = el('div', { className: 'action-proposal' });

      const titleRow = el('div', { className: 'action-title' });
      titleRow.appendChild(el('span', { text: '🎯' }));
      titleRow.appendChild(el('span', { text: proposal.title }));

      const desc = el('div', { className: 'action-description', text: proposal.description });
      const cons = el('div', { className: 'action-consequences', text: proposal.consequences });

      const btnRow = el('div', { className: 'action-buttons' });

      const confirmBtn = el('button', {
        className: 'confirm-btn',
        text: 'Confirm',
        attrs: { type: 'button' },
      });

      const cancelBtn = el('button', {
        className: 'cancel-btn',
        text: 'Cancel',
        attrs: { type: 'button' },
      });

      confirmBtn.addEventListener('click', () => onConfirm?.(proposal));
      cancelBtn.addEventListener('click', () => onCancel?.(proposal));

      btnRow.appendChild(confirmBtn);
      btnRow.appendChild(cancelBtn);

      card.appendChild(titleRow);
      card.appendChild(desc);
      card.appendChild(cons);
      card.appendChild(btnRow);

      return card;
    }

    function showSingleProposal(proposal, handlers) {
      if (!actionProposals) return;
      clearProposals();
      actionProposals.style.display = 'block';
      actionProposals.appendChild(renderProposalCard(proposal, handlers));
    }

    /** ---------- Core behaviors ---------- */

    async function handleIntent(intent) {
      addMessage(intent, 'user');

      sm.planning();
      addMessage('Got it. Before I do anything, here\'s what I\'m thinking…', 'rina');

      const result = await agent.invoke('agent:v1:plan', { intent });

      if (!result?.ok) {
        sm.idle();
        addMessage(result?.error || 'Planning failed.', 'rina');
        return;
      }

      if (result.reply) addMessage(result.reply, 'rina');

      const proposals = Array.isArray(result.proposals) ? result.proposals : [];
      if (proposals.length === 0) {
        sm.idle();
        addMessage('No actions proposed. Tell me what you want to do next.', 'rina');
        return;
      }

      // Enforce one proposal at a time (you can add next/prev later)
      const first = proposals[0];

      showSingleProposal(first, {
        onConfirm: async (p) => {
          clearProposals();
          sm.acting();
          addMessage(`Okay — I'm executing: "${p.title}"`, 'rina');

          const execRes = await agent.invoke('agent:v1:execute', {
            actionId: p.id,
            params: p.params || {},
          });

          if (!execRes?.ok) {
            sm.idle();
            addMessage(execRes?.error || 'Execution failed.', 'rina');
            return;
          }

          if (execRes.reply) addMessage(execRes.reply, 'rina');
          if (execRes.terminal) appendTerminal(execRes.terminal);

          sm.idle();
        },
        onCancel: () => {
          clearProposals();
          sm.idle();
          addMessage('Cancelled. Tell me what you want instead.', 'rina');
        },
      });

      sm.idle();
    }

    /** ---------- Event wiring (CSP-safe) ---------- */

    if (terminalToggle && terminalOutput) {
      terminalToggle.addEventListener('click', () => {
        const isCollapsed = terminalOutput.classList.contains('collapsed');
        setTerminalCollapsed(!isCollapsed);
      });
    }

    // Enter to submit intent
    intentInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const intent = intentInput.value.trim();
        if (!intent) return;
        intentInput.value = '';
        handleIntent(intent).catch((err) => {
          console.error(err);
          sm.idle();
          addMessage('Something went wrong while handling that intent.', 'rina');
        });
      }
    });

    if (btnPlan) {
      btnPlan.addEventListener('click', () => {
        const intent = intentInput.value.trim();
        if (!intent) return;
        intentInput.value = '';
        handleIntent(intent).catch((err) => {
          console.error(err);
          sm.idle();
          addMessage('Something went wrong while planning.', 'rina');
        });
      });
    }

    // Optional: initial greeting
    addMessage(
      agent.canInvoke()
        ? 'Agent connected. Tell me what you want to do.'
        : 'Agent not connected (mock mode). UI is live; IPC wiring will activate when preload is set.',
      'system',
    );
  });
})();