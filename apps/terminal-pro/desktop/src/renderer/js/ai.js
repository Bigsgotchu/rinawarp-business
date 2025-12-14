/**
 * RinaWarp Terminal Pro - AI Assistant
 */

class AIAssistant {
    constructor() {
        this.isEnabled = true;
        this.isInitialized = false;
        this.apiKey = null;
        this.baseUrl = 'https://api.openai.com/v1';
        this.model = 'gpt-4';
        this.chatHistory = [];
        this.maxHistorySize = 50;
        this.currentMode = 'chat'; // chat, command, explain, fix
        
        // Command suggestions cache
        this.commandCache = new Map();
        this.maxCacheSize = 100;
        
        this.config = {
            temperature: 0.7,
            maxTokens: 1000,
            timeout: 30000
        };
    }

    async initialize() {
        try {
            // Load AI API key
            await this.loadAPIKey();
            
            // Load chat history
            this.loadChatHistory();
            
            // Setup UI event listeners
            this.setupEventListeners();
            
            // Initialize voice integration if available
            if (window.voiceController) {
                await this.initializeVoiceIntegration();
            }
            
            this.isInitialized = true;
            console.log('AI Assistant initialized');
            
        } catch (error) {
            console.error('Failed to initialize AI Assistant:', error);
            this.isEnabled = false;
        }
    }

    async loadAPIKey() {
        try {
            // Try to get API key from settings
            if (window.electronAPI) {
                this.apiKey = await window.electronAPI.getSetting('openai_api_key');
            }
            
            // If no API key found, show setup dialog
            if (!this.apiKey) {
                await this.showAPIKeySetup();
            }
        } catch (error) {
            console.warn('Failed to load API key:', error);
        }
    }

