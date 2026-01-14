const vscode = require("vscode");

const API_LOGIN = "/auth/login";
const API_CHAT = "/api/ai/completions";
const API_TREE = "/api/files/tree";
const API_READ_FILE = "/api/files/read";
const API_WRITE_FILE = "/api/files/write";
const API_DEPLOY_RUN = "/api/deploy/run";
const API_DEPLOY_STATUS = "/api/deploy/status";
const API_VOICE = "/api/ai/voice";
const API_SHELL = "/api/shell/exec";
const API_PLUGINS_LIST = "/api/plugins";
const API_PLUGINS_RUN = "/api/plugins/run";
const API_FIX_CODE = "/api/ai/fix";
const API_INLINE_COMPLETION = "/api/ai/inline";
const API_ME = "/auth/me";

async function activate(context) {
  const secrets = context.secrets;

  // Register Panel
  const provider = new RinaWarpPanelProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("rinawarp.control", provider),
  );

  // Register Inline Completion Provider
  try {
    // Import the TypeScript module dynamically
    const { RinaWarpClient } = require("./src/rinawarpClient");
    const {
      RinaWarpInlineCompletionProvider,
    } = require("./src/inlineCompletionProvider");

    const client = new RinaWarpClient(context);
    const inlineProvider = new RinaWarpInlineCompletionProvider(client);

    context.subscriptions.push(
      vscode.languages.registerInlineCompletionItemProvider(
        { pattern: "**" }, // All file types
        inlineProvider,
      ),
    );
  } catch (err) {
    console.log("Inline completion provider not available:", err.message);
  }

  // LOGIN COMMAND
  context.subscriptions.push(
    vscode.commands.registerCommand("rinawarp.login", async () => {
      const email = await vscode.window.showInputBox({
        prompt: "Email",
        placeHolder: "you@example.com",
      });

      const password = await vscode.window.showInputBox({
        prompt: "Password",
        password: true,
      });

      if (!email || !password) return;

      const response = await fetch(API_LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        vscode.window.showErrorMessage("Login failed");
        return;
      }

      const json = await response.json();
      await secrets.store("rw_token", json.token);
      await secrets.store("rw_email", email);

      vscode.window.showInformationMessage(`Signed in as ${email}`);

      provider.refresh(); // Refresh UI
    }),
  );

  // OPEN PANEL COMMAND
  context.subscriptions.push(
    vscode.commands.registerCommand("rinawarp.openPanel", async () => {
      provider.refresh();
      vscode.window.showInformationMessage("RinaWarp Control Panel opened");
    }),
  );

  // FIX FILE COMMAND
  context.subscriptions.push(
    vscode.commands.registerCommand("rinawarp.fixFile", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage(
          "Open a file to use RinaWarp Fix Mode.",
        );
        return;
      }

      const document = editor.document;
      const originalCode = document.getText();

      const token = await secrets.get("rw_token");
      if (!token) {
        vscode.window.showErrorMessage(
          "Please sign in to use RinaWarp Fix Mode.",
        );
        return;
      }

      vscode.window.setStatusBarMessage(
        "RinaWarp Fix Mode: refactoring file...",
        3000,
      );

      try {
        const res = await fetch(API_FIX_CODE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            code: originalCode,
            instructions: `Fix and improve this ${document.languageId} file`,
          }),
        });

        const data = await res.json();

        if (!data.fixedCode) {
          vscode.window.showErrorMessage(
            "RinaWarp Fix Mode failed to return code.",
          );
          return;
        }

        await editor.edit((editBuilder) => {
          const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(originalCode.length),
          );
          editBuilder.replace(fullRange, data.fixedCode);
        });

        vscode.window.showInformationMessage(
          "RinaWarp Fix Mode: file updated.",
        );
        if (data.summary) {
          vscode.window.showInformationMessage(`Summary: ${data.summary}`);
        }
      } catch (err) {
        vscode.window.showErrorMessage("Fix Mode error: " + err.message);
      }
    }),
  );

  // FIX SELECTION COMMAND
  context.subscriptions.push(
    vscode.commands.registerCommand("rinawarp.fixSelection", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage(
          "Open a file to use RinaWarp Fix Mode.",
        );
        return;
      }

      const selection = editor.selection;
      if (selection.isEmpty) {
        vscode.window.showInformationMessage("Select some code to fix.");
        return;
      }

      const document = editor.document;
      const originalCode = document.getText(selection);

      const token = await secrets.get("rw_token");
      if (!token) {
        vscode.window.showErrorMessage(
          "Please sign in to use RinaWarp Fix Mode.",
        );
        return;
      }

      vscode.window.setStatusBarMessage(
        "RinaWarp Fix Mode: refactoring selection...",
        3000,
      );

      try {
        const res = await fetch(API_FIX_CODE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            code: originalCode,
            instructions: `Fix and improve this ${document.languageId} code selection`,
          }),
        });

        const data = await res.json();

        if (!data.fixedCode) {
          vscode.window.showErrorMessage(
            "RinaWarp Fix Mode failed to return code.",
          );
          return;
        }

        await editor.edit((editBuilder) => {
          editBuilder.replace(selection, data.fixedCode);
        });

        vscode.window.showInformationMessage(
          "RinaWarp Fix Mode: selection updated.",
        );
        if (data.summary) {
          vscode.window.showInformationMessage(`Summary: ${data.summary}`);
        }
      } catch (err) {
        vscode.window.showErrorMessage("Fix Mode error: " + err.message);
      }
    }),
  );

  // VOICE COMMAND COMMAND
  context.subscriptions.push(
    vscode.commands.registerCommand("rinawarp.voiceCommand", async () => {
      const text = await vscode.window.showInputBox({
        prompt: "Enter voice command",
        placeHolder: "e.g., create a new function called test",
      });

      if (!text) return;

      const token = await secrets.get("rw_token");
      if (!token) {
        vscode.window.showErrorMessage("Please sign in to use voice commands.");
        return;
      }

      vscode.window.setStatusBarMessage(
        "RinaWarp: Processing voice command...",
        3000,
      );

      try {
        const res = await fetch(API_VOICE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text }),
        });

        const data = await res.json();

        if (data.success) {
          vscode.window.showInformationMessage(
            `Voice command processed: ${data.response}`,
          );
        } else {
          vscode.window.showErrorMessage("Voice command failed");
        }
      } catch (err) {
        vscode.window.showErrorMessage("Voice command error: " + err.message);
      }
    }),
  );

  // SHELL EXECUTION COMMAND
  context.subscriptions.push(
    vscode.commands.registerCommand("rinawarp.executeShell", async () => {
      const cmd = await vscode.window.showInputBox({
        prompt: "Enter shell command",
        placeHolder: "e.g., ls -la",
      });

      if (!cmd) return;

      const token = await secrets.get("rw_token");
      if (!token) {
        vscode.window.showErrorMessage(
          "Please sign in to execute shell commands.",
        );
        return;
      }

      vscode.window.setStatusBarMessage(
        "RinaWarp: Executing shell command...",
        3000,
      );

      try {
        const res = await fetch(API_SHELL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cmd }),
        });

        const data = await res.json();

        // Show output in console for now
        if (data.stdout) {
          vscode.window.showInformationMessage(`Command executed successfully`);
          console.log("Shell output:", data.stdout);
        }

        if (data.stderr) {
          vscode.window.showWarningMessage(
            `Command had errors: ${data.stderr}`,
          );
        }
      } catch (err) {
        vscode.window.showErrorMessage("Shell execution error: " + err.message);
      }
    }),
  );

  // DEPLOY COMMAND
  context.subscriptions.push(
    vscode.commands.registerCommand("rinawarp.deploy", async () => {
      const token = await secrets.get("rw_token");
      if (!token) {
        vscode.window.showErrorMessage("Please sign in to deploy.");
        return;
      }

      vscode.window.setStatusBarMessage(
        "RinaWarp: Starting deployment...",
        3000,
      );

      try {
        const res = await fetch(API_DEPLOY_RUN, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          vscode.window.showInformationMessage(
            "Deployment started successfully!",
          );
        } else {
          vscode.window.showErrorMessage("Deployment failed to start");
        }
      } catch (err) {
        vscode.window.showErrorMessage("Deploy error: " + err.message);
      }
    }),
  );

  // DEPLOY STATUS COMMAND
  context.subscriptions.push(
    vscode.commands.registerCommand("rinawarp.deployStatus", async () => {
      const token = await secrets.get("rw_token");
      if (!token) {
        vscode.window.showErrorMessage(
          "Please sign in to check deploy status.",
        );
        return;
      }

      try {
        const res = await fetch(API_DEPLOY_STATUS, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        vscode.window.showInformationMessage(
          `Deploy Status: ${data.status || "No status available"}`,
        );
      } catch (err) {
        vscode.window.showErrorMessage("Deploy status error: " + err.message);
      }
    }),
  );
}

