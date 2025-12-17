/**
 * Agent Integration Example
 *
 * This file shows exactly how to wire the v1 Agent into your existing
 * Terminal Pro chat handler. Drop this pattern into your renderer code.
 */

import { handleUserIntent } from '../agent-v1/core/agent';
import type { ToolContext } from '../agent-v1/core/types';

// ============================================================================
// STEP 1: Import and setup your existing chat message handler
// ============================================================================

export async function handleUserMessage(text: string, currentProjectPath: string) {
  // Create the agent context (local-first, secure)
  const agentContext: ToolContext = {
    projectRoot: currentProjectPath,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      // Add other safe env vars as needed
    },
    log: (msg, data) => console.log('[Agent]', msg, data),
  };

  // ============================================================================
  // STEP 2: Add the confirmation resolver (UI-driven)
  // ============================================================================
  // This bridges agent → UI modal → user decision

  const confirm = async ({ id }: { id: string }): Promise<'yes' | 'no'> => {
    return new Promise((resolve) => {
      openConfirmationModal({
        id,
        onConfirm: () => resolve('yes'),
        onCancel: () => resolve('no'),
      });
    });
  };

  // ============================================================================
  // STEP 3: Handle agent events (THIS IS THE KEY)
  // ============================================================================
  const emit = (event: any) => {
    switch (event.type) {
      case 'assistant:message':
        addChatMessage('rina', event.text);
        break;

      case 'tool:declare':
        addSystemMessage(`Rina is using ${event.toolName}`);
        break;

      case 'tool:output':
        showExpandableOutput(event.output);
        break;

      case 'tool:error':
        addChatMessage('rina', event.message);
        break;

      case 'confirm:request':
        openConfirmationModal({
          title: event.request.title,
          body: [
            event.request.intentReflection,
            event.request.actionPlain,
            event.request.risk && `⚠ ${event.request.risk}`,
          ].filter(Boolean),
          prompt: event.request.prompt,
        });
        break;
    }
  };

  // ============================================================================
  // STEP 4: Call the agent from chat submit
  // ============================================================================
  await handleUserIntent({
    text,
    ctx: agentContext,
    confirm,
    emit,
  });
}

// ============================================================================
// UI INTEGRATION HELPERS
// These should integrate with your existing UI framework
// ============================================================================

/**
 * Add a chat message to your existing chat interface
 */
function addChatMessage(sender: string, text: string) {
  // Example for React/Vue/vanilla JS:
  // setMessages(prev => [...prev, {
  //   id: Date.now(),
  //   sender,
  //   text,
  //   timestamp: new Date()
  // }]);

  // For debugging:
  console.log(`[Chat] ${sender}: ${text}`);
}

/**
 * Add a system/status message
 */
function addSystemMessage(text: string) {
  // Show in your status bar or system messages area
  console.log(`[System] ${text}`);
}

/**
 * Show expandable tool output
 */
function showExpandableOutput(output: any) {
  // Display in your expandable output panel
  console.log('[Tool Output]', output);

  // Example: Open expandable panel with the output
  // openOutputPanel({
  //   title: 'Tool Execution Result',
  //   content: typeof output === 'string' ? output : JSON.stringify(output, null, 2),
  //   type: 'tool-result'
  // });
}

/**
 * Open confirmation modal - integrate with your existing modal system
 */
function openConfirmationModal(config: {
  id: string;
  title: string;
  body: string[];
  prompt: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  // Example implementation - replace with your modal system
  const modal = document.createElement('div');
  modal.className = 'agent-confirmation-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>${config.title}</h3>
      <div class="modal-body">
        ${config.body.map((line) => `<p>${line}</p>`).join('')}
        <p><strong>${config.prompt}</strong></p>
      </div>
      <div class="modal-actions">
        <button class="confirm-btn">Yes</button>
        <button class="cancel-btn">No</button>
      </div>
    </div>
  `;

  modal.querySelector('.confirm-btn')?.addEventListener('click', () => {
    config.onConfirm();
    document.body.removeChild(modal);
  });

  modal.querySelector('.cancel-btn')?.addEventListener('click', () => {
    config.onCancel();
    document.body.removeChild(modal);
  });

  document.body.appendChild(modal);
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/**
 * Example of how to use this in your chat form submit handler:
 */
export function setupChatInputHandler() {
  const chatInput = document.getElementById('chat-input');
  const sendButton = document.getElementById('send-button');

  if (!chatInput || !sendButton) {
    console.error('Chat input elements not found');
    return;
  }

  sendButton.addEventListener('click', async () => {
    const message = chatInput.value.trim();
    if (!message) return;

    // Clear input
    chatInput.value = '';

    // Add user message to chat
    addChatMessage('user', message);

    // Get current project path (adjust based on your app)
    const currentProjectPath = getCurrentProjectPath();

    // Handle with agent
    try {
      await handleUserMessage(message, currentProjectPath);
    } catch (error) {
      console.error('Agent error:', error);
      addChatMessage('rina', 'Sorry, I hit an unexpected error. Can you try again?');
    }
  });

  // Handle Enter key
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendButton.click();
    }
  });
}

/**
 * Get current project path - adjust based on your app's project management
 */
function getCurrentProjectPath(): string {
  // Example implementations:
  // - From your project selector state
  // - From a global store/context
  // - From local storage
  // - From the current working directory

  return process.cwd(); // Fallback to current directory
}

// ============================================================================
// TESTING YOUR INTEGRATION
// ============================================================================

/**
 * Test the integration with sample messages
 */
export async function testAgentIntegration() {
  const testCases = [
    'build',
    'deploy',
    "I'm stuck and frustrated",
    'show me git status',
    'this should fail - unknown.tool',
  ];

  console.log('Testing Agent Integration...');

  for (const testMessage of testCases) {
    console.log(`\n--- Testing: "${testMessage}" ---`);

    try {
      await handleUserMessage(testMessage, process.cwd());
    } catch (error) {
      console.error('Test failed:', error);
    }
  }

  console.log('\nIntegration test complete!');
}
