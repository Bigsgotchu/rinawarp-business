# RinaWarp Terminal Pro – VS Code Companion

This is the **RinaWarp Terminal Pro companion extension** for VS Code.

- Live Founder Wave seat bar
- License status & tier
- One-click deploy button
- AI suggestions (GPT / Claude / Groq / Ollama via your backend)
- Recent commands & errors (from `kilo-memory.json`)
- RinaWarp Dev Dashboard in the Activity Bar

## Install

```bash
cd vscode-rinawarp-extension
npm install
npx vsce package
```

Then in VS Code:

Open Extensions → … menu → Install from VSIX…

Select the generated .vsix in this folder.

Go to Settings → Extensions → RinaWarp Terminal Pro:

Set rinawarp.apiBaseUrl (default is https://api.rinawarptech.com)

Paste your rinawarp.authToken

Point rinawarp.kiloMemoryPath to your kilo-memory.json file if you use Kilo.

Open the dashboard via:

Activity bar "RinaWarp" icon, or

Command Palette → RinaWarp: Open Dev Dashboard.


---

## 6️⃣ How to build & test it

From the extension folder:

```bash
cd /home/karina/Documents/RinaWarp/vscode-rinawarp-extension

# install deps
npm install

# package into VSIX
npx vsce package
```

Then:

Open VS Code

Extensions panel → … (top right) → Install from VSIX…

Pick the generated rinawarp-terminal-pro-0.1.0.vsix

Reload VS Code

Look for the RinaWarp icon in the activity bar on the left.