class RinaWarpPanelProvider {
  constructor(context) {
    this.context = context;
  }

  async resolveWebviewView(webviewView) {
    this.webviewView = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
    };

    webviewView.webview.html = await this.getHtml();

    webviewView.webview.onDidReceiveMessage(async (msg) => {
      const token = await this.context.secrets.get("rw_token");

      // HANDLE CHAT REQUEST
      if (msg.type === "chat") {
        const chatRequest = {
          provider: msg.provider || "openai",
          model:
            msg.provider === "openai"
              ? "gpt-4o-mini"
              : msg.provider === "groq"
                ? "llama-3.1-8b-instant"
                : msg.provider === "claude"
                  ? "claude-3-5-sonnet-20241022"
                  : "llama3",
          messages: [
            {
              role: "system",
              content:
                "You are RinaWarp Terminal Pro's AI assistant. Help with coding, development, and technical questions.",
            },
            {
              role: "user",
              content: msg.message,
            },
          ],
        };

        const res = await fetch(API_CHAT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(chatRequest),
        });

        const json = await res.json();
        const reply =
          json.choices?.[0]?.message?.content || "No response from AI";
        this.webviewView.webview.postMessage({
          type: "chatResponse",
          data: { reply },
        });
      }

      // HANDLE FILE TREE
      if (msg.type === "loadTree") {
        const res = await fetch(`${API_TREE}?path=/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        this.webviewView.webview.postMessage({ type: "treeData", data: json });
      }

      // RUN DEPLOY
      if (msg.type === "deploy") {
        const res = await fetch(API_DEPLOY_RUN, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();
        vscode.window.showInformationMessage(
          json.message || "Deploy complete.",
        );
      }

      // HANDLE VOICE COMMAND
      if (msg.type === "voiceRequest") {
        const token = await this.context.secrets.get("rw_token");

        // For demo purposes, using simulated audio data
        // In production, this would record actual audio from VS Code
        const audio = "simulated_base64_audio_data";

        try {
          const res = await fetch(API_VOICE, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ audio }),
          });

          const data = await res.json();

          this.webviewView.webview.postMessage({
            type: "chatResponse",
            data: { reply: data.reply || "Voice command processed" },
          });

          this.webviewView.webview.postMessage({
            type: "voiceStatus",
            data: "Voice command completed",
          });
        } catch (err) {
          this.webviewView.webview.postMessage({
            type: "voiceStatus",
            data: "Voice command failed",
          });
        }
      }

      // HANDLE PLUGIN LIST
      if (msg.type === "listPlugins") {
        const token = await this.context.secrets.get("rw_token");

        try {
          const res = await fetch(API_PLUGINS_LIST, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const json = await res.json();

          this.webviewView.webview.postMessage({
            type: "pluginList",
            data: json || [],
          });
        } catch (err) {
          this.webviewView.webview.postMessage({
            type: "pluginList",
            data: ["Failed to load plugins: " + err.message],
          });
        }
      }

      // HANDLE PLUGIN INSTALL
      if (msg.type === "installPlugin") {
        const token = await this.context.secrets.get("rw_token");

        try {
          const res = await fetch(API_PLUGINS_RUN, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ plugin: msg.plugin }),
          });

          const json = await res.json();

          vscode.window.showInformationMessage(
            json.message || "Plugin executed",
          );

          // Refresh plugin list
          this.webviewView.webview.postMessage({ type: "listPlugins" });
        } catch (err) {
          vscode.window.showErrorMessage(
            "Plugin execution failed: " + err.message,
          );
        }
      }

      // HANDLE SHELL COMMAND
      if (msg.type === "shell") {
        const token = await this.context.secrets.get("rw_token");

        try {
          const res = await fetch(API_SHELL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ command: msg.command }),
          });

          const json = await res.json();

          this.webviewView.webview.postMessage({
            type: "shellOut",
            data: json.output || "Command executed",
          });
        } catch (err) {
          this.webviewView.webview.postMessage({
            type: "shellOut",
            data: "Shell command failed: " + err.message,
          });
        }
      }

      // HANDLE SHELL COMMAND
      if (msg.type === "shell") {
        const token = await this.context.secrets.get("rw_token");

        try {
          const res = await fetch(API_SHELL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ cmd: msg.command }),
          });

          const json = await res.json();

          this.webviewView.webview.postMessage({
            type: "shellOut",
            data: json.stdout || json.stderr || "Command executed",
          });
        } catch (err) {
          this.webviewView.webview.postMessage({
            type: "shellOut",
            data: "Shell command failed: " + err.message,
          });
        }
      }
    });
  }

  async refresh() {
    if (this.webviewView) {
      this.webviewView.webview.html = await this.getHtml();
    }
  }

  async getHtml() {
    const token = await this.context.secrets.get("rw_token");
    const email = await this.context.secrets.get("rw_email");

    const htmlUri = vscode.Uri.joinPath(
      this.context.extensionUri,
      "media",
      "panel.html",
    );
    const htmlBytes = await vscode.workspace.fs.readFile(htmlUri);
    let html = Buffer.from(htmlBytes).toString("utf8");

    html = html.replace("{{email}}", email || "Not signed in");

    return html;
  }
}

function deactivate() {}

module.exports = { activate, deactivate };
