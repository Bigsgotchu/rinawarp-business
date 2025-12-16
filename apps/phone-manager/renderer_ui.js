let currentDevice = null;
let currentPath = '/';

// --- UI Navigation Logic ---
document.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    // 1. Update active link in sidebar
    document.querySelectorAll('.nav-link').forEach((nav) => nav.classList.remove('active'));
    this.classList.add('active');

    // 2. Switch feature view
    const viewId = this.getAttribute('data-view');
    document
      .querySelectorAll('.feature-view')
      .forEach((view) => view.classList.remove('active-view'));
    document.getElementById(viewId).classList.add('active-view');
  });
});

// Function to enable/disable all buttons in the main view
function setFeatureControlsEnabled(enabled) {
  // List of all controllable buttons/inputs in the main views
  const controls = [
    'upFolderBtn',
    'remoteInputText',
    'sendInputBtn',
    'listAppsBtn',
    'installAppBtn',
    'startBackupBtn',
    'startRestoreBtn',
    'rebootStandard',
    'rebootBootloader',
    'rebootDownload',
    'rebootRecovery',
    'shutdownDeviceBtn',
    'diagBattery',
    'diagSystem',
    'startScanBtn',
    'dataTypeSelect',
    'privilegedCommandInput',
    'executePrivilegedCommandBtn',
    'runHealthScanBtn',
  ];

  controls.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.disabled = !enabled;
  });

  document.getElementById('currentDeviceDisplay').textContent = enabled
    ? `${currentDevice.platform.toUpperCase()} | ${currentDevice.name}`
    : 'No Device Selected';
}

function renderDevices(devices) {
  const deviceListDiv = document.getElementById('deviceList');
  deviceListDiv.innerHTML = '';

  if (devices.length === 0) {
    deviceListDiv.innerHTML = '<p>No devices found.</p>';
    setFeatureControlsEnabled(false);
    return;
  }

  devices.forEach((device) => {
    const platformIcon = device.platform === 'android' ? '🤖' : '🍎';
    const card = document.createElement('div');
    card.className = 'device-card';

    card.onclick = () => {
      currentDevice = device;
      currentPath = device.platform === 'android' ? '/' : '/'; // Reset path

      document.querySelectorAll('.device-card').forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');

      setFeatureControlsEnabled(true);
      browseFiles(currentPath); // Automatically load file manager view
    };

    card.innerHTML = `
            <strong>${platformIcon} ${device.name || 'Unknown Device'}</strong>
            <span class="badge ${device.platform}">${device.platform.toUpperCase()}</span>
            <p class="device-id">ID: ${device.id}</p>
        `;
    deviceListDiv.appendChild(card);
  });
}

// --- IPC Call Stubs (Must be implemented in main.js/preload.js) ---

document.getElementById('scanBtn').addEventListener('click', async () => {
  const scanBtn = document.getElementById('scanBtn');
  const deviceList = document.getElementById('deviceList');
  scanBtn.disabled = true;
  deviceList.innerHTML = '<p>🔍 Scanning for devices...</p>';

  if (window.electronAPI) {
    try {
      // Call the real IPC function here
      // const devices = await window.electronAPI.listDevices();

      // Mocking for testing the UI layout:
      const devices = [
        { id: '12345ABC', platform: 'android', name: 'My Android Phone' },
        { id: '00008030-MOCK', platform: 'ios', name: 'Mock iPhone 13 Pro' },
      ];
      renderDevices(devices);
    } catch (e) {
      deviceList.innerHTML = `<p class="error-message">Scan failed: ${e.message}</p>`;
    } finally {
      scanBtn.disabled = false;
    }
  }
});

// --- File Manager Stub ---
function browseFiles(path) {
  const display = document.getElementById('fileBrowserDisplay');
  if (!currentDevice) return;
  // This is where you call window.electronAPI.browseFiles(currentDevice.id, path)
  display.innerHTML = `<h4>Current Path: ${path}</h4><p>File list for ${currentDevice.name} will load here.</p>`;
}

// --- Recovery Scan Logic (From previous turn) ---
document.getElementById('startScanBtn').addEventListener('click', async () => {
  // Implementation of handleRecoveryScan (calling window.electronAPI.startRecoveryScan) goes here
});

// --- Privileged Command Logic (From previous turn) ---
document.getElementById('executePrivilegedCommandBtn').addEventListener('click', async () => {
  // Implementation of executePrivilegedCommand (calling window.electronAPI.executePrivilegedCommand) goes here
});

// --- Health Diagnostics Logic ---
document.getElementById('runHealthScanBtn').addEventListener('click', runHealthDiagnostics);

async function runHealthDiagnostics() {
  if (!currentDevice) {
    alert('Please select a device first.');
    return;
  }
  if (!window.electronAPI || !window.electronAPI.runHealthDiagnostics) {
    alert('Health diagnostics API not available.');
    return;
  }
  const log = document.getElementById('predictionLog');
  const badge = document.getElementById('healthScoreDisplay');
  log.innerHTML = `<p class="transfer-status">Analyzing ${currentDevice.name}... This may take a moment.</p>`;
  badge.textContent = 'Health Score: Running...';
  try {
    const result = await window.electronAPI.runHealthDiagnostics(
      currentDevice.id,
      currentDevice.platform,
    );
    badge.textContent = `Health Score: ${result.score}%`;
    document.getElementById('batteryStatus').textContent = result.battery;
    document.getElementById('storageStatus').textContent = result.storage;
    document.getElementById('thermalStatus').textContent = result.thermal;
    log.innerHTML = `<p class="success-message">${result.prediction}</p>`;
  } catch (error) {
    log.innerHTML = `<p class="error-message">Diagnostic Error: ${error.message}</p>`;
    badge.textContent = 'Health Score: --';
  }
}
