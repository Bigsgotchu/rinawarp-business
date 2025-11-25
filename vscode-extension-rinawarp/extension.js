// extension.js
const vscode = require("vscode");
const https = require("https");

/**
 * Simple HTTP helper for POST/GET from the extension host
 */
function httpRequest({ method, url, headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    try {
      const urlObj = new URL(url);
      const options = {
        method,
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        port: urlObj.port || 443,
        headers: headers
      };

      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const contentType = res.headers["content-type"] || "";
            if (contentType.includes("application/json")) {
              resolve({
                status: res.statusCode,
                body: data ? JSON.parse(data) : null
              });
            } else {
              resolve({ status: res.statusCode, body: data });
            }
          } catch (err) {
            reject(err);
          }
        });
      });

      req.on("error", (err) => reject(err));

      if (body) {
        const payload =
          typeof body === "string" ? body : JSON.stringify(body);
        req.write(payload);
      }

      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Webview HTML (loaded from media/panel.html instead in real project)
 */
function getPanelHtml(webview, extensionUri) {
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "media", "panel.html")
  );
  // We'll actually read raw HTML file in activate() – this is just a placeholder if needed.
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta
    http-equiv="Content-Security-Policy"
    content="default-src 'none'; img-src ${webview.cspSource} https:; script-src 'unsafe-inline' ${webview.cspSource}; style-src 'unsafe-inline' ${webview.cspSource};"
  />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>RinaWarp Dev Dashboard</title>
</head>
<body>
  <div id="app">Loading...</div>
</body>
</html>
  `;
}

/**
 * Activate extension
 */
function activate(context) {
  const apiBaseUrl = () =>
    vscode.workspace
      .getConfiguration("rinawarp")
      .get("apiBaseUrl", "https://api.rinawarptech.com");

  const loginUrl = () =>
    vscode.workspace
      .getConfiguration("rinawarp")
      .get("loginUrl", "https://rinawarptech.com/vscode/login");

  // 1) Command: Sign In (opens browser)
  const signInCmd = vscode.commands.registerCommand(
    "rinawarp.signIn",
    async () => {
      const url = loginUrl();
      vscode.env.openExternal(vscode.Uri.parse(url));
      vscode.window.showInformationMessage(
        "RinaWarp: Opening browser for login..."
      );
    }
  );

  // 2) URI handler: handle vscode://rinawarp.rinawarp-vscode/auth?token=XYZ
  const uriHandler = {
    async handleUri(uri) {
      try {
        if (!uri || !uri.path) return;
        if (!uri.path.startsWith("/auth")) return;

        const query = new URLSearchParams(uri.query);
        const token = query.get("token");

        if (!token) {
          vscode.window.showErrorMessage(
            "RinaWarp: Missing token in auth URI."
          );
          return;
        }

        await context.secrets.store("rinawarp_token", token);
        vscode.window.showInformationMessage(
          "✅ RinaWarp: Sign in successful!"
        );
      } catch (err) {
        console.error(err);
        vscode.window.showErrorMessage(
          "RinaWarp: Failed to handle auth callback."
        );
      }
    }
  };

  context.subscriptions.push(
    signInCmd,
    vscode.window.registerUriHandler(uriHandler)
  );

  // 3) Dev Dashboard Webview Panel
  const openPanelCmd = vscode.commands.registerCommand(
    "rinawarp.openPanel",
    async () => {
      const panel = vscode.window.createWebviewPanel(
        "rinawarpDevDashboard",
        "RinaWarp Dev Dashboard",
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
          retainContextWhenHidden: true
        }
      );

      // Load HTML from media/panel.html
      const htmlUri = vscode.Uri.joinPath(
        context.extensionUri,
        "media",
        "panel.html"
      );
      const htmlBytes = await vscode.workspace.fs.readFile(htmlUri);
      const htmlContent = Buffer.from(htmlBytes).toString("utf8");

      panel.webview.html = htmlContent.replace(
        /{{cspSource}}/g,
        panel.webview.cspSource
      );

      // Handle messages from webview
      panel.webview.onDidReceiveMessage(async (msg) => {
        if (msg.type === "runDeploy") {
          await handleRunDeploy(panel, context, apiBaseUrl());
        } else if (msg.type === "aiSuggest") {
          await handleAiSuggest(panel, context, apiBaseUrl(), msg.payload);
        }
      });
    }
  );

  context.subscriptions.push(openPanelCmd);
}

/**
 * Handle "Run Deploy" button click from webview
 */
async function handleRunDeploy(panel, context, baseUrl) {
  try {
    const token = await context.secrets.get("rinawarp_token");
    if (!token) {
      panel.webview.postMessage({
        type: "log",
        level: "error",
        message: "Not signed in. Run 'RinaWarp: Sign In' first."
      });
      return;
    }

    panel.webview.postMessage({
      type: "log",
      level: "info",
      message: "Running one-click deploy..."
    });

    const res = await httpRequest({
      method: "POST",
      url: `${baseUrl}/api/dev/one-click-deploy`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: {}
    });

    if (res.status >= 200 && res.status < 300) {
      panel.webview.postMessage({
        type: "log",
        level: "success",
        message: "✅ Deploy started successfully."
      });
    } else {
      panel.webview.postMessage({
        type: "log",
        level: "error",
        message: `Deploy failed: HTTP ${res.status}`
      });
    }
  } catch (err) {
    panel.webview.postMessage({
      type: "log",
      level: "error",
      message: `Deploy error: ${err.message || err}`
    });
  }
}

/**
 * Handle AI suggestions from webview
 */
async function handleAiSuggest(panel, context, baseUrl, payload) {
  try {
    const token = await context.secrets.get("rinawarp_token");
    if (!token) {
      panel.webview.postMessage({
        type: "aiResponse",
        error: "Not signed in. Run 'RinaWarp: Sign In' first."
      });
      return;
    }

    const { text, filePath } = payload || {};

    const res = await httpRequest({
      method: "POST",
      url: `${baseUrl}/api/ai/complete`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: {
        prompt: text || "",
        meta: {
          source: "vscode-extension",
          filePath: filePath || null
        }
      }
    });

    if (res.status >= 200 && res.status < 300) {
      panel.webview.postMessage({
        type: "aiResponse",
        data: res.body
      });
    } else {
      panel.webview.postMessage({
        type: "aiResponse",
        error: `AI request failed: HTTP ${res.status}`
      });
    }
  } catch (err) {
    panel.webview.postMessage({
      type: "aiResponse",
      error: `AI error: ${err.message || err}`
    });
  }
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};