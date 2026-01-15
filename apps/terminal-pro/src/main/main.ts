import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { runCommand, validateCommand, logCommand } from '../shared/safety';

let mainWindow: BrowserWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
}

app.whenReady().then(createWindow);

// Command execution
ipcMain.handle('execute-command', async (event, command: string) => {
  const safety = validateCommand(command);
  if (!safety.safe) {
    const confirm = await dialog.showMessageBox(mainWindow, {
      type: 'warning',
      buttons: ['Cancel', 'Proceed'],
      defaultId: 1,
      title: 'Confirm Command',
      message: `The command "${command}" may be destructive. Proceed?`,
    });
    if (confirm.response !== 1) return { status: 'cancelled' };
  }
  const result = await runCommand(command);
  logCommand(command, result);
  return result;
});

// AI suggestion handler
ipcMain.handle('ai-suggestion', async (event, command: string) => {
  // Replace with FastAPI backend call later
  return `Rina suggests: ${command} --safe`;
});
