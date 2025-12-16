// RinaWarp Terminal Pro - Silent AI Integration
// Automatically integrates technical knowledge without user interaction

import {
  CORE_TECHNICAL_KNOWLEDGE,
  AUTO_DETECTION_RULES,
  AUTO_FIX_COMMANDS,
  KNOWLEDGE_INTEGRATION,
} from './core-knowledge.js';

// Silent AI Integration Class
class SilentAIIntegration {
  constructor() {
    this.knowledgeBase = CORE_TECHNICAL_KNOWLEDGE;
    this.detectionRules = AUTO_DETECTION_RULES;
    this.autoFixCommands = AUTO_FIX_COMMANDS;
    this.integration = KNOWLEDGE_INTEGRATION;
    this.isActive = false;
    this.terminalState = {};
    this.lastAnalysis = null;
  }

  // Automatically integrate into terminal
  autoIntegrate(terminal) {
    if (this.isActive) return;

    // Hook into terminal input processing
    this.hookIntoTerminal(terminal);

    // Start silent monitoring
    this.startSilentMonitoring();

    // Auto-analyze on startup
    setTimeout(() => this.silentAnalyze(), 2000);

    this.isActive = true;
  }

  // Hook into terminal without user knowing
  hookIntoTerminal(terminal) {
    // Store original functions
    const originalProcessInput = terminal.processInput;
    const originalExecuteCommand = terminal.executeCommand;

    // Override terminal input processing
    terminal.processInput = (input) => {
      // Process normally
      if (originalProcessInput) {
        originalProcessInput(input);
      }

      // Silently analyze and suggest
      setTimeout(() => this.silentAnalyzeAndSuggest(input), 300);
    };

    // Override command execution
    terminal.executeCommand = (command) => {
      // Execute normally
      if (originalExecuteCommand) {
        originalExecuteCommand(command);
      }

      // Silently analyze command results
      setTimeout(() => this.silentAnalyzeCommand(command), 500);
    };
  }

  // Silent analysis - no output unless critical issues found
  silentAnalyze() {
    const analysis = this.analyzeProjectState();
    const issues = this.detectCriticalIssues(analysis);

    if (issues.length > 0) {
      this.showCriticalIssues(issues);
    }
  }

  // Silent analysis and suggestion
  silentAnalyzeAndSuggest(input) {
    const analysis = this.analyzeProjectState();
    const issues = this.detectCriticalIssues(analysis);

    // Only show suggestions if critical issues detected
    if (issues.length > 0) {
      this.showSuggestions(issues);
    }
  }

  // Silent command analysis
  silentAnalyzeCommand(command) {
    // Analyze command for potential issues
    if (command.includes('npm install') && !command.includes('--save')) {
      this.showWarning('Consider using --save or --save-dev for dependencies');
    }

    if (command.includes('localhost') && !command.includes('test')) {
      this.showWarning(
        'Consider using environment variables instead of hardcoded localhost'
      );
    }

    if (command.includes('rm -rf') && command.includes('node_modules')) {
      this.showWarning(
        "Be careful with node_modules deletion - ensure you're in the right directory"
      );
    }
  }

  // Analyze project state
  analyzeProjectState() {
    return {
      fileCount: this.getFileCount(),
      deployScripts: this.getDeployScriptCount(),
      nodeModules: this.getNodeModulesCount(),
      localhostRefs: this.getLocalhostReferences(),
      dependencySize: this.getDependencySize(),
      deprecatedTags: this.getDeprecatedTags(),
    };
  }

  // Detect critical issues
  detectCriticalIssues(analysis) {
    const issues = [];

    // Check file count
    if (analysis.fileCount > this.detectionRules.fileCount.critical) {
      issues.push({
        type: 'fileCount',
        severity: 'critical',
        message: `Too many files (${analysis.fileCount}) - consider cleanup`,
        action: this.detectionRules.fileCount.action,
      });
    }

    // Check deployment scripts
    if (analysis.deployScripts > this.detectionRules.deployScripts.critical) {
      issues.push({
        type: 'deployScripts',
        severity: 'critical',
        message: `Too many deployment scripts (${analysis.deployScripts}) - consolidate`,
        action: this.detectionRules.deployScripts.action,
      });
    }

    // Check node modules
    if (analysis.nodeModules > this.detectionRules.nodeModules.critical) {
      issues.push({
        type: 'nodeModules',
        severity: 'critical',
        message: `node_modules in multiple locations (${analysis.nodeModules}) - consolidate`,
        action: this.detectionRules.nodeModules.action,
      });
    }

    // Check localhost references
    if (analysis.localhostRefs > this.detectionRules.localhostRefs.critical) {
      issues.push({
        type: 'localhostRefs',
        severity: 'critical',
        message: `Hardcoded localhost URLs (${analysis.localhostRefs}) - use environment variables`,
        action: this.detectionRules.localhostRefs.action,
      });
    }

    return issues;
  }

