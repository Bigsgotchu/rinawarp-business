import { LastShellEvent, GitState, NodeState, AgentHealth, RecentUserAction } from "./types";

interface AgentState {
  lastCommand?: string;
  workingDirectory?: string;
  environment?: Record<string, string>;
  userContext?: Record<string, any>;
  
  // Enhanced state for planning heuristics
  lastShellEvent?: LastShellEvent;
  gitState?: GitState;
  nodeState?: NodeState;
  agentHealth?: AgentHealth;
  recentUserActions?: RecentUserAction[];
  lastNpmCommand?: string;
  lastNpmExitCode?: number;
  crashHistory?: number[];
}

class StateManager {
  private state: AgentState = {
    recentUserActions: [],
    crashHistory: []
  };

  getState(): AgentState {
    return { ...this.state };
  }

  updateState(updates: Partial<AgentState>): void {
    this.state = { ...this.state, ...updates };
  }

  // Original methods
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

  // Enhanced methods for planning heuristics
  setLastShellEvent(event: LastShellEvent): void {
    this.state.lastShellEvent = event;
  }

  getLastShellEvent(): LastShellEvent | undefined {
    return this.state.lastShellEvent;
  }

  setGitState(gitState: GitState): void {
    this.state.gitState = gitState;
  }

  getGitState(): GitState | undefined {
    return this.state.gitState;
  }

  setNodeState(nodeState: NodeState): void {
    this.state.nodeState = nodeState;
  }

  getNodeState(): NodeState | undefined {
    return this.state.nodeState;
  }

  setAgentHealth(health: AgentHealth): void {
    this.state.agentHealth = health;
  }

  getAgentHealth(): AgentHealth | undefined {
    return this.state.agentHealth;
  }

  addUserAction(action: RecentUserAction): void {
    if (!this.state.recentUserActions) {
      this.state.recentUserActions = [];
    }
    this.state.recentUserActions.push(action);
    
    // Keep only last 10 actions
    if (this.state.recentUserActions.length > 10) {
      this.state.recentUserActions = this.state.recentUserActions.slice(-10);
    }
  }

  getRecentUserActions(): RecentUserAction[] {
    return this.state.recentUserActions || [];
  }

  setLastNpmCommand(command: string): void {
    this.state.lastNpmCommand = command;
  }

  getLastNpmCommand(): string | undefined {
    return this.state.lastNpmCommand;
  }

  setLastNpmExitCode(exitCode: number): void {
    this.state.lastNpmExitCode = exitCode;
  }

  getLastNpmExitCode(): number | undefined {
    return this.state.lastNpmExitCode;
  }

  recordCrash(): void {
    if (!this.state.crashHistory) {
      this.state.crashHistory = [];
    }
    this.state.crashHistory.push(Date.now());
    
    // Keep only crashes from last hour
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    this.state.crashHistory = this.state.crashHistory.filter(time => time > oneHourAgo);
  }

  getCrashCountLastHour(): number {
    return this.state.crashHistory?.length || 0;
  }

  clear(): void {
    this.state = {
      recentUserActions: [],
      crashHistory: []
    };
  }
}

export const stateManager = new StateManager();
