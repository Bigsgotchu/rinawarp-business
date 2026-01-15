import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

export function validateCommand(command: string) {
  const destructiveKeywords = ['rm', 'sudo', 'mkfs', 'dd'];
  const safe = !destructiveKeywords.some(k => command.includes(k));
  return { safe };
}

export async function runCommand(command: string) {
  return new Promise<{ output: string; status: string }>((resolve) => {
    exec(command, (err, stdout, stderr) => {
      resolve({ output: stdout + stderr, status: err ? 'error' : 'success' });
    });
  });
}

export function logCommand(command: string, result: { output: string; status: string }) {
  const logPath = path.join(__dirname, '../../logs/commands.json');
  const log = fs.existsSync(logPath) ? JSON.parse(fs.readFileSync(logPath, 'utf8')) : [];
  log.push({ timestamp: new Date(), command, result });
  fs.writeFileSync(logPath, JSON.stringify(log, null, 2));
}
