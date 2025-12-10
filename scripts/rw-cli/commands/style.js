import { run } from "../lib/exec.js";

export function style() {
  console.log("\n🎨 Enforcing RinaWarp Code Style\n");
  run("npx prettier --write .");
  run("npx eslint --fix .");
  console.log("\n✔ Codebase formatted.\n");
}