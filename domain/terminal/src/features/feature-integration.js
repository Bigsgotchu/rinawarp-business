// Feature Integration - Safe integration of new features
import AdvancedSearch from './advanced-search.js';
import CommandMacros from './command-macros.js';
import MultiTabManager from './multi-tab.js';

class FeatureIntegration {
  constructor() {
    this.advancedSearch = new AdvancedSearch();
    this.commandMacros = new CommandMacros();
    this.multiTabManager = new MultiTabManager();
    this.features = {
      advancedSearch: true,
      commandMacros: true,
      multiTab: true,
    };
  }

  // Initialize all features
  async initialize() {
    console.log('🚀 Initializing enhanced features...');

    try {
      // Initialize multi-tab manager
      await this.multiTabManager.createTab('Main Terminal', 'terminal');

      console.log('✅ Enhanced features initialized successfully');
      return {
        success: true,
        features: Object.keys(this.features).filter((f) => this.features[f]),
      };
    } catch (error) {
      console.error('❌ Error initializing features:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Handle command execution with new features
  async executeCommand(command, result) {
    // Add to search history
    this.advancedSearch.addCommand(command, result);

    // Add to macro recording if active
    this.commandMacros.addCommandToRecording(command, result);

    // Update active tab content
    const activeTab = this.multiTabManager.getActiveTab();
    if (activeTab.success) {
      this.multiTabManager.updateTabContent(activeTab.tab.id, command);
    }

    return {
      success: true,
      command,
      result,
      features: {
        searchIndexed: true,
        macroRecorded: this.commandMacros.getRecordingStatus().recording,
        tabUpdated: activeTab.success,
      },
    };
  }

  // Search commands
  searchCommands(query, limit = 10) {
    return this.advancedSearch.search(query, limit);
  }

  // Get command suggestions
  getCommandSuggestions(partialCommand) {
    return this.advancedSearch.getSuggestions(partialCommand);
  }

  // Get most used commands
  getMostUsedCommands(limit = 10) {
    return this.advancedSearch.getMostUsed(limit);
  }

  // Macro management
  startMacroRecording(name) {
    return this.commandMacros.startRecording(name);
  }

  stopMacroRecording() {
    return this.commandMacros.stopRecording();
  }

  executeMacro(name, context = {}) {
    return this.commandMacros.executeMacro(name, context);
  }

  listMacros() {
    return this.commandMacros.listMacros();
  }

  // Tab management
  createTab(name, type = 'terminal') {
    return this.multiTabManager.createTab(name, type);
  }

  switchToTab(tabId) {
    return this.multiTabManager.switchToTab(tabId);
  }

  closeTab(tabId) {
    return this.multiTabManager.closeTab(tabId);
  }

  listTabs() {
    return this.multiTabManager.listTabs();
  }

  // Get feature status
  getFeatureStatus() {
    return {
      features: this.features,
      search: {
        totalCommands: this.advancedSearch.commandHistory.length,
        searchIndexSize: this.advancedSearch.searchIndex.size,
      },
      macros: {
        totalMacros: this.commandMacros.macros.size,
        recording: this.commandMacros.getRecordingStatus(),
      },
      tabs: {
        totalTabs: this.multiTabManager.tabs.size,
        activeTab: this.multiTabManager.activeTabId,
      },
    };
  }

  // Export all data
  exportAllData() {
    return {
      search: this.advancedSearch.exportHistory(),
      macros: this.commandMacros.exportMacros(),
      tabs: this.multiTabManager.exportTabs(),
      exportedAt: new Date().toISOString(),
    };
  }

  // Import all data
  importAllData(data) {
    const results = [];

    if (data.search) {
      this.advancedSearch.importHistory(data.search);
      results.push('✅ Search history imported');
    }

    if (data.macros) {
      const macroResult = this.commandMacros.importMacros(data.macros);
      results.push(macroResult);
    }

    if (data.tabs) {
      const tabResult = this.multiTabManager.importTabs(data.tabs);
      results.push(tabResult);
    }

    return results;
  }
}

export default FeatureIntegration;
