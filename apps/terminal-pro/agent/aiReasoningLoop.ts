/**
 * AI Reasoning Loop - Two-loop architecture (Fast/Slow)
 * Planner/Executor/Verifier pattern with guardrails
 */

import { planNextStep } from "./planNextStep";
import { stateManager } from "./state-enhanced";
import { NextStep } from "./types";

export interface Goal {
  description: string;
  context?: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface Context {
  cwd: string;
  lastShell?: {
    cmd: string;
    exitCode: number;
    stdoutTail: string;
    stderrTail: string;
    durationMs: number;
  };
  git?: {
    isRepo: boolean;
    branch?: string;
    dirty?: boolean;
    ahead?: number;
    behind?: number;
  };
  node?: {
    hasPackageJson?: boolean;
    lastNpmScript?: string;
    lastNpmExitCode?: number;
  };
  agentHealth?: {
    ok: boolean;
    recentlyCrashed: boolean;
    restartCount1h: number;
  };
  recentUserActions?: any[];
  errorHistory?: Array<{
    timestamp: number;
    command: string;
    error: string;
  }>;
}

export interface PlanStep {
  intent: string;
  tool: string;
  args: any;
  expectedSignal: string;
  rollback?: PlanStep;
  explanation: string;
}

export interface Plan {
  goal: Goal;
  steps: PlanStep[];
  estimatedTime: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface Result {
  success: boolean;
  output?: any;
  error?: string;
  signal?: string;
  continue: boolean;
  escalate?: boolean;
}

export interface ApprovalRequest {
  step: PlanStep;
  explanation: string;
  riskLevel: 'low' | 'medium' | 'high';
  command?: string;
}

export class AIReasoningLoop {
  private fastLoopEnabled = true;
  private slowLoopEnabled = false;
  private userApprovalRequired = true;
  private riskGuardrailsEnabled = true;
  
  private lastSlowLoopRun = 0;
  private errorCountLastHour = 0;
  private planCache = new Map<string, Plan>();
  
  constructor(options: {
    fastLoopEnabled?: boolean;
    slowLoopEnabled?: boolean;
    userApprovalRequired?: boolean;
    riskGuardrailsEnabled?: boolean;
  } = {}) {
    this.fastLoopEnabled = options.fastLoopEnabled ?? true;
    this.slowLoopEnabled = options.slowLoopEnabled ?? false;
    this.userApprovalRequired = options.userApprovalRequired ?? true;
    this.riskGuardrailsEnabled = options.riskGuardrailsEnabled ?? true;
  }

  /**
   * Main entry point - processes shell events and decides which loop to run
   */
  async processShellEvent(event: any): Promise<NextStep | null> {
    // Update error tracking
    if (event.type === 'shell:exit' && event.code !== 0) {
      this.trackError(event);
    }

    // Always run fast loop for immediate suggestions
    if (this.fastLoopEnabled) {
      const fastResult = await this.runFastLoop(event);
      if (fastResult) {
        return fastResult;
      }
    }

    // Decide if we should trigger slow loop
    if (this.shouldTriggerSlowLoop(event)) {
      const slowResult = await this.runSlowLoop(event);
      if (slowResult) {
        return slowResult;
      }
    }

    return null;
  }

  /**
   * Fast loop - immediate deterministic suggestions (always on)
   * Wraps existing planNextStep heuristics
   */
  private async runFastLoop(event: any): Promise<NextStep | null> {
    try {
      // Build context for planning
      const context = await this.buildContext();
      
      // Use existing heuristics for immediate suggestions
      const nextStep = planNextStep(context);
      
      // Only return suggestions, not complex planning
      if (nextStep.kind === 'suggestion' || nextStep.kind === 'checklist') {
        return nextStep;
      }
      
      return null;
    } catch (error) {
      console.warn('[AIReasoningLoop] Fast loop failed:', error);
      return null;
    }
  }

