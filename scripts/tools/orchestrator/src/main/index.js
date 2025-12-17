import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { createRinaAgent } from '../agent/index.js';

let win, agent;
async function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/rinaBridge.js'),
      nodeIntegration: false,
    },
  });
  await win.loadURL(process.env.APP_URL || 'http://localhost:5173');
}
app.whenReady().then(async () => {
  agent = await createRinaAgent();
  await createWindow();
});
ipcMain.handle('app:version', () => app.getVersion());
ipcMain.handle('rina:run', async (_evt, { mode, goal, context }) => agent.run(mode, goal, context));
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
