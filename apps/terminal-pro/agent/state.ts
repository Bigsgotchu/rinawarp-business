interface AgentState {
  lastCommand?: string;
  workingDirectory?: string;
  environment?: Record<string, string>;
  userContext?: Record<string, any>;
}

class StateManager {
  private state: AgentState = {};

  getState(): AgentState {
    return { ...this.state };
  }

  updateState(updates: Partial<AgentState>): void {
    this.state = { ...this.state, ...updates };
  }

  setLastCommand(command: string): void {
    this.state.lastCommand = command;
  }

  getLastCommand(): string | undefined {
    return this.state.lastCommand;
  }

  setWorkingDirectory(cwd: string): void {
    this.state.workingDirectory = cwd;
  }

  getWorkingDirectory(): string | undefined {
    return this.state.workingDirectory;
  }

  setEnvironment(env: Record<string, string>): void {
    this.state.environment = env;
  }

  getEnvironment(): Record<string, string> | undefined {
    return this.state.environment;
  }

  setUserContext(context: Record<string, any>): void {
    this.state.userContext = context;
  }

  getUserContext(): Record<string, any> | undefined {
    return this.state.userContext;
  }

  clear(): void {
    this.state = {};
  }
}

export const stateManager = new StateManager();
