import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

interface LongTermMemory {
  userPreferences: Record<string, any>;
  workspaceHistory: Array<{ path: string; timestamp: number }>;
  commandPatterns: Record<string, number>;
  aliases: Record<string, string>;
}

class LongTermMemoryManager {
  private memoryFile: string;
  private memory: LongTermMemory = {
    userPreferences: {},
    workspaceHistory: [],
    commandPatterns: {},
    aliases: {},
  };

  constructor() {
    // Store in user's home directory for persistence
    this.memoryFile = join(
      process.env.HOME || process.env.USERPROFILE || '/tmp',
      '.rina-agent-memory.json',
    );
    this.loadMemory();
  }

  private async loadMemory(): Promise<void> {
    try {
      const data = await readFile(this.memoryFile, 'utf8');
      this.memory = JSON.parse(data);
    } catch (error) {
      // Memory file doesn't exist or can't be read, start with defaults
      console.log('[RinaAgent] Starting with fresh long-term memory');
    }
  }

  private async saveMemory(): Promise<void> {
    try {
      await writeFile(this.memoryFile, JSON.stringify(this.memory, null, 2), 'utf8');
    } catch (error) {
      console.error('[RinaAgent] Failed to save long-term memory:', error);
    }
  }

  setUserPreference(key: string, value: any): void {
    this.memory.userPreferences[key] = value;
    this.saveMemory();
  }

  getUserPreference(key: string): any {
    return this.memory.userPreferences[key];
  }

  addWorkspace(path: string): void {
    const existing = this.memory.workspaceHistory.findIndex((w) => w.path === path);
    if (existing !== -1) {
      this.memory.workspaceHistory.splice(existing, 1);
    }
    this.memory.workspaceHistory.unshift({
      path,
      timestamp: Date.now(),
    });
    // Keep only last 20 workspaces
    this.memory.workspaceHistory = this.memory.workspaceHistory.slice(0, 20);
    this.saveMemory();
  }

  getWorkspaceHistory(): Array<{ path: string; timestamp: number }> {
    return [...this.memory.workspaceHistory];
  }

  incrementCommandPattern(command: string): void {
    this.memory.commandPatterns[command] = (this.memory.commandPatterns[command] || 0) + 1;
    this.saveMemory();
  }

  getCommandPatterns(): Record<string, number> {
    return { ...this.memory.commandPatterns };
  }

  getTopCommands(limit: number = 10): Array<{ command: string; count: number }> {
    return Object.entries(this.memory.commandPatterns)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([command, count]) => ({ command, count }));
  }

  setAlias(alias: string, command: string): void {
    this.memory.aliases[alias] = command;
    this.saveMemory();
  }

  getAlias(alias: string): string | undefined {
    return this.memory.aliases[alias];
  }

  getAllAliases(): Record<string, string> {
    return { ...this.memory.aliases };
  }

  clear(): void {
    this.memory = {
      userPreferences: {},
      workspaceHistory: [],
      commandPatterns: {},
      aliases: {},
    };
    this.saveMemory();
  }
}

export const longTermMemory = new LongTermMemoryManager();
