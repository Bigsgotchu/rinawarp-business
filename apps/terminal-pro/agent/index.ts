import { setupSupervisor } from "./supervisor";
import { handleMessage } from "./protocol";

console.log("[RinaAgent] starting…");

process.on("message", async (msg) => {
  try {
    await handleMessage(msg);
  } catch (err) {
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
});
