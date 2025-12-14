import { spawn } from "child_process";
import { registerTool } from "./registry";
import { stateManager } from "../state";

registerTool({
  name: "shell.run",
  description: "Run a shell command in a controlled environment",
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
  async run({ command, cwd, timeoutMs = 15000 }, ctx) {
    return new Promise((resolve) => {
      // Update working directory in state
      const workingDir = cwd ?? ctx.cwd ?? stateManager.getWorkingDirectory() ?? process.cwd();
      if (cwd) {
        stateManager.setWorkingDirectory(cwd);
      }

      // Update last command in state
      stateManager.setLastCommand(command);

      const proc = spawn(command, { shell: true, cwd: workingDir });

      let out = "";
      let err = "";
      const killTimer = setTimeout(() => {
        proc.kill("SIGKILL");
        resolve({ ok: false, code: -1, stdout: out, stderr: err, timeout: true });
      }, timeoutMs);

      proc.stdout.on("data", d => (out += d.toString()));
      proc.stderr.on("data", d => (err += d.toString()));
      proc.on("exit", (code) => {
        clearTimeout(killTimer);
        resolve({ ok: code === 0, code, stdout: out, stderr: err });
      });
    });
  }
});
