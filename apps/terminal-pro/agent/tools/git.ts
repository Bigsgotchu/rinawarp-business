import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function runGit({ command, cwd }: { command: string; cwd?: string }) {
  try {
    const { stdout, stderr } = await execAsync(command, { cwd: cwd || process.cwd() });
    
    if (stdout) {
      process.send?.({
        type: "git:stdout",
        data: stdout,
      });
    }
    
    if (stderr) {
      process.send?.({
        type: "git:stderr",
        data: stderr,
      });
    }
    
    process.send?.({
      type: "git:exit",
      code: 0,
    });
  } catch (error: any) {
    process.send?.({
      type: "git:stderr",
      data: error.message || String(error),
    });
    
    process.send?.({
      type: "git:exit",
      code: error.code || 1,
    });
  }
}
