/**
 * RinaWarp Terminal Pro - Voice Control
 */

class VoiceController {
    constructor() {
        this.isSupported = false;
        this.isListening = false;
        this.isInitialized = false;
        this.recognition = null;
        this.transcriptBuffer = '';
        this.confidenceThreshold = 0.7;
        this.commands = new Map();
        this.callbacks = new Map();
        
        // Voice settings
        this.settings = {
            language: 'en-US',
            continuous: false,
            interimResults: true,
            maxAlternatives: 3
        };

        this.setupCommands();
    }

    async initialize() {
        try {
            // Check for Web Speech API support
            this.isSupported = this.checkWebSpeechSupport();
            
            if (!this.isSupported) {
                console.warn('Web Speech API not supported');
                return;
            }

            // Initialize speech recognition
            await this.initializeSpeechRecognition();
            
            // Load saved settings
            this.loadSettings();
            
            // Setup UI event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('Voice Controller initialized');
            
        } catch (error) {
            console.error('Failed to initialize Voice Controller:', error);
        }
    }

    checkWebSpeechSupport() {
        return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    }

    async initializeSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        this.recognition = new SpeechRecognition();
        this.recognition.lang = this.settings.language;
        this.recognition.continuous = this.settings.continuous;
        this.recognition.interimResults = this.settings.interimResults;
        this.recognition.maxAlternatives = this.settings.maxAlternatives;

        // Event handlers
        this.recognition.onstart = () => {
            this.handleRecognitionStart();
        };

        this.recognition.onresult = (event) => {
            this.handleRecognitionResult(event);
        };

        this.recognition.onerror = (event) => {
            this.handleRecognitionError(event);
        };

