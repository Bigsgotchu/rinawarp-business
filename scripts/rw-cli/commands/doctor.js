import chalk from "chalk";
import fs from "fs";
import { runCapture } from "../lib/exec.js";

export function doctor() {
  console.log(chalk.magenta("\n🩺 RinaWarp Doctor — Deep System Diagnostic\n"));

  const nodeVersion = process.version;
  const npmVersion = runCapture("npm -v") || "unknown";

  console.log(chalk.cyan("\nRuntime"));
  console.log(chalk.green(`✔ Node Version: ${nodeVersion}`));
  console.log(chalk.green(`✔ NPM Version: ${npmVersion}`));

  console.log(chalk.cyan("\nTypeScript Configs"));
  const hasRootTS = fs.existsSync("tsconfig.json");
  const hasApiTS = fs.existsSync("services/api/tsconfig.json");

  hasRootTS
    ? console.log(chalk.green("✔ Root tsconfig.json found"))
    : console.log(chalk.red("✘ Root tsconfig.json missing"));

  hasApiTS
    ? console.log(chalk.green("✔ services/api/tsconfig.json found"))
    : console.log(chalk.red("✘ services/api/tsconfig.json missing"));

  console.log(chalk.cyan("\nDist Folders"));
  const dists = [
    "apps/website/dist",
    "apps/rw-terminal/dist",
  ];

  dists.forEach((p) => {
    fs.existsSync(p)
      ? console.log(chalk.green(`✔ ${p}`))
      : console.log(chalk.red(`✘ ${p} missing (run: rw build)`));
  });

  console.log(chalk.cyan("\nNode Modules (top level)"));
  fs.existsSync("node_modules")
    ? console.log(chalk.green("✔ node_modules present"))
    : console.log(chalk.yellow("⚠ node_modules missing at root (may be fine for pnpm / workspaces)"));

  console.log(chalk.yellow("\n⚠ Deep broken-import analysis not implemented yet"));
  console.log(chalk.magenta("\nDoctor scan complete.\n"));
}