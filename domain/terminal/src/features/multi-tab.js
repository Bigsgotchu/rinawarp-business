// Multi-Tab & Split Panes - Safe to implement
class MultiTabManager {
  constructor() {
    this.tabs = new Map();
    this.activeTabId = null;
    this.tabCounter = 0;
    this.splitPanes = new Map();
  }

  // Create a new tab
  createTab(name = null, type = 'terminal') {
    const tabId = `tab_${++this.tabCounter}`;
    const tabName = name || `Terminal ${this.tabCounter}`;

    const tab = {
      id: tabId,
      name: tabName,
      type: type, // 'terminal', 'ai', 'file', 'git', etc.
      createdAt: new Date().toISOString(),
      lastActive: Date.now(),
      content: '',
      history: [],
      settings: {
        theme: 'default',
        fontSize: 14,
        fontFamily: 'monospace',
      },
      splitPanes: [],
    };

    this.tabs.set(tabId, tab);

    if (!this.activeTabId) {
      this.activeTabId = tabId;
    }

    return {
      success: true,
      tab: {
        id: tabId,
        name: tabName,
        type: type,
      },
    };
  }

  // Switch to a tab
  switchToTab(tabId) {
    if (!this.tabs.has(tabId)) {
      return {
        success: false,
        message: `❌ Tab '${tabId}' not found`,
      };
    }

    // Update last active time for previous tab
    if (this.activeTabId && this.tabs.has(this.activeTabId)) {
      this.tabs.get(this.activeTabId).lastActive = Date.now();
    }

    this.activeTabId = tabId;
    this.tabs.get(tabId).lastActive = Date.now();

    return {
      success: true,
      message: `✅ Switched to tab '${this.tabs.get(tabId).name}'`,
      tab: this.tabs.get(tabId),
    };
  }

  // Close a tab
  closeTab(tabId) {
    if (!this.tabs.has(tabId)) {
      return {
        success: false,
        message: `❌ Tab '${tabId}' not found`,
      };
    }

    const tabName = this.tabs.get(tabId).name;
    this.tabs.delete(tabId);

    // If we closed the active tab, switch to another one
    if (this.activeTabId === tabId) {
      const remainingTabs = Array.from(this.tabs.keys());
      this.activeTabId = remainingTabs.length > 0 ? remainingTabs[0] : null;
    }

    return {
      success: true,
      message: `✅ Closed tab '${tabName}'`,
      activeTabId: this.activeTabId,
    };
  }

  // Rename a tab
  renameTab(tabId, newName) {
    if (!this.tabs.has(tabId)) {
      return {
        success: false,
        message: `❌ Tab '${tabId}' not found`,
      };
    }

    const tab = this.tabs.get(tabId);
    const oldName = tab.name;
    tab.name = newName;

    return {
      success: true,
      message: `✅ Renamed tab from '${oldName}' to '${newName}'`,
      tab: {
        id: tabId,
        name: newName,
        type: tab.type,
      },
    };
  }

  // List all tabs
  listTabs() {
    const tabList = Array.from(this.tabs.values()).map((tab) => ({
      id: tab.id,
      name: tab.name,
      type: tab.type,
      isActive: tab.id === this.activeTabId,
      lastActive: tab.lastActive,
      createdAt: tab.createdAt,
    }));

    return {
      tabs: tabList,
      activeTabId: this.activeTabId,
      total: this.tabs.size,
    };
  }

  // Create a split pane within a tab
  createSplitPane(tabId, direction = 'horizontal') {
    if (!this.tabs.has(tabId)) {
      return {
        success: false,
        message: `❌ Tab '${tabId}' not found`,
      };
    }

    const paneId = `pane_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tab = this.tabs.get(tabId);

    const pane = {
      id: paneId,
      tabId: tabId,
      direction: direction, // 'horizontal' or 'vertical'
      content: '',
      history: [],
      createdAt: new Date().toISOString(),
      lastActive: Date.now(),
      settings: {
        theme: tab.settings.theme,
        fontSize: tab.settings.fontSize,
        fontFamily: tab.settings.fontFamily,
      },
    };

    tab.splitPanes.push(paneId);
    this.splitPanes.set(paneId, pane);

    return {
      success: true,
      message: `✅ Created ${direction} split pane in tab '${tab.name}'`,
      pane: {
        id: paneId,
        tabId: tabId,
        direction: direction,
      },
    };
  }

  // Close a split pane
  closeSplitPane(paneId) {
    if (!this.splitPanes.has(paneId)) {
      return {
        success: false,
        message: `❌ Split pane '${paneId}' not found`,
      };
    }

    const pane = this.splitPanes.get(paneId);
    const tab = this.tabs.get(pane.tabId);

    // Remove pane from tab's split panes
    tab.splitPanes = tab.splitPanes.filter((id) => id !== paneId);
    this.splitPanes.delete(paneId);

    return {
      success: true,
      message: `✅ Closed split pane in tab '${tab.name}'`,
    };
  }

  // Get tab content
  getTabContent(tabId) {
    if (!this.tabs.has(tabId)) {
      return {
        success: false,
        message: `❌ Tab '${tabId}' not found`,
      };
    }

    const tab = this.tabs.get(tabId);
    const panes = tab.splitPanes.map((paneId) => this.splitPanes.get(paneId));

    return {
      success: true,
      tab: {
        id: tab.id,
        name: tab.name,
        type: tab.type,
        content: tab.content,
        history: tab.history,
        settings: tab.settings,
        panes: panes,
      },
    };
  }

  // Update tab content
  updateTabContent(tabId, content) {
    if (!this.tabs.has(tabId)) {
      return {
        success: false,
        message: `❌ Tab '${tabId}' not found`,
      };
    }

    const tab = this.tabs.get(tabId);
    tab.content = content;
    tab.lastActive = Date.now();

    // Add to history
    tab.history.push({
      content: content,
      timestamp: Date.now(),
    });

    // Keep only last 100 history entries
    if (tab.history.length > 100) {
      tab.history = tab.history.slice(-100);
    }

    return {
      success: true,
      message: `✅ Updated content for tab '${tab.name}'`,
    };
  }

  // Get active tab
  getActiveTab() {
    if (!this.activeTabId || !this.tabs.has(this.activeTabId)) {
      return {
        success: false,
        message: '❌ No active tab',
      };
    }

    return {
      success: true,
      tab: this.tabs.get(this.activeTabId),
    };
  }

  // Export all tabs for backup
  exportTabs() {
    const tabsData = {};
    this.tabs.forEach((tab, tabId) => {
      tabsData[tabId] = {
        ...tab,
        splitPanes: tab.splitPanes.map((paneId) => this.splitPanes.get(paneId)),
      };
    });

    return {
      tabs: tabsData,
      activeTabId: this.activeTabId,
      exportedAt: new Date().toISOString(),
      totalTabs: this.tabs.size,
    };
  }

  // Import tabs from backup
  importTabs(data) {
    if (data.tabs && typeof data.tabs === 'object') {
      Object.keys(data.tabs).forEach((tabId) => {
        const tab = data.tabs[tabId];
        this.tabs.set(tabId, tab);

        // Restore split panes
        if (tab.splitPanes) {
          tab.splitPanes.forEach((pane) => {
            this.splitPanes.set(pane.id, pane);
          });
        }
      });

      this.activeTabId = data.activeTabId;
      return `✅ Imported ${Object.keys(data.tabs).length} tabs`;
    }
    return '❌ Invalid tabs data format';
  }
}

export default MultiTabManager;