        this.recognition.onend = () => {
            this.handleRecognitionEnd();
        };
    }

    setupCommands() {
        // Terminal commands
        this.commands.set('clear terminal', () => {
            if (window.terminalManager) {
                window.terminalManager.clearTerminal(window.terminalManager.activeTerminalId);
            }
        });

        this.commands.set('new terminal', () => {
            if (window.terminalManager) {
                window.terminalManager.createNewTerminal();
            }
        });

        this.commands.set('close terminal', () => {
            if (window.terminalManager) {
                window.terminalManager.closeActiveTerminal();
            }
        });

        this.commands.set('go home', () => {
            if (window.terminalManager && window.terminalManager.activeTerminalId) {
                window.terminalManager.writeToTerminal(
                    window.terminalManager.activeTerminalId, 
                    'cd ~\r'
                );
            }
        });

        // AI commands
        this.commands.set('open ai', () => {
            if (window.rinaWarpApp) {
                window.rinaWarpApp.showAIModal();
            }
        });

        this.commands.set('close ai', () => {
            if (window.aiAssistant) {
                window.aiAssistant.hideAIModal();
            }
        });

        this.commands.set('explain code', () => {
            if (window.rinaWarpApp) {
                window.rinaWarpApp.showCodeExplanation();
            }
        });

        // Navigation commands
        this.commands.set('go up', () => {
            if (window.terminalManager && window.terminalManager.activeTerminalId) {
                window.terminalManager.writeToTerminal(
                    window.terminalManager.activeTerminalId, 
                    'cd ..\r'
                );
            }
        });

        this.commands.set('list files', () => {
            if (window.terminalManager && window.terminalManager.activeTerminalId) {
                window.terminalManager.writeToTerminal(
                    window.terminalManager.activeTerminalId, 
                    'ls -la\r'
                );
            }
        });

        // System commands
        this.commands.set('show processes', () => {
            if (window.terminalManager && window.terminalManager.activeTerminalId) {
                const cmd = process.platform === 'win32' ? 'tasklist' : 'ps aux';
                window.terminalManager.writeToTerminal(
                    window.terminalManager.activeTerminalId, 
                    `${cmd}\r`
                );
            }
        });

        this.commands.set('check disk space', () => {
            if (window.terminalManager && window.terminalManager.activeTerminalId) {
                const cmd = process.platform === 'win32' ? 'dir' : 'df -h';
                window.terminalManager.writeToTerminal(
                    window.terminalManager.activeTerminalId, 
                    `${cmd}\r`
                );
            }
        });

        // Window management
        this.commands.set('minimize window', () => {
            if (window.electronAPI) {
                // This would need to be implemented in the main process
                console.log('Minimize window requested');
            }
        });

        this.commands.set('maximize window', () => {
            if (window.electronAPI) {
                console.log('Maximize window requested');
            }
        });

        this.commands.set('close window', () => {
            if (window.electronAPI) {
                console.log('Close window requested');
            }
        });
    }

    setupEventListeners() {
        const voiceToggleBtn = document.getElementById('voice-toggle-btn');
        if (voiceToggleBtn) {
            voiceToggleBtn.addEventListener('click', () => {
                this.toggleListening();
            });
        }

        const voiceModalClose = document.querySelector('#voice-modal .modal-close');
        if (voiceModalClose) {
            voiceModalClose.addEventListener('click', () => {
                this.hideVoiceModal();
            });
        }

        // Language selector
        const languageSelect = document.getElementById('voice-language');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                this.changeLanguage(e.target.value);
            });
        }

        // Settings panel
        const voiceSettingsBtn = document.getElementById('voice-settings-btn');
        if (voiceSettingsBtn) {
            voiceSettingsBtn.addEventListener('click', () => {
                this.showVoiceSettings();
            });
        }
    }

    async toggleListening() {
        if (!this.isSupported) {
            this.showError('Voice recognition is not supported in this browser');
            return;
        }

        if (this.isListening) {
            this.stopListening();
        } else {
            await this.startListening();
        }
    }

    async startListening() {
        try {
            this.transcriptBuffer = '';
            this.updateVoiceStatus('listening', 'Listening for commands...');
            this.recognition.start();
        } catch (error) {
            console.error('Failed to start voice recognition:', error);
            this.showError('Failed to start voice recognition');
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    handleRecognitionStart() {
        this.isListening = true;
        this.updateVoiceUI();
        
        // Update button state
        const toggleBtn = document.getElementById('voice-toggle-btn');
        if (toggleBtn) {
            toggleBtn.textContent = 'Stop Listening';
            toggleBtn.classList.add('listening');
        }
    }

    handleRecognitionResult(event) {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            const confidence = event.results[i][0].confidence;

            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }

        // Update display
        this.updateTranscriptDisplay(finalTranscript, interimTranscript);

        // If we have a final result, process it
        if (finalTranscript) {
            this.transcriptBuffer = finalTranscript;
            this.processVoiceCommand(finalTranscript.trim());
        }
    }

    handleRecognitionError(event) {
        console.error('Speech recognition error:', event.error);
        
        switch (event.error) {
            case 'no-speech':
                this.updateVoiceStatus('error', 'No speech detected. Try again.');
                break;
            case 'audio-capture':
                this.updateVoiceStatus('error', 'Audio capture failed. Check microphone.');
                break;
            case 'not-allowed':
                this.updateVoiceStatus('error', 'Microphone access denied.');
                break;
            case 'network':
                this.updateVoiceStatus('error', 'Network error occurred.');
                break;
            default:
                this.updateVoiceStatus('error', 'Speech recognition error occurred.');
        }
        
        this.isListening = false;
        this.updateVoiceUI();
    }

    handleRecognitionEnd() {
        this.isListening = false;
        this.updateVoiceUI();
        
        // Auto-restart if continuous mode is enabled
        if (this.settings.continuous) {
            setTimeout(() => {
                if (!this.isListening) {
                    this.startListening();
                }
            }, 100);
        }
    }

    processVoiceCommand(transcript) {
        const command = transcript.toLowerCase().trim();
        
        console.log('Processing voice command:', command);
        
        // Add to transcript history
        this.addToTranscriptHistory(command);
        
        // Check for exact command matches
        if (this.commands.has(command)) {
            this.executeCommand(command);
            return;
        }
        
        // Check for partial matches
        for (const [cmd, func] of this.commands) {
            if (command.includes(cmd)) {
                this.executeCommand(cmd);
                return;
            }
        }
        
        // Send to AI if it looks like a natural language request
        if (this.isNaturalLanguage(command)) {
            this.sendToAI(command);
        } else {
            this.showError(`Command not recognized: "${transcript}"`);
        }
    }

    executeCommand(command) {
        const func = this.commands.get(command);
        if (func) {
            try {
                func();
                this.showSuccess(`Executed: ${command}`);
            } catch (error) {
                console.error('Failed to execute command:', error);
                this.showError(`Failed to execute: ${command}`);
            }
        }
    }

    sendToAI(transcript) {
        if (window.aiAssistant && window.aiAssistant.isReady()) {
            // Add voice marker to indicate this came from voice
            const voiceMessage = `🎤 Voice command: ${transcript}`;
            window.aiAssistant.addChatMessage('user', voiceMessage);
            
            // Get AI response
            window.aiAssistant.getAIResponse(transcript).then(response => {
                window.aiAssistant.addChatMessage('assistant', response);
            });
        } else {
            this.showError('AI assistant is not available');
        }
    }

    isNaturalLanguage(transcript) {
        // Simple heuristic to determine if this is natural language vs a command
        const questionWords = ['what', 'how', 'why', 'where', 'when', 'who', 'which'];
        const requestWords = ['please', 'can you', 'help me', 'show me', 'tell me'];
        
        return questionWords.some(word => transcript.includes(word)) ||
               requestWords.some(phrase => transcript.includes(phrase)) ||
               transcript.split(' ').length > 3;
    }

    updateTranscriptDisplay(finalText, interimText) {
        const transcriptDiv = document.getElementById('voice-transcript');
        if (!transcriptDiv) return;

        const finalHtml = finalText ? `<div class="final-transcript">${finalText}</div>` : '';
        const interimHtml = interimText ? `<div class="interim-transcript">${interimText}</div>` : '';

        transcriptDiv.innerHTML = finalHtml + interimHtml;
        
        // Scroll to bottom
        transcriptDiv.scrollTop = transcriptDiv.scrollHeight;
    }

    addToTranscriptHistory(transcript) {
        // Store recent transcripts for reference
        if (!this.transcriptHistory) {
            this.transcriptHistory = [];
        }
        
        this.transcriptHistory.push({
            transcript,
            timestamp: Date.now()
        });
        
        // Keep only last 10
        if (this.transcriptHistory.length > 10) {
            this.transcriptHistory.shift();
        }
        
        // Update UI
        this.updateTranscriptHistory();
    }

    updateTranscriptHistory() {
        const historyDiv = document.getElementById('voice-history');
        if (!historyDiv || !this.transcriptHistory) return;

        historyDiv.innerHTML = this.transcriptHistory
            .slice(-5)
            .reverse()
            .map(item => `
                <div class="history-item">
                    <span class="transcript">${item.transcript}</span>
                    <span class="time">${new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
            `).join('');
    }

    updateVoiceStatus(status, message) {
        const statusDiv = document.getElementById('voice-status');
        const statusText = document.getElementById('voice-status-text');
        
        if (statusDiv && statusText) {
            statusDiv.className = `voice-status ${status}`;
            statusText.textContent = message;
        }
    }

    updateVoiceUI() {
        const toggleBtn = document.getElementById('voice-toggle-btn');
        const voiceStatus = document.getElementById('voice-status');
        
        if (this.isListening) {
            if (toggleBtn) {
                toggleBtn.textContent = 'Stop Listening';
                toggleBtn.classList.add('listening');
            }
            if (voiceStatus) {
                voiceStatus.className = 'voice-status listening';
            }
        } else {
            if (toggleBtn) {
                toggleBtn.textContent = 'Start Listening';
                toggleBtn.classList.remove('listening');
            }
            if (voiceStatus) {
                voiceStatus.className = 'voice-status idle';
            }
        }
    }

    changeLanguage(language) {
        this.settings.language = language;
        if (this.recognition) {
            this.recognition.lang = language;
        }
        this.saveSettings();
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('rinawarp-voice-settings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.warn('Failed to load voice settings:', error);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('rinawarp-voice-settings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Failed to save voice settings:', error);
        }
    }

    showVoiceSettings() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Voice Settings</h2>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="voice-language">Language:</label>
                        <select id="voice-language">
                            <option value="en-US">English (US)</option>
                            <option value="en-GB">English (UK)</option>
                            <option value="es-ES">Spanish</option>
                            <option value="fr-FR">French</option>
                            <option value="de-DE">German</option>
                            <option value="zh-CN">Chinese</option>
                            <option value="ja-JP">Japanese</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="continuous-mode" ${this.settings.continuous ? 'checked' : ''}>
                            Continuous listening
                        </label>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="interim-results" ${this.settings.interimResults ? 'checked' : ''}>
                            Show interim results
                        </label>
                    </div>
                    <div class="form-group">
                        <label for="confidence-threshold">Confidence threshold:</label>
                        <input type="range" id="confidence-threshold" min="0" max="1" step="0.1" value="${this.confidenceThreshold}">
                        <span id="threshold-value">${this.confidenceThreshold}</span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.querySelector('#continuous-mode').addEventListener('change', (e) => {
            this.settings.continuous = e.target.checked;
            if (this.recognition) {
                this.recognition.continuous = e.target.checked;
            }
            this.saveSettings();
        });

        modal.querySelector('#interim-results').addEventListener('change', (e) => {
            this.settings.interimResults = e.target.checked;
            if (this.recognition) {
                this.recognition.interimResults = e.target.checked;
            }
            this.saveSettings();
        });

        modal.querySelector('#confidence-threshold').addEventListener('input', (e) => {
            this.confidenceThreshold = parseFloat(e.target.value);
            document.getElementById('threshold-value').textContent = this.confidenceThreshold;
        });
    }

    hideVoiceModal() {
        const modal = document.getElementById('voice-modal');
        if (modal) {
            modal.classList.remove('show');
        }
        this.stopListening();
    }

    showError(message) {
        this.updateVoiceStatus('error', message);
        if (window.electronAPI) {
            window.electronAPI.showMessageBox({
                type: 'error',
                title: 'Voice Control Error',
                message: message
            });
        }
    }

    showSuccess(message) {
        this.updateVoiceStatus('success', message);
    }

    // Callback system for external components
    onTranscript(callback) {
        this.callbacks.set('transcript', callback);
    }

    onCommand(callback) {
        this.callbacks.set('command', callback);
    }

    triggerCallback(type, data) {
        const callback = this.callbacks.get(type);
        if (callback) {
            callback(data);
        }
    }

    // Public API
    isReady() {
        return this.isInitialized && this.isSupported;
    }

    isListeningActive() {
        return this.isListening;
    }

    getSupportedLanguages() {
        return [
            { code: 'en-US', name: 'English (US)' },
            { code: 'en-GB', name: 'English (UK)' },
            { code: 'es-ES', name: 'Spanish' },
            { code: 'fr-FR', name: 'French' },
            { code: 'de-DE', name: 'German' },
            { code: 'zh-CN', name: 'Chinese' },
            { code: 'ja-JP', name: 'Japanese' }
        ];
    }

    addCustomCommand(phrase, callback) {
        this.commands.set(phrase.toLowerCase(), callback);
    }

    removeCustomCommand(phrase) {
        this.commands.delete(phrase.toLowerCase());
    }
}

// Export for use in main application
window.VoiceController = VoiceController;
window.voiceController = new VoiceController();