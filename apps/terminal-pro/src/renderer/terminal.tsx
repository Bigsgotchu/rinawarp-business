import { ipcRenderer } from 'electron';
import './style.css';

const outputEl = document.getElementById('terminal-output')!;
const inputEl = document.getElementById('terminal-input') as HTMLInputElement;
const aiEl = document.getElementById('ai-suggestions')!;

function appendOutput(line: string) {
  const div = document.createElement('div');
  div.textContent = line;
  outputEl.appendChild(div);
  outputEl.scrollTop = outputEl.scrollHeight;
}

async function runCommand(command: string) {
  appendOutput(`$ ${command}`);
  const result = await ipcRenderer.invoke('execute-command', command);
  appendOutput(result.output || result.status);
}

inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    runCommand(inputEl.value);
    inputEl.value = '';
  }
});

document.addEventListener('keydown', async (e) => {
  if (e.ctrlKey && e.key.toLowerCase() === 'r') {
    const command = inputEl.value;
    if (!command) return;
    const suggestion = await ipcRenderer.invoke('ai-suggestion', command);
    aiEl.textContent = suggestion || 'No suggestion available';
  }
});