  // Show critical issues
  showCriticalIssues(issues) {
    console.log('\n🚨 RinaWarp AI detected critical issues:');
    issues.forEach((issue) => {
      console.log(`  • ${issue.message}`);
    });

    console.log('\n💡 Suggested actions:');
    issues.forEach((issue) => {
      console.log(`  • ${issue.action}`);
    });

    // Show auto-fix commands if available
    const autoFixes = this.generateAutoFixes(issues);
    if (autoFixes.length > 0) {
      console.log('\n🔧 Auto-fix commands available:');
      autoFixes.forEach((fix) => {
        console.log(`  ${fix}`);
      });
    }
  }

  // Show suggestions
  showSuggestions(issues) {
    console.log('\n🤖 RinaWarp AI suggestions:');
    issues.forEach((issue) => {
      console.log(`  • ${issue.message}`);
    });
  }

  // Show warning
  showWarning(message) {
    console.log(`\n⚠️  RinaWarp AI: ${message}`);
  }

  // Generate auto-fix commands
  generateAutoFixes(issues) {
    const fixes = [];

    issues.forEach((issue) => {
      switch (issue.type) {
        case 'fileCount':
          fixes.push(...this.autoFixCommands.cleanup);
          break;
        case 'deployScripts':
          fixes.push(...this.autoFixCommands.consolidate);
          break;
        case 'localhostRefs':
          fixes.push(...this.autoFixCommands.configuration);
          break;
        case 'nodeModules':
          fixes.push(...this.autoFixCommands.dependencies);
          break;
      }
    });

    return fixes;
  }

  // Start silent monitoring
  startSilentMonitoring() {
    // Monitor file changes every 30 seconds
    setInterval(() => {
      const newAnalysis = this.analyzeProjectState();
      if (this.hasSignificantChanges(newAnalysis)) {
        this.lastAnalysis = newAnalysis;
        this.silentAnalyze();
      }
    }, 30000);
  }

  // Check for significant changes
  hasSignificantChanges(newAnalysis) {
    if (!this.lastAnalysis) return true;

    return (
      Math.abs(newAnalysis.fileCount - this.lastAnalysis.fileCount) > 100 ||
      newAnalysis.deployScripts !== this.lastAnalysis.deployScripts ||
      newAnalysis.nodeModules !== this.lastAnalysis.nodeModules ||
      newAnalysis.localhostRefs !== this.lastAnalysis.localhostRefs
    );
  }

  // Utility functions for analysis
  getFileCount() {
    try {
      const { execSync } = require('child_process');
      return parseInt(execSync('find . -type f | wc -l', { encoding: 'utf8' }));
    } catch {
      return 0;
    }
  }

  getDeployScriptCount() {
    try {
      const { execSync } = require('child_process');
      return parseInt(
        execSync('find . -name "*deploy*.sh" | wc -l', { encoding: 'utf8' })
      );
    } catch {
      return 0;
    }
  }

  getNodeModulesCount() {
    try {
      const { execSync } = require('child_process');
      return parseInt(
        execSync('find . -name node_modules -type d | wc -l', {
          encoding: 'utf8',
        })
      );
    } catch {
      return 0;
    }
  }

  getLocalhostReferences() {
    try {
      const { execSync } = require('child_process');
      return parseInt(
        execSync(
          'grep -r "localhost" . --include="*.js" --include="*.html" | wc -l',
          { encoding: 'utf8' }
        )
      );
    } catch {
      return 0;
    }
  }

  getDependencySize() {
    try {
      const { execSync } = require('child_process');
      const size = execSync('du -sh node_modules 2>/dev/null | cut -f1', {
        encoding: 'utf8',
      });
      return this.parseSize(size);
    } catch {
      return 0;
    }
  }

  getDeprecatedTags() {
    try {
      const { execSync } = require('child_process');
      return parseInt(
        execSync('grep -r "apple-mobile-web-app-capable" . | wc -l', {
          encoding: 'utf8',
        })
      );
    } catch {
      return 0;
    }
  }

  parseSize(sizeStr) {
    if (sizeStr.includes('G')) {
      return parseFloat(sizeStr) * 1000000000;
    } else if (sizeStr.includes('M')) {
      return parseFloat(sizeStr) * 1000000;
    } else if (sizeStr.includes('K')) {
      return parseFloat(sizeStr) * 1000;
    }
    return parseInt(sizeStr);
  }
}

// Create and export silent AI instance
const silentAI = new SilentAIIntegration();

// Auto-integrate if in browser environment
if (typeof window !== 'undefined') {
  // Wait for terminal to be available
  const checkTerminal = () => {
    if (window.terminal) {
      silentAI.autoIntegrate(window.terminal);
      console.log('🧠 RinaWarp AI knowledge base silently integrated');
    } else {
      setTimeout(checkTerminal, 1000);
    }
  };
  checkTerminal();
}

export default silentAI;
