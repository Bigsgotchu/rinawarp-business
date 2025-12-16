#!/usr/bin/env node

import { execSync } from 'child_process';
import chalk from 'chalk';

console.log(chalk.cyan('\n🧪 Running RW CLI Tests\n'));

try {
  // Install vitest if not already installed
  console.log(chalk.blue('📦 Installing test dependencies...'));
  execSync('npm install vitest --save-dev', { stdio: 'inherit' });

  // Run all tests
  console.log(chalk.blue('\n🚀 Running test suite...'));
  const result = execSync('npx vitest run scripts/rw-cli/tests/', { stdio: 'inherit' });

  console.log(chalk.green('\n✅ All tests completed!'));
} catch (error) {
  console.error(chalk.red('\n❌ Test execution failed:'));
  console.error(error.message);
  process.exit(1);
}