  /**
   * Slow loop - AI-powered complex planning (triggers on specific conditions)
   */
  private async runSlowLoop(event: any): Promise<NextStep | null> {
    try {
      this.lastSlowLoopRun = Date.now();
      
      const context = await this.buildContext();
      const goal = this.extractGoal(context);
      
      // Generate plan using AI reasoning
      const plan = await this.generatePlan(goal, context);
      
      if (!plan || plan.steps.length === 0) {
        return null;
      }

      // Check if we need user approval for first step
      const firstStep = plan.steps[0];
      if (this.requiresApproval(firstStep)) {
        const approvalRequest = this.createApprovalRequest(firstStep, plan.goal);
        return {
          kind: 'checklist',
          items: [{
            text: `AI suggests: ${firstStep.explanation}`,
            acceptText: 'Approve & Execute',
            tool: {
              tool: 'ai.reasoning.approve',
              input: { step: firstStep, plan }
            }
          }],
          message: 'AI reasoning loop requires approval'
        };
      }

      // Execute first step directly if no approval needed
      const result = await this.executeStep(firstStep, context);
      
      if (result.success) {
        return {
          kind: 'suggestion',
          text: `Executing: ${firstStep.explanation}`,
          acceptText: 'Execute',
          tool: {
            tool: 'ai.reasoning.execute',
            input: { step: firstStep, context }
          }
        };
      }

      return null;
    } catch (error) {
      console.error('[AIReasoningLoop] Slow loop failed:', error);
      return null;
    }
  }

  /**
   * Check if we should trigger the slow AI loop
   */
  private shouldTriggerSlowLoop(event: any): boolean {
    if (!this.slowLoopEnabled) return false;
    
    const now = Date.now();
    
    // Don't run too frequently (at least 30 seconds between runs)
    if (now - this.lastSlowLoopRun < 30000) {
      return false;
    }
    
    // Trigger on repeated failures
    if (this.errorCountLastHour >= 3) {
      return true;
    }
    
    // Trigger on explicit user request
    if (event?.triggerAI) {
      return true;
    }
    
    // Trigger on high-severity errors
    if (event?.severity === 'high') {
      return true;
    }
    
    return false;
  }

  /**
   * Generate AI-powered plan
   */
  private async generatePlan(goal: Goal, context: Context): Promise<Plan | null> {
    try {
      // Check cache first
      const cacheKey = this.getCacheKey(goal, context);
      if (this.planCache.has(cacheKey)) {
        return this.planCache.get(cacheKey)!;
      }

      // Generate plan using AI reasoning
      const plan = await this.aiPlanner.generatePlan(goal, context);
      
      // Cache the plan
      if (plan) {
        this.planCache.set(cacheKey, plan);
        
        // Clear cache after 5 minutes
        setTimeout(() => {
          this.planCache.delete(cacheKey);
        }, 300000);
      }
      
      return plan;
    } catch (error) {
      console.error('[AIReasoningLoop] Plan generation failed:', error);
      return null;
    }
  }

