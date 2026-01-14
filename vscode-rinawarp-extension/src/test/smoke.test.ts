import * as vscode from "vscode";

async function assertCommandExists(cmd: string) {
  const commands = await vscode.commands.getCommands(true);
  if (!commands.includes(cmd)) {
    throw new Error(`Missing command: ${cmd}`);
  }
}

(async () => {
  await assertCommandExists("rinawarp.plan");
  await assertCommandExists("rinawarp.execute");
  await assertCommandExists("rinawarp.openPanel");
  console.log("Smoke tests passed");
})();