// scripts/rw-cli/commands/test-ai.js
import chalk from "chalk";
import { run } from "../lib/exec.js";

export function testAi() {
  console.log(chalk.cyan("\n🧪 Running RinaWarp AI Integration Tests...\n"));
  run("node tests/test-ai-agent.js");
}