// tests/test-ai-agent.js
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import { apiRequest } from "./utils/api-request.js";
import { logSection, logStep, logOk, logWarn, logFail } from "./utils/pretty-log.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadConfig() {
  const cfgPath = path.join(__dirname, "config.json");
  const txt = await fs.readFile(cfgPath, "utf8");
  return JSON.parse(txt);
}

async function testPing(config) {
  logSection("Test 1 — API Ping / Health");

  const { apiBase, timeoutMs, endpoints } = config;
  const path = endpoints.ping ?? "/health";

  logStep(`Calling ${apiBase}${path}`);

  const res = await apiRequest({
    base: apiBase,
    path,
    timeoutMs,
  });

  if (!res.ok) {
    logFail(`Ping failed (HTTP ${res.status})`);
    return false;
  }

  logOk("Ping OK");
  return true;
}

async function testAuthVerify(config) {
  logSection("Test 2 — Auth Verification");

  const { apiBase, timeoutMs, endpoints, authToken } = config;
  const path = endpoints.authVerify ?? "/auth/verify";

  if (!authToken) {
    logWarn("No authToken set in config.json — skipping auth verify test");
    return null;
  }

  logStep(`Calling ${apiBase}${path}`);

  const res = await apiRequest({
    base: apiBase,
    path,
    method: "GET",
    token: authToken,
    timeoutMs,
  });

  if (!res.ok) {
    logFail(`Auth verify failed (HTTP ${res.status})`);
    return false;
  }

  logOk("Auth verify OK");
  return true;
}

async function testLicense(config) {
  logSection("Test 3 — License Check");

  const { apiBase, timeoutMs, endpoints, licenseKey, authToken } = config;
  const path = endpoints.licenseCheck ?? "/license/check";

  if (!licenseKey) {
    logWarn("No licenseKey set in config.json — skipping license test");
    return null;
  }

  logStep(`Calling ${apiBase}${path}`);

  const res = await apiRequest({
    base: apiBase,
    path,
    method: "POST",
    token: authToken,
    timeoutMs,
    body: { licenseKey },
  });

  if (!res.ok) {
    logFail(`License check failed (HTTP ${res.status})`);
    return false;
  }

  if (res.json && res.json.status) {
    logOk(`License status: ${res.json.status}`);
  } else {
    logWarn("License endpoint returned no 'status' field — check API shape");
  }

  return true;
}

async function testChat(config) {
  logSection("Test 4 — AI Chat Endpoint");

  const { apiBase, timeoutMs, endpoints, authToken, payloads } = config;
  const path = endpoints.chat ?? "/ai/chat";

  logStep(`Calling ${apiBase}${path}`);

  const body = payloads.chatTest ?? {
    prompt: "Say 'RinaWarp AI test OK' in one short sentence.",
  };

  const res = await apiRequest({
    base: apiBase,
    path,
    method: "POST",
    token: authToken,
    timeoutMs,
    body,
  });

  if (!res.ok) {
    logFail(`Chat failed (HTTP ${res.status})`);
    return false;
  }

  if (!res.json) {
    logWarn("Chat endpoint returned no JSON body");
    return false;
  }

  const text =
    res.json.text ||
    res.json.message ||
    res.json.output ||
    JSON.stringify(res.json).slice(0, 200);

  logOk(`AI response sample: ${text}`);
  return true;
}

async function testCommand(config) {
  logSection("Test 5 — AI Command / Shell Integration");

  const { apiBase, timeoutMs, endpoints, authToken, payloads } = config;
  const path = endpoints.command ?? "/ai/command";

  logStep(`Calling ${apiBase}${path}`);

  const body = payloads.commandTest ?? { command: "ls", args: [] };

  const res = await apiRequest({
    base: apiBase,
    path,
    method: "POST",
    token: authToken,
    timeoutMs,
    body,
  });

  if (!res.ok) {
    logFail(`Command endpoint failed (HTTP ${res.status})`);
    return false;
  }

  if (!res.json) {
    logWarn("Command endpoint returned no JSON body");
    return false;
  }

  if (res.json.stdout || res.json.stderr) {
    logOk("Command execution returned stdout/stderr as expected");
  } else {
    logWarn("Command response missing stdout/stderr — check API shape");
  }

  return true;
}

async function testRinaMode(config) {
  logSection("Test 6 — Rina Mode (Personality Integration)");

  const { apiBase, timeoutMs, endpoints, authToken, payloads } = config;
  const path = endpoints.chat ?? "/ai/chat";

  logStep(`Calling ${apiBase}${path} with mode=rina`);

  const body = payloads.chatTestRina ?? {
    prompt: "Briefly say 'RinaWarp AI test OK' in your own style.",
    mode: "rina",
    context: {
      moodHint: "playful",
      userSkillLevel: "intermediate",
      projectType: "terminal-pro"
    }
  };

  const res = await apiRequest({
    base: apiBase,
    path,
    method: "POST",
    token: authToken,
    timeoutMs,
    body,
  });

  if (!res.ok) {
    logFail(`Rina mode failed (HTTP ${res.status})`);
    return false;
  }

  if (!res.json) {
    logWarn("Rina mode returned no JSON body");
    return false;
  }

  const text =
    res.json.text ||
    res.json.message ||
    res.json.output ||
    JSON.stringify(res.json).slice(0, 200);

  if (res.json.persona === "Rina") {
    logOk(`Rina response sample: ${text}`);
  } else {
    logWarn(`Response received but persona not set to Rina: ${text}`);
    return false;
  }

  return true;
}

async function run() {
  logSection("RinaWarp AI Integration Test Suite");

  let config;
  try {
    config = await loadConfig();
  } catch (err) {
    console.error(chalk.red("Failed to load tests/config.json"));
    console.error(err);
    process.exit(1);
  }

  const results = [];

  results.push(await testPing(config));
  results.push(await testAuthVerify(config));
  results.push(await testLicense(config));
  results.push(await testChat(config));
  results.push(await testCommand(config));
  results.push(await testRinaMode(config));

  const passed = results.filter(r => r === true).length;
  const failed = results.filter(r => r === false).length;

  console.log(chalk.cyan("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
  console.log(chalk.cyan("📊 Test Summary"));
  console.log(chalk.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
  console.log(chalk.green(`  Passed: ${passed}`));
  console.log(chalk.red(`  Failed: ${failed}`));
  console.log(chalk.yellow(`  Skipped/Neutral: ${results.length - passed - failed}\n`));

  if (failed > 0) {
    process.exit(1);
  }
}

run();