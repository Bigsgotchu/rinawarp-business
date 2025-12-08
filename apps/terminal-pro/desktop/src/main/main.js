// Use global Electron API (available when running in Electron)
const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = global.electron || {};
const path = require('path');
const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');

console.log('Starting RinaWarp Terminal Pro...');
console.log('Available electron modules:', {
  app: !!app,
  BrowserWindow: !!BrowserWindow,
  ipcMain: !!ipcMain,
  dialog: !!dialog,
  shell: !!shell
});

if (!app || !BrowserWindow || !ipcMain) {
  console.error('ERROR: Electron API not available. This script must be run with Electron.');
  process.exit(1);
}

console.log('App ready state:', app.isReady());
console.log('Development mode:', isDev);

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: true,
      preload: path.join(__dirname, '../shared/preload.js')
    },
    icon: path.join(__dirname, '../../assets/icons/icon.png'),
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    show: false // Don't show until ready-to-show
  });

  // Load the app
  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../renderer/index.html')}`;

  mainWindow.loadURL(startUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    // Focus on the window when initially shown
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Create application menu
function createMenu() {
  const template = [
    ...(process.platform === 'darwin' ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'New Terminal',
          accelerator: 'CmdOrCtrl+T',
          click: () => {
            mainWindow.webContents.send('menu-new-terminal');
          }
        },
        { type: 'separator' },
        {
          label: 'Open Folder',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openDirectory']
            });
            if (!result.canceled) {
              mainWindow.webContents.send('menu-open-folder', result.filePaths[0]);
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Close Terminal',
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            mainWindow.webContents.send('menu-close-terminal');
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'AI Features',
      submenu: [
        {
          label: 'AI Command Suggestions',
          accelerator: 'CmdOrCtrl+Shift+A',
          click: () => {
            mainWindow.webContents.send('menu-ai-suggestions');
          }
        },
        {
          label: 'Voice Commands',
          accelerator: 'CmdOrCtrl+Shift+V',
          click: () => {
            mainWindow.webContents.send('menu-voice-commands');
          }
        },
        {
          label: 'Explain Code',
          accelerator: 'CmdOrCtrl+Shift+E',
          click: () => {
            mainWindow.webContents.send('menu-explain-code');
          }
        },
        { type: 'separator' },
        {
          label: 'License Management',
          click: () => {
            mainWindow.webContents.send('menu-license');
          }
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
        ...(process.platform === 'darwin' ? [
          { type: 'separator' },
          { role: 'front' }
        ] : [
          { role: 'close' }
        ])
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'RinaWarp Terminal Pro Help',
          click: () => {
            shell.openExternal('https://rinawarptech.com/help');
          }
        },
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About RinaWarp Terminal Pro',
              message: 'RinaWarp Terminal Pro v1.0.0',
              detail: 'AI-powered terminal application for developers and creators.\n\nBuilt with ❤️ by RinaWarp Technologies'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC handlers using newer API for Electron 28 compatibility
ipcMain.handle('app-version', () => {
  return app.getVersion();
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-message-box', async (event, options) => {
  const result = await dialog.showMessageBox(mainWindow, options);
  return result;
});

ipcMain.handle('execute-command', async (event, command, options = {}) => {
  return new Promise((resolve, reject) => {
    const { exec } = require('child_process');
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        resolve({ error: error.message, code: error.code });
      } else {
        resolve({ stdout, stderr, code: 0 });
      }
    });
  });
});

// Terminal shell process management
const terminalSessions = new Map();

ipcMain.handle('create-terminal-session', async (event, terminalId, options = {}) => {
  try {
    const { spawn } = require('child_process');
    const shell = process.platform === 'win32' ? 'cmd.exe' : '/bin/bash';
    
    const shellOptions = {
      cwd: options.cwd || process.cwd(),
      env: process.env,
      stdio: ['pipe', 'pipe', 'pipe']
    };
    
    const shellProcess = spawn(shell, [], shellOptions);
    
    terminalSessions.set(terminalId, {
      process: shellProcess,
      cwd: shellOptions.cwd,
      created: Date.now()
    });
    
    // Handle output
    shellProcess.stdout.on('data', (data) => {
      event.sender.send('terminal-output', terminalId, data.toString());
    });
    
    shellProcess.stderr.on('data', (data) => {
      event.sender.send('terminal-error', terminalId, data.toString());
    });
    
    // Handle exit
    shellProcess.on('exit', (code) => {
      event.sender.send('terminal-exit', terminalId, code);
      terminalSessions.delete(terminalId);
    });
    
    return { success: true, shell: shell };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('write-to-terminal', async (event, terminalId, data) => {
  const session = terminalSessions.get(terminalId);
  if (session && session.process) {
    try {
      session.process.stdin.write(data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  return { success: false, error: 'Terminal session not found' };
});

ipcMain.handle('resize-terminal', async (event, terminalId, cols, rows) => {
  const session = terminalSessions.get(terminalId);
  if (session && session.process) {
    try {
      if (session.process.resize) {
        session.process.resize({ cols, rows });
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  return { success: false, error: 'Terminal session not found' };
});

ipcMain.handle('close-terminal-session', async (event, terminalId) => {
  const session = terminalSessions.get(terminalId);
  if (session && session.process) {
    try {
      session.process.kill();
      terminalSessions.delete(terminalId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  return { success: true }; // Already closed
});

ipcMain.handle('get-terminal-info', async (event, terminalId) => {
  const session = terminalSessions.get(terminalId);
  if (session) {
    return {
      terminalId,
      cwd: session.cwd,
      created: session.created,
      running: !session.process.killed
    };
  }
  return null;
});

// File system operations
ipcMain.handle('read-file', async (event, filePath) => {
  const fs = require('fs').promises;
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return content;
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('write-file', async (event, filePath, data) => {
  const fs = require('fs').promises;
  try {
    await fs.writeFile(filePath, data, 'utf8');
    return true;
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('get-current-directory', async () => {
  return process.cwd();
});

ipcMain.handle('change-directory', async (event, path) => {
  process.chdir(path);
  return process.cwd();
});

ipcMain.handle('get-directory-contents', async (event, dirPath) => {
  const fs = require('fs').promises;
  const path = require('path');

  try {
    const items = await fs.readdir(dirPath);
    const contents = await Promise.all(items.map(async (name) => {
      const fullPath = path.join(dirPath, name);
      const stats = await fs.stat(fullPath);
      return {
        name,
        path: fullPath,
        type: stats.isDirectory() ? 'folder' : 'file',
        size: stats.size,
        modified: stats.mtime
      };
    }));
    return contents;
  } catch (error) {
    throw error;
  }
});

// System information
ipcMain.handle('get-system-info', () => {
  return {
    platform: process.platform,
    arch: process.arch,
    version: process.version,
    cwd: process.cwd(),
    env: process.env
  };
});

// Settings management
ipcMain.handle('get-setting', async (event, key) => {
  // Simple settings storage using userData
  const settingsFile = path.join(app.getPath('userData'), 'settings.json');
  const fs = require('fs').promises;

  try {
    const data = await fs.readFile(settingsFile, 'utf8');
    const settings = JSON.parse(data);
    return settings[key];
  } catch (error) {
    return null;
  }
});

ipcMain.handle('set-setting', async (event, key, value) => {
  const settingsFile = path.join(app.getPath('userData'), 'settings.json');
  const fs = require('fs').promises;
  const path = require('path');

  try {
    let settings = {};
    try {
      const data = await fs.readFile(settingsFile, 'utf8');
      settings = JSON.parse(data);
    } catch (error) {
      // File doesn't exist yet, that's ok
    }

    settings[key] = value;
    await fs.writeFile(settingsFile, JSON.stringify(settings, null, 2), 'utf8');
    return true;
  } catch (error) {
    throw error;
  }
});

// Network status
ipcMain.handle('is-online', () => {
  return true; // Simplified - assume online
});

// Theme management
ipcMain.handle('get-current-theme', async () => {
  const settingsFile = path.join(app.getPath('userData'), 'settings.json');
  const fs = require('fs').promises;

  try {
    const data = await fs.readFile(settingsFile, 'utf8');
    const settings = JSON.parse(data);
    return settings.theme || 'mermaid';
  } catch (error) {
    return 'mermaid';
  }
});

ipcMain.handle('set-theme', async (event, themeName) => {
  const settingsFile = path.join(app.getPath('userData'), 'settings.json');
  const fs = require('fs').promises;

  try {
    let settings = {};
    try {
      const data = await fs.readFile(settingsFile, 'utf8');
      settings = JSON.parse(data);
    } catch (error) {
      // File doesn't exist yet, that's ok
    }

    settings.theme = themeName;
    await fs.writeFile(settingsFile, JSON.stringify(settings, null, 2), 'utf8');
    return true;
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('get-available-themes', async () => {
  return ['mermaid', 'dark', 'light', 'matrix', 'monokai', 'solarized-dark', 'solarized-light', 'high-contrast', 'night-owl'];
});

// Notification support
ipcMain.handle('show-notification', async (event, title, body) => {
  console.log(`Notification: ${title} - ${body}`);
  return true;
});

// Terminal operations
ipcMain.handle('create-terminal', async (event, options) => {
  return { id: Date.now().toString() };
});

ipcMain.handle('write-terminal', async (event, terminalId, data) => {
  console.log(`Writing to terminal ${terminalId}:`, data);
  return true;
});

ipcMain.handle('resize-terminal', async (event, terminalId, cols, rows) => {
  console.log(`Resizing terminal ${terminalId} to ${cols}x${rows}`);
  return true;
});

// License management (placeholder)
ipcMain.handle('validate-license', async (event, licenseKey) => {
  return { valid: false, tier: 'free' };
});

ipcMain.handle('get-license-info', async () => {
  return { tier: 'free', valid: false };
});

ipcMain.handle('purchase-license', async (event, tier) => {
  return { success: false };
});

// AI features (placeholder)
ipcMain.handle('ai-command-suggestion', async (event, naturalLanguage) => {
  return 'AI command suggestions not implemented yet';
});

ipcMain.handle('explain-code', async (event, code, language) => {
  return 'Code explanation not implemented yet';
});

ipcMain.handle('quick-fix', async (event, error, context) => {
  return 'Quick fix not implemented yet';
});

// Voice commands (placeholder)
ipcMain.handle('start-voice-recognition', async () => {
  return true;
});

ipcMain.handle('stop-voice-recognition', async () => {
  return true;
});

// Feature flags
ipcMain.handle('has-feature', async (event, feature) => {
  return feature === 'basic-terminal';
});

ipcMain.handle('is-pro-user', async () => {
  return false;
});

ipcMain.handle('get-license-tier', async () => {
  return 'free';
});

// App event handlers
app.whenReady().then(() => {
  console.log('App is ready, creating window...');
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  console.log('All windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// Auto-updater events (when ready)
if (!isDev) {
  try {
    const { autoUpdater } = require('electron-updater');
    
    autoUpdater.checkForUpdatesAndNotify();

    autoUpdater.on('checking-for-update', () => {
      console.log('Checking for update...');
    });

    autoUpdater.on('update-available', (info) => {
      console.log('Update available:', info);
    });

    autoUpdater.on('update-not-available', (info) => {
      console.log('Update not available:', info);
    });

    autoUpdater.on('error', (err) => {
      console.log('Error in auto-updater:', err);
    });

    autoUpdater.on('download-progress', (progressObj) => {
      let log_message = "Download speed: " + progressObj.bytesPerSecond;
      log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
      log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
      console.log(log_message);
    });

    autoUpdater.on('update-downloaded', (info) => {
      console.log('Update downloaded:', info);
      autoUpdater.quitAndInstall();
    });
  } catch (error) {
    console.log('Auto-updater not available:', error.message);
  }
}