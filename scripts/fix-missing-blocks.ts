// path: scripts/fix-missing-blocks.ts
// usage:
//   npx tsx scripts/fix-missing-blocks.ts --config ~/.continue/config.yaml --fallback local/rinawarp-default --scaffold
//   npx tsx scripts/fix-missing-blocks.ts --config ./continue.yaml --replace rinawarptech/Rinawarptech=local/rinawarp-default --dry-run --print
//   npx tsx scripts/fix-missing-blocks.ts --config ~/.config/KiloCode/agent.yaml --check-remote --only rinawarptech/Rinawarptech --list
//
// deps: npm i -D yaml

import fs from "fs";
import os from "os";
import path from "path";
import cp from "child_process";
import YAML from "yaml";

type ReplaceMap = Record<string, string>;
type Mut = { changed: number; missing: string[]; replacements: Record<string, string> };

const DEFAULT_BLOCKS_ROOT = path.join(process.cwd(), "blocks");

// owner/name tokens (avoid matching scheme://host/owner/name)
const SLUG_TOKEN = "([A-Za-z0-9._-]+/[A-Za-z0-9._-]+)";
const URL_LIKE = /^[a-z]+:\/\/|^[A-Za-z0-9.-]+\.[A-Za-z]{2,}\//i;

function isObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function expand(p: string) {
  return p.startsWith("~") ? path.join(os.homedir(), p.slice(1)) : p;
}

function readConfig(file: string) {
  const raw = fs.readFileSync(file, "utf8");
  const ext = path.extname(file).toLowerCase();
  if (ext === ".yaml" || ext === ".yml") return YAML.parse(raw);
  try { return JSON.parse(raw); } catch { return YAML.parse(raw); }
}

function stringifyByExt(file: string, data: unknown) {
  const ext = path.extname(file).toLowerCase();
  return (ext === ".yaml" || ext === ".yml") ? YAML.stringify(data) : JSON.stringify(data, null, 2) + "\n";
}

function atomicWrite(file: string, txt: string) {
  const dir = path.dirname(file);
  const tmp = path.join(dir, `.tmp.${path.basename(file)}.${process.pid}.${Date.now()}`);
  fs.writeFileSync(tmp, txt, "utf8");
  fs.renameSync(tmp, file);
}

function backup(file: string) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dst = `${file}.bak.${stamp}`;
  fs.copyFileSync(file, dst);
  return dst;
}

function allStringsIn(obj: unknown): string[] {
  const out: string[] = [];
  const stack: unknown[] = [obj];
  while (stack.length) {
    const cur = stack.pop();
    if (typeof cur === "string") out.push(cur);
    else if (Array.isArray(cur)) stack.push(...cur);
    else if (isObject(cur)) stack.push(...Object.values(cur));
  }
  return out;
}

function findSlugs(obj: unknown): Set<string> {
  const hits = new Set<string>();
  for (const s of allStringsIn(obj)) {
    if (URL_LIKE.test(s)) continue; // ignore URLs
    const m = s.match(new RegExp(`\\b${SLUG_TOKEN}\\b`)); // one token per string
    if (m) hits.add(m[1]);
  }
  return hits;
}

function localBlockExists(slug: string, blocksRoot: string): boolean {
  const p = path.join(blocksRoot, slug, "block.json");
  return fs.existsSync(p);
}

function checkRemote(slug: string): boolean {
  try {
    cp.execSync(`git ls-remote --exit-code https://github.com/${slug}.git`, {
      stdio: "ignore",
      timeout: 4000,
    });
    return true;
  } catch { return false; }
}

function scaffoldLocal(slug: string, blocksRoot: string) {
  const dir = path.join(blocksRoot, slug);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "block.json");
  if (!fs.existsSync(file)) {
    const name = slug.split("/")[1];
    const stub = {
      name,
      version: "0.0.0-local",
      description: `Scaffolded stub for ${slug}`,
      entry: "./index.md",
      meta: { source: "scaffold" },
    };
    fs.writeFileSync(file, JSON.stringify(stub, null, 2) + "\n", "utf8");
  }
  const md = path.join(dir, "index.md");
  if (!fs.existsSync(md)) {
    fs.writeFileSync(md, `# ${slug}\n\n> Local scaffold. Replace with your block content.\n`, "utf8");
  }
}

