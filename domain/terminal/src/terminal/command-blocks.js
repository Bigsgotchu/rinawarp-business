/**
 * RinaWarp Terminal Pro - Command Blocks System
 * Implements Warp-style command blocks with AI integration
 */

class CommandBlocks {
  constructor(terminal) {
    this.terminal = terminal;
    this.blocks = [];
    this.currentBlock = null;
    this.blockId = 0;
  }

  createBlock(command, options = {}) {
    const block = {
      id: ++this.blockId,
      command: command,
      startTime: Date.now(),
      endTime: null,
      output: [],
      status: 'running', // running, success, error
      exitCode: null,
      aiSuggestions: [],
      isSelected: false,
      ...options,
    };

    this.blocks.push(block);
    this.currentBlock = block;

    this.renderBlock(block);
    return block;
  }

  renderBlock(block) {
    const blockElement = document.createElement('div');
    blockElement.className = 'command-block';
    blockElement.dataset.blockId = block.id;

    // Command header
    const header = document.createElement('div');
    header.className = 'command-header';
    header.innerHTML = `
            <div class="command-info">
                <span class="command-prompt">$</span>
                <span class="command-text">${block.command}</span>
                <span class="command-status ${block.status}"></span>
            </div>
            <div class="command-actions">
                <button class="ai-suggest-btn" onclick="this.showAISuggestions(${block.id})">🤖 AI</button>
                <button class="copy-btn" onclick="this.copyCommand(${block.id})">📋</button>
                <button class="rerun-btn" onclick="this.rerunCommand(${block.id})">🔄</button>
            </div>
        `;

    // Output container
    const output = document.createElement('div');
    output.className = 'command-output';
    output.id = `output-${block.id}`;

    blockElement.appendChild(header);
    blockElement.appendChild(output);

    // Add to terminal
    this.terminal.container.appendChild(blockElement);
  }

  updateBlock(blockId, updates) {
    const block = this.blocks.find((b) => b.id === blockId);
    if (!block) return;

    Object.assign(block, updates);
    this.updateBlockDisplay(block);
  }

  updateBlockDisplay(block) {
    const blockElement = document.querySelector(
      `[data-block-id="${block.id}"]`
    );
    if (!blockElement) return;

    // Update status
    const statusElement = blockElement.querySelector('.command-status');
    statusElement.className = `command-status ${block.status}`;

    // Update output
    const outputElement = blockElement.querySelector('.command-output');
    outputElement.innerHTML = block.output.join('\n');

    // Add AI suggestions if available
    if (block.aiSuggestions.length > 0) {
      this.renderAISuggestions(block);
    }
  }

  addOutput(blockId, text) {
    const block = this.blocks.find((b) => b.id === blockId);
    if (!block) return;

    block.output.push(text);
    this.updateBlockDisplay(block);
  }

  finishBlock(blockId, exitCode = 0) {
    const block = this.blocks.find((b) => b.id === blockId);
    if (!block) return;

    block.status = exitCode === 0 ? 'success' : 'error';
    block.exitCode = exitCode;
    block.endTime = Date.now();

    this.updateBlockDisplay(block);
    this.generateAISuggestions(block);
  }

  async generateAISuggestions(block) {
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Analyze this command and its output, suggest improvements or next steps:\nCommand: ${block.command}\nOutput: ${block.output.join('\n')}`,
          provider: 'groq',
        }),
      });

      const data = await response.json();
      block.aiSuggestions = [data.response];
      this.updateBlockDisplay(block);
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
    }
  }

  renderAISuggestions(block) {
    const blockElement = document.querySelector(
      `[data-block-id="${block.id}"]`
    );
    if (!blockElement) return;

    // Remove existing suggestions
    const existingSuggestions = blockElement.querySelector('.ai-suggestions');
    if (existingSuggestions) {
      existingSuggestions.remove();
    }

    // Create suggestions container
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'ai-suggestions';
    suggestionsContainer.innerHTML = `
            <div class="ai-suggestions-header">
                <span class="ai-icon">🤖</span>
                <span>AI Suggestions</span>
            </div>
            <div class="ai-suggestions-content">
                ${block.aiSuggestions
    .map(
      (suggestion) => `
                    <div class="ai-suggestion">
                        <p>${suggestion}</p>
                        <button class="apply-suggestion" onclick="this.applySuggestion('${suggestion}')">Apply</button>
                    </div>
                `
    )
    .join('')}
            </div>
        `;

    blockElement.appendChild(suggestionsContainer);
  }

  showAISuggestions(blockId) {
    const block = this.blocks.find((b) => b.id === blockId);
    if (!block) return;

    if (block.aiSuggestions.length === 0) {
      this.generateAISuggestions(block);
    } else {
      this.renderAISuggestions(block);
    }
  }

  copyCommand(blockId) {
    const block = this.blocks.find((b) => b.id === blockId);
    if (!block) return;

    navigator.clipboard.writeText(block.command);
    // Show feedback
    this.showToast('Command copied to clipboard');
  }

  rerunCommand(blockId) {
    const block = this.blocks.find((b) => b.id === blockId);
    if (!block) return;

    // Create new block with same command
    this.createBlock(block.command);
  }

  applySuggestion(suggestion) {
    // Apply AI suggestion as new command
    this.createBlock(suggestion);
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  getBlocks() {
    return this.blocks;
  }

  clearBlocks() {
    this.blocks = [];
    const blockElements =
      this.terminal.container.querySelectorAll('.command-block');
    blockElements.forEach((el) => el.remove());
  }
}

export default CommandBlocks;
