/**
 * RinaWarp Terminal Pro - UI Management
 */

class UIManager {
  constructor() {
    this.isInitialized = false;
    this.currentTheme = 'mermaid';
    this.sidebarCollapsed = false;
    this.modals = new Map();
    this.notifications = [];
    this.fileManager = null;

    // Theme definitions
    this.themes = {
      mermaid: {
        name: 'RinaWarp Mermaid',
        primary: '#e9007f',
        secondary: '#00ffb3',
        accent: '#22d3ee',
        background: '#0a0a0a',
        surface: '#1a1a1a',
        textPrimary: '#ffffff',
        textSecondary: '#b3b3b3',
      },
      dark: {
        name: 'Dark',
        primary: '#5865f2',
        secondary: '#57f287',
        accent: '#fee75c',
        background: '#1e1e1e',
        surface: '#2d2d30',
        textPrimary: '#cccccc',
        textSecondary: '#969696',
      },
      light: {
        name: 'Light',
        primary: '#007acc',
        secondary: '#4caf50',
        accent: '#ff9800',
        background: '#f5f5f5',
        surface: '#ffffff',
        textPrimary: '#333333',
        textSecondary: '#666666',
      },
      matrix: {
        name: 'Matrix',
        primary: '#00ff41',
        secondary: '#39ff14',
        accent: '#00cc66',
        background: '#000000',
        surface: '#001100',
        textPrimary: '#00ff41',
        textSecondary: '#00cc66',
      },
    };
  }

  async initialize() {
    try {
      // Initialize file manager
      this.fileManager = new FileManager();
      await this.fileManager.initialize();

      // Setup UI components
      this.setupComponents();

      // Setup event listeners
      this.setupEventListeners();

      // Load saved preferences
      this.loadPreferences();

      // Initialize theme system
      this.initializeThemeSystem();

      this.isInitialized = true;
      console.log('UI Manager initialized');
    } catch (error) {
      console.error('Failed to initialize UI Manager:', error);
    }
  }

  setupComponents() {
    // Initialize all modal instances
    this.initializeModals();

    // Setup sidebar functionality
    this.setupSidebar();

    // Setup notification system
    this.setupNotifications();

    // Setup drag and drop
    this.setupDragAndDrop();
  }

  setupEventListeners() {
    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleGlobalKeydown(e));

    // Window resize
    window.addEventListener('resize', () => this.handleResize());

    // Context menu
    document.addEventListener('contextmenu', (e) => this.handleContextMenu(e));

    // Click outside modals to close
    document.addEventListener('click', (e) => this.handleOutsideClick(e));

    // Theme change events
    document.addEventListener('theme-change', (e) => {
      this.applyTheme(e.detail.theme);
    });

