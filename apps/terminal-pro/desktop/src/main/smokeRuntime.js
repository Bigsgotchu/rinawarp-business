import { BrowserWindow } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(new URL(import.meta.url));
const __dirname = path.dirname(__filename);
export async function runRuntimeSmoke() {
    const win = new BrowserWindow({ show: false, webPreferences: { sandbox: true } });
    const indexHtml = path.join(__dirname, '..', 'renderer', 'index-conversation.html');
    await win.loadFile(indexHtml);
    // If load succeeded, we're good.
    win.destroy();
}
