"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runShell = runShell;
const child_process_1 = require("child_process");
const state_1 = require("../state");
function runShell({ command, cwd }) {
    if (cwd) {
        state_1.stateManager.setWorkingDirectory(cwd);
    }
    state_1.stateManager.setLastCommand(command);
    const proc = (0, child_process_1.spawn)(command, {
        cwd: cwd || state_1.stateManager.getWorkingDirectory() || process.cwd(),
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
