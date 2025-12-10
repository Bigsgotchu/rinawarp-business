import chalk from "chalk";
import { run } from "../lib/exec.js";

export function publish(target) {
  console.log(chalk.magenta("\n📦 RinaWarp Publisher\n"));

  if (!target) {
    console.log(chalk.cyan(`
Usage:
  rw publish terminal    Build & package RinaWarp Terminal Pro installers
`));
    return;
  }

  if (target === "terminal") {
    console.log(chalk.cyan("Building and packaging RinaWarp Terminal Pro…"));
    // Adjust these commands to match your actual scripts in apps/rw-terminal/package.json
    run(`cd apps/terminal-pro/desktop && npm install`);
    run(`cd apps/terminal-pro/desktop && npm run build`);         // or build:renderer / build:electron
    run(`cd apps/terminal-pro/desktop && npm run dist`);          // common for electron-builder
    console.log(chalk.green("✔ Terminal Pro installer build complete"));
    console.log(chalk.gray("Check apps/rw-terminal/dist/ for .AppImage / .exe / .dmg files"));
    return;
  }

  console.log(chalk.red(`❌ Unknown publish target: ${target}`));
}