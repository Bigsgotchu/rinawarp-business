// Repo Panel - Hybrid behavior implementation
// Shows only when: repo detected + user intent + not shown this session

let repoPanelShown = false;

class RepoPanel {
    constructor() {
        this.panel = null;
        this.userIntentDetected = false;
        this.currentRepo = null;
        this.init();
    }

    init() {
        this.createPanel();
        this.setupEventListeners();
    }

    createPanel() {
        // Create the repo panel HTML
        const panel = document.createElement('div');
        panel.id = 'repo-panel';
        panel.className = 'repo-panel hidden';
        panel.innerHTML = `
            <div class="repo-panel-header">
                <span id="repo-panel-title">Repository Suggestions</span>
                <button id="repo-panel-hide" title="Hide suggestions for this repo">×</button>
            </div>
            <div id="repo-panel-content" class="repo-panel-content"></div>
        `;

        document.body.appendChild(panel);
        this.panel = panel;

        // Setup hide button
        const hideBtn = panel.querySelector('#repo-panel-hide');
        hideBtn.addEventListener('click', () => {
            this.hidePermanently();
        });
    }

    setupEventListeners() {
        // Listen for user intent signals
        this.setupIntentDetection();
    }

    setupIntentDetection() {
        // First command executed
        if (window.RinaTerminal) {
            // Hook into terminal data events
            const originalOnData = window.RinaTerminal.onData;
            window.RinaTerminal.onData = (callback) => {
                const wrappedCallback = (data) => {
                    // Check if this looks like a command (not just output)
                    if (data.data && data.data.includes('\r') && !this.userIntentDetected) {
                        this.userIntentDetected = true;
                        this.checkAndShowPanel();
                    }
                    callback(data);
                };
                originalOnData(wrappedCallback);
            };
        }

        // File opened (this would need to be hooked into file system events)
        // For now, we'll rely on terminal commands as the primary intent signal
    }

    async checkAndShowPanel() {
        if (repoPanelShown) return;

        // Get current working directory
        const cwd = window.RinaTerminalState?.cwd || '/tmp';

        try {
            // Use IPC to detect repo
            const repo = await window.RinaRepo?.detect(cwd);
            if (!repo || repo.confidence === 0) return;

            this.currentRepo = repo;

            // Use IPC to get suggestions
            const suggestions = await window.RinaRepo?.suggest(repo);
            const output = this.formatSuggestions(repo, suggestions);

            this.showPanel(output);
            repoPanelShown = true;
        } catch (error) {
            console.warn('Failed to detect repo or generate suggestions:', error);
        }
    }


    formatSuggestions(profile, s) {
        const lines = [];

        const projectType = profile.kind === 'node' ? 'Node.js' :
                           profile.kind === 'python' ? 'Python' :
                           profile.kind === 'go' ? 'Go' :
                           profile.kind === 'rust' ? 'Rust' :
                           profile.kind === 'docker' ? 'Docker' : 'project';

        lines.push(`Rina noticed this looks like a ${projectType} project.`);

        lines.push('');
        lines.push('Recommended next steps:');
        s.firstSteps.forEach(step => {
            lines.push(`• ${step}`);
        });

        if (s.runCommands.length) {
            lines.push('');
            lines.push('Common commands:');
            s.runCommands.forEach(cmd => {
                lines.push(`$ ${cmd}`);
            });
        }

        if (s.warnings.length) {
            lines.push('');
            lines.push('Notes:');
            s.warnings.forEach(warn => {
                lines.push(`⚠ ${warn}`);
            });
        }

        return lines.join('\n');
    }

    showPanel(content) {
        if (!this.panel) return;

        const contentEl = this.panel.querySelector('#repo-panel-content');
        contentEl.textContent = content;

        // Fade in quietly
        this.panel.classList.remove('hidden');
        this.panel.style.opacity = '0';
        this.panel.style.transform = 'translateY(10px)';

        requestAnimationFrame(() => {
            this.panel.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            this.panel.style.opacity = '1';
            this.panel.style.transform = 'translateY(0)';
        });
    }

    hidePermanently() {
        if (!this.panel || !this.currentRepo) return;

        // Store in settings that user doesn't want suggestions for this repo
        this.saveRepoHintSetting(false);

        this.panel.classList.add('hidden');
    }

    saveRepoHintSetting(enabled) {
        try {
            // Create .rinawarp directory if it doesn't exist
            const fs = require('fs');
            const path = require('path');
            const settingsDir = path.join(require('os').homedir(), '.rinawarp');
            const settingsFile = path.join(settingsDir, 'settings.json');

            if (!fs.existsSync(settingsDir)) {
                fs.mkdirSync(settingsDir, { recursive: true });
            }

            let settings = {};
            if (fs.existsSync(settingsFile)) {
                settings = JSON.parse(fs.readFileSync(settingsFile, 'utf-8'));
            }

            settings.repoHints = enabled;
            fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
        } catch (error) {
            console.warn('Failed to save repo hint settings:', error);
        }
    }

    shouldShowForRepo() {
        try {
            const fs = require('fs');
            const path = require('path');
            const settingsFile = path.join(require('os').homedir(), '.rinawarp', 'settings.json');

            if (fs.existsSync(settingsFile)) {
                const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf-8'));
                return settings.repoHints !== false; // Default to true
            }
        } catch (error) {
            console.warn('Failed to read repo hint settings:', error);
        }
        return true;
    }
}

// Export for use in other modules
window.RepoPanel = RepoPanel;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.RepoPanel) {
        window.repoPanel = new RepoPanel();
    }
});
