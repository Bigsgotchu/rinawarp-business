#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const version = process.env.RELEASE_VERSION || process.env.npm_package_version;

function run(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

function getLastTag() {
  try {
    return run("git describe --tags --abbrev=0");
  } catch {
    return null;
  }
}

function generatePlainNotes() {
  const lastTag = getLastTag();
  let logCmd = "git log --pretty=format:'- %s'";

  if (lastTag) {
    logCmd += ` ${lastTag}..HEAD`;
  }

  const lines = run(logCmd);
  return `# RinaWarp Terminal Pro ${version}\n\n${lines || "- Initial release"}`;
}

function main() {
  const notes = generatePlainNotes();
  const outPath = path.join(root, "RELEASE_NOTES.md");
  fs.writeFileSync(outPath, notes, "utf8");
  console.log(`✅ Release notes written to ${outPath}`);
}

main();