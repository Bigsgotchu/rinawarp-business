import chalk from 'chalk';
import { run } from '../lib/exec.js';

const modules = {
  site: {
    path: 'apps/website',
    build: 'npm run build',
  },
  terminal: {
    path: 'apps/terminal-pro/desktop',
    build: 'npm run build',
  },
  api: {
    path: 'services/api',
    build: 'npm run build || tsc',
  },
};

export function build(target) {
  console.log(chalk.magenta('\n🚀 RinaWarp Build System\n'));

  if (!target || target === 'all') {
    Object.keys(modules).forEach((key) => {
      console.log(chalk.cyan(`\n📦 Building ${key}...`));
      run(`cd ${modules[key].path} && npm install`);
      run(`cd ${modules[key].path} && ${modules[key].build}`);
      console.log(chalk.green(`✔ ${key} build complete`));
    });
    return;
  }

  if (!modules[target]) {
    console.log(chalk.red(`❌ Unknown build target: ${target}`));
    return;
  }

  const mod = modules[target];
  console.log(chalk.cyan(`📦 Building ${target}...`));
  run(`cd ${mod.path} && npm install`);
  run(`cd ${mod.path} && ${mod.build}`);
  console.log(chalk.green(`✔ ${target} build complete`));
}
