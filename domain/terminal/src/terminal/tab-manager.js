/**
 * ============================================================
 * 🧠 RinaWarp Tab Manager (Electron-safe)
 * ------------------------------------------------------------
 * Handles terminal tabs & UI state.
 * Works across renderer and main safely.
 * ============================================================
 */

let SafeEmitter;

try {
  const { EventEmitter } = require('events');
  SafeEmitter = EventEmitter;
} catch {
  // Dummy fallback if EventEmitter isn't available (e.g. in some renderer contexts)
  SafeEmitter = class {
    on() {}
    emit() {}
    removeListener() {}
  };
}

class TabManager extends SafeEmitter {
  constructor() {
    super();
    this.tabs = new Map();
    this.activeTab = null;
  }

  createTab(id, label = 'New Tab') {
    const tab = { id, label, created: new Date().toISOString() };
    this.tabs.set(id, tab);
    this.activeTab = id;
    this.emit('tab-created', tab);
    console.log(`🧩 New tab created: ${label}`);
  }

  switchTab(id) {
    if (this.tabs.has(id)) {
      this.activeTab = id;
      this.emit('tab-switched', id);
      console.log(`🔀 Switched to tab: ${id}`);
    }
  }

  closeTab(id) {
    if (this.tabs.has(id)) {
      this.tabs.delete(id);
      this.emit('tab-closed', id);
      if (this.activeTab === id) {
        // Switch to first available tab or null
        const firstTab = this.tabs.keys().next().value || null;
        this.activeTab = firstTab;
        this.emit('tab-switched', this.activeTab);
      }
    }
  }

  getActiveTab() {
    return this.tabs.get(this.activeTab) || null;
  }

  getAllTabs() {
    return Array.from(this.tabs.values());
  }
}

export default TabManager;
