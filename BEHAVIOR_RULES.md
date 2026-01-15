# RinaWarp Behavior Rules v1 — Electron Implementation

**Purpose:** Define safe, consistent, and predictable behavior for RinaWarp as the authoritative AI-assisted terminal. These rules guide all command execution, AI suggestions, and user interactions.

---

## 1️⃣ Architecture in Electron

- **Main process**
  - Runs RinaWarp engine / FastAPI backend (L1–L2)
  - Handles:
    - Command execution
    - Sandboxing
    - Logging
    - AI reasoning
  - Exposes endpoints via **local WebSocket / IPC** to renderer

- **Renderer process**
  - Terminal UI + AI assistant panel
  - Shows terminal buffer, command suggestions, and confirmation modals
  - Sends **all command requests** to main process; **never executes commands directly**

- **VS Code Extension (optional)**
  - Communicates with Electron app via **RPC/WebSocket**
  - Defers all execution authority to RinaWarp

---

## 2️⃣ Command Execution Flow

1. User types a command in Electron terminal or via VS Code extension
2. Renderer sends request to **main process**
3. Engine evaluates:
   - Safety classification: **safe / ambiguous / destructive**
   - Scope: **project root / system**
   - AI suggestions (if enabled)
4. If required, engine sends **confirmation request** back to renderer
5. User confirms → engine executes → logs result → sends output to renderer
6. AI notes / completions are attached, but **never auto-executed**

> **Electron advantage:** All IPC traffic is local → safety and sandboxing are easier to enforce

---

## 3️⃣ Logging & Rollback

- Store logs in **local SQLite or JSON file**
- Log contents:
  - Timestamp
  - Command string
  - AI notes (if applied)
  - User confirmation (if required)
  - Execution result / exit code
- Destructive commands:
  - If canceled or failed, trigger **rollback** via main process
- Logs are **immutable and local-only**

---

## 4️⃣ AI Suggestion Rules in Electron

- Renderer displays suggestions in:
  - Side panel
  - Inline completions
- Suggestions must come from **main process AI module**
- Inline completions or refactors **cannot auto-execute**
- User confirmation is **always required**
- Renderer provides hover/tooltip explanation:
  - Why suggestion was made
  - Expected outcome
  - Risk level

---

## 5️⃣ Safety & Scope Enforcement

- **Main process sandbox:**
  - Commands restricted to **project folder** by default
  - Network requests / elevated privileges require **explicit confirmation**
- **Renderer:**
  - Never accesses filesystem directly
  - All commands go through main process

---

## 6️⃣ Electron-specific Checklist (Implementation-ready)

- [ ] Main process runs FastAPI or Node.js backend for AI reasoning
- [ ] Renderer shows terminal + AI panels + confirmation modals
- [ ] All commands use **IPC/WebSocket** requests/responses
- [ ] Logging done in main process, immutable and local-only
- [ ] AI suggestions:
  - Inline or panel display
  - Hover explanations
  - User confirmation required
- [ ] VS Code extension (optional) communicates via **RPC/WebSocket**, deferring authority

---

## 7️⃣ Notes / Tips for Developers

- Use Electron **`ipcMain`** for main process command handling
- Use **`ipcRenderer`** in renderer for sending commands / receiving results
- Wrap **all destructive actions** in explicit confirmation modals
- Keep AI suggestion logic **in main process** to centralize authority
- Always enforce **project-root scope** for local safety
- Maintain **immutable command logs** for auditing & rollback
