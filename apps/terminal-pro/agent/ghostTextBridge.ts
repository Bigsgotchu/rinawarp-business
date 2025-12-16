/**
 * GhostTextBridge - Real-time integration between agent planning and UI
 * Handles the complete flow: shell event → planning → ghost text → user action
 */

import { planNextStep } from './planNextStep';
import { stateManager } from './state-enhanced';
import { NextStep } from './types';

interface BridgeConfig {
  onSuggestion?: (suggestion: string, nextStep: NextStep) => void;
  onExecution?: (command: string) => void;
  shouldSuggest?: (context: any) => boolean;
}

export class GhostTextBridge {
  private config: BridgeConfig;
  private lastSuggestion = '';
  private suggestionCooldown = 0; // Prevent spam

  constructor(config: BridgeConfig = {}) {
    this.config = config;
  }

  /**
   * Main entry point - called after shell events to trigger planning
   */
  async handleShellEvent(event: any): Promise<void> {
    // Update state with latest shell event
    if (event.type === 'shell:exit') {
      stateManager.setLastShellEvent({
        cmd: event.cmd || stateManager.getLastCommand() || '',
        exitCode: event.code || 0,
        stdoutTail: event.stdout || '',
        stderrTail: event.stderr || '',
        durationMs: event.duration || 0,
      });
    }

    // Check if we should generate suggestions
    if (!this.config.shouldSuggest || this.config.shouldSuggest(event)) {
      await this.generateAndEmitSuggestion();
    }
  }

  /**
   * Generate suggestion based on current context
   */
  private async generateAndEmitSuggestion(): Promise<void> {
    try {
      // Rate limiting - don't suggest too frequently
      const now = Date.now();
      if (now - this.suggestionCooldown < 2000) {
        // 2 second cooldown
        return;
      }

      // Build planning context
      const context = await this.buildContext();

      // Get next step from heuristics
      const nextStep = planNextStep(context);

      // Extract suggestion text
      const suggestion = this.extractSuggestion(nextStep);

      if (suggestion && suggestion !== this.lastSuggestion) {
        this.lastSuggestion = suggestion;
        this.suggestionCooldown = now;

        // Emit to UI
        this.config.onSuggestion?.(suggestion, nextStep);

        console.log(`[GhostTextBridge] Suggestion: ${suggestion}`, nextStep);
      }
    } catch (error) {
      console.warn('[GhostTextBridge] Planning failed:', error);
    }
  }

  /**
   * Build context for planning from current state
   */
  private async buildContext() {
    const cwd = stateManager.getWorkingDirectory();

    // Check git status
    let gitState;
    try {
      const { execSync } = require('child_process');
      const branch = execSync('git branch --show-current', { cwd, encoding: 'utf8' }).trim();
      const status = execSync('git status --porcelain', { cwd, encoding: 'utf8' }).trim();
      const remote = execSync('git status --porcelain -b', { cwd, encoding: 'utf8' }).trim();

      const ahead = remote.match(/ahead (\d+)/)?.[1]
        ? parseInt(remote.match(/ahead (\d+)!/)?.[1] || '0')
        : 0;
      const behind = remote.match(/behind (\d+)/)?.[1]
        ? parseInt(remote.match(/behind (\d+)!/)?.[1] || '0')
        : 0;

      gitState = {
        isRepo: true,
        branch,
        dirty: status.length > 0,
        ahead,
        behind,
      };
    } catch {
      gitState = {
        isRepo: false,
        dirty: false,
        ahead: 0,
        behind: 0,
      };
    }

    // Check Node project status
    let nodeState;
    try {
      const { existsSync } = require('fs');
      const hasPackageJson = existsSync('./package.json');

      nodeState = {
        hasPackageJson,
        lastNpmScript: stateManager.getLastNpmCommand(),
        lastNpmExitCode: stateManager.getLastNpmExitCode(),
      };
    } catch {
      nodeState = {
        hasPackageJson: false,
      };
    }

    // Agent health
    const agentHealth = {
      ok: true,
      recentlyCrashed: stateManager.getCrashCountLastHour() > 0,
      restartCount1h: stateManager.getCrashCountLastHour(),
    };

    return {
      cwd,
      lastShell: stateManager.getLastShellEvent(),
      git: gitState,
      node: nodeState,
      agentHealth,
      recentUserActions: stateManager.getRecentUserActions(),
    };
  }

  /**
   * Extract actionable suggestion text from NextStep
   */
  private extractSuggestion(nextStep: NextStep): string {
    switch (nextStep.kind) {
      case 'suggestion':
        return nextStep.acceptText;

      case 'checklist':
        // Return first actionable item
        return nextStep.items[0]?.acceptText || '';

      case 'none':
      default:
        return '';
    }
  }

  /**
   * Handle user accepting a suggestion
   */
  async handleSuggestionAccepted(suggestion: string, originalNextStep: NextStep): Promise<void> {
    console.log(`[GhostTextBridge] User accepted: ${suggestion}`);

    // Execute the suggested action if it has a tool
    if (originalNextStep.kind === 'suggestion' && originalNextStep.tool) {
      await this.executeToolCall(originalNextStep.tool);
    } else if (originalNextStep.kind === 'checklist' && originalNextStep.items[0]?.tool) {
      await this.executeToolCall(originalNextStep.items[0].tool);
    }

    // Emit execution event
    this.config.onExecution?.(suggestion);
  }

  /**
   * Execute tool calls from suggestions
   */
  private async executeToolCall(tool: any): Promise<void> {
    try {
      switch (tool.tool) {
        case 'shell.run':
          // Execute shell command
          const { spawn } = require('child_process');
          const proc = spawn(tool.input.cmd, {
            cwd: tool.input.cwd || stateManager.getWorkingDirectory(),
            shell: true,
          });

          proc.on('exit', (code: number) => {
            console.log(`[GhostTextBridge] Tool executed with code: ${code}`);
          });
          break;

        case 'git.status':
        case 'git.diff':
          // Git commands will be handled by existing git tools
          console.log(`[GhostTextBridge] Git tool: ${tool.tool}`);
          break;

        case 'process.list':
        case 'system.info':
          // System tools will be handled by existing system tools
          console.log(`[GhostTextBridge] System tool: ${tool.tool}`);
          break;
      }
    } catch (error) {
      console.error('[GhostTextBridge] Tool execution failed:', error);
    }
  }

  /**
   * Clear current suggestion (when user dismisses)
   */
  clearSuggestion(): void {
    this.lastSuggestion = '';
    console.log('[GhostTextBridge] Suggestion cleared');
  }

  /**
   * Force refresh suggestion (for testing/debugging)
   */
  async refreshSuggestion(): Promise<void> {
    this.lastSuggestion = '';
    await this.generateAndEmitSuggestion();
  }
}

// Global bridge instance
export const ghostTextBridge = new GhostTextBridge();