    // File system events
    document.addEventListener('file-operation', (e) => {
      this.handleFileOperation(e.detail);
    });
  }

  initializeModals() {
    // AI Modal
    this.modals.set('ai', document.getElementById('ai-modal'));

    // Voice Modal
    this.modals.set('voice', document.getElementById('voice-modal'));

    // License Modal
    this.modals.set('license', document.getElementById('license-modal'));
  }

  setupSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');

    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => {
        this.toggleSidebar();
      });
    }

    // Collapsible sections
    document.querySelectorAll('.panel-header').forEach((header) => {
      const panel = header.closest('.panel');
      const content = panel?.querySelector('.panel-content');

      if (content) {
        header.addEventListener('click', () => {
          this.togglePanel(panel);
        });
      }
    });
  }

  setupNotifications() {
    // Create notification container
    if (!document.getElementById('notification-container')) {
      const container = document.createElement('div');
      container.id = 'notification-container';
      container.className = 'notification-container';
      document.body.appendChild(container);
    }
  }

  setupDragAndDrop() {
    // Setup file/folder drag and drop
    const terminalContent = document.getElementById('terminal-content');
    if (terminalContent) {
      terminalContent.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        terminalContent.classList.add('drag-over');
      });

      terminalContent.addEventListener('dragleave', () => {
        terminalContent.classList.remove('drag-over');
      });

      terminalContent.addEventListener('drop', (e) => {
        e.preventDefault();
        terminalContent.classList.remove('drag-over');
        this.handleFileDrop(e);
      });
    }
  }

  initializeThemeSystem() {
    // Load theme preference
    const savedTheme = localStorage.getItem('rinawarp-theme');
    if (savedTheme && this.themes[savedTheme]) {
      this.currentTheme = savedTheme;
    }

    this.applyTheme(this.currentTheme);
  }

  loadPreferences() {
    try {
      const saved = localStorage.getItem('rinawarp-ui-preferences');
      if (saved) {
        const prefs = JSON.parse(saved);
        this.sidebarCollapsed = prefs.sidebarCollapsed || false;
        this.currentTheme = prefs.theme || 'mermaid';
      }
    } catch (error) {
      console.warn('Failed to load UI preferences:', error);
    }
  }

  savePreferences() {
    try {
      const prefs = {
        sidebarCollapsed: this.sidebarCollapsed,
        theme: this.currentTheme,
      };
      localStorage.setItem('rinawarp-ui-preferences', JSON.stringify(prefs));
    } catch (error) {
      console.warn('Failed to save UI preferences:', error);
    }
  }

  applyTheme(themeName) {
    const theme = this.themes[themeName];
    if (!theme) return;

    // Apply CSS variables
    const root = document.documentElement;
    root.style.setProperty('--rw-primary', theme.primary);
    root.style.setProperty('--rw-secondary', theme.secondary);
    root.style.setProperty('--rw-accent', theme.accent);
    root.style.setProperty('--rw-background', theme.background);
    root.style.setProperty('--rw-surface', theme.surface);
    root.style.setProperty('--rw-text-primary', theme.textPrimary);
    root.style.setProperty('--rw-text-secondary', theme.textSecondary);

    // Update body class
    document.body.className = document.body.className.replace(/theme-\w+/, '');
    document.body.classList.add(`theme-${themeName}`);

    this.currentTheme = themeName;
    this.savePreferences();

    // Emit theme change event
    document.dispatchEvent(
      new CustomEvent('theme-change', {
        detail: { theme: themeName, themeData: theme },
      }),
    );
  }

  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      this.sidebarCollapsed = !this.sidebarCollapsed;
      sidebar.classList.toggle('collapsed', this.sidebarCollapsed);
      this.savePreferences();
    }
  }

  togglePanel(panel) {
    const content = panel.querySelector('.panel-content') || panel.querySelector('.panel-body');
    if (content) {
      panel.classList.toggle('collapsed');
      content.style.display = panel.classList.contains('collapsed') ? 'none' : 'block';
    }
  }

  showModal(modalId, options = {}) {
    const modal = this.modals.get(modalId);
    if (modal) {
      modal.classList.add('show');

      // Setup modal-specific options
      if (options.focusFirstInput) {
        setTimeout(() => {
          const firstInput = modal.querySelector('input, textarea, select');
          if (firstInput) firstInput.focus();
        }, 100);
      }

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }
  }

  hideModal(modalId) {
    const modal = this.modals.get(modalId);
    if (modal) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  }

  hideAllModals() {
    this.modals.forEach((modal) => {
      modal.classList.remove('show');
    });
    document.body.style.overflow = '';
  }

  showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">×</button>
            </div>
        `;

    const container = document.getElementById('notification-container');
    if (container) {
      container.appendChild(notification);

      // Auto-remove after duration
      setTimeout(() => {
        this.removeNotification(notification);
      }, duration);

      // Manual close
      notification.querySelector('.notification-close').addEventListener('click', () => {
        this.removeNotification(notification);
      });

      this.notifications.push(notification);
    }
  }

  removeNotification(notification) {
    if (notification && notification.parentNode) {
      notification.classList.add('removing');
      setTimeout(() => {
        notification.remove();
        const index = this.notifications.indexOf(notification);
        if (index > -1) {
          this.notifications.splice(index, 1);
        }
      }, 300);
    }
  }

  clearAllNotifications() {
    this.notifications.forEach((notification) => {
      this.removeNotification(notification);
    });
  }

  handleFileDrop(e) {
    const files = Array.from(e.dataTransfer.files);
    const directories = Array.from(e.dataTransfer.items)
      .filter((item) => item.kind === 'file')
      .map((item) => item.webkitGetAsEntry())
      .filter((entry) => entry && entry.isDirectory);

    if (files.length > 0) {
      this.handleDroppedFiles(files);
    }

    if (directories.length > 0) {
      this.handleDroppedDirectories(directories);
    }
  }

  handleDroppedFiles(files) {
    const terminalManager = window.terminalManager;
    if (!terminalManager || !terminalManager.activeTerminalId) {
      this.showNotification('No active terminal to process files', 'warning');
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Handle file content
        terminalManager.writeToTerminal(
          terminalManager.activeTerminalId,
          `# Dropped file: ${file.name}\n`,
        );
      };
      reader.readAsText(file);
    });

    this.showNotification(`Processing ${files.length} dropped file(s)`, 'success');
  }

  handleDroppedDirectories(directories) {
    directories.forEach((entry) => {
      this.traverseDirectory(entry);
    });

    this.showNotification(
      `Processing ${directories.length} dropped directory/directories`,
      'success',
    );
  }

  traverseDirectory(entry, path = '') {
    const fullPath = path ? `${path}/${entry.name}` : entry.name;

    if (entry.isFile) {
      entry.file((file) => {
        console.log('Dropped file:', fullPath);
      });
    } else if (entry.isDirectory) {
      const reader = entry.createReader();
      reader.readEntries((entries) => {
        entries.forEach((subEntry) => {
          this.traverseDirectory(subEntry, fullPath);
        });
      });
    }
  }

  handleGlobalKeydown(e) {
    // Escape key closes modals
    if (e.key === 'Escape') {
      this.hideAllModals();
    }

    // Ctrl+Shift+T toggles sidebar
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
      e.preventDefault();
      this.toggleSidebar();
    }

    // F11 toggles fullscreen
    if (e.key === 'F11') {
      e.preventDefault();
      this.toggleFullscreen();
    }
  }

  handleResize() {
    // Notify components of resize
    document.dispatchEvent(
      new CustomEvent('window-resize', {
        detail: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      }),
    );
  }

  handleContextMenu(e) {
    // Custom context menu for terminal
    if (e.target.closest('.terminal-instance')) {
      e.preventDefault();
      this.showTerminalContextMenu(e);
    }
  }

  showTerminalContextMenu(e) {
    const contextMenu = document.createElement('div');
    contextMenu.className = 'context-menu';
    contextMenu.style.cssText = `
            position: fixed;
            top: ${e.pageY}px;
            left: ${e.pageX}px;
            background: var(--rw-surface);
            border: 1px solid var(--rw-border);
            border-radius: 6px;
            padding: 4px 0;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;

    const menuItems = [
      { label: 'Copy', action: () => this.copyFromTerminal() },
      { label: 'Paste', action: () => this.pasteToTerminal() },
      { label: 'Clear', action: () => this.clearTerminal() },
      { label: 'Select All', action: () => this.selectAllInTerminal() },
      null, // Separator
      { label: 'Find...', action: () => this.findInTerminal() },
    ];

    menuItems.forEach((item) => {
      if (item) {
        const menuItem = document.createElement('div');
        menuItem.className = 'context-menu-item';
        menuItem.textContent = item.label;
        menuItem.addEventListener('click', () => {
          item.action();
          contextMenu.remove();
        });
        contextMenu.appendChild(menuItem);
      } else {
        const separator = document.createElement('div');
        separator.className = 'context-menu-separator';
        contextMenu.appendChild(separator);
      }
    });

    document.body.appendChild(contextMenu);

    // Remove menu on click outside
    setTimeout(() => {
      document.addEventListener('click', function removeMenu() {
        contextMenu.remove();
        document.removeEventListener('click', removeMenu);
      });
    }, 0);
  }

  copyFromTerminal() {
    if (window.terminalManager && window.terminalManager.activeTerminalId) {
      window.terminalManager.copySelection(window.terminalManager.activeTerminalId);
    }
  }

  pasteToTerminal() {
    navigator.clipboard.readText().then((text) => {
      if (window.terminalManager && window.terminalManager.activeTerminalId) {
        window.terminalManager.paste(window.terminalManager.activeTerminalId, text);
      }
    });
  }

  clearTerminal() {
    if (window.terminalManager && window.terminalManager.activeTerminalId) {
      window.terminalManager.clearTerminal(window.terminalManager.activeTerminalId);
    }
  }

  selectAllInTerminal() {
    if (window.terminalManager && window.terminalManager.activeTerminalId) {
      window.terminalManager.selectAll(window.terminalManager.activeTerminalId);
    }
  }

  findInTerminal() {
    const searchTerm = prompt('Search in terminal:');
    if (searchTerm && window.terminalManager && window.terminalManager.activeTerminalId) {
      window.terminalManager.findInTerminal(window.terminalManager.activeTerminalId, searchTerm);
    }
  }

  handleOutsideClick(e) {
    // Close modals when clicking outside
    this.modals.forEach((modal) => {
      if (modal.classList.contains('show')) {
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent && !modalContent.contains(e.target)) {
          this.hideModal(modal.id);
        }
      }
    });
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  handleFileOperation(operation) {
    switch (operation.type) {
      case 'file-created':
        this.showNotification(`File created: ${operation.filename}`, 'success');
        break;
      case 'file-deleted':
        this.showNotification(`File deleted: ${operation.filename}`, 'info');
        break;
      case 'folder-opened':
        this.showNotification(`Opened folder: ${operation.path}`, 'info');
        break;
      default:
        console.log('Unhandled file operation:', operation);
    }
  }

  // File Manager Integration
  updateFileTree(path, files) {
    const fileTree = document.getElementById('file-tree');
    if (fileTree) {
      fileTree.innerHTML = '';
      this.renderFileTree(fileTree, files, path);
    }
  }

  renderFileTree(container, items, basePath = '') {
    items.forEach((item) => {
      const itemElement = document.createElement('div');
      itemElement.className = `file-tree-item ${item.type}`;

      const icon = item.type === 'folder' ? '📁' : '📄';
      const expandIcon = item.type === 'folder' ? '▶️' : '';

      itemElement.innerHTML = `
                <div class="file-tree-row" data-path="${item.path}">
                    <span class="file-tree-icon">${icon}</span>
                    <span class="file-tree-name">${item.name}</span>
                    ${item.type === 'folder' ? '<span class="file-tree-expand">▶</span>' : ''}
                </div>
            `;

      itemElement.addEventListener('click', () => {
        if (item.type === 'folder') {
          this.toggleFolder(itemElement, item.path);
        } else {
          this.openFile(item.path);
        }
      });

      container.appendChild(itemElement);
    });
  }

  async toggleFolder(element, folderPath) {
    const expandIcon = element.querySelector('.file-tree-expand');
    const isExpanded = element.classList.contains('expanded');

    if (isExpanded) {
      // Collapse
      element.classList.remove('expanded');
      expandIcon.textContent = '▶';
      const children = element.querySelector('.file-tree-children');
      if (children) children.remove();
    } else {
      // Expand
      element.classList.add('expanded');
      expandIcon.textContent = '▼';

      // Load folder contents
      try {
        const contents = await this.fileManager.getDirectoryContents(folderPath);
        this.renderFolderContents(element, contents);
      } catch (error) {
        this.showNotification(`Failed to load folder: ${error.message}`, 'error');
      }
    }
  }

  renderFolderContents(parentElement, contents) {
    let childrenContainer = parentElement.querySelector('.file-tree-children');
    if (!childrenContainer) {
      childrenContainer = document.createElement('div');
      childrenContainer.className = 'file-tree-children';
      parentElement.appendChild(childrenContainer);
    }

    this.renderFileTree(childrenContainer, contents);
  }

  async openFile(filePath) {
    try {
      const content = await this.fileManager.readFile(filePath);
      this.showFileContent(filePath, content);
    } catch (error) {
      this.showNotification(`Failed to open file: ${error.message}`, 'error');
    }
  }

  showFileContent(filename, content) {
    // For now, just show in a notification
    // In a full implementation, you'd open a file viewer or editor
    this.showNotification(`Opened ${filename} (${content.length} characters)`, 'info');
  }

  // Theme management
  getAvailableThemes() {
    return Object.keys(this.themes).map((key) => ({
      id: key,
      name: this.themes[key].name,
      preview: this.themes[key],
    }));
  }

  getCurrentTheme() {
    return {
      id: this.currentTheme,
      ...this.themes[this.currentTheme],
    };
  }

  // Public API
  isReady() {
    return this.isInitialized;
  }

  getTheme() {
    return this.currentTheme;
  }

  setTheme(themeName) {
    if (this.themes[themeName]) {
      this.applyTheme(themeName);
    }
  }
}

// File Manager class
class FileManager {
  constructor() {
    this.currentDirectory = null;
    this.history = [];
    this.bookmarks = [];
  }

  async initialize() {
    this.currentDirectory = await this.getInitialDirectory();
  }

  async getInitialDirectory() {
    if (window.electronAPI) {
      return await window.electronAPI.getCurrentDirectory();
    }
    return '/'; // Fallback to root directory
  }

  async getDirectoryContents(path) {
    if (window.electronAPI) {
      return await window.electronAPI.getDirectoryContents(path);
    }

    // Fallback implementation - limited browser support
    try {
      // In a browser environment, we can't directly read directories
      // This would need to be implemented via IPC or web APIs
      throw new Error('Directory listing not available in browser environment');
    } catch (error) {
      throw new Error(`Failed to read directory: ${error.message}`);
    }
  }

  async readFile(filePath) {
    if (window.electronAPI) {
      return await window.electronAPI.readFile(filePath);
    }

    // Fallback implementation using bridge API
    try {
      if (window.bridge?.readTextFile) {
        return await window.bridge.readTextFile(filePath);
      }
      throw new Error('File reading not available in browser environment');
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  async writeFile(filePath, content) {
    if (window.electronAPI) {
      return await window.electronAPI.writeFile(filePath, content);
    }

    // Fallback implementation - limited browser support
    try {
      // In a browser environment, we can't directly write files
      // This would need to be implemented via download API or IPC
      throw new Error('File writing not available in browser environment');
    } catch (error) {
      throw new Error(`Failed to write file: ${error.message}`);
    }
  }

  async changeDirectory(path) {
    this.history.push(this.currentDirectory);
    this.currentDirectory = path;

    if (window.electronAPI) {
      await window.electronAPI.changeDirectory(path);
    }
  }

  openDirectory(path) {
    this.changeDirectory(path);
    return this.getDirectoryContents(path);
  }
}

// Export for use in main application
window.UIManager = UIManager;
window.uiManager = new UIManager();
