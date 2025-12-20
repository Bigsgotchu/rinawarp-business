import { registerTool } from "./registry.js";
import { spawn } from "child_process";
import os from "os";
import { kvGet, kvSet, getRecentMessages } from "../memory/store.js";

export function registerBuiltinTools() {
  // memory:get - Get a value from persistent key-value storage
  registerTool({
    name: "memory:get",
    description: "Get a value from persistent key-value storage",
    requires: [],
    schema: {
      type: "object",
      properties: {
        key: { type: "string" }
      },
      required: ["key"]
    },
    async run({ key }) {
      return kvGet(key);
    }
  });

  // memory:put - Store a key-value pair in persistent storage
  registerTool({
    name: "memory:put",
    description: "Store a key-value pair in persistent storage",
    requires: [],
    schema: {
      type: "object",
      properties: {
        key: { type: "string" },
        value: { type: "string" }
      },
      required: ["key", "value"]
    },
    async run({ key, value }) {
      kvSet(key, value);
      return { ok: true };
    }
  });

  // memory:recent - Get recent messages from a conversation
  registerTool({
    name: "memory:recent",
    description: "Get recent messages from a conversation",
    requires: [],
    schema: {
      type: "object",
      properties: {
        convoId: { type: "string" },
        limit: { type: "number", default: 30 }
      },
      required: ["convoId"]
    },
    async run({ convoId, limit = 30 }) {
      return getRecentMessages(convoId, limit);
    }
  });

  // system.info
  registerTool({
    name: "system.info",
    description: "Basic system info (cpu/mem/platform)",
    requires: [],
    schema: { type: "object", properties: {} },
    run() {
      return {
        platform: process.platform,
        arch: process.arch,
        cpus: os.cpus()?.length ?? 0,
        totalMemGB: Math.round(os.totalmem() / (1024 ** 3)),
        uptime: Math.round(process.uptime())
      };
    }
  });

  // shell.run
  registerTool({
    name: "shell.run",
    description: "Run shell command with timeout",
    requires: ["shell"],
    schema: {
      type: "object",
      properties: {
        command: { type: "string" },
        cwd: { type: "string" },
        timeoutMs: { type: "number", default: 15000 }
      },
      required: ["command"]
    },
    async run({ command, cwd, timeoutMs = 15000 }) {
      return new Promise((resolve) => {
        const proc = spawn(command, { shell: true, cwd: cwd ?? process.cwd() });

        let stdout = "";
        let stderr = "";

        const killTimer = setTimeout(() => {
          proc.kill("SIGKILL");
          resolve({ ok: false, code: -1, stdout, stderr, timeout: true });
        }, timeoutMs);

        proc.stdout.on("data", d => (stdout += d.toString()));
        proc.stderr.on("data", d => (stderr += d.toString()));
        proc.on("exit", (code) => {
          clearTimeout(killTimer);
          resolve({ ok: code === 0, code, stdout, stderr });
        });
      });
    }
  });
}
