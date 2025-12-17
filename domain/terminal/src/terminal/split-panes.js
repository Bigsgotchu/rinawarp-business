/**
 * RinaWarp Terminal Pro - Split Panes System
 * Implements Warp-style split pane functionality
 */

class SplitPanes {
  constructor(container, options = {}) {
    this.container = container;
    this.panes = [];
    this.activePane = null;
    this.paneId = 0;
    this.options = {
      maxPanes: 4,
      defaultSplit: 'vertical',
      ...options,
    };

    this.init();
  }

  init() {
    // Create initial pane
    this.createPane();
    this.setupKeyboardShortcuts();
  }

  createPane(options = {}) {
    if (this.panes.length >= this.options.maxPanes) {
      console.warn('Maximum number of panes reached');
      return null;
    }

    const paneId = ++this.paneId;
    const pane = {
      id: paneId,
      element: null,
      terminal: null,
      isActive: false,
      ...options,
    };

    // Create pane element
    pane.element = document.createElement('div');
    pane.element.className = 'pane';
    pane.element.dataset.paneId = paneId;
    pane.element.style.cssText = `
            position: relative;
            border: 1px solid #333;
            background: #1a1a1a;
            overflow: hidden;
        `;

    // Create terminal container
    const terminalContainer = document.createElement('div');
    terminalContainer.className = 'terminal-container';
    terminalContainer.style.cssText = `
            width: 100%;
            height: 100%;
        `;

    pane.element.appendChild(terminalContainer);
    this.container.appendChild(pane.element);

    // Initialize terminal
    this.initializeTerminal(pane, terminalContainer);

    this.panes.push(pane);
    this.setActivePane(paneId);

    return pane;
  }

  async initializeTerminal(pane, container) {
    // Import and initialize terminal
    const { TerminalIntegration } = await import('./terminal-integration.js');
    pane.terminal = new TerminalIntegration(container, {
      terminal: {
        theme: 'mermaid-enhanced',
      },
    });
  }

  splitPane(paneId, direction = 'vertical') {
    const pane = this.panes.find((p) => p.id === paneId);
    if (!pane) return null;

    // Create new pane
    const newPane = this.createPane({
      direction: direction,
      parent: paneId,
    });

    if (newPane) {
      this.arrangePanes();
      this.setActivePane(newPane.id);
    }

    return newPane;
  }

  arrangePanes() {
    const paneCount = this.panes.length;
    if (paneCount === 0) return;

    // Calculate pane dimensions
    const containerRect = this.container.getBoundingClientRect();
    const width = containerRect.width;
    const height = containerRect.height;

    if (paneCount === 1) {
      this.panes[0].element.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border: 1px solid #333;
                background: #1a1a1a;
            `;
    } else if (paneCount === 2) {
      this.panes[0].element.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 50%;
                height: 100%;
                border: 1px solid #333;
                background: #1a1a1a;
            `;
      this.panes[1].element.style.cssText = `
                position: absolute;
                top: 0;
                left: 50%;
                width: 50%;
                height: 100%;
                border: 1px solid #333;
                background: #1a1a1a;
            `;
    } else if (paneCount === 3) {
      this.panes[0].element.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 50%;
                height: 100%;
                border: 1px solid #333;
                background: #1a1a1a;
            `;
      this.panes[1].element.style.cssText = `
                position: absolute;
                top: 0;
                left: 50%;
                width: 50%;
                height: 50%;
                border: 1px solid #333;
                background: #1a1a1a;
            `;
      this.panes[2].element.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                width: 50%;
                height: 50%;
                border: 1px solid #333;
                background: #1a1a1a;
            `;
    } else if (paneCount === 4) {
      this.panes[0].element.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 50%;
                height: 50%;
                border: 1px solid #333;
                background: #1a1a1a;
            `;
      this.panes[1].element.style.cssText = `
                position: absolute;
                top: 0;
                left: 50%;
                width: 50%;
                height: 50%;
                border: 1px solid #333;
                background: #1a1a1a;
            `;
      this.panes[2].element.style.cssText = `
                position: absolute;
                top: 50%;
                left: 0;
                width: 50%;
                height: 50%;
                border: 1px solid #333;
                background: #1a1a1a;
            `;
      this.panes[3].element.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                width: 50%;
                height: 50%;
                border: 1px solid #333;
                background: #1a1a1a;
            `;
    }
  }

  setActivePane(paneId) {
    // Remove active class from all panes
    this.panes.forEach((pane) => {
      pane.isActive = false;
      pane.element.classList.remove('active');
    });

    // Set new active pane
    const pane = this.panes.find((p) => p.id === paneId);
    if (pane) {
      pane.isActive = true;
      pane.element.classList.add('active');
      this.activePane = pane;

      // Focus terminal
      if (pane.terminal) {
        pane.terminal.getTerminal().focus();
      }
    }
  }

  closePane(paneId) {
    if (this.panes.length <= 1) {
      console.warn('Cannot close the last pane');
      return false;
    }

    const paneIndex = this.panes.findIndex((p) => p.id === paneId);
    if (paneIndex === -1) return false;

    const pane = this.panes[paneIndex];

    // Remove from DOM
    if (pane.element.parentNode) {
      pane.element.parentNode.removeChild(pane.element);
    }

    // Destroy terminal
    if (pane.terminal) {
      pane.terminal.destroy();
    }

    // Remove from array
    this.panes.splice(paneIndex, 1);

    // Rearrange remaining panes
    this.arrangePanes();

    // Set new active pane
    if (this.activePane && this.activePane.id === paneId) {
      const newActivePane = this.panes[0];
      if (newActivePane) {
        this.setActivePane(newActivePane.id);
      }
    }

    return true;
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Cmd/Ctrl + D - Split pane vertically
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        if (this.activePane) {
          this.splitPane(this.activePane.id, 'vertical');
        }
      }

      // Cmd/Ctrl + Shift + D - Split pane horizontally
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        if (this.activePane) {
          this.splitPane(this.activePane.id, 'horizontal');
        }
      }

      // Cmd/Ctrl + W - Close active pane
      if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
        e.preventDefault();
        if (this.activePane) {
          this.closePane(this.activePane.id);
        }
      }

      // Cmd/Ctrl + [1-4] - Switch to pane
      if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '4') {
        e.preventDefault();
        const paneIndex = parseInt(e.key) - 1;
        if (this.panes[paneIndex]) {
          this.setActivePane(this.panes[paneIndex].id);
        }
      }
    });
  }

  getPanes() {
    return this.panes;
  }

  getActivePane() {
    return this.activePane;
  }

  getPane(paneId) {
    return this.panes.find((p) => p.id === paneId);
  }

  destroy() {
    this.panes.forEach((pane) => {
      if (pane.terminal) {
        pane.terminal.destroy();
      }
      if (pane.element.parentNode) {
        pane.element.parentNode.removeChild(pane.element);
      }
    });
    this.panes = [];
    this.activePane = null;
  }
}

export default SplitPanes;
