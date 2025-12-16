interface ShortTermMemory {
  recentCommands: string[];
  recentOutputs: string[];
  currentSession: Record<string, any>;
  buffer: string[];
}

class ShortTermMemoryManager {
  private memory: ShortTermMemory = {
    recentCommands: [],
    recentOutputs: [],
    currentSession: {},
    buffer: [],
  };

  private maxCommands = 50;
  private maxOutputs = 100;

  addCommand(command: string): void {
    this.memory.recentCommands.unshift(command);
    if (this.memory.recentCommands.length > this.maxCommands) {
      this.memory.recentCommands = this.memory.recentCommands.slice(0, this.maxCommands);
    }
  }

  getRecentCommands(): string[] {
    return [...this.memory.recentCommands];
  }

  addOutput(output: string): void {
    this.memory.recentOutputs.unshift(output);
    if (this.memory.recentOutputs.length > this.maxOutputs) {
      this.memory.recentOutputs = this.memory.recentOutputs.slice(0, this.maxOutputs);
    }
  }

  getRecentOutputs(): string[] {
    return [...this.memory.recentOutputs];
  }

  setSessionValue(key: string, value: any): void {
    this.memory.currentSession[key] = value;
  }

  getSessionValue(key: string): any {
    return this.memory.currentSession[key];
  }

  getCurrentSession(): Record<string, any> {
    return { ...this.memory.currentSession };
  }

  clearSession(): void {
    this.memory.currentSession = {};
  }

  addToBuffer(data: string): void {
    this.memory.buffer.push(data);
  }

  getBuffer(): string[] {
    return [...this.memory.buffer];
  }

  clearBuffer(): void {
    this.memory.buffer = [];
  }

  clear(): void {
    this.memory = {
      recentCommands: [],
      recentOutputs: [],
      currentSession: {},
      buffer: [],
    };
  }
}

export const shortTermMemory = new ShortTermMemoryManager();
