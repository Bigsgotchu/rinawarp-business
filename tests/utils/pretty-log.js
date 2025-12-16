// tests/utils/pretty-log.js
import chalk from 'chalk';

export function logSection(title) {
  console.log(chalk.cyan(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`));
  console.log(chalk.cyan(`🔎 ${title}`));
  console.log(chalk.cyan(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`));
}

export function logStep(label) {
  console.log(chalk.white(`• ${label}`));
}

export function logOk(label) {
  console.log(chalk.green(`  ✔ ${label}`));
}

export function logWarn(label) {
  console.log(chalk.yellow(`  ⚠ ${label}`));
}

export function logFail(label) {
  console.log(chalk.red(`  ✘ ${label}`));
}
