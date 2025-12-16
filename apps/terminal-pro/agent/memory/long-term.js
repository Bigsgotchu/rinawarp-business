'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.longTermMemory = void 0;
const promises_1 = require('fs/promises');
const path_1 = require('path');
class LongTermMemoryManager {
  constructor() {
    this.memory = {
      userPreferences: {},
      workspaceHistory: [],
      commandPatterns: {},
      aliases: {},
    };
    this.memoryFile = (0, path_1.join)(
      process.env.HOME || process.env.USERPROFILE || '/tmp',
      '.rina-agent-memory.json',
    );
    this.loadMemory();
  }
  async loadMemory() {
    try {
      const data = await (0, promises_1.readFile)(this.memoryFile, 'utf8');
      this.memory = JSON.parse(data);
    } catch (error) {
      console.log('[RinaAgent] Starting with fresh long-term memory');
    }
  }
  async saveMemory() {
    try {
      await (0, promises_1.writeFile)(
        this.memoryFile,
        JSON.stringify(this.memory, null, 2),
        'utf8',
      );
    } catch (error) {
      console.error('[RinaAgent] Failed to save long-term memory:', error);
    }
  }
  setUserPreference(key, value) {
    this.memory.userPreferences[key] = value;
    this.saveMemory();
  }
  getUserPreference(key) {
    return this.memory.userPreferences[key];
  }
  addWorkspace(path) {
    const existing = this.memory.workspaceHistory.findIndex((w) => w.path === path);
    if (existing !== -1) {
      this.memory.workspaceHistory.splice(existing, 1);
    }
    this.memory.workspaceHistory.unshift({
      path,
      timestamp: Date.now(),
    });
    this.memory.workspaceHistory = this.memory.workspaceHistory.slice(0, 20);
    this.saveMemory();
  }
  getWorkspaceHistory() {
    return [...this.memory.workspaceHistory];
  }
  incrementCommandPattern(command) {
    this.memory.commandPatterns[command] = (this.memory.commandPatterns[command] || 0) + 1;
    this.saveMemory();
  }
  getCommandPatterns() {
    return { ...this.memory.commandPatterns };
  }
  getTopCommands(limit = 10) {
    return Object.entries(this.memory.commandPatterns)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([command, count]) => ({ command, count }));
  }
  setAlias(alias, command) {
    this.memory.aliases[alias] = command;
    this.saveMemory();
  }
  getAlias(alias) {
    return this.memory.aliases[alias];
  }
  getAllAliases() {
    return { ...this.memory.aliases };
  }
  clear() {
    this.memory = {
      userPreferences: {},
      workspaceHistory: [],
      commandPatterns: {},
      aliases: {},
    };
    this.saveMemory();
  }
}
exports.longTermMemory = new LongTermMemoryManager();
