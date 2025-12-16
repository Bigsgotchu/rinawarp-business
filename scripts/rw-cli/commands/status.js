import chalk from 'chalk';

export function status() {
  console.log(chalk.cyan('\n🚀 RinaWarp Project Status\n'));

  const tasks = [
    ['Analyze Terminal Pro stability', 'done'],
    ['Fix blank UI', 'done'],
    ['Remove service worker residue', 'done'],
    ['Fix MIME type issues', 'done'],
    ['Fix build issues', 'done'],
    ['Electron loads properly', 'done'],
    ['AI agent responds', 'done'],
    ['Licensing module works', 'pending'],
    ['Premium mode unlocks', 'pending'],
    ['Device tests (Linux/Win/Mac)', 'pending'],
  ];

  for (const [label, state] of tasks) {
    let icon = '○';
    if (state === 'done') icon = chalk.green('✔');
    if (state === 'in-progress') icon = chalk.yellow('●');
    if (state === 'pending') icon = chalk.red('○');

    console.log(` ${icon} ${label}`);
  }

  console.log(chalk.magenta('\nUse `rw scan` for deeper analysis.\n'));
}
