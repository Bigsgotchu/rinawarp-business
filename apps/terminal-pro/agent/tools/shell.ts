import { spawn } from "child_process";
import { stateManager } from "../state";

export function runShell({ command, cwd }: any) {
  // Update working directory in state
  if (cwd) {
    stateManager.setWorkingDirectory(cwd);
  }

  // Update last command in state
  stateManager.setLastCommand(command);

  const proc = spawn(command, { 
    cwd: cwd || stateManager.getWorkingDirectory() || process.cwd(), 
    shell: true 
  });

  proc.stdout.on("data", (data) => {
    process.send?.({
      type: "shell:stdout",
      data: data.toString(),
    });
  });

  proc.stderr.on("data", (data) => {
    process.send?.({
      type: "shell:stderr",
      data: data.toString(),
    });
  });

  proc.on("exit", (code) => {
    process.send?.({
      type: "shell:exit",
      code,
    });
  });

  proc.on("error", (err) => {
    process.send?.({
      type: "shell:error",
      error: err.message,
    });
  });
}
