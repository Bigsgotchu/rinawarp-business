const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Device Scanning
  listDevices: () => ipcRenderer.invoke('list-devices'),

  // File Browsing (New)
  browseDeviceFiles: (deviceId, platform, path) =>
    ipcRenderer.invoke('browse-device-files', deviceId, platform, path),

  // File Transfer (NEW)
  pullFile: (deviceId, remotePath, localPath, platform) =>
    ipcRenderer.invoke('pull-file', deviceId, remotePath, localPath, platform),

  // Device Management (NEW)
  shutdownDevice: (deviceId, platform) =>
    ipcRenderer.invoke('shutdown-device', deviceId, platform),

  // Remote Input (NEW)
  sendInputText: (deviceId, platform, text) =>
    ipcRenderer.invoke('send-input-text', deviceId, platform, text),

  // Backup & Restore
  backupDevice: payload => ipcRenderer.invoke('backup-device', payload),
  restoreDevice: payload => ipcRenderer.invoke('restore-device', payload),

  // Application management (NEW)
  listApps: (deviceId, platform) => ipcRenderer.invoke('list-apps', deviceId, platform),
  installApp: (deviceId, platform, localPath) =>
    ipcRenderer.invoke('install-app', deviceId, platform, localPath),
  uninstallApp: (deviceId, platform, identifier) =>
    ipcRenderer.invoke('uninstall-app', deviceId, platform, identifier),

  // System toolkit
  rebootDeviceMode: payload => ipcRenderer.invoke('reboot-device-mode', payload),
  getBatteryInfo: (deviceId, platform) =>
    ipcRenderer.invoke('get-battery-info', deviceId, platform),
  getSystemInfo: (deviceId, platform) =>
    ipcRenderer.invoke('get-system-info', deviceId, platform),

  // Recovery wizard
  startRecoveryScan: (deviceId, platform, dataType) =>
    ipcRenderer.invoke('start-recovery-scan', deviceId, platform, dataType),

  // Advanced Shell
  executePrivilegedCommand: (deviceId, platform, command) =>
    ipcRenderer.invoke('execute-privileged-command', deviceId, platform, command),

  // Health diagnostics
  runHealthDiagnostics: (deviceId, platform) =>
    ipcRenderer.invoke('run-health-diagnostics', deviceId, platform),

  // File Dialogs (openSaveDialog is NEW)
  openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),
  openSaveDialog: defaultFilename =>
    ipcRenderer.invoke('open-save-dialog', defaultFilename),
  openFileDialog: extensions => ipcRenderer.invoke('open-file-dialog', extensions),

  // New function for the actual unlock process
  triggerSecureUnlock: (deviceId, proofFilePath) =>
    ipcRenderer.invoke('trigger-secure-unlock', deviceId, proofFilePath)
})
