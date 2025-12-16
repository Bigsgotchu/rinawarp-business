/**
 * RinaWarp Terminal Pro - AI Assistant (Agent-based)
 * Updated to use local agent IPC instead of direct OpenAI API calls
 */

class AIAgentAssistant {
  constructor() {
    this.isEnabled = true;
    this.isInitialized = false;
    this.chatHistory = [];
    this.maxHistorySize = 50;
    this.currentMode = 'chat'; // chat, command, explain, fix

    // Command suggestions cache
    this.commandCache = new Map();
    this.maxCacheSize = 100;

    this.config = {
      temperature: 0.7,
      maxTokens: 1000,
      timeout: 30000,
    };
  }

  async initialize() {
    try {
      // Load chat history
      this.loadChatHistory();

      // Setup UI event listeners
      this.setupEventListeners();

      // Initialize agent IPC listeners
      this.setupAgentListeners();

      // Initialize voice integration if available
      if (window.voiceController) {
        await this.initializeVoiceIntegration();
      }

      this.isInitialized = true;
      console.log('AI Agent Assistant initialized');
    } catch (error) {
      console.error('Failed to initialize AI Agent Assistant:', error);
      this.isEnabled = false;
    }
  }

  setupEventListeners() {
    // AI chat input
    const aiChatInput = document.getElementById('ai-chat-input');
    if (aiChatInput) {
      aiChatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.sendChatMessage();
        }
      });
    }

    const aiSendBtn = document.getElementById('ai-send-btn');
    if (aiSendBtn) {
      aiSendBtn.addEventListener('click', () => {
        this.sendChatMessage();
      });
    }

    // AI suggestions
    const aiSuggestBtn = document.getElementById('ai-suggest-btn');
    if (aiSuggestBtn) {
      aiSuggestBtn.addEventListener('click', () => {
        this.getCommandSuggestions();
      });
    }

    // Quick fix
    const quickFixBtn = document.getElementById('quick-fix-btn');
    if (quickFixBtn) {
      quickFixBtn.addEventListener('click', () => {
        this.getQuickFix();
      });
    }

    // Modal close buttons
    document.querySelectorAll('#ai-modal .modal-close').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.hideAIModal();
      });
    });
  }

  setupAgentListeners() {
    // Listen for agent messages
    if (window.electron) {
      window.electron.on('rina:agent', (msg) => {
        this.handleAgentMessage(msg);
      });
    }
  }

  handleAgentMessage(msg) {
    // Handle agent responses for different message types
    switch (msg.type) {
      case 'ai:result':
        // Resolve pending AI requests
        if (this.pendingAIRequest) {
          this.pendingAIRequest.resolve(msg.data);
          this.pendingAIRequest = null;
        }
        break;
      case 'ai:error':
        // Reject pending AI requests
        if (this.pendingAIRequest) {
          this.pendingAIRequest.reject(new Error(msg.error));
          this.pendingAIRequest = null;
        }
        break;
      case 'agent:heartbeat':
        // Agent is alive and healthy
        this.updateAgentStatus(true);
        break;
      case 'agent:crash':
        // Agent crashed
        this.updateAgentStatus(false, msg.error);
        break;
    }
  }

  updateAgentStatus(healthy, error = null) {
    const statusElement = document.getElementById('agent-status');
    if (statusElement) {
      statusElement.textContent = healthy ? '🟢 Agent Online' : '🔴 Agent Offline';
      statusElement.className = healthy ? 'status-online' : 'status-offline';
      if (error) {
        statusElement.title = `Error: ${error}`;
      }
    }
  }

  async initializeVoiceIntegration() {
    if (window.voiceController) {
      window.voiceController.onTranscript((transcript) => {
        this.processVoiceInput(transcript);
      });
    }
  }

  loadChatHistory() {
    try {
      const saved = localStorage.getItem('rinawarp-ai-history');
      if (saved) {
        this.chatHistory = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load AI chat history:', error);
      this.chatHistory = [];
    }
  }

  saveChatHistory() {
    try {
      localStorage.setItem('rinawarp-ai-history', JSON.stringify(this.chatHistory));
    } catch (error) {
      console.warn('Failed to save AI chat history:', error);
    }
  }

  async sendChatMessage() {
    const input = document.getElementById('ai-chat-input');
    if (!input || !input.value.trim()) return;

    const message = input.value.trim();
    input.value = '';

    // Add user message to chat
    this.addChatMessage('user', message);

    try {
      // Show typing indicator
      this.showTypingIndicator();

      // Get AI response via agent
      const response = await this.getAIResponse(message);

      // Hide typing indicator
      this.hideTypingIndicator();

      // Add AI response to chat
      this.addChatMessage('assistant', response);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      this.hideTypingIndicator();
      this.addChatMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    }
  }

  async getAIResponse(message) {
    if (!this.isEnabled) {
      throw new Error('AI assistant is not enabled');
    }

    // Check for cached response
    const cacheKey = this.hashMessage(message);
    if (this.commandCache.has(cacheKey)) {
      return this.commandCache.get(cacheKey);
    }

    const messages = [
      {
        role: 'system',
        content: `You are Rina Agent, an AI assistant for RinaWarp Terminal Pro. You help users with:
- Terminal commands and navigation
- Code explanation and debugging
- Development workflow optimization
- Problem-solving and troubleshooting

Always be helpful, concise, and provide practical examples when relevant.`,
      },
      ...this.chatHistory.slice(-10), // Last 10 messages for context
      {
        role: 'user',
        content: message,
      },
    ];

    const response = await this.callAgentAI(messages);

    // Cache the response
    this.cacheResponse(cacheKey, response);

    return response;
  }

  async callAgentAI(messages) {
    const prompt = messages.find((m) => m.role === 'user')?.content || '';

    return new Promise((resolve, reject) => {
      // Set up response handler
      const timeout = setTimeout(() => {
        reject(new Error('AI request timeout'));
      }, this.config.timeout);

      // Temporary message handler
      const handleMessage = (msg) => {
        if (msg.type === 'ai:result') {
          clearTimeout(timeout);
          window.electron.removeListener('rina:agent', handleMessage);
          resolve(msg.data.choices?.[0]?.message?.content || msg.data);
        } else if (msg.type === 'ai:error') {
          clearTimeout(timeout);
          window.electron.removeListener('rina:agent', handleMessage);
          reject(new Error(msg.error));
        }
      };

      // Add listener and send request
      window.electron.on('rina:agent', handleMessage);
      window.electron.send('rina:agent:send', {
        type: 'ai:run',
        prompt: prompt,
        context: {
          messages: messages,
          model: 'gpt-4',
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
        },
      });
    });
  }

  addChatMessage(role, content) {
    const message = {
      role,
      content,
      timestamp: Date.now(),
    };

    this.chatHistory.push(message);

    // Trim history if too large
    if (this.chatHistory.length > this.maxHistorySize) {
      this.chatHistory.shift();
    }

    // Update UI
    this.updateChatDisplay();

    // Save to storage
    this.saveChatHistory();
  }

  updateChatDisplay() {
    const chatMessages = document.getElementById('ai-chat-messages');
    if (!chatMessages) return;

    chatMessages.innerHTML = '';

    this.chatHistory.forEach((msg) => {
      const messageDiv = document.createElement('div');
      messageDiv.className = `ai-message ${msg.role}`;

      messageDiv.innerHTML = `
                <div class="avatar">${msg.role === 'user' ? '👤' : '🤖'}</div>
                <div class="content">
                    <div class="message-content">${this.formatMessageContent(msg.content)}</div>
                    <div class="timestamp">${new Date(msg.timestamp).toLocaleTimeString()}</div>
                </div>
            `;

      chatMessages.appendChild(messageDiv);
    });

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  formatMessageContent(content) {
    // Convert markdown-like formatting to HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  showTypingIndicator() {
    const chatMessages = document.getElementById('ai-chat-messages');
    if (!chatMessages) return;

    const typingDiv = document.createElement('div');
    typingDiv.className = 'ai-message assistant typing';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
            <div class="avatar">🤖</div>
            <div class="content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  async getCommandSuggestions() {
    const input = document.getElementById('ai-input');
    if (!input || !input.value.trim()) return;

    const description = input.value.trim();

    try {
      const suggestions = await this.generateCommandSuggestions(description);
      this.displayCommandSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to get command suggestions:', error);
      this.showError('Failed to generate command suggestions');
    }
  }

  async generateCommandSuggestions(description) {
    const prompt = `Generate terminal commands for: "${description}"

Provide 3-5 different approaches with explanations. Format as:
1. [Command] - [Brief explanation]
2. [Command] - [Brief explanation]
etc.

Focus on common Unix/Linux commands and include flags/options where relevant.`;

    const response = await this.getAIResponse(prompt);
    return this.parseCommandSuggestions(response);
  }

  parseCommandSuggestions(response) {
    const suggestions = [];
    const lines = response.split('\n');

    for (const line of lines) {
      const match = line.match(/^\d+\.\s*`([^`]+)`\s*-\s*(.+)/);
      if (match) {
        suggestions.push({
          command: match[1],
          explanation: match[2],
        });
      }
    }

    return suggestions;
  }

  displayCommandSuggestions(suggestions) {
    const aiPanel = document.getElementById('ai-panel');
    if (!aiPanel) return;

    let suggestionsContainer = aiPanel.querySelector('.suggestions-container');
    if (!suggestionsContainer) {
      suggestionsContainer = document.createElement('div');
      suggestionsContainer.className = 'suggestions-container';
      aiPanel.appendChild(suggestionsContainer);
    }

    suggestionsContainer.innerHTML = `
            <h4>Command Suggestions</h4>
            <div class="suggestions-list">
                ${suggestions
                  .map(
                    (s, i) => `
                    <div class="suggestion-item">
                        <div class="command">${s.command}</div>
                        <div class="explanation">${s.explanation}</div>
                        <button class="use-command-btn" data-command="${s.command}">Use</button>
                    </div>
                `,
                  )
                  .join('')}
            </div>
        `;

    // Add click handlers for use buttons
    suggestionsContainer.querySelectorAll('.use-command-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const command = e.target.dataset.command;
        this.useCommand(command);
      });
    });
  }

  useCommand(command) {
    // Send command to agent for execution
    if (window.electron) {
      window.electron.send('rina:agent:send', {
        type: 'shell:run',
        command: command,
        cwd: '/',
      });
    }

    // Hide suggestions
    const suggestionsContainer = document.querySelector('.suggestions-container');
    if (suggestionsContainer) {
      suggestionsContainer.remove();
    }
  }

  async getQuickFix() {
    const errorInput = document.getElementById('error-input');
    if (!errorInput || !errorInput.value.trim()) return;

    const error = errorInput.value.trim();

    try {
      const fix = await this.generateQuickFix(error);
      this.displayQuickFix(fix);
    } catch (error) {
      console.error('Failed to get quick fix:', error);
      this.showError('Failed to generate quick fix');
    }
  }

  async generateQuickFix(error) {
    const prompt = `Analyze this error and provide a quick fix:

Error: ${error}

Provide:
1. **Root Cause**: Brief explanation of what's wrong
2. **Quick Fix**: Step-by-step solution
3. **Prevention**: How to avoid this in the future

Keep it concise and actionable.`;

    return await this.getAIResponse(prompt);
  }

  displayQuickFix(fix) {
    const aiPanel = document.getElementById('ai-panel');
    if (!aiPanel) return;

    let fixContainer = aiPanel.querySelector('.fix-container');
    if (!fixContainer) {
      fixContainer = document.createElement('div');
      fixContainer.className = 'fix-container';
      aiPanel.appendChild(fixContainer);
    }

    fixContainer.innerHTML = `
            <h4>Quick Fix</h4>
            <div class="fix-content">${this.formatMessageContent(fix)}</div>
            <button class="apply-fix-btn">Apply Fix</button>
        `;

    // Add apply button handler
    const applyBtn = fixContainer.querySelector('.apply-fix-btn');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        this.applyQuickFix(fix);
      });
    }
  }

  applyQuickFix(fix) {
    // Extract and execute commands from fix
    const commands = fix.match(/`([^`]+)`/g);
    if (commands && window.electron) {
      // Execute each command via agent
      commands.forEach((cmd) => {
        const cleanCmd = cmd.replace(/`/g, '');
        window.electron.send('rina:agent:send', {
          type: 'shell:run',
          command: cleanCmd,
          cwd: '/',
        });
      });
    }

    // Hide fix display
    const fixContainer = document.querySelector('.fix-container');
    if (fixContainer) {
      fixContainer.remove();
    }
  }

  processVoiceInput(transcript) {
    // Process voice input as chat message
    if (transcript.trim()) {
      this.addChatMessage('user', `🎤 ${transcript}`);
      this.getAIResponse(transcript).then((response) => {
        this.addChatMessage('assistant', response);
      });
    }
  }

  async explainCode(code, language = 'auto') {
    const prompt = `Explain this ${language} code in simple terms:

\`\`\`${language}
${code}
\`\`\`

Provide:
1. **What it does**: Clear description
2. **Key components**: Important parts explained
3. **How it works**: Step-by-step explanation
4. **Potential improvements**: Suggestions if applicable`;

    return await this.getAIResponse(prompt);
  }

  hideAIModal() {
    const modal = document.getElementById('ai-modal');
    if (modal) {
      modal.classList.remove('show');
    }
  }

  showError(message) {
    if (window.electron) {
      window.electron.showMessageBox({
        type: 'error',
        title: 'AI Agent Error',
        message: message,
      });
    }
  }

  // Public API
  isReady() {
    return this.isInitialized && this.isEnabled;
  }

  getChatHistory() {
    return this.chatHistory;
  }

  clearChatHistory() {
    this.chatHistory = [];
    this.saveChatHistory();
    this.updateChatDisplay();
  }

  toggleEnabled() {
    this.isEnabled = !this.isEnabled;
    return this.isEnabled;
  }

  async getAgentStatus() {
    if (window.electron) {
      return await window.electron.invoke('rina:agent:get-status');
    }
    return null;
  }

  hashMessage(message) {
    // Simple hash for caching
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  cacheResponse(key, response) {
    this.commandCache.set(key, response);

    // Trim cache if too large
    if (this.commandCache.size > this.maxCacheSize) {
      const firstKey = this.commandCache.keys().next().value;
      this.commandCache.delete(firstKey);
    }
  }
}

// Export for use in main application
window.AIAgentAssistant = AIAgentAssistant;
window.aiAgentAssistant = new AIAgentAssistant();
