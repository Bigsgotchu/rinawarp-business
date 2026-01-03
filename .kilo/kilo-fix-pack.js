#!/usr/bin/env node
/**
 * Kilo Fix Pack v1.0
 * Auto-scan logs, detect errors, suggest fixes, self-learn.
 */

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const KILO_DIR = path.join(ROOT, ".kilo");
const MEMORY_PATH = path.join(KILO_DIR, "kilo-memory.json");

// --- UTILITIES -------------------------------------------------------------

function safeReadJSON(p, fallback = {}) {
  try {
    if (!fs.existsSync(p)) return fallback;
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return fallback;
  }
}

function safeWriteJSON(p, data) {
  try {
    fs.writeFileSync(p, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("[kilo-fix-pack] Write error:", e.message);
  }
}

function printHeader(title) {
  console.log("\n====================================================");
  console.log("     " + title);
  console.log("====================================================\n");
}

// --- LOG SCANNER -----------------------------------------------------------

const COMMON_ERRORS = [
  {
    name: "CORS Error",
    pattern: /CORS|No 'Access-Control-Allow-Origin'/i,
    fix: [
      "Edit backend fastapi_server.py:",
      "Add allowed origins in CORSMiddleware:",
      "",
      "app.add_middleware(",
      "  CORSMiddleware,",
      "  allow_origins=['*', 'https://rinawarptech.com'],",
      "  allow_credentials=True,",
      "  allow_methods=['*'],",
      "  allow_headers=['*'],",
      ")",
    ],
  },
  {
    name: "Stripe Not Defined",
    pattern: /Stripe is not defined/i,
    fix: [
      "Remove direct <script src='https://js.stripe.com'> usage.",
      "Use backend-created checkout sessions instead.",
      "Your new UI kit already fixed this.",
    ],
  },
  {
    name: "404 Asset Missing",
    pattern: /Failed to load resource:.*404/i,
    fix: [
      "Check if the asset exists in rinawarp-website/assets/",
      "Fix filename casing differences (Linux is case-sensitive).",
      "Ensure <img src> and <link href> paths start with './assets/'.",
    ],
  },
  {
    name: "PM2 Script Not Found",
    pattern: /PM2.*Script not found/i,
    fix: [
      "1. Ensure PM2 ecosystem file exists:",
      "   /home/ubuntu/ecosystem.config.js",
      "2. Then run:",
      "   pm2 start ecosystem.config.js",
      "3. Verify process name matches:",
      "   pm2 ls",
    ],
  },
  {
    name: "Module Import Error",
    pattern: /Cannot use import statement|Unexpected token 'export'/i,
    fix: [
      "Remove ES module <script type='module'> from static HTML pages.",
      "Use plain <script src='js/rinawarp-ui-kit-v2.js' defer> instead.",
    ],
  },
  {
    name: "Netlify File Too Large",
    pattern: /File size limited|payload too large/i,
    fix: [
      "Netlify cannot host files >100MB.",
      "Host AppImage on Cloudflare R2 / Oracle VM instead.",
      "Update download links in download.html.",
    ],
  },
];

// --- MAIN ------------------------------------------------------------------

function main() {
  printHeader("KILO FIX PACK - AUTO SCAN");

  // Load memory
  const memory = safeReadJSON(MEMORY_PATH, {
    recentErrors: [],
    recentCommands: [],
    paths: {},
  });

  const logFiles = [
    "pm2.log",
    "npm-debug.log",
    "backend.log",
    "frontend.log",
    "server.log",
    "netlify.log",
  ];

  let suggestions = [];
  let foundErrors = [];

  console.log("Scanning logs...\n");

  logFiles.forEach((log) => {
    const fullPath = path.join(ROOT, log);
    if (!fs.existsSync(fullPath)) return;

    const content = fs.readFileSync(fullPath, "utf8");

    COMMON_ERRORS.forEach((err) => {
      if (err.pattern.test(content)) {
        foundErrors.push(err.name);
        suggestions.push({
          type: err.name,
          fix: err.fix,
          log: log,
        });

        // Save to memory
        memory.recentErrors.unshift({
          error: err.name,
          log: log,
          at: new Date().toISOString(),
        });
      }
    });
  });

  safeWriteJSON(MEMORY_PATH, memory);

  if (foundErrors.length === 0) {
    console.log("✨ No known errors found. System looks healthy.");
    return;
  }

  printHeader("ISSUES FOUND");
  foundErrors.forEach((err, i) => console.log(`${i + 1}. ${err}`));

  printHeader("RECOMMENDED FIXES");
  suggestions.forEach((s) => {
    console.log(`\n🔧 ERROR: ${s.type}`);
    console.log(`📄 Log File: ${s.log}`);
    console.log("--- Fix Instructions ---");
    console.log(s.fix.join("\n"));
  });
}

main();