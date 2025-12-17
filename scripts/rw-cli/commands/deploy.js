import chalk from "chalk";
import { run } from "../lib/exec.js";

export function deploy(target) {
  console.log(chalk.magenta("\n🚀 RinaWarp Deployment System\n"));

  switch (target) {
    case "site":
      console.log(chalk.cyan("Deploying website → Netlify"));
      run(`netlify deploy --prod --dir=apps/website/dist`);
      console.log(chalk.green("✔ Website deployed"));
      break;

    case "terminal":
      console.log(chalk.cyan("Deploying Terminal Pro → Netlify"));
      run(`netlify deploy --prod --dir=apps/rw-terminal/dist`);
      console.log(chalk.green("✔ Terminal Pro deployed"));
      break;

    case "api":
      console.log(chalk.cyan("Deploying API → Oracle Cloud VM"));
      run(`ssh ubuntu@your-server-ip "cd /var/www/rw-api && git pull && pm2 restart all"`);
      console.log(chalk.green("✔ API deployed"));
      break;

    case "all":
      deploy("site");
      deploy("terminal");
      deploy("api");
      break;

    default:
      console.log(chalk.red(`❌ Unknown deploy target: ${target}`));
  }
}