import chalk from "chalk";
import { run } from "../lib/exec.js";

const SERVER = "ubuntu@YOUR_SERVER_IP_HERE"; // <-- set this

export function logs(target) {
  console.log(chalk.magenta("\n📜 RinaWarp Logs Viewer\n"));

  if (!target) {
    console.log(chalk.cyan(`
Usage:
  rw logs api          Show API logs (server)
  rw logs gateway      Show gateway logs (server)
  rw logs auth         Show auth-service logs (server)
  rw logs pm2          Show PM2 process list (server)
  rw logs site         Show Netlify deploy logs (via CLI)
`));
    return;
  }

  switch (target) {
    case "api":
      run(`ssh ${SERVER} "journalctl -u rw-api.service -n 100 --no-pager"`);
      break;

    case "gateway":
      run(`ssh ${SERVER} "journalctl -u rw-gateway.service -n 100 --no-pager"`);
      break;

    case "auth":
      run(`ssh ${SERVER} "journalctl -u rw-auth.service -n 100 --no-pager"`);
      break;

    case "pm2":
      run(`ssh ${SERVER} "pm2 status && pm2 logs --lines 50"`);
      break;

    case "site":
      // Requires Netlify CLI + auth set up
      run(`netlify status && netlify logs --deploy-id=latest || echo 'Configure Netlify logs if needed'`);
      break;

    default:
      console.log(chalk.red(`❌ Unknown logs target: ${target}`));
  }
}