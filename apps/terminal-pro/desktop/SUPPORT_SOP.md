# RinaWarp Terminal Pro — Support SOP

## Purpose
This SOP defines how to triage crashes using safe-mode report bundles and crash signatures.

---

## 1. What a Support Bundle Contains

Location (user machine):
~/.config/RinaWarp Terminal Pro/reports/

Each bundle folder includes:

- meta.json
- log-tail.txt
- logs/
  - rinawarp.log
  - rinawarp.log.1 …
- crash signature (in folder name)

---

## 2. Crash Signature Format

Example:
safe-mode-2025-01-22T09-41-33Z-a9c4f21e7b9d4a12

- Signature hash is stable across machines
- Same hash = same underlying failure
- App version is stored in meta.json

---

## 3. Triage Workflow

### Step 1 — Identify signature
Open `meta.json`:
- signature
- appVersion
- platform
- arch

### Step 2 — Check known issues
Search internal tracker by signature hash.

- If known → follow existing resolution
- If new → continue

### Step 3 — Inspect logs
Read:
- `log-tail.txt`
- then full `rinawarp.log`

Look for:
- render-process-gone
- child-process-gone
- IPC violations
- ABI mismatch errors

### Step 4 — Classify failure
Choose one:
- Renderer crash
- Main process exception
- Native module / ABI
- GPU / driver
- Network / WebSocket
- License / billing
- AI backend failure

### Step 5 — Respond
- If deterministic → fix + patch
- If environment-specific → document workaround
- If unreproducible → request reproduction steps

---

## 4. Safe Mode Policy

Safe mode is entered after repeated crashes to prevent loops.

Safe mode:
- disables GPU acceleration
- loads minimal UI
- prevents background tasks
- preserves logs

Safe mode is NOT a failure; it is a containment mechanism.

---

## 5. User Communication Rules

- Never ask for screenshots first
- Always request the bundle folder
- Refer to crashes by signature hash
- Never ask users to edit config files manually