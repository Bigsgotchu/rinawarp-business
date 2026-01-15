import { ipcRenderer } from 'electron';

const aiEl = document.getElementById('ai-suggestions')!;

ipcRenderer.on('ai-response', (event, suggestion: string) => {
  aiEl.textContent = suggestion;
});