  /**
   * AI Planner implementation (simplified for now)
   */
  private aiPlanner = {
    async generatePlan(goal: Goal, context: Context): Promise<Plan | null> {
      // This would integrate with your AI service
      // For now, implement rule-based planning based on common patterns
      
      const steps: PlanStep[] = [];
      
      // Handle common error patterns
      if (context.lastShell?.exitCode !== 0) {
        const error = context.lastShell.stderrTail;
        
        if (error.includes('EADDRINUSE')) {
          steps.push({
            intent: 'Fix port conflict',
            tool: 'process.list',
            args: { filter: 'port' },
            expectedSignal: 'port_conflict_identified',
            explanation: 'Identify process using the port',
            rollback: { intent: 'Rollback port fix', tool: 'shell.run', args: { cmd: 'echo "Manual intervention required"' } }
          });
          
          steps.push({
            intent: 'Kill conflicting process',
            tool: 'shell.run',
            args: { cmd: 'kill -9 {{pid}}' },
            expectedSignal: 'port_freed',
            explanation: 'Kill the process using the port',
            rollback: { intent: 'Restart service', tool: 'shell.run', args: { cmd: 'start_service' } }
          });
        }
        
        if (error.includes('MODULE_NOT_FOUND')) {
          steps.push({
            intent: 'Install missing module',
            tool: 'shell.run',
            args: { cmd: 'npm install {{missing_module}}' },
            expectedSignal: 'module_installed',
            explanation: 'Install the missing npm module',
            rollback: { intent: 'Uninstall module', tool: 'shell.run', args: { cmd: 'npm uninstall {{missing_module}}' } }
          });
        }
        
        if (error.includes('whenReady')) {
          steps.push({
            intent: 'Wait for service',
            tool: 'shell.run',
            args: { cmd: 'sleep 5 && curl -f http://localhost:3000/health' },
            expectedSignal: 'service_ready',
            explanation: 'Wait for service to be ready',
            rollback: { intent: 'Check service status', tool: 'shell.run', args: { cmd: 'curl -f http://localhost:3000/health || echo "Service down"' } }
          });
        }
      }
      
      if (steps.length === 0) {
        return null; // No plan needed
      }
      
      return {
        goal,
        steps,
        estimatedTime: steps.length * 30, // 30 seconds per step
        riskLevel: this.calculateRiskLevel(steps)
      };
    }
  };

  /**
   * Execute a single plan step
   */
  private async executeStep(step: PlanStep, context: Context): Promise<Result> {
    try {
      console.log(`[AIReasoningLoop] Executing: ${step.explanation}`);
      
      // Execute based on tool type
      let output: any;
      
      switch (step.tool) {
        case 'shell.run':
          output = await this.executeShellCommand(step.args.cmd, context.cwd);
          break;
          
        case 'process.list':
          output = await this.listProcesses(step.args.filter);
          break;
          
        case 'git.status':
          output = await this.getGitStatus(context.cwd);
          break;
          
        default:
          throw new Error(`Unknown tool: ${step.tool}`);
      }
      
      // Check if we got the expected signal
      const signal = this.interpretOutput(step.expectedSignal, output);
      
      return {
        success: true,
        output,
        signal,
        continue: true
      };
      
    } catch (error) {
      console.error('[AIReasoningLoop] Step execution failed:', error);
      
      return {
        success: false,
        error: error.message,
        continue: false,
        escalate: true
      };
    }
  }

  /**
   * Check if a step requires user approval
   */
  private requiresApproval(step: PlanStep): boolean {
    if (!this.userApprovalRequired) return false;
    
    // Always require approval for risky operations
    if (this.riskGuardrailsEnabled) {
      const riskyPatterns = [
        /rm\s+/,
        /sudo\s+/,
        /chmod\s+/,
        /kill\s+-?\s*\d+/,
        /systemctl\s+(stop|restart|reload)/
      ];
      
      const command = step.args.cmd || '';
      return riskyPatterns.some(pattern => pattern.test(command));
    }
    
    return false;
  }

  /**
   * Create approval request
   */
  private createApprovalRequest(step: PlanStep, goal: Goal): ApprovalRequest {
    return {
      step,
      explanation: `${goal.description}: ${step.explanation}`,
      riskLevel: this.calculateRiskLevel([step]),
      command: step.args.cmd
    };
  }

  /**
   * Build context for planning
   */
  private async buildContext(): Promise<Context> {
    const cwd = stateManager.getWorkingDirectory();
    
    // Get git status
    let gitState;
    try {
      const { execSync } = require('child_process');
      const branch = execSync('git branch --show-current', { cwd, encoding: 'utf8' }).trim();
      const status = execSync('git status --porcelain', { cwd, encoding: 'utf8' }).trim();
      
      gitState = {
        isRepo: true,
        branch,
        dirty: status.length > 0
      };
    } catch {
      gitState = { isRepo: false };
    }
    
    return {
      cwd,
      lastShell: stateManager.getLastShellEvent(),
      git: gitState,
      node: {
        hasPackageJson: require('fs').existsSync('./package.json')
      },
      agentHealth: {
        ok: true,
        recentlyCrashed: stateManager.getCrashCountLastHour() > 0,
        restartCount1h: stateManager.getCrashCountLastHour()
      },
      errorHistory: this.getErrorHistory()
    };
  }

