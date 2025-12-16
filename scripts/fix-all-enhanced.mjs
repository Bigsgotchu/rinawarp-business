#!/usr/bin/env node

/**
 * Enhanced Fix Everything System - Master Orchestrator
 * Comprehensive single script that coordinates all linting tools and auto-fixers
 *
 * Features:
 * - ESLint (JavaScript/TypeScript)
 * - Stylelint (CSS/SCSS/Less)
 * - Prettier (Code formatting)
 * - Markdown Auto-Fixer (.mjs ESM)
 * - CSS Logical Properties Fixer
 * - CSS Physical Properties Normalizer (for legal HTMLs)
 * - cspell (Spell checking)
 * - TypeScript type checking
 * - Dependency validation
 * - Comprehensive reporting
 *
 * Usage:
 *   node scripts/fix-all-enhanced.mjs
 *   node scripts/fix-all-enhanced.mjs --dry-run
 *   node scripts/fix-all-enhanced.mjs --only-eslint
 *   node scripts/fix-all-enhanced.mjs --only-markdown
 *   node scripts/fix-all-enhanced.mjs --only-css
 *   node scripts/fix-all-enhanced.mjs --skip-git
 *   node scripts/fix-all-enhanced.mjs --verbose
 */

import { execSync, spawn } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { globSync } from 'glob';
import { relative, join } from 'path';

class EnhancedFixOrchestrator {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;
    this.onlyTarget = options.onlyTarget || null;
    this.skipGit = options.skipGit || false;
    this.failedTasks = [];
    this.completedTasks = [];
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
    const prefix =
      {
        info: '🔧',
        success: '✅',
        warning: '⚠️',
        error: '❌',
        task: '🎯',
      }[type] || '🔧';

    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  async runCommand(command, description, options = {}) {
    return new Promise((resolve, reject) => {
      this.log(`Starting: ${description}`, 'task');

      if (this.dryRun) {
        this.log(`[DRY RUN] Would execute: ${command}`, 'warning');
        this.completedTasks.push({ name: description, status: 'dry-run' });
        return resolve({ dryRun: true });
      }

      const args = command.split(' ').filter((arg) => arg.length > 0);
      const executable = args.shift();

      const child = spawn(executable, args, {
        stdio: 'pipe',
        ...options,
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
        if (this.verbose) {
          process.stdout.write(data);
        }
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
        if (this.verbose) {
          process.stderr.write(data);
        }
      });

      child.on('close', (code) => {
        if (code === 0) {
          this.log(`Completed: ${description}`, 'success');
          this.completedTasks.push({ name: description, status: 'success', code });
          resolve({ code, stdout, stderr });
        } else {
          this.log(`Failed: ${description} (exit code: ${code})`, 'error');
          this.completedTasks.push({ name: description, status: 'failed', code });
          reject(new Error(`${description} failed with exit code ${code}: ${stderr}`));
        }
      });

      child.on('error', (error) => {
        this.log(`Error: ${description} - ${error.message}`, 'error');
        this.completedTasks.push({ name: description, status: 'error', error: error.message });
        reject(error);
      });
    });
  }

  checkRequirements() {
    this.log('Checking system requirements...', 'info');

    const requirements = [
      { name: 'Node.js', command: 'node --version' },
      { name: 'pnpm', command: 'pnpm --version' },
      { name: 'npm (fallback)', command: 'npm --version' },
    ];

    for (const req of requirements) {
      try {
        const version = execSync(req.command, { encoding: 'utf8' }).trim();
        this.log(`${req.name}: ${version}`, 'success');
      } catch (error) {
        this.log(`${req.name}: Not found`, 'warning');
      }
    }
  }

