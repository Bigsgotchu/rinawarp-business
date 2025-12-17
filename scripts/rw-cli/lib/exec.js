import { execSync } from "child_process";

export function run(command) {
  try {
    console.log(`Running: ${command}`);
    const result = execSync(command, { stdio: "inherit" });
    return result;
  } catch (error) {
    console.error(`Command failed: ${command}`);
    console.error(error.message);
    throw error;
  }
}