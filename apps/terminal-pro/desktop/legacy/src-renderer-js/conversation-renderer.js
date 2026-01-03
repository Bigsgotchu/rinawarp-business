/**
 * Conversation UI Renderer (CSP-Perfect DOM)
 * No innerHTML. Ever. Defensive DOM creation only.
 */

export function createConversationRenderer(root) {
  const messages = root.querySelector('#conversationMessages');
  const proposals = root.querySelector('#actionProposals');
  const terminalOutput = root.querySelector('#terminalOutput');

  function addMessage(text, sender = 'rina') {
    if (!messages || !text) return;

    const wrap = document.createElement('div');
    wrap.className = `message ${sender}`;

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = text;

    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = new Date().toLocaleTimeString();

    wrap.appendChild(bubble);
    wrap.appendChild(time);
    messages.appendChild(wrap);
    
    // Auto-scroll to bottom
    messages.scrollTop = messages.scrollHeight;
  }

  function clearProposals() {
    if (!proposals) return;
    proposals.textContent = '';
    proposals.style.display = 'none';
  }

  function showProposals(items, onConfirm, onCancel) {
    if (!proposals || !Array.isArray(items)) return;
    
    clearProposals();
    proposals.style.display = 'block';

    for (const item of items) {
      const card = document.createElement('div');
      card.className = 'action-proposal';

      // Title
      const title = document.createElement('div');
      title.className = 'action-title';
      const titleIcon = document.createElement('span');
      titleIcon.textContent = '🎯';
      const titleText = document.createElement('span');
      titleText.textContent = item.title;
      title.appendChild(titleIcon);
      title.appendChild(titleText);

      // Description
      const desc = document.createElement('div');
      desc.className = 'action-description';
      desc.textContent = item.description;

      // Consequences
      const cons = document.createElement('div');
      cons.className = 'action-consequences';
      cons.textContent = item.consequences;

      // Buttons
      const btnRow = document.createElement('div');
      btnRow.className = 'action-buttons';

      const confirmBtn = document.createElement('button');
      confirmBtn.className = 'confirm-btn';
      confirmBtn.textContent = 'Confirm';
      confirmBtn.addEventListener('click', () => onConfirm?.(item));

      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'cancel-btn';
      cancelBtn.textContent = 'Cancel';
      cancelBtn.addEventListener('click', () => onCancel?.(item));

      btnRow.appendChild(confirmBtn);
      btnRow.appendChild(cancelBtn);

      card.appendChild(title);
      card.appendChild(desc);
      card.appendChild(cons);
      card.appendChild(btnRow);
      
      proposals.appendChild(card);
    }
  }

  function appendTerminal(text) {
    if (!terminalOutput || !text) return;
    
    // Prefer a <pre> inside terminalOutput; if not, just append text to terminalOutput
    const pre = terminalOutput.querySelector('pre') || terminalOutput;
    pre.textContent = (pre.textContent || '') + String(text);
    
    // Auto-scroll terminal
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }

  function setTerminalCollapsed(collapsed) {
    if (!terminalOutput) return;
    
    if (collapsed) {
      terminalOutput.classList.add('collapsed');
    } else {
      terminalOutput.classList.remove('collapsed');
    }
  }

  return { 
    addMessage, 
    showProposals, 
    clearProposals,
    appendTerminal,
    setTerminalCollapsed 
  };
}