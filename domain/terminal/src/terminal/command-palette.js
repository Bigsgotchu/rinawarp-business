/**
 * RinaWarp Terminal Pro - Command Palette
 * Implements Warp-style command palette (Cmd+K)
 */

class CommandPalette {
  constructor(terminal, options = {}) {
    this.terminal = terminal;
    this.options = {
      hotkey: 'k',
      modifier: 'metaKey', // metaKey for Cmd on Mac, ctrlKey for Ctrl
      ...options,
    };

    this.isOpen = false;
    this.commands = [];
    this.filteredCommands = [];
    this.selectedIndex = 0;

    this.init();
  }

  init() {
    this.createPalette();
    this.setupKeyboardShortcuts();
    this.loadCommands();
  }

  createPalette() {
    // Create palette overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'command-palette-overlay';
    this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: none;
            align-items: center;
            justify-content: center;
        `;

    // Create palette container
    this.container = document.createElement('div');
    this.container.className = 'command-palette-container';
    this.container.style.cssText = `
            width: 600px;
            max-height: 400px;
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            overflow: hidden;
        `;

    // Create input
    this.input = document.createElement('input');
    this.input.className = 'command-palette-input';
    this.input.type = 'text';
    this.input.placeholder = 'Type a command...';
    this.input.style.cssText = `
            width: 100%;
            padding: 16px;
            background: transparent;
            border: none;
            color: #ffffff;
            font-size: 16px;
            outline: none;
        `;

    // Create results container
    this.results = document.createElement('div');
    this.results.className = 'command-palette-results';
    this.results.style.cssText = `
            max-height: 300px;
            overflow-y: auto;
        `;

    this.container.appendChild(this.input);
    this.container.appendChild(this.results);
    this.overlay.appendChild(this.container);
    document.body.appendChild(this.overlay);
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Open palette
      if ((e.metaKey || e.ctrlKey) && e.key === this.options.hotkey) {
        e.preventDefault();
        this.open();
      }

      // Close palette
      if (e.key === 'Escape') {
        this.close();
      }

      // Handle palette navigation
      if (this.isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.selectNext();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          this.selectPrevious();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          this.executeSelected();
        }
      }
    });

    // Handle input changes
    this.input.addEventListener('input', (e) => {
      this.filterCommands(e.target.value);
    });
  }

  loadCommands() {
    this.commands = [
      // Terminal commands
      {
        id: 'clear',
        name: 'Clear Terminal',
        description: 'Clear the terminal screen',
        category: 'Terminal',
        action: () => this.terminal.clear(),
      },
      {
        id: 'help',
        name: 'Show Help',
        description: 'Display available commands',
        category: 'Terminal',
        action: () =>
          this.terminal.write('\r\nType !help for available commands\r\n'),
      },

      // AI commands
      {
        id: 'ai-chat',
        name: 'AI Chat',
        description: 'Start AI conversation',
        category: 'AI',
        action: () =>
          this.terminal.write(
            '\r\n🤖 AI Assistant ready. Type your question.\r\n'
          ),
      },
      {
        id: 'ai-explain',
        name: 'AI Explain',
        description: 'Explain last command',
        category: 'AI',
        action: () =>
          this.terminal.write('\r\n🤖 AI will explain the last command\r\n'),
      },

      // Workflow commands
      {
        id: 'workflow-git',
        name: 'Git Setup Workflow',
        description: 'Initialize git repository',
        category: 'Workflow',
        action: () => this.runWorkflow('git-setup'),
      },
      {
        id: 'workflow-node',
        name: 'Node.js Setup Workflow',
        description: 'Create Node.js project',
        category: 'Workflow',
        action: () => this.runWorkflow('node-setup'),
      },
      {
        id: 'workflow-react',
        name: 'React Setup Workflow',
        description: 'Create React project',
        category: 'Workflow',
        action: () => this.runWorkflow('react-setup'),
      },

      // Pane commands
      {
        id: 'split-vertical',
        name: 'Split Pane Vertically',
        description: 'Split current pane vertically',
        category: 'Panes',
        action: () => this.splitPane('vertical'),
      },
      {
        id: 'split-horizontal',
        name: 'Split Pane Horizontally',
        description: 'Split current pane horizontally',
        category: 'Panes',
        action: () => this.splitPane('horizontal'),
      },
      {
        id: 'close-pane',
        name: 'Close Pane',
        description: 'Close current pane',
        category: 'Panes',
        action: () => this.closePane(),
      },

      // Theme commands
      {
        id: 'theme-mermaid',
        name: 'Mermaid Theme',
        description: 'Switch to Mermaid theme',
        category: 'Themes',
        action: () => this.changeTheme('mermaid-enhanced'),
      },
      {
        id: 'theme-dark',
        name: 'Dark Theme',
        description: 'Switch to Dark theme',
        category: 'Themes',
        action: () => this.changeTheme('dark'),
      },
      {
        id: 'theme-light',
        name: 'Light Theme',
        description: 'Switch to Light theme',
        category: 'Themes',
        action: () => this.changeTheme('light'),
      },

      // Monitoring commands
      {
        id: 'monitor',
        name: 'Show Monitor',
        description: 'Display monitoring dashboard',
        category: 'Monitoring',
        action: () => this.terminal.write('\r\n📊 Monitoring dashboard\r\n'),
      },
      {
        id: 'alerts',
        name: 'Show Alerts',
        description: 'Display active alerts',
        category: 'Monitoring',
        action: () => this.terminal.write('\r\n🚨 Active alerts\r\n'),
      },

      // System commands
      {
        id: 'restart',
        name: 'Restart Terminal',
        description: 'Restart the terminal',
        category: 'System',
        action: () => this.restartTerminal(),
      },
      {
        id: 'settings',
        name: 'Open Settings',
        description: 'Open terminal settings',
        category: 'System',
        action: () => this.openSettings(),
      },
    ];

    this.filteredCommands = [...this.commands];
  }

  open() {
    this.isOpen = true;
    this.overlay.style.display = 'flex';
    this.input.value = '';
    this.filteredCommands = [...this.commands];
    this.selectedIndex = 0;
    this.renderResults();
    this.input.focus();
  }

  close() {
    this.isOpen = false;
    this.overlay.style.display = 'none';
  }

  filterCommands(query) {
    if (!query.trim()) {
      this.filteredCommands = [...this.commands];
    } else {
      const lowercaseQuery = query.toLowerCase();
      this.filteredCommands = this.commands.filter(
        (cmd) =>
          cmd.name.toLowerCase().includes(lowercaseQuery) ||
          cmd.description.toLowerCase().includes(lowercaseQuery) ||
          cmd.category.toLowerCase().includes(lowercaseQuery)
      );
    }

    this.selectedIndex = 0;
    this.renderResults();
  }

  renderResults() {
    this.results.innerHTML = '';

    if (this.filteredCommands.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'no-results';
      noResults.textContent = 'No commands found';
      noResults.style.cssText = `
                padding: 16px;
                color: #666;
                text-align: center;
            `;
      this.results.appendChild(noResults);
      return;
    }

    this.filteredCommands.forEach((command, index) => {
      const item = document.createElement('div');
      item.className = `command-item ${index === this.selectedIndex ? 'selected' : ''}`;
      item.style.cssText = `
                padding: 12px 16px;
                border-bottom: 1px solid #333;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 12px;
            `;

      if (index === this.selectedIndex) {
        item.style.backgroundColor = '#333';
      }

      item.innerHTML = `
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: #fff; margin-bottom: 4px;">${command.name}</div>
                    <div style="font-size: 14px; color: #999;">${command.description}</div>
                </div>
                <div style="font-size: 12px; color: #666; background: #333; padding: 2px 8px; border-radius: 4px;">
                    ${command.category}
                </div>
            `;

      item.addEventListener('click', () => {
        this.selectedIndex = index;
        this.executeSelected();
      });

      this.results.appendChild(item);
    });
  }

  selectNext() {
    if (this.selectedIndex < this.filteredCommands.length - 1) {
      this.selectedIndex++;
      this.renderResults();
    }
  }

  selectPrevious() {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
      this.renderResults();
    }
  }

  executeSelected() {
    const command = this.filteredCommands[this.selectedIndex];
    if (command) {
      command.action();
      this.close();
    }
  }

  // Command actions
  runWorkflow(workflowId) {
    this.terminal.write(`\r\n🚀 Running workflow: ${workflowId}\r\n`);
    // Implementation would call the workflow system
  }

  splitPane(direction) {
    this.terminal.write(`\r\n📱 Splitting pane ${direction}\r\n`);
    // Implementation would call the split pane system
  }

  closePane() {
    this.terminal.write('\r\n❌ Closing pane\r\n');
    // Implementation would call the split pane system
  }

  changeTheme(theme) {
    this.terminal.write(`\r\n🎨 Switching to ${theme} theme\r\n`);
    // Implementation would change the theme
  }

  restartTerminal() {
    this.terminal.write('\r\n🔄 Restarting terminal...\r\n');
    // Implementation would restart the terminal
  }

  openSettings() {
    this.terminal.write('\r\n⚙️ Opening settings...\r\n');
    // Implementation would open settings
  }

  addCommand(command) {
    this.commands.push(command);
    this.filteredCommands = [...this.commands];
  }

  removeCommand(commandId) {
    this.commands = this.commands.filter((cmd) => cmd.id !== commandId);
    this.filteredCommands = this.filteredCommands.filter(
      (cmd) => cmd.id !== commandId
    );
  }

  destroy() {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
  }
}

export default CommandPalette;
