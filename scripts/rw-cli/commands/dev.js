import chalk from "chalk";
import { run } from "../lib/exec.js";

const devTargets = {
  site: {
    path: "apps/website",
    cmd: "npm run dev",
    note: "Vite dev server for marketing site",
  },
  terminal: {
    path: "apps/rw-terminal",
    cmd: "npm run dev",
    note: "Terminal Pro React/Electron dev frontend",
  },
  api: {
    path: "services/api",
    cmd: "npm run dev",
    note: "Backend API (Node/Express/Nest/etc.)",
  },
  gateway: {
    path: "services/gateway",
    cmd: "npm run dev",
    note: "API Gateway",
  },
  auth: {
    path: "services/auth-service",
    cmd: "npm run dev",
    note: "Auth service / auth microservice",
  },
};

export function dev(target) {
  console.log(chalk.magenta("\n🧪 RinaWarp Dev Runner\n"));

  if (!target) {
    console.log(chalk.cyan(`
Usage:
  rw dev site       Start website dev server
  rw dev terminal   Start Terminal Pro dev
  rw dev api        Start backend API dev
  rw dev gateway    Start gateway dev
  rw dev auth       Start auth service dev
`));
    return;
  }

  const config = devTargets[target];

  if (!config) {
    console.log(chalk.red(`❌ Unknown dev target: ${target}`));
    return;
  }

  console.log(chalk.cyan(`Starting ${target} dev server…`));
  console.log(chalk.gray(`(${config.note})`));
  run(`cd ${config.path} && ${config.cmd}`);
}