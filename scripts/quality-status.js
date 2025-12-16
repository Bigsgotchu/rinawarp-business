#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * Quality Status Checker
 * Provides a comprehensive overview of repository quality state
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

function log(message, color = RESET) {
  console.log(`${color}${message}${RESET}`);
}

function runCommand(command, timeout = 30000) {
  try {
    const output = execSync(command, {
      encoding: 'utf-8',
      timeout,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { success: true, output: output.trim() };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function checkGitStatus() {
  log('\n🔍 Git Status', CYAN);
  console.log('─'.repeat(50));

  const gitStatus = runCommand('git status --porcelain');
  const branchInfo = runCommand('git branch --show-current');
  const aheadBehind = runCommand('git rev-list --count --left-right HEAD...origin/main', 5000);

  log(`Branch: ${branchInfo.success ? branchInfo.output : 'Unknown'}`, BLUE);

  if (gitStatus.success) {
    const staged = gitStatus.output.split('\n').filter((line) => line.startsWith('A ')).length;
    const modified = gitStatus.output.split('\n').filter((line) => line.startsWith(' M')).length;
    const untracked = gitStatus.output.split('\n').filter((line) => line.startsWith('??')).length;

    log(`Staged files: ${staged}`, BLUE);
    log(`Modified files: ${modified}`, BLUE);
    log(`Untracked files: ${untracked}`, BLUE);

    if (staged === 0 && modified === 0) {
      log('✅ Working directory is clean', GREEN);
    } else {
      log('⚠️  Working directory has changes', YELLOW);
    }
  }

  if (aheadBehind.success) {
    const [behind, ahead] = aheadBehind.output.split('\t');
    if (behind !== '0') log(`Behind origin: ${behind}`, YELLOW);
    if (ahead !== '0') log(`Ahead of origin: ${ahead}`, YELLOW);
  }
}

function checkDependencies() {
  log('\n📦 Dependencies', CYAN);
  console.log('─'.repeat(50));

  const lockfileExists = existsSync('pnpm-lock.yaml');
  if (lockfileExists) {
    log('✅ Lockfile exists (pnpm-lock.yaml)', GREEN);
  } else {
    log('❌ Lockfile missing', RED);
  }

  const nodeModulesExists = existsSync('node_modules');
  if (nodeModulesExists) {
    log('✅ node_modules exists', GREEN);
  } else {
    log('❌ node_modules missing - run pnpm install', RED);
  }

  // Check for outdated packages
  const outdatedResult = runCommand('pnpm outdated --depth=0', 10000);
  if (outdatedResult.success && outdatedResult.output) {
    const outdatedCount = outdatedResult.output.split('\n').filter((line) => line.trim()).length;
    if (outdatedCount > 0) {
      log(`⚠️  ${outdatedCount} outdated packages`, YELLOW);
    } else {
      log('✅ All packages are up to date', GREEN);
    }
  }
}

function checkCodeQuality() {
  log('\n🔧 Code Quality', CYAN);
  console.log('─'.repeat(50));

  // ESLint check
  const eslintResult = runCommand('pnpm lint --max-warnings=0', 30000);
  if (eslintResult.success) {
    log('✅ ESLint: No issues found', GREEN);
  } else {
    log('❌ ESLint: Issues found', RED);
    if (eslintResult.error.includes('error')) {
      const errorLines = eslintResult.error.split('\n').filter((line) => line.trim());
      log(`   ${errorLines.slice(0, 3).join('\n   ')}`, RED);
    }
  }

  // TypeScript check
  const tsResult = runCommand('pnpm -r run typecheck', 30000);
  if (tsResult.success) {
    log('✅ TypeScript: No type errors', GREEN);
  } else {
    log('❌ TypeScript: Type errors found', RED);
  }

  // Prettier check
  const prettierResult = runCommand('pnpm format:check', 15000);
  if (prettierResult.success) {
    log('✅ Prettier: Files are formatted correctly', GREEN);
  } else {
    log('❌ Prettier: Files need formatting', YELLOW);
  }
}

function checkTests() {
  log('\n🧪 Tests', CYAN);
  console.log('─'.repeat(50));

  const testResult = runCommand('pnpm test --run', 60000);
  if (testResult.success) {
    log('✅ All tests pass', GREEN);
  } else {
    log('❌ Some tests failed', RED);
  }

  // Check for test coverage
  const coverageFiles = ['coverage', 'coverage-summary.json', '.nyc_output'];
  const hasCoverage = coverageFiles.some((file) => existsSync(file));
  if (hasCoverage) {
    log('ℹ️  Test coverage available', BLUE);
  }
}

function checkSecurity() {
  log('\n🔒 Security', CYAN);
  console.log('─'.repeat(50));

  // Security audit
  const auditResult = runCommand('pnpm audit --audit-level moderate', 30000);
  if (auditResult.success) {
    log('✅ Security audit: No vulnerabilities found', GREEN);
  } else {
    const vulnerabilityCount = (auditResult.error.match(/found \d+ vulnerabilities/g) || []).length;
    if (vulnerabilityCount > 0) {
      log(`⚠️  Security vulnerabilities found`, YELLOW);
    } else {
      log('✅ Security audit: Only low-risk issues', GREEN);
    }
  }

  // Check for sensitive files
  const sensitivePatterns = ['.env', '*.key', '*.pem', 'config.json', 'secrets.js'];

  const sensitiveFiles = [];
  for (const pattern of sensitivePatterns) {
    const result = runCommand(`find . -name "${pattern}" -not -path "./node_modules/*"`, 5000);
    if (result.success && result.output) {
      sensitiveFiles.push(...result.output.split('\n').filter((line) => line.trim()));
    }
  }

  if (sensitiveFiles.length > 0) {
    log('⚠️  Sensitive files detected:', YELLOW);
    sensitiveFiles.forEach((file) => log(`   ${file}`, YELLOW));
  } else {
    log('✅ No sensitive files in repository', GREEN);
  }
}

function checkDocumentation() {
  log('\n📚 Documentation', CYAN);
  console.log('─'.repeat(50));

  const readmeExists = existsSync('README.md');
  if (readmeExists) {
    log('✅ README.md exists', GREEN);
  } else {
    log('❌ README.md missing', RED);
  }

  // Check for TODO/FIXME comments
  const todoResult = runCommand(
    'grep -r "TODO\\|FIXME" --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" . | head -10',
    10000,
  );
  if (todoResult.success && todoResult.output) {
    const todoCount = todoResult.output.split('\n').filter((line) => line.trim()).length;
    log(`ℹ️  Found ${todoCount} TODO/FIXME comments`, BLUE);
  } else {
    log('✅ No TODO/FIXME comments found', GREEN);
  }

  // Check markdown formatting
  const mdLintResult = runCommand(
    'find . -name "*.md" -not -path "./node_modules/*" | head -5 | xargs markdownlint --disable MD013',
    10000,
  );
  if (mdLintResult.success) {
    log('✅ Markdown files are properly formatted', GREEN);
  } else {
    log('⚠️  Some markdown files need formatting', YELLOW);
  }
}

function checkPerformance() {
  log('\n⚡ Performance', CYAN);
  console.log('─'.repeat(50));

  // Check bundle size (if build directory exists)
  const buildDir = existsSync('dist') || existsSync('build');
  if (buildDir) {
    const result = runCommand(
      'find dist build -type f -name "*.js" -o -name "*.css" | head -10 | xargs ls -la | awk \'{sum += $5} END {print sum}\'',
      5000,
    );
    if (result.success) {
      const totalSize = parseInt(result.output) || 0;
      const sizeMB = (totalSize / 1024 / 1024).toFixed(2);
      log(`📦 Total bundle size: ${sizeMB}MB`, BLUE);
    }
  }

  // Check for large files (> 1MB)
  const largeFilesResult = runCommand(
    'find . -type f -size +1M -not -path "./node_modules/*" -not -path "./.git/*" | head -5',
    5000,
  );
  if (largeFilesResult.success && largeFilesResult.output) {
    const largeFiles = largeFilesResult.output.split('\n').filter((line) => line.trim());
    if (largeFiles.length > 0) {
      log(`⚠️  Found ${largeFiles.length} large files (>1MB)`, YELLOW);
    } else {
      log('✅ No large files detected', GREEN);
    }
  }
}

function generateSummary() {
  log('\n📊 Quality Summary', CYAN);
  console.log('═'.repeat(50));

  log('This check provides an overview of your repository quality state.', BLUE);
  log('Run specific commands to fix issues:', BLUE);
  log('  • pnpm lint:fix        - Fix ESLint issues', BLUE);
  log('  • pnpm format          - Format with Prettier', BLUE);
  log('  • pnpm test            - Run tests', BLUE);
  log('  • pnpm fix:staged      - Fix staged files', BLUE);
  log('  • pnpm good:state      - Complete quality check', BLUE);
  log('\nFor more details, see CONTRIBUTING.md', BLUE);
}

async function main() {
  log('🔍 Repository Quality Status', BLUE);
  log('=============================', BLUE);

  // Check if we're in a git repository
  if (!existsSync('.git')) {
    log('❌ Not in a git repository', RED);
    process.exit(1);
  }

  try {
    checkGitStatus();
    checkDependencies();
    checkCodeQuality();
    checkTests();
    checkSecurity();
    checkDocumentation();
    checkPerformance();
    generateSummary();

    log('\n✅ Quality status check completed!', GREEN);
  } catch (error) {
    log(`❌ Quality check failed: ${error.message}`, RED);
    process.exit(1);
  }
}

// Handle script execution
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    log(`💥 Unexpected error: ${error.message}`, RED);
    process.exit(1);
  });
}
