#!/usr/bin/env node

import { execSync } from "child_process";
import chalk from "chalk";

export function verifyDeploy() {
  console.log(chalk.cyan("🔍 Running RinaWarp Post-Deploy Verification..."));

  try {
    // Execute the existing verification script
    execSync("node scripts/rw-verify.js", { stdio: "inherit" });
  } catch (error) {
    console.log(chalk.red("❌ Verification failed"));
    process.exit(1);
  }
}