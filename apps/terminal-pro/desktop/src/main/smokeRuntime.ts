import { BrowserWindow } from 'electron';
import path from 'node:path';

export async function runRuntimeSmoke(): Promise<void> {
    const win = new BrowserWindow({ show: false, webPreferences: { sandbox: true } });
    // Compiled under CJS; __dirname is available.
    const indexHtml = path.join(__dirname, '..', 'renderer', 'index.html');
    await win.loadFile(indexHtml);
    // If load succeeded, we're good.
    win.destroy();
}