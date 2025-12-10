const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const fetch = require("node-fetch");

// Fallback store implementation for ESM/CommonJS compatibility
let store;
try {
  // Try to use electron-store with dynamic import
  import("electron-store").then((module) => {
    const Store = module.default;
    store = new Store();
  }).catch(() => {
    // Fallback to simple in-memory store
    store = {
      get: (key, defaultValue) => defaultValue,
      set: () => {}
    };
  });
} catch (err) {
  // Fallback to simple in-memory store
  store = {
    get: (key, defaultValue) => defaultValue,
    set: () => {}
  };
}

const RINA_AI_URL = process.env.RINA_AI_URL || "http://localhost:3004/chat";

let mainWindow;

// -----------------------------
// CREATE WINDOW
// -----------------------------
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "../shared/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load the appropriate URL based on environment
  const startUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../renderer/index.html')}`;

  mainWindow.loadURL(startUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    // Focus on the window when initially shown
    if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// -----------------------------
// REGISTER IPC HANDLERS
// -----------------------------
function registerIPC() {
  ipcMain.handle("rina:chat", async (event, payload = {}) => {
    const { prompt } = payload;
    const licenseKey = store.get("licenseKey", null);
    const token = store.get("authToken", null);

    if (!prompt || !prompt.trim()) {
      return { error: true, message: "Empty prompt" };
    }

    try {
      const res = await fetch(RINA_AI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          mode: "rina",
          licenseKey,
          context: {
            app: "terminal-pro",
            os: process.platform,
            moodHint: "focused",
            userSkillLevel: "intermediate",
            projectType: "terminal-pro",
          },
        }),
      });

      const data = await res.json().catch(() => ({}));

      // Store license plan if backend returns it
      if (data.license && data.license.plan) {
        store.set("licensePlan", data.license.plan);
        store.set("licenseFeatures", data.license.features || {});
      }

      return data;
    } catch (err) {
      console.error("Rina IPC error:", err);
      return {
        error: true,
        message: "Failed to reach Rina AI service",
        details: err.message,
      };
    }
  });
  // 🔹 Get Rina layout (open/width)
  ipcMain.handle("rina:get-layout", async () => {
    const layout = store.get("rinaLayout", {
      isOpen: true,
      sidebarWidth: 360,
      onboardingDone: false,
    });
    return layout;
  });

  // 🔹 Set Rina layout
  ipcMain.handle("rina:set-layout", async (event, layoutUpdate = {}) => {
    const current = store.get("rinaLayout", {
      isOpen: true,
      sidebarWidth: 360,
      onboardingDone: false,
    });

    const next = {
      ...current,
      ...layoutUpdate,
    };

    store.set("rinaLayout", next);
    return next;
  });

  // 🔹 Get license plan
  ipcMain.handle("get-license-plan", async () => {
    return {
      plan: store.get("licensePlan", "free"),
      features: store.get("licenseFeatures", {}),
    };
  });

  // 🔹 Start Stripe upgrade
  ipcMain.handle("billing:start-upgrade", async (event, { tier }) => {
    const licenseKey = store.get("licenseKey", null);
    const token = store.get("authToken", null);

    try {
      const res = await fetch("http://localhost:3003/api/billing/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          tier,
          licenseKey,
          success_url: "rinawarp-terminal-pro://upgrade-success",
          cancel_url: "rinawarp-terminal-pro://upgrade-cancel",
        }),
      });

      const data = await res.json();

      if (data.url) {
        // Open Stripe checkout in default browser
        shell.openExternal(data.url);
        return { success: true, url: data.url };
      } else {
        return { success: false, error: "No checkout URL returned" };
      }
    } catch (err) {
      console.error("Stripe checkout error:", err);
      return {
        success: false,
        error: "Failed to create checkout session",
        details: err.message,
      };
    }
  });

  // 🔹 Refresh license from backend
  ipcMain.handle("license:refresh", async () => {
    const licenseKey = store.get("licenseKey", null);
    const token = store.get("authToken", null);

    try {
      const res = await fetch("http://localhost:3003/api/license/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ licenseKey }),
      });

      const data = await res.json();

      if (data.plan) {
        // Update stored license info
        store.set("licensePlan", data.plan);
        store.set("licenseFeatures", data.features || {});
        return data;
      } else {
        return { plan: "free", features: {} };
      }
    } catch (err) {
      console.error("License refresh error:", err);
      return { plan: "free", features: {} };
    }
  });
}

// -----------------------------
// APP READY
// -----------------------------
app.whenReady().then(() => {
  createMainWindow();
  registerIPC();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

// -----------------------------
// QUIT WHEN ALL WINDOWS CLOSED
// -----------------------------
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});