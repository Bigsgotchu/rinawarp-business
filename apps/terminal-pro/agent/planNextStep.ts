import { PlanningContext, RuleResult, NextStep, LastShellEvent } from "./types";

// Error pattern regexes for common development issues
const ERROR_PATTERNS = {
  whenReady: /whenReady/i,
  eaddrinuse: /EADDRINUSE/i,
  modNotFound: /MODULE_NOT_FOUND|Cannot find module/i,
  refused: /ECONNREFUSED|fetch failed|ENOTFOUND/i,
  typeError: /TypeError:/i,
  syntaxError: /SyntaxError:/i
};

/**
 * Analyze recent terminal events and project context to suggest next steps
 * without calling an LLM. Uses scored heuristic rules.
 */
export function planNextStep(ctx: PlanningContext): NextStep {
  const rules: RuleResult[] = [];
  
  // Rule A1: Common Node/Electron errors (highest priority)
  if (ctx.lastShell && ctx.lastShell.exitCode !== 0) {
    const errorAnalysis = analyzeError(ctx.lastShell);
    rules.push(...errorAnalysis);
  }
  
  // Rule A2: Build/test failing
  if (ctx.lastShell && isBuildCommand(ctx.lastShell.cmd) && ctx.lastShell.exitCode !== 0) {
    rules.push({
      score: 85,
      next: {
        kind: "suggestion",
        label: "Fix build/test failure",
        detail: "Build or test command failed. Check the error output above for details.",
        acceptText: "Review build errors",
        tool: { tool: "shell.run", input: { cmd: "echo 'Check terminal output above for specific error details'" } }
      }
    });
  }
  
  // Rule B1: Git hygiene - dirty repo with meaningful changes
  if (ctx.git?.isRepo && ctx.git.dirty) {
    rules.push({
      score: 70,
      next: {
        kind: "checklist",
        label: "Ship your changes",
        items: [
          { label: "Review status", acceptText: "git status", tool: { tool: "git.status", input: { cwd: ctx.cwd } } },
          { label: "Review diff", acceptText: "git diff", tool: { tool: "git.diff", input: { cwd: ctx.cwd } } },
          { label: "Commit changes", acceptText: "git commit -am \"Update\"" }
        ]
      }
    });
  }
  
  // Rule B2: Git ahead/behind
  if (ctx.git?.isRepo && ctx.git.ahead > 0) {
    rules.push({
      score: 60,
      next: {
        kind: "suggestion",
        label: "Push your branch",
        acceptText: "git push",
        detail: `Your branch is ${ctx.git.ahead} commit(s) ahead of remote`
      }
    });
  }
  
  if (ctx.git?.isRepo && ctx.git.behind > 0) {
    rules.push({
      score: 58,
      next: {
        kind: "suggestion",
        label: "Pull remote changes",
        acceptText: "git pull",
        detail: `Your branch is ${ctx.git.behind} commit(s) behind remote`
      }
    });
  }
  
  // Rule C1: Agent health issues
  if (ctx.agentHealth?.recentlyCrashed || (ctx.agentHealth?.restartCount1h ?? 0) > 2) {
    rules.push({
      score: 65,
      next: {
        kind: "suggestion",
        label: "Stabilize agent (recent restarts)",
        acceptText: "Check agent logs",
        tool: { tool: "shell.run", input: { cmd: "tail -n 50 ~/.rinawarp/agent.log 2>/dev/null || echo 'No agent logs found'" } }
      }
    });
  }
  
  // Rule D1: Dev loop niceties - after successful npm install
  if (ctx.node?.hasPackageJson && ctx.lastShell && 
      ctx.lastShell.cmd.includes('npm install') && ctx.lastShell.exitCode === 0) {
    rules.push({
      score: 45,
      next: {
        kind: "suggestion",
        label: "Start development server",
        acceptText: "npm run dev",
        detail: "Dependencies installed successfully"
      }
    });
  }
  
  // Rule D2: After successful build
  if (ctx.lastShell && isBuildCommand(ctx.lastShell.cmd) && ctx.lastShell.exitCode === 0) {
    rules.push({
      score: 40,
      next: {
        kind: "suggestion",
        label: "Start application",
        acceptText: "npm start"
      }
    });
  }
  
  // Rule D3: After successful tests
  if (ctx.lastShell && ctx.lastShell.cmd.includes('test') && ctx.lastShell.exitCode === 0) {
    rules.push({
      score: 35,
      next: {
        kind: "suggestion",
        label: "Tests passed! Consider version bump",
        acceptText: "npm version patch"
      }
    });
  }
  
  // Rule D4: General development suggestions
  if (ctx.node?.hasPackageJson && !ctx.lastShell?.cmd.includes('npm')) {
    rules.push({
      score: 20,
      next: {
        kind: "suggestion",
        label: "Check available scripts",
        acceptText: "npm run",
        detail: "See what scripts are available in package.json"
      }
    });
  }
  
  if (!rules.length) {
    return { kind: "none", reason: "No obvious next step detected" };
  }
  
  // Sort by score (highest first) and return top result
  rules.sort((a, b) => b.score - a.score);
  return rules[0].next;
}