    async showAPIKeySetup() {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal show';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>OpenAI API Key Setup</h2>
                        <button class="modal-close">×</button>
                    </div>
                    <div class="modal-body">
                        <p>To use AI features, please enter your OpenAI API key.</p>
                        <div class="form-group">
                            <label for="openai-api-key">API Key:</label>
                            <input type="password" id="openai-api-key" placeholder="sk-...">
                        </div>
                        <div class="form-actions">
                            <button id="save-api-key" class="primary">Save</button>
                            <button id="cancel-api-key">Cancel</button>
                        </div>
                        <p class="help-text">
                            You can get an API key from 
                            <a href="https://platform.openai.com/api-keys" target="_blank">OpenAI Platform</a>
                        </p>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Event listeners
            modal.querySelector('.modal-close').addEventListener('click', () => {
                document.body.removeChild(modal);
                resolve();
            });

            modal.querySelector('#cancel-api-key').addEventListener('click', () => {
                document.body.removeChild(modal);
                resolve();
            });

            modal.querySelector('#save-api-key').addEventListener('click', async () => {
                const apiKey = modal.querySelector('#openai-api-key').value.trim();
                if (apiKey) {
                    this.apiKey = apiKey;
                    if (window.electronAPI) {
                        await window.electronAPI.setSetting('openai_api_key', apiKey);
                    }
                    document.body.removeChild(modal);
                    resolve();
                }
            });
        });
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
        document.querySelectorAll('#ai-modal .modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideAIModal();
            });
        });
    }

    async initializeVoiceIntegration() {
        if (window.voiceController) {
            // Connect voice events to AI
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

            // Get AI response
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

    addChatMessage(role, content) {
        const message = {
            role,
            content,
            timestamp: Date.now()
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

        this.chatHistory.forEach(msg => {
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

    async getAIResponse(message) {
        if (!this.isEnabled || !this.apiKey) {
            throw new Error('AI assistant is not enabled or API key is missing');
        }

        // Check for cached response
        const cacheKey = this.hashMessage(message);
        if (this.commandCache.has(cacheKey)) {
            return this.commandCache.get(cacheKey);
        }

        const messages = [
            {
                role: 'system',
                content: `You are an AI assistant for RinaWarp Terminal Pro. You help users with:
- Terminal commands and navigation
- Code explanation and debugging
- Development workflow optimization
- Problem-solving and troubleshooting

Always be helpful, concise, and provide practical examples when relevant.`
            },
            ...this.chatHistory.slice(-10), // Last 10 messages for context
            {
                role: 'user',
                content: message
            }
        ];

        const response = await this.callOpenAI(messages);

        // Cache the response
        this.cacheResponse(cacheKey, response);

        return response;
    }

    async callOpenAI(messages) {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: this.model,
                messages,
                temperature: this.config.temperature,
                max_tokens: this.config.maxTokens
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'OpenAI API request failed');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    hashMessage(message) {
        // Simple hash for caching
        let hash = 0;
        for (let i = 0; i < message.length; i++) {
            const char = message.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
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
                    explanation: match[2]
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
                ${suggestions.map((s, i) => `
                    <div class="suggestion-item">
                        <div class="command">${s.command}</div>
                        <div class="explanation">${s.explanation}</div>
                        <button class="use-command-btn" data-command="${s.command}">Use</button>
                    </div>
                `).join('')}
            </div>
        `;

        // Add click handlers for use buttons
        suggestionsContainer.querySelectorAll('.use-command-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const command = e.target.dataset.command;
                this.useCommand(command);
            });
        });
    }

    useCommand(command) {
        // Send command to active terminal
        if (window.terminalManager && window.terminalManager.activeTerminalId) {
            window.terminalManager.writeToTerminal(window.terminalManager.activeTerminalId, command + '\r');
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
        if (commands && window.terminalManager) {
            const terminalId = window.terminalManager.activeTerminalId;
            if (terminalId) {
                // Execute each command
                commands.forEach(cmd => {
                    const cleanCmd = cmd.replace(/`/g, '');
                    window.terminalManager.writeToTerminal(terminalId, cleanCmd + '\r');
                });
            }
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
            this.getAIResponse(transcript).then(response => {
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
        if (window.electronAPI) {
            window.electronAPI.showMessageBox({
                type: 'error',
                title: 'AI Assistant Error',
                message: message
            });
        }
    }

    // Public API
    isReady() {
        return this.isInitialized && this.isEnabled && this.apiKey;
    }

    getChatHistory() {
        return this.chatHistory;
    }

    clearChatHistory() {
        this.chatHistory = [];
        this.saveChatHistory();
        this.updateChatDisplay();
    }

    setAPIKey(apiKey) {
        this.apiKey = apiKey;
        if (window.electronAPI) {
            window.electronAPI.setSetting('openai_api_key', apiKey);
        }
    }

    toggleEnabled() {
        this.isEnabled = !this.isEnabled;
        return this.isEnabled;
    }
}

// Export for use in main application
window.AIAssistant = AIAssistant;
window.aiAssistant = new AIAssistant();

// Export askRinaChat function for terminal-optimized.js
export async function askRinaChat(payload) {
  try {
    // Use the existing AI assistant if available
    if (window.aiAssistant && window.aiAssistant.isReady()) {
      const prompt = typeof payload === 'string' ? payload : payload.prompt || payload.message || '';
      return await window.aiAssistant.getAIResponse(prompt);
    }

    // Fallback to local agent API
    const r = await fetch("http://127.0.0.1:3333/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "rina-agent",
        messages: [{ role: "user", content: String(payload.prompt || payload.message || payload) }],
      }),
    });

    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(`Rina agent error ${r.status}: ${t}`);
    }

    const json = await r.json();
    return json?.choices?.[0]?.message?.content ?? "";
  } catch (error) {
    console.error('askRinaChat error:', error);
    return "Sorry, I couldn't process that request right now.";
  }
}

/**
 * Compatibility export for ai-router.js
 * If askRinaChat exists, we use it. Otherwise we fall back to calling the local agent server directly.
 */
async function _defaultAskRinaChat(prompt) {
  try {
    const res = await fetch("http://127.0.0.1:3333/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "rina-agent",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? "(no reply)";
  } catch (e) {
    return `Rina local agent not reachable. Start it, then retry.\n${String(e)}`;
  }
}

export async function askAboutOutput(payload = {}) {
  const {
    command = "",
    stdout = "",
    stderr = "",
    code = null,
    cwd = "",
  } = payload;

  const prompt =
`You are Rina. Explain the terminal command output clearly and suggest next steps if relevant.

CWD: ${cwd}
COMMAND: ${command}

STDOUT:
${stdout}

STDERR:
${stderr}

EXIT CODE: ${code}
`;

  const fn = (typeof askRinaChat === "function") ? askRinaChat : _defaultAskRinaChat;
  return await fn(prompt);
}
