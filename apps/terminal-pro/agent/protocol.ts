import { runShell } from "./tools/shell";
import { runAI } from "./tools/ai";

export async function handleMessage(msg: any) {
  switch (msg.type) {
    case "shell:run":
      return runShell(msg);

    case "ai:run":
      return runAI(msg);

    default:
      process.send?.({
        type: "agent:warn",
        message: `Unknown message ${msg.type}`,
      });
  }
}
