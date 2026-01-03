#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();

const args = new Set(process.argv.slice(2));
const DRY_RUN = !args.has("--apply");
const YES = args.has("--yes");

const DELETE_DIRS = [
    "out",
    "dist",
    "dist-terminal-pro",
    "dist-terminal-pro-staging",
    "build-output",
    "release",
    "coverage",
    ".vite",
];

const DELETE_GLOBS_NOTE = [
    "If you have other build dirs like dist-linux/ dist-win/ add them to DELETE_DIRS.",
];

const MOVE_RULES = [
    // Move legacy/experimental areas out of the main source path
    { from: "src/renderer/js", to: "legacy/src/renderer/js" },
    { from: "src/shared", to: "legacy/src/shared" },
    { from: "tools", to: "legacy/tools" },
    { from: "tests", to: "legacy/tests" },
];

const REQUIRED_IGNORES = [
    "node_modules/",
    "out/",
    "dist/",
    "dist-*/",
    "dist-terminal-pro/",
    "build-output/",
    "release/",
    "coverage/",
    ".vite/",
    "*.map",
];

const ESLINT_IGNORES = [
    "node_modules/",
    "out/",
    "dist/",
    "dist-*/",
    "dist-terminal-pro/",
    "build-output/",
    "release/",
    "coverage/",
    ".vite/",
    "src/renderer/js/",
    "src/shared/",
    "tools/",
    "tests/",
    "test*.js",
];

function exists(p) {
    try {
        fs.accessSync(p);
        return true;
    } catch {
        return false;
    }
}

function ensureDir(dir) {
    if (exists(dir)) return;
    if (!DRY_RUN) fs.mkdirSync(dir, { recursive: true });
}

function readLines(file) {
    if (!exists(file)) return [];
    return fs.readFileSync(file, "utf8").split(/\r?\n/);
}

function writeLines(file, lines) {
    const content = lines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
    if (!DRY_RUN) fs.writeFileSync(file, content, "utf8");
}

function ensureLines(file, requiredLines) {
    const lines = readLines(file);
    const set = new Set(lines);
    let changed = false;
    for (const line of requiredLines) {
        if (!set.has(line)) {
            lines.push(line);
            changed = true;
        }
    }
    if (changed) {
        console.log(`${DRY_RUN ? "[dry-run] would update" : "updated"} ${file}`);
        writeLines(file, lines);
    } else {
        console.log(`ok ${file}`);
    }
}

function rmDir(dir) {
    if (!exists(dir)) return;
    console.log(`${DRY_RUN ? "[dry-run] would delete" : "deleting"} ${dir}`);
    if (!DRY_RUN) fs.rmSync(dir, { recursive: true, force: true });
}

function moveDir(from, to) {
    if (!exists(from)) return;
    console.log(`${DRY_RUN ? "[dry-run] would move" : "moving"} ${from} -> ${to}`);
    if (DRY_RUN) return;

    ensureDir(path.dirname(to));

    // If target exists, merge (best-effort)
    if (!exists(to)) {
        fs.renameSync(from, to);
        return;
    }

    // Merge directory contents
    const stack = [from];
    while (stack.length) {
        const cur = stack.pop();
        const rel = path.relative(from, cur);
        const dest = path.join(to, rel);
        ensureDir(dest);

        for (const entry of fs.readdirSync(cur, { withFileTypes: true })) {
            const srcPath = path.join(cur, entry.name);
            const dstPath = path.join(dest, entry.name);
            if (entry.isDirectory()) {
                stack.push(srcPath);
            } else {
                ensureDir(path.dirname(dstPath));
                fs.renameSync(srcPath, dstPath);
            }
        }
    }
    fs.rmSync(from, { recursive: true, force: true });
}

function gitRmCachedIfTracked(dir) {
    // If this dir is tracked, remove from git index (keep files on disk)
    try {
        const out = execSync(`git ls-files -- "${dir}"`, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
        if (!out) return;
        console.log(`${DRY_RUN ? "[dry-run] would untrack" : "untracking"} ${dir} from git index`);
        if (!DRY_RUN) execSync(`git rm -r --cached -- "${dir}"`, { stdio: "inherit" });
    } catch {
        // ignore
    }
}

function printTopLevelSizes() {
    console.log("\n--- repo size snapshot (top-level) ---");
    for (const name of fs.readdirSync(ROOT)) {
        if (name === ".git") continue;
        const p = path.join(ROOT, name);
        try {
            const st = fs.statSync(p);
            if (st.isDirectory()) {
                // best-effort; avoid heavy traversal
                console.log(`- ${name}/`);
            } else {
                console.log(`- ${name}`);
            }
        } catch {
            // ignore
        }
    }
    console.log("--------------------------------------\n");
}

function confirmOrExit() {
    if (DRY_RUN) return;
    if (YES) return;

    process.stdout.write("Apply changes? Type 'yes' to continue: ");
    const input = fs.readFileSync(0, "utf8").trim().toLowerCase();
    if (input !== "yes") {
        console.log("Aborted.");
        process.exit(1);
    }
}

(async function main() {
    console.log(`cleanup-repo (${DRY_RUN ? "dry-run" : "apply"})`);
    printTopLevelSizes();

    if (!DRY_RUN) confirmOrExit();

    // 1) Ensure ignores
    ensureLines(".gitignore", REQUIRED_IGNORES);
    ensureLines(".eslintignore", ESLINT_IGNORES);

    // 2) Untrack + delete build outputs (never should be committed)
    for (const d of DELETE_DIRS) {
        gitRmCachedIfTracked(d);
        rmDir(d);
    }

    // 3) Move legacy areas out of the critical path (safe default vs deleting)
    for (const r of MOVE_RULES) {
        moveDir(r.from, r.to);
    }

    // 4) Report
    console.log("\nNotes:");
    for (const n of DELETE_GLOBS_NOTE) console.log(`- ${n}`);

    console.log("\nNext:");
    console.log("- Run: npm ci && npm run lint && npm test && npm run dist:linux:staged");
    console.log("- If all good, you can delete ./legacy after confirming nothing imports it.");
})();