  checkDependencies() {
    this.log('Checking dependencies...', 'info');

    const devDeps = [
      'eslint',
      'prettier',
      'stylelint',
      'cspell',
      'markdownlint',
      'typescript',
      'glob',
    ];

    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    const installed = Object.keys(packageJson.devDependencies || {});

    for (const dep of devDeps) {
      if (installed.includes(dep)) {
        this.log(`✓ ${dep} - Installed`, 'success');
      } else {
        this.log(`✗ ${dep} - Missing`, 'warning');
        this.failedTasks.push({ task: `Dependency check`, issue: `Missing ${dep}` });
      }
    }
  }

  async runESLint() {
    if (this.onlyTarget && this.onlyTarget !== 'eslint') return;

    try {
      await this.runCommand('pnpm lint:fix', 'ESLint - Fix JavaScript/TypeScript');
      await this.runCommand('pnpm lint:ci', 'ESLint - Check for warnings');
    } catch (error) {
      this.failedTasks.push({ task: 'ESLint', issue: error.message });
    }
  }

  async runStylelint() {
    if (this.onlyTarget && this.onlyTarget !== 'stylelint') return;

    try {
      await this.runCommand('pnpm lint:css:fix', 'Stylelint - Fix CSS/SCSS/Less');
    } catch (error) {
      this.failedTasks.push({ task: 'Stylelint', issue: error.message });
    }
  }

  async runPrettier() {
    if (this.onlyTarget && this.onlyTarget !== 'prettier') return;

    try {
      await this.runCommand('pnpm format', 'Prettier - Format code');
      await this.runCommand('pnpm format:check', 'Prettier - Check formatting');
    } catch (error) {
      this.failedTasks.push({ task: 'Prettier', issue: error.message });
    }
  }

  async runMarkdownFixer() {
    if (this.onlyTarget && this.onlyTarget !== 'markdown') return;

    try {
      const args = this.dryRun ? '--dry-run' : '';
      await this.runCommand(`pnpm fix:md ${args}`, 'Markdown Auto-Fixer');
    } catch (error) {
      this.failedTasks.push({ task: 'Markdown Fixer', issue: error.message });
    }
  }

  async runCSSLogicalFixer() {
    if (this.onlyTarget && this.onlyTarget !== 'css-logical') return;

    try {
      const args = this.dryRun ? '--dry-run' : '';
      await this.runCommand(`pnpm fix:css-logical ${args}`, 'CSS Logical Properties Fixer');
    } catch (error) {
      this.failedTasks.push({ task: 'CSS Logical Fixer', issue: error.message });
    }
  }

  async runCSSPhysicalFixer() {
    if (this.onlyTarget && this.onlyTarget !== 'css-physical') return;

    try {
      const args = this.dryRun ? '--dry-run' : '';
      await this.runCommand(`pnpm fix:css-physical ${args}`, 'CSS Physical Properties Normalizer');
    } catch (error) {
      this.failedTasks.push({ task: 'CSS Physical Fixer', issue: error.message });
    }
  }

  async runSpellCheck() {
    if (this.onlyTarget && this.onlyTarget !== 'spell') return;

    try {
      await this.runCommand('pnpm spell:fix', 'cspell - Fix spelling');
    } catch (error) {
      this.failedTasks.push({ task: 'Spell Check', issue: error.message });
    }
  }

  async runTypeScriptCheck() {
    if (this.onlyTarget && this.onlyTarget !== 'typescript') return;

    try {
      await this.runCommand('pnpm -r run typecheck', 'TypeScript - Type checking');
    } catch (error) {
      this.failedTasks.push({ task: 'TypeScript Check', issue: error.message });
    }
  }

  async runDependencyCheck() {
    if (this.onlyTarget && this.onlyTarget !== 'deps') return;

    try {
      await this.runCommand('pnpm deps:check', 'Dependency validation');
    } catch (error) {
      this.failedTasks.push({ task: 'Dependency Check', issue: error.message });
    }
  }

  async commitChanges() {
    if (this.skipGit || this.dryRun) return;

    try {
      // Check if there are changes to commit
      const status = execSync('git status --porcelain', { encoding: 'utf8' });

      if (status.trim()) {
        this.log('Git changes detected, committing...', 'info');
        await this.runCommand('git add .', 'Git - Add changes');
        await this.runCommand(
          'git commit -m "style: auto-fix linting and formatting issues"',
          'Git - Commit changes',
        );
      } else {
        this.log('No git changes to commit', 'info');
      }
    } catch (error) {
      this.log(`Git commit failed: ${error.message}`, 'warning');
    }
  }

  generateReport() {
    const duration = Date.now() - this.startTime;
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);

    this.log('\n📊 ENHANCED FIX EVERYTHING SYSTEM REPORT', 'info');
    this.log('================================================', 'info');
    this.log(`⏱️  Total execution time: ${minutes}m ${seconds}s`, 'info');
    this.log(`✅ Tasks completed: ${this.completedTasks.length}`, 'info');
    this.log(`❌ Tasks failed: ${this.failedTasks.length}`, 'info');

    if (this.completedTasks.length > 0) {
      this.log('\n✅ Completed Tasks:', 'success');
      this.completedTasks.forEach((task, index) => {
        const status = task.status === 'dry-run' ? '[DRY RUN]' : '[SUCCESS]';
        this.log(`  ${index + 1}. ${status} ${task.name}`, 'success');
      });
    }

    if (this.failedTasks.length > 0) {
      this.log('\n❌ Failed Tasks:', 'error');
      this.failedTasks.forEach((task, index) => {
        this.log(`  ${index + 1}. ${task.task}: ${task.issue}`, 'error');
      });
    }

    if (this.dryRun) {
      this.log('\n📋 DRY RUN MODE - No changes were applied', 'warning');
      this.log('💡 Review the output above and run without --dry-run to apply fixes', 'info');
    }

    if (this.failedTasks.length === 0) {
      this.log('\n🎉 ALL TASKS COMPLETED SUCCESSFULLY!', 'success');
      this.log('🎯 Repository is now clean and properly formatted', 'success');
    } else {
      this.log('\n⚠️  SOME TASKS FAILED - Please review the errors above', 'warning');
      this.log('🔧 Fix the issues manually or check the task-specific scripts', 'info');
    }

    return {
      success: this.failedTasks.length === 0,
      duration,
      completedTasks: this.completedTasks.length,
      failedTasks: this.failedTasks.length,
      dryRun: this.dryRun,
    };
  }

  async run() {
    this.log('🚀 Starting Enhanced Fix Everything System...', 'info');
    this.log('📝 This will run all linting tools and auto-fixers', 'info');

    // Check requirements and dependencies
    this.checkRequirements();
    this.checkDependencies();

    // Define the execution order
    const tasks = [
      { name: 'eslint', fn: () => this.runESLint() },
      { name: 'stylelint', fn: () => this.runStylelint() },
      { name: 'prettier', fn: () => this.runPrettier() },
      { name: 'markdown', fn: () => this.runMarkdownFixer() },
      { name: 'css-logical', fn: () => this.runCSSLogicalFixer() },
      { name: 'css-physical', fn: () => this.runCSSPhysicalFixer() },
      { name: 'spell', fn: () => this.runSpellCheck() },
      { name: 'typescript', fn: () => this.runTypeScriptCheck() },
      { name: 'deps', fn: () => this.runDependencyCheck() },
    ];

    // Run tasks in sequence
    for (const task of tasks) {
      try {
        await task.fn();
      } catch (error) {
        this.log(`Task ${task.name} failed: ${error.message}`, 'error');
      }
    }

    // Commit changes if successful
    if (this.failedTasks.length === 0) {
      await this.commitChanges();
    }

    // Generate final report
    return this.generateReport();
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  const options = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    skipGit: args.includes('--skip-git'),
    onlyTarget: args.find((arg) => arg.startsWith('--only-'))?.replace('--only-', null) || null,
  };

  const orchestrator = new EnhancedFixOrchestrator(options);

  orchestrator
    .run()
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}

export default EnhancedFixOrchestrator;
