const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs'); // <--- NEW: Need fs for writing local files
const adb = require('adbkit');
const iosClient = require('./mock-ios-client');
const { exec } = require('child_process');

const adbClient = adb.createClient();
const adbUtil = adb.util;
const fsPromises = fs.promises;
const posixPath = path.posix;

const DEFAULT_ANDROID_BACKUP_PATHS = [
  '/sdcard/DCIM',
  '/sdcard/Download',
  '/sdcard/Documents',
  '/sdcard',
];

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      enableRemoteModule: false,
    },
  });

  mainWindow.loadFile('index.html');
  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// ------------------------------------------------------------------
// IPC Handlers
// ------------------------------------------------------------------

// 1. Device Listing (Android and iOS support)
ipcMain.handle('list-devices', async () => {
  console.log('Scanning for devices...');
  let deviceList = [];

  try {
    const androidDevices = await adbClient.listDevices();
    deviceList.push(
      ...androidDevices.map((device) => ({
        id: device.id,
        platform: 'android',
        state: device.state,
        name: device.id,
      })),
    );
  } catch (error) {
    console.warn(
      'Android (ADB) scan failed. Server might not be running or no devices connected.',
      error.message,
    );
  }

  try {
    const iosDevices = await iosClient.listDevices();
    deviceList.push(...iosDevices);
  } catch (error) {
    console.error('Mock iOS scan failed:', error);
  }

  if (deviceList.length === 0) {
    throw new Error(
      'No devices found. Ensure ADB is running and a device is connected, or check iOS environment setup.',
    );
  }

  console.log('Devices found:', deviceList);
  return deviceList;
});