  /**
   * Extract goal from context
   */
  private extractGoal(context: Context): Goal {
    const lastError = context.errorHistory?.[context.errorHistory.length - 1];
    
    if (lastError) {
      return {
        description: `Fix error: ${lastError.error}`,
        context: lastError,
        priority: 'high'
      };
    }
    
    if (context.lastShell?.exitCode !== 0) {
      return {
        description: 'Resolve command failure',
        context: context.lastShell,
        priority: 'medium'
      };
    }
    
    return {
      description: 'Optimize workflow',
      priority: 'low'
    };
  }

  /**
   * Track errors for pattern recognition
   */
  private trackError(event: any) {
    const now = Date.now();
    
    // Add to error history
    if (!stateManager.getErrorHistory) {
      stateManager.getErrorHistory = () => [];
    }
    
    const errorHistory = stateManager.getErrorHistory();
    errorHistory.push({
      timestamp: now,
      command: event.cmd,
      error: event.stderr
    });
    
    // Keep only last 10 errors
    if (errorHistory.length > 10) {
      errorHistory.shift();
    }
    
    // Count errors in last hour
    const oneHourAgo = now - (60 * 60 * 1000);
    this.errorCountLastHour = errorHistory.filter(e => e.timestamp > oneHourAgo).length;
  }

  /**
   * Calculate risk level for a plan
   */
  private calculateRiskLevel(steps: PlanStep[]): 'low' | 'medium' | 'high' {
    const highRiskTools = ['shell.run', 'git.push', 'npm.publish'];
    const mediumRiskTools = ['file.write', 'file.delete', 'process.kill'];
    
    const hasHighRisk = steps.some(step => highRiskTools.includes(step.tool));
    if (hasHighRisk) return 'high';
    
    const hasMediumRisk = steps.some(step => mediumRiskTools.includes(step.tool));
    if (hasMediumRisk) return 'medium';
    
    return 'low';
  }

  /**
   * Helper methods for tool execution
   */
  private async executeShellCommand(cmd: string, cwd: string): Promise<any> {
    const { execSync } = require('child_process');
    return execSync(cmd, { cwd, encoding: 'utf8' });
  }

  private async listProcesses(filter?: string): Promise<any> {
    const { execSync } = require('child_process');
    const output = execSync('ps aux', { encoding: 'utf8' });
    const lines = output.split('\n');
    
    if (filter === 'port') {
      return lines.filter(line => line.includes(':3000') || line.includes(':8080'));
    }
    
    return lines;
  }

  private async getGitStatus(cwd: string): Promise<any> {
    const { execSync } = require('child_process');
    return execSync('git status --porcelain', { cwd, encoding: 'utf8' });
  }

  private interpretOutput(expectedSignal: string, output: any): string {
    // Simple signal interpretation
    if (expectedSignal === 'port_conflict_identified' && typeof output === 'string') {
      return output.includes(':3000') ? 'port_conflict_identified' : 'no_conflict';
    }
    
    if (expectedSignal === 'service_ready') {
      return 'service_ready';
    }
    
    return 'completed';
  }

  private getCacheKey(goal: Goal, context: Context): string {
    return `${goal.description}:${context.cwd}:${context.lastShell?.cmd || 'none'}`;
  }

  private getErrorHistory(): any[] {
    // This would integrate with state manager
    return [];
  }
}

// Global instance
export const aiReasoningLoop = new AIReasoningLoop();