/**
 * Analyze error output and return relevant rule suggestions
 */
function analyzeError(lastShell: LastShellEvent): RuleResult[] {
  const results: RuleResult[] = [];
  const stderr = lastShell.stderrTail || "";
  
  // Electron whenReady error
  if (ERROR_PATTERNS.whenReady.test(stderr)) {
    results.push({
      score: 100,
      next: {
        kind: "suggestion",
        label: "Fix Electron app init (whenReady undefined)",
        detail: "Ensure electron `app` is imported correctly and not shadowed. Check main process initialization order.",
        acceptText: "Check main process file",
        tool: { tool: "shell.run", input: { cmd: "find . -name 'main.js' -o -name 'main.ts' | head -5" } }
      }
    });
  }
  
  // Port already in use
  if (ERROR_PATTERNS.eaddrinuse.test(stderr)) {
    results.push({
      score: 95,
      next: {
        kind: "suggestion",
        label: "Free the port (EADDRINUSE)",
        detail: "Another process is already using this port",
        acceptText: "Find process using port",
        tool: { tool: "shell.run", input: { cmd: "lsof -iTCP -sTCP:LISTEN -P -n | head -20" } }
      }
    });
  }
  
  // Module not found
  if (ERROR_PATTERNS.modNotFound.test(stderr) && isNodeProject()) {
    results.push({
      score: 92,
      next: {
        kind: "suggestion",
        label: "Install missing dependencies",
        detail: "Required module not found",
        acceptText: "npm install",
        tool: { tool: "shell.run", input: { cmd: "npm install" } }
      }
    });
  }
  
  // Network/connection errors
  if (ERROR_PATTERNS.refused.test(stderr)) {
    results.push({
      score: 90,
      next: {
        kind: "suggestion",
        label: "Check network/endpoint connectivity",
        detail: "Connection refused or network error",
        acceptText: "Check network configuration",
        tool: { tool: "shell.run", input: { cmd: "env | grep -E 'RINA_AI_ENDPOINT|HTTP_PROXY|HTTPS_PROXY' && echo '--- Testing connectivity ---' && (curl -fsS \"${RINA_AI_ENDPOINT:-http://localhost}/health\" 2>/dev/null || echo 'Endpoint not reachable')" } }
      }
    });
  }
  
  // TypeScript/JavaScript errors
  if (ERROR_PATTERNS.typeError.test(stderr) || ERROR_PATTERNS.syntaxError.test(stderr)) {
    results.push({
      score: 88,
      next: {
        kind: "suggestion",
        label: "Fix code error",
        detail: "TypeScript/JavaScript runtime error detected",
        acceptText: "Review error details",
        tool: { tool: "shell.run", input: { cmd: "echo 'Check the error output above for file and line number'" } }
      }
    });
  }
  
  return results;
}

/**
 * Check if command is a build/test command
 */
function isBuildCommand(cmd: string): boolean {
  const buildPatterns = [
    /npm\s+run\s+(build|test|typecheck|lint|check)/,
    /yarn\s+(build|test|lint)/,
    /pnpm\s+(build|test|lint)/,
    /npm\s+(build|test|lint)/,
    /vite\s+build/,
    /webpack/,
    /tsc/,
    /eslint/,
    /jest/,
    /vitest/
  ];
  
  return buildPatterns.some(pattern => pattern.test(cmd));
}

/**
 * Check if this looks like a Node.js project
 */
function isNodeProject(): boolean {
  try {
    // Simple check for package.json existence
    return require('fs').existsSync('./package.json');
  } catch {
    return false;
  }
}