// 2. File Browsing (Android and iOS support)
ipcMain.handle('browse-device-files', async (event, deviceId, platform, targetPath) => {
  try {
    if (platform === 'android') {
      const files = await adbClient.readdir(deviceId, targetPath);
      return files
        .map((file) => ({
          name: file.name,
          path: targetPath.endsWith('/')
            ? `${targetPath}${file.name}`
            : `${targetPath}/${file.name}`,
          isDirectory: file.isDirectory(),
          isFile: file.isFile(),
          size: file.size ? file.size.toString() : '0',
          mtime: file.mtime || 0,
        }))
        .sort((a, b) => {
          if (a.isDirectory !== b.isDirectory) {
            return a.isDirectory ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        });
    } else if (platform === 'ios') {
      const files = await iosClient.readdir(deviceId, targetPath);
      return files.sort((a, b) => {
        if (a.isDirectory !== b.isDirectory) {
          return a.isDirectory ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
    }
    throw new Error(`Unsupported platform for file browsing.`);
  } catch (error) {
    console.error(`Error browsing files on ${platform}/${deviceId}:`, error);
    throw new Error(`Failed to browse files on '${targetPath}': ${error.message}`);
  }
});

// 3. Open Folder Dialog
ipcMain.handle('open-folder-dialog', async () => {
  return dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
});

// 4. Open Save Dialog (NEW) - For Downloads
ipcMain.handle('open-save-dialog', async (event, defaultFilename) => {
  return dialog.showSaveDialog({
    defaultPath: defaultFilename,
  });
});

// 5. Open File Dialog (NEW) - For selecting APK/IPA files
ipcMain.handle('open-file-dialog', async (event, extensions = ['*']) => {
  return dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Applications', extensions }],
  });
});

// 5. File Pull (Download) (Android and iOS support)
ipcMain.handle('pull-file', async (event, deviceId, remotePath, localPath, platform) => {
  console.log(`Pulling ${remotePath} to ${localPath} on device ${deviceId} (${platform}).`);

  try {
    if (platform === 'android') {
      await pullAndroidFile(deviceId, remotePath, localPath);
      return { success: true, message: `Successfully downloaded to ${localPath}` };
    } else if (platform === 'ios') {
      await iosClient.pull(deviceId, remotePath, localPath);
      return { success: true, message: `iOS pull initiated. (MOCK success)` };
    }
    throw new Error('Unsupported platform for file pull.');
  } catch (error) {
    console.error(`Error pulling file ${remotePath} on ${platform}:`, error);
    throw new Error(`Failed to download file: ${error.message}`);
  }
});

// 6. Remote Device Shutdown (Android and iOS support)
ipcMain.handle('shutdown-device', async (event, deviceId, platform) => {
  try {
    if (platform === 'android') {
      const output = await adbClient.shell(deviceId, 'reboot -p');
      await new Promise((resolve, reject) => {
        output.on('end', resolve);
        output.on('error', reject);
      });
      console.log(`Android device ${deviceId} received shutdown command.`);
      return {
        success: true,
        message: `Shutdown command sent to Android device ${deviceId}.`,
      };
    } else if (platform === 'ios') {
      await iosClient.shell(deviceId, 'shutdown');
      return {
        success: true,
        message: `Shutdown command sent to Mock iOS device ${deviceId}.`,
      };
    }
    throw new Error('Unsupported platform for shutdown.');
  } catch (error) {
    console.error(`Error shutting down ${platform} device ${deviceId}:`, error);
    throw new Error(`Failed to send shutdown command: ${error.message}`);
  }
});

// 7. Remote Text Input (Android and iOS support)
ipcMain.handle('send-input-text', async (event, deviceId, platform, text) => {
  try {
    if (platform === 'android') {
      const command = `input text "${text}"`;
      const output = await adbClient.shell(deviceId, command);
      await new Promise((resolve, reject) => {
        output.on('end', resolve);
        output.on('error', reject);
      });
      console.log(`Text input sent to Android device ${deviceId}.`);
      return { success: true, message: `Input sent successfully to Android device.` };
    } else if (platform === 'ios') {
      await iosClient.shell(deviceId, `input text "${text}"`);
      console.log(`Text input sent to Mock iOS device ${deviceId}.`);
      return { success: true, message: `Input sent successfully to Mock iOS device.` };
    }
    throw new Error('Unsupported platform for remote input.');
  } catch (error) {
    console.error(`Error sending input text to ${platform} device ${deviceId}:`, error);
    throw new Error(`Failed to send input: ${error.message}`);
  }
});

// 8. Device Backup
ipcMain.handle('backup-device', async (event, payload = {}) => {
  const { deviceId, platform, destination, paths = DEFAULT_ANDROID_BACKUP_PATHS } = payload;
  if (!deviceId || !platform || !destination) {
    throw new Error('Missing parameters for backup request.');
  }

  try {
    if (platform === 'android') {
      await fsPromises.mkdir(destination, { recursive: true });
      const summary = [];
      const requestedPaths =
        Array.isArray(paths) && paths.length ? paths : DEFAULT_ANDROID_BACKUP_PATHS;
      for (const remotePath of requestedPaths) {
        const sanitized = sanitizeRemotePath(remotePath);
        const localTarget = path.join(destination, sanitized);
        const stats = await backupAndroidPath(deviceId, remotePath, localTarget);
        summary.push({ remotePath, localPath: localTarget, stats });
      }
      return { success: true, summary };
    } else if (platform === 'ios') {
      return await iosClient.backup(deviceId, { destination, paths });
    }
    throw new Error('Unsupported platform for backup.');
  } catch (error) {
    console.error('Backup failed:', error);
    throw new Error(`Backup failed: ${error.message}`);
  }
});

// 9. Device Restore (prototype)
ipcMain.handle('restore-device', async (event, payload = {}) => {
  const { deviceId, platform, source, remoteRoot = '/sdcard' } = payload;
  if (!deviceId || !platform || !source) {
    throw new Error('Missing parameters for restore request.');
  }

  try {
    if (platform === 'android') {
      const stats = await restoreAndroidFromLocal(deviceId, source, remoteRoot);
      return { success: true, stats };
    } else if (platform === 'ios') {
      return await iosClient.restore(deviceId, { source, remoteRoot });
    }
    throw new Error('Unsupported platform for restore.');
  } catch (error) {
    console.error('Restore failed:', error);
    throw new Error(`Restore failed: ${error.message}`);
  }
});

// 10. Application Management
ipcMain.handle('list-apps', async (event, deviceId, platform) => {
  if (!deviceId || !platform) {
    throw new Error('Missing parameters for list-apps.');
  }
  try {
    if (platform === 'android') {
      const output = await readShellString(deviceId, 'pm list packages -3');
      return output
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.startsWith('package:'))
        .map((line) => {
          const pkg = line.replace('package:', '').trim();
          return { name: pkg, identifier: pkg, platform: 'android' };
        });
    } else if (platform === 'ios') {
      const apps = await iosClient.listApplications(deviceId);
      return apps.map((app) => ({
        name: app.CFBundleDisplayName || app.CFBundleIdentifier,
        identifier: app.CFBundleIdentifier,
        platform: 'ios',
      }));
    }
    throw new Error('Unsupported platform for listing applications.');
  } catch (error) {
    console.error('Application listing failed:', error);
    throw new Error(`Failed to list applications: ${error.message}`);
  }
});

ipcMain.handle('install-app', async (event, deviceId, platform, localPath) => {
  if (!deviceId || !platform || !localPath) {
    throw new Error('Missing parameters for install-app.');
  }
  try {
    if (platform === 'android') {
      await adbClient.install(deviceId, localPath);
      return { success: true, message: 'APK installed successfully.' };
    } else if (platform === 'ios') {
      await iosClient.installApp(deviceId, localPath);
      return { success: true, message: 'IPA/App installed successfully.' };
    }
    throw new Error('Unsupported platform for app installation.');
  } catch (error) {
    console.error('Application install failed:', error);
    throw new Error(`Failed to install application: ${error.message}`);
  }
});

ipcMain.handle('uninstall-app', async (event, deviceId, platform, identifier) => {
  if (!deviceId || !platform || !identifier) {
    throw new Error('Missing parameters for uninstall-app.');
  }
  try {
    if (platform === 'android') {
      await adbClient.uninstall(deviceId, identifier);
      return { success: true, message: `Package ${identifier} uninstalled successfully.` };
    } else if (platform === 'ios') {
      await iosClient.uninstallApp(deviceId, identifier);
      return { success: true, message: `App ${identifier} uninstalled successfully.` };
    }
    throw new Error('Unsupported platform for app uninstall.');
  } catch (error) {
    console.error('Application uninstall failed:', error);
    throw new Error(`Failed to uninstall application: ${error.message}`);
  }
});

// 11. Advanced reboot modes
ipcMain.handle('reboot-device-mode', async (event, payload = {}) => {
  const { deviceId, platform, mode = 'reboot' } = payload;
  if (!deviceId || !platform) {
    throw new Error('Missing parameters for reboot command.');
  }
  try {
    if (platform === 'android') {
      const command =
        mode === 'recovery' || mode === 'bootloader' || mode === 'download'
          ? `reboot ${mode}`
          : 'reboot';
      const output = await adbClient.shell(deviceId, command);
      await new Promise((resolve, reject) => {
        output.on('end', resolve);
        output.on('error', reject);
      });
      return { success: true, message: `Android reboot command (${mode}) sent.` };
    } else if (platform === 'ios') {
      return await iosClient.reboot(deviceId, mode);
    }
    throw new Error('Unsupported platform for reboot.');
  } catch (error) {
    console.error('Reboot failed:', error);
    throw new Error(`Failed to reboot device: ${error.message}`);
  }
});

// 12. Diagnostics
ipcMain.handle('get-battery-info', async (event, deviceId, platform) => {
  if (!deviceId || !platform) {
    throw new Error('Missing parameters for get-battery-info.');
  }
  try {
    if (platform === 'android') {
      const output = await readShellString(deviceId, 'dumpsys battery');
      return parseBatteryInfo(output);
    } else if (platform === 'ios') {
      return await iosClient.getBatteryInfo(deviceId);
    }
    throw new Error('Unsupported platform for battery info.');
  } catch (error) {
    console.error('Battery info failed:', error);
    throw new Error(`Failed to read battery info: ${error.message}`);
  }
});

ipcMain.handle('get-system-info', async (event, deviceId, platform) => {
  if (!deviceId || !platform) {
    throw new Error('Missing parameters for get-system-info.');
  }
  try {
    if (platform === 'android') {
      const output = await readShellString(deviceId, 'getprop');
      return parseSystemInfo(output);
    } else if (platform === 'ios') {
      return await iosClient.getSystemInfo(deviceId);
    }
    throw new Error('Unsupported platform for system info.');
  } catch (error) {
    console.error('System info failed:', error);
    throw new Error(`Failed to read system info: ${error.message}`);
  }
});

// 13. Recovery wizard mock
ipcMain.handle('start-recovery-scan', async (event, deviceId, platform, dataType) => {
  if (!deviceId || !platform || !dataType) {
    throw new Error('Missing parameters for recovery scan.');
  }

  console.log(`Starting ${dataType} recovery scan on ${platform} device ${deviceId}...`);

  try {
    if (platform === 'android') {
      await delay(5000);
      return [
        {
          id: 1,
          type: 'Photo',
          name: 'IMG_0001.jpg',
          size: '1.2MB',
          status: 'Recoverable',
        },
        { id: 2, type: 'Message', name: 'SMS from Mom', size: '1KB', status: 'Partial' },
        {
          id: 3,
          type: dataType,
          name: `${dataType} Sample`,
          size: '3MB',
          status: 'Recoverable',
        },
      ];
    } else if (platform === 'ios') {
      await iosClient.startRecoveryScan(deviceId, dataType);
      return [
        {
          id: 101,
          type: 'Contact',
          name: 'John Doe',
          size: '1KB',
          status: 'Recoverable',
        },
        {
          id: 102,
          type: 'Video',
          name: 'VID_002.mov',
          size: '120MB',
          status: 'Corrupted',
        },
      ];
    }
    throw new Error('Unsupported platform for recovery scan.');
  } catch (error) {
    console.error('Recovery scan failed:', error);
    throw new Error(`Recovery scan failed: ${error.message}`);
  }
});

// 14. Execute Privileged Command
ipcMain.handle('execute-privileged-command', async (event, deviceId, platform, command) => {
  if (!deviceId || !platform || !command) {
    throw new Error('Missing parameters for privileged execution.');
  }
  try {
    if (platform === 'android') {
      const escaped = command.replace(/"/g, '\\"');
      const privilegedCommand = `su -c "${escaped}"`;
      const outputStream = await adbClient.shell(deviceId, privilegedCommand);
      let output = '';
      await new Promise((resolve, reject) => {
        outputStream.on('data', (chunk) => {
          output += chunk.toString();
        });
        outputStream.on('end', resolve);
        outputStream.on('error', reject);
      });
      return {
        success: true,
        output: output.trim() || 'Command executed with no output.',
      };
    } else if (platform === 'ios') {
      if (typeof iosClient.executePrivileged === 'function') {
        return await iosClient.executePrivileged(deviceId, command);
      }
      if (command.includes('testdisk')) {
        return {
          success: true,
          output: 'iOS MOCK: Ran privileged testdisk binary. Output: Found 5 partitions.',
        };
      }
      throw new Error('iOS privileged execution requires SSH access on a jailbroken device.');
    }
    throw new Error('Unsupported platform for privileged execution.');
  } catch (error) {
    console.error(`Privileged command failed on ${platform}/${deviceId}:`, error);
    throw new Error(`Privileged command failed: ${error.message}`);
  }
});

// 15. Enhanced Health Diagnostics
ipcMain.handle('run-health-diagnostics', async (event, deviceId, platform) => {
  if (!deviceId || !platform) {
    throw new Error('Missing parameters for health diagnostics.');
  }

  try {
    if (platform === 'android') {
      // 1. Data Collection (using ADB shell commands)
      let rawBattery = '';
      let rawThermal = '';
      let rawStorage = '';

      try {
        // --- ADB Command Examples for Android ---
        // Get Battery stats
        rawBattery = await execShell(deviceId, 'dumpsys battery');
        // Get Thermal stats (requires root or specific permissions on some devices)
        rawThermal = await execShell(deviceId, 'cat /sys/class/thermal/thermal_zone*/temp');
        // Get Storage information (simulated S.M.A.R.T. for flash storage)
        rawStorage = await execShell(deviceId, 'dumpsys diskstats');
      } catch (error) {
        console.error('Error running ADB shell for diagnostics:', error);
        throw new Error('Failed to run low-level diagnostics on device.');
      }

      // 2. Data Parsing and AI/Prediction Logic (Simple Example)
      let healthScore = 100;
      let prediction = 'No major issues detected. Device health is optimal.';

      // --- Battery Analysis ---
      const levelMatch = rawBattery.match(/level: (\d+)/);
      const scaleMatch = rawBattery.match(/scale: (\d+)/);
      const healthMatch = rawBattery.match(/health: (.+)/);

      // In a real app, you'd calculate capacity based on design capacity vs. actual charging behavior
      if (levelMatch && parseInt(levelMatch[1]) < 90) {
        healthScore -= 5;
        prediction = 'Battery capacity may be degraded. Consider replacement soon.';
      }

      // --- Thermal Analysis ---
      const temps = rawThermal
        .split('\n')
        .filter((t) => t.trim().length > 0)
        .map((t) => parseInt(t) / 1000); // Convert from millidegree to Celsius
      const maxTemp = Math.max(...temps);
      if (maxTemp > 45) {
        // Over 45°C is critical
        healthScore -= 15;
        prediction +=
          '\nCritical: High thermal stress detected during scan. This indicates potential hardware degradation or poor thermal paste.';
      }

      // --- Storage Analysis (Wear Leveling) ---
      // This requires complex parsing, but for a mock:
      if (rawStorage.includes('Bad sectors: 5+')) {
        healthScore -= 20;
        prediction +=
          '\nWarning: Flash storage shows evidence of bad sectors. High risk of data corruption or loss. **Backup immediately.**';
      }

      healthScore = Math.max(0, healthScore); // Cap at 0

      // 3. Return results to Renderer
      return {
        score: healthScore,
        battery: `Level: ${levelMatch ? levelMatch[1] + '%' : 'N/A'} (Health: ${healthMatch ? healthMatch[1] : 'Unknown'})`,
        storage: rawStorage.includes('Bad sectors: 5+') ? 'Degraded/Failing' : 'Optimal',
        thermal: `Max Temperature: ${maxTemp ? maxTemp + '°C' : 'N/A'}`,
        prediction: prediction,
      };
    } else if (platform === 'ios') {
      if (typeof iosClient.runHealthDiagnostics === 'function') {
        return await iosClient.runHealthDiagnostics(deviceId);
      }
      return {
        score: 88,
        battery: 'Mock iOS battery at 88% health.',
        storage: 'Mock storage usage 72%.',
        thermal: 'Mock chassis temperature 36.5°C.',
        prediction: 'Mock iOS: Device operating within expected parameters.',
      };
    }
    throw new Error('Unsupported platform for health diagnostics.');
  } catch (error) {
    console.error(`Health diagnostics failed on ${platform}/${deviceId}:`, error);
    throw new Error(`Health diagnostics failed: ${error.message}`);
  }
});

// 16. Secure Unlock with Proof of Purchase
ipcMain.handle('trigger-secure-unlock', async (event, deviceId, proofFilePath) => {
  console.log(`Attempting secure unlock for ${deviceId} with proof file: ${proofFilePath}`);

  // --- STEP 1: Proof of Purchase Verification (Logical/Legal Step) ---
  // In a real application, you would use OCR or a service here to
  // automatically verify the legitimacy of the receipt/document.
  try {
    // Simple file existence check as a placeholder for validation
    if (!fs.existsSync(proofFilePath)) {
      return {
        success: false,
        message: 'Proof of purchase file not found on host computer.',
      };
    }

    // Read the file content (optional, but good for validation)
    // const fileData = fs.readFileSync(proofFilePath);
    console.log('Proof of purchase file verified to exist locally.');
  } catch (e) {
    return { success: false, message: `Error processing proof file: ${e.message}` };
  }

  // --- STEP 2: Forensic Execution (Technical Step) ---

  // Low-level commands to bypass a screen lock. These commands require
  // root access (su) and are highly device/OS-specific. You must have
  // a device-specific exploit or tool to run here.

  try {
    // PUSHING a specialized binary (Forensic Tool)
    const toolPath = `/path/to/your/compiled/unlock-binary`; // Example: An exploit or key-extractor
    const deviceTempPath = '/data/local/tmp/unlock_exec';

    // 1. Push the binary (Requires adb push command, which runs outside of 'shell')
    // const pushOutput = await new Promise((resolve, reject) => {
    //     exec(`adb -s ${deviceId} push ${toolPath} ${deviceTempPath}`, (err, stdout, stderr) => {
    //         if (err) return reject(err);
    //         resolve(stdout);
    //     });
    // });
    // console.log(`Push successful: ${pushOutput}`);

    // For this implementation, we will use a simple shell command as a placeholder:
    const unlockCommand = `su -c "input keyevent 82 && rm /data/system/locksettings.db"`;
    // This is a common, though often blocked, root command to clear the lock database.

    // 2. Execute the privileged command
    const output = await execShell(deviceId, unlockCommand);

    console.log(`Unlock command output: ${output}`);

    // --- STEP 3: Cleanup and Reporting ---
    // (Optional: Remove the forensic binary from the device)
    // await execShell(deviceId, `su -c "rm ${deviceTempPath}"`);

    return {
      success: true,
      message: `Device lock database cleared. Attempted unlock execution complete. Raw output: ${output.trim()}`,
    };
  } catch (error) {
    // The error indicates the privileged command failed (likely due to security restrictions)
    if (error.message.includes('permission denied')) {
      return {
        success: false,
        message:
          'Failed to obtain necessary root privileges. Device security or OS version blocked forensic execution.',
      };
    }
    return {
      success: false,
      message: `Technical Execution Error: ${error.message}`,
    };
  }
});

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

async function readShellString(deviceId, command) {
  const output = await adbClient.shell(deviceId, command);
  const buffer = await adbUtil.readAll(output);
  return buffer.toString();
}

function parseBatteryInfo(raw = '') {
  const info = {};
  raw.split('\n').forEach((line) => {
    const [key, value] = line.split(':').map((part) => (part || '').trim());
    if (!key) return;
    const numericValue = Number(value);
    info[key] = Number.isNaN(numericValue) ? value : numericValue;
  });
  return info;
}

function parseSystemInfo(raw = '') {
  const map = {};
  raw.split('\n').forEach((line) => {
    const match = line.match(/^\[(.+?)\]: \[(.*?)\]$/);
    if (match) {
      map[match[1]] = match[2];
    }
  });
  return {
    model: map['ro.product.model'],
    manufacturer: map['ro.product.manufacturer'],
    androidVersion: map['ro.build.version.release'],
    buildId: map['ro.build.display.id'],
    fingerprint: map['ro.build.fingerprint'],
    raw: map,
  };
}

function extractValue(raw = '', key) {
  const line = raw
    .split('\n')
    .map((entry) => entry.trim())
    .find((entry) => entry.toLowerCase().includes(key.toLowerCase()));
  if (!line) return null;
  const parts = line.split(':');
  return parts.length > 1 ? parts[1].trim() : null;
}

function sanitizeRemotePath(remotePath = '/') {
  const cleaned = remotePath.replace(/^\/+/, '');
  const safe = cleaned.replace(/[<>:"|?*]/g, '_');
  return safe || 'root';
}

function joinRemotePath(base, child) {
  if (!base) return child;
  if (base.endsWith('/')) {
    return `${base}${child}`;
  }
  return `${base}/${child}`;
}

async function backupAndroidPath(deviceId, remotePath, localTarget) {
  const stats = { files: 0, directories: 0, skipped: 0 };
  await copyAndroidNode(deviceId, remotePath, localTarget, stats);
  return stats;
}

async function copyAndroidNode(deviceId, remotePath, localPath, stats) {
  let entryStat;
  try {
    entryStat = await adbClient.stat(deviceId, remotePath);
  } catch (error) {
    console.warn(`Skipping ${remotePath}:`, error.message);
    stats.skipped += 1;
    return;
  }

  if (entryStat.isFile()) {
    await pullAndroidFile(deviceId, remotePath, localPath);
    stats.files += 1;
    return;
  }

  if (entryStat.isDirectory()) {
    await fsPromises.mkdir(localPath, { recursive: true });
    stats.directories += 1;
    const entries = await adbClient.readdir(deviceId, remotePath);
    for (const entry of entries) {
      if (entry.name === '.' || entry.name === '..') continue;
      const childRemote = joinRemotePath(remotePath, entry.name);
      const childLocal = path.join(localPath, entry.name);
      if (entry.isDirectory()) {
        await copyAndroidNode(deviceId, childRemote, childLocal, stats);
      } else if (entry.isFile()) {
        await pullAndroidFile(deviceId, childRemote, childLocal);
        stats.files += 1;
      } else {
        stats.skipped += 1;
      }
    }
    return;
  }

  stats.skipped += 1;
}

async function pullAndroidFile(deviceId, remotePath, localPath) {
  await fsPromises.mkdir(path.dirname(localPath), { recursive: true });
  const transfer = await adbClient.pull(deviceId, remotePath);
  const fileStream = fs.createWriteStream(localPath);

  return new Promise((resolve, reject) => {
    transfer.pipe(fileStream);

    transfer.on('end', () => resolve());
    transfer.on('error', (err) => {
      fileStream.close();
      reject(err);
    });
    fileStream.on('error', reject);
  });
}

async function restoreAndroidFromLocal(deviceId, localSource, remoteRoot) {
  const stats = { files: 0, directories: 0, skipped: 0 };
  const sourceStats = await fsPromises.stat(localSource);
  if (!sourceStats.isDirectory()) {
    throw new Error('Restore source must be a directory.');
  }
  await ensureRemoteDirectory(deviceId, remoteRoot);
  await pushLocalNode(deviceId, localSource, remoteRoot, stats);
  return stats;
}

async function pushLocalNode(deviceId, localPathEntry, remotePathEntry, stats) {
  const entryStats = await fsPromises.stat(localPathEntry);
  if (entryStats.isDirectory()) {
    stats.directories += 1;
    await ensureRemoteDirectory(deviceId, remotePathEntry);
    const children = await fsPromises.readdir(localPathEntry);
    for (const child of children) {
      const childLocal = path.join(localPathEntry, child);
      const childRemote = joinRemotePath(remotePathEntry, child);
      await pushLocalNode(deviceId, childLocal, childRemote, stats);
    }
    return;
  }

  const parentRemote = posixPath.dirname(remotePathEntry);
  if (parentRemote) {
    await ensureRemoteDirectory(deviceId, parentRemote);
  }

  const readStream = fs.createReadStream(localPathEntry);
  const transfer = await adbClient.push(deviceId, readStream, remotePathEntry);
  await new Promise((resolve, reject) => {
    transfer.on('end', resolve);
    transfer.on('error', reject);
  });
  stats.files += 1;
}

async function ensureRemoteDirectory(deviceId, remoteDir) {
  if (!remoteDir || remoteDir === '.' || remoteDir === '/') return;
  const command = `mkdir -p ${escapeShellArg(remoteDir)}`;
  const output = await adbClient.shell(deviceId, command);
  await new Promise((resolve, reject) => {
    output.on('end', resolve);
    output.on('error', reject);
  });
}

function escapeShellArg(value = '') {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Utility function to execute ADB shell commands
function execShell(deviceId, command) {
  return new Promise((resolve, reject) => {
    // Use adbkit module instead of system ADB command
    // This avoids PATH issues and uses the already available adbkit functionality
    try {
      const output = adbClient.shell(deviceId, command);
      let result = '';

      output.on('data', (chunk) => {
        result += chunk.toString();
      });

      output.on('end', () => {
        resolve(result.trim());
      });

      output.on('error', (error) => {
        reject(new Error(`ADB shell command failed: ${error.message}`));
      });
    } catch (error) {
      reject(new Error(`Failed to execute ADB shell command: ${error.message}`));
    }
  });
}