function walkReplace(obj: unknown, map: ReplaceMap, mut: Mut): unknown {
  if (typeof obj === "string") {
    let res = obj;
    for (const [oldSlug, newSlug] of Object.entries(map)) {
      // replace exact slug tokens only
      const re = new RegExp(`\\b${oldSlug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g");
      if (re.test(res)) {
        res = res.replace(re, newSlug);
        mut.changed += 1;
        mut.replacements[oldSlug] = newSlug;
      }
    }
    return res;
  }
  if (Array.isArray(obj)) return obj.map((v) => walkReplace(v, map, mut));
  if (isObject(obj)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) out[k] = walkReplace(v, map, mut);
    return out;
  }
  return obj;
}

function parseArgs() {
  const args = new Map<string, string[]>();
  const one = new Set(["--dry-run", "--print", "--scaffold", "--check-remote", "--list", "--json"]);
  const kv = new Set(["--config", "--fallback", "--replace", "--blocks-root", "--only"]);
  const push = (k: string, v?: string) => {
    const arr = args.get(k) || [];
    if (v !== undefined) arr.push(v);
    args.set(k, arr);
  };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (one.has(a)) push(a);
    else if (kv.has(a)) push(a, argv[++i]);
  }
  return args;
}

function main() {
  const args = parseArgs();

  const file = expand(args.get("--config")?.[0] || path.join(os.homedir(), ".continue", "config.yaml"));
  const blocksRoot = expand(args.get("--blocks-root")?.[0] || process.env.BLOCKS_ROOT || DEFAULT_BLOCKS_ROOT);
  const onlySlug = args.get("--only")?.[0];
  const listOnly = args.has("--list");
  const jsonOut = args.has("--json");
  const dry = args.has("--dry-run");
  const print = args.has("--print");
  const scaffoldFlag = args.has("--scaffold");
  const checkRemoteFlag = args.has("--check-remote");
  const fallback = args.get("--fallback")?.[0];

  if (!fs.existsSync(file)) {
    console.error(`Config not found: ${file}`);
    process.exit(1);
  }

  const replacePairs = (args.get("--replace") || []).reduce<ReplaceMap>((acc, s) => {
    const idx = s.indexOf("=");
    if (idx === -1) return acc;
    const k = s.slice(0, idx);
    const v = s.slice(idx + 1);
    if (k && v) acc[k] = v;
    return acc;
  }, {});

  const cfg = readConfig(file);
  const slugs = Array.from(findSlugs(cfg));
  const targetSlugs = onlySlug ? slugs.filter((s) => s === onlySlug) : slugs;

  if (listOnly) {
    const out = { config: file, blocksRoot, slugs: targetSlugs.sort() };
    console.log(jsonOut ? JSON.stringify(out, null, 2) : `Slugs:\n- ${out.slugs.join("\n- ")}`);
    process.exit(0);
  }

  const missing: string[] = [];
  for (const slug of targetSlugs) {
    const local = localBlockExists(slug, blocksRoot);
    const remote = checkRemoteFlag ? checkRemote(slug) : true;
    if (!local && !remote) missing.push(slug);
  }

  const mut: Mut = { changed: 0, missing: [...missing], replacements: {} };

  const map: ReplaceMap = { ...replacePairs };
  if (!map["rinawarptech/Rinawarptech"] && fallback) {
    map["rinawarptech/Rinawarptech"] = fallback;
  }

  const nextCfg = walkReplace(cfg, map, mut);

  // Only scaffold truly missing slugs (post-replacement)
  const finalSlugs = Array.from(findSlugs(nextCfg));
  const toScaffold = new Set<string>();
  if (scaffoldFlag) {
    for (const slug of finalSlugs) {
      const wasMissing = missing.includes(slug) || (fallback && Object.values(map).includes(slug) && !localBlockExists(slug, blocksRoot));
      if (wasMissing && !localBlockExists(slug, blocksRoot)) toScaffold.add(slug);
    }
  }

  const summary = {
    config: file,
    blocksRoot,
    totalFound: slugs.length,
    missing,
    replacements: mut.replacements,
    changedNodes: mut.changed,
    scaffoldPlanned: Array.from(toScaffold),
  };

  // Output preview
  if (print || dry) {
    console.log(jsonOut ? JSON.stringify(summary, null, 2) : [
      `== Config: ${file}`,
      `== Blocks root: ${blocksRoot}`,
      `== Found: ${slugs.length}`,
      `== Missing: ${missing.length ? missing.join(", ") : "(none)"}`,
      `== Replacements: ${Object.keys(mut.replacements).length ? JSON.stringify(mut.replacements, null, 2) : "(none)"}`,
      `== Scaffold planned: ${toScaffold.size ? Array.from(toScaffold).join(", ") : "(none)"}`
    ].join("\n"));
    if (print) {
      const preview = stringifyByExt(file, nextCfg);
      console.log("\n----- PREVIEW BEGIN -----\n" + preview + "----- PREVIEW END-----");
    }
    if (dry) process.exit(0);
    // IMPORTANT: --print implies preview-only; do NOT write.
    if (print) process.exit(0);
  }

  // Write config
  const bak = backup(file);
  atomicWrite(file, stringifyByExt(file, nextCfg));
  console.log(`OK: wrote normalized config to ${file}\nBackup: ${bak}`);

  // Scaffold
  if (toScaffold.size) {
    for (const slug of toScaffold) scaffoldLocal(slug, blocksRoot);
    console.log(`Scaffolded ${toScaffold.size} block(s) under ${blocksRoot}`);
  }
}

if (require.main === module) {
  try { main(); } catch (e: any) { console.error(`ERROR: ${e?.message || e}`); process.exit(1); }
}
