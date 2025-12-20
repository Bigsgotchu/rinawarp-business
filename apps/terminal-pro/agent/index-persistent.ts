import { setupSupervisor } from "./supervisor";
import { handleMessage } from "./protocol-persistent";
import "./tools"; // Initialize all tools and register them

console.log("[RinaAgent] Persistent memory version starting…");

process.on("message", async (msg) => {
  try {
    await handleMessage(msg);
  } catch (err) {
    console.error("[RinaAgent] Error handling message:", err);
    process.send?.({
      type: "agent:error",
      error: String(err),
    });
  }
});

setupSupervisor();

process.send?.({
  type: "agent:ready",
  pid: process.pid,
  version: "persistent",
  capabilities: {
    memory: "sqlite",
    reasoning: "heuristic",
    tools: "registry-based",
    permissions: "granular",
  },
  tools: [
    "shell.run",
    "memory:get", 
    "memory:put",
    "memory:recent",
    "ai.run",
    "process.list",
    "process.kill", 
    "network.connections",
    "system.info"
  ]
});
