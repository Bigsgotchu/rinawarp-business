# RinaWarp Brain – VS Code Extension

RinaWarp Brain integrates RinaWarp directly into VS Code, treating it as the **single source of truth** for planning, previewing, approving, executing, and verifying code changes. The extension enforces strict REG (Rina Execution Grammar) compliance, Rina personality-aware guidance, and cryptographic authority checks for safe development workflows.

---

## **Key Features**

- **Full REG Workflow Enforcement**
  - Lifecycle: `draft → preview → awaiting_approval → executing → verifying → done/failed`.
  - Plan hash validation and approval token binding ensure safe execution.

- **Interactive Webview Panel**
  - Dynamic plan details: title, summary, risks, steps, actions, and verification commands.
  - Auto-refresh after every command execution.

- **Plan Validation & Safety**
  - Inline validation errors with red highlights.
  - Regenerate (Strict) button to request validated plans if the previous plan fails.

- **State-Aware UI**
  - Buttons enable/disable based on current workflow state.
  - Tooltips guide user actions.
  - Copyable plan JSON, hash, and approval token for auditing.

- **Color-Coded Risk Display**
  - High risks: red
  - Medium risks: orange
  - Low risks: green

---

## **Installation**

1. Install the VSIX:
   - In VS Code: `Extensions → ... → Install from VSIX…`
   - Select the generated `.vsix` file.

2. Configure the RinaWarp daemon:
```json
{
  "rinawarp.baseUrl": "http://127.0.0.1:8787"
}

---

## **Usage**

### Open the RinaWarp Brain panel:
- Command Palette (Ctrl+Shift+P) → RinaWarp: Open Panel

### Panel Buttons & Actions:

| Button | Function |
|--------|----------|
| Ping Daemon | Check if RinaWarp daemon is reachable. |
| Plan | Generate a new plan from current editor content. |
| Preview | Preview generated plan before approval. |
| Approve | Approve current plan (requires valid plan and hash). |
| Execute | Execute the approved plan (requires token). |
| Verify | Verify executed changes (requires token). |
| Regenerate (Strict) | Request RinaWarp to generate a new validated plan if validation fails. |

### Plan Details Section:
- View plan title, summary, risks, steps, actions, and verification commands.
- Inline validation errors appear under the plan preview.
- Color-coded risks for quick visual assessment.

---

## **Workflow Recommendations**

1. Generate plan → Preview → Approve → Execute → Verify.
2. Always inspect risks and steps before approving.
3. Use Regenerate (Strict) if validation errors occur.
4. Only execute plans that match the approved hash and token.

---

## **Testing**

1. **Full lifecycle validation** (plan → preview → approve → execute → verify).
2. **Invalid or modified plans** should be blocked by safety gates.
3. **Copy plan JSON, hash, and token** to clipboard for auditing.

---

## **Development**

### Install dependencies:
```bash
npm install
```

### Compile:
```bash
npm run compile
```

### Run in development mode:
```bash
code --extensionDevelopmentPath=./vscode-rinawarp-extension
```

### Watch mode for auto-compilation:
```bash
npm run watch
```

---

## **Packaging & Distribution**

### Package extension:
```bash
npm run package
```

### Publish to VS Code Marketplace:
```bash
npm install -g vsce
vsce login <publisher-name>
vsce publish
```

---

## **Security Guarantees**

- **Immutable Plans**: Any modification invalidates the approval hash.
- **Token Binding**: Approval tokens tied to specific plan hashes.
- **Authority Enforcement**: All execution decisions are made by RinaWarp daemon.
- **No Client-Side Execution**: The extension only forwards requests to RinaWarp.

---

## **License**

MIT

---

RinaWarp Brain turns RinaWarp into a fully interactive, safe, and personality-aware VS Code assistant for planning, approval, and execution of code changes.