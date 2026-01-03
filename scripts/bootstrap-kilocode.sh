#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$REPO_ROOT"

mkdir -p .kilocode/rules .vscode scripts

# ----------------------------
# Kilo Code workspace rules
# ----------------------------

cat > .kilocode/rules/00-ground-truth.md <<'RULE'
# Ground truth rule (no more loops)
- Never claim something is "done" unless you can show proof from the workspace or a command output.
- If you edited files: you MUST run and report:
  - `git status --porcelain`
  - `git diff --stat`
- If you claim a URL works: you MUST run and report:
  - `curl -sI <url> | sed -n '1,25p'`
- If you claim a build artifact exists: you MUST run and report:
  - `ls -la <path>` or `find <dir> -maxdepth N -type f | head`
RULE

cat > .kilocode/rules/10-proof-loop.md <<'RULE'
# Proof loop (required after every change)
For any task:
1) State the exact files you will change (or commands you will run).
2) Make the change.
3) Prove it with outputs:
   - `git status --porcelain`
   - `git diff --stat`
4) If the goal is CI/CD: include the exact failing log snippet and the fix diff.
If proof fails, stop and fix before continuing.
RULE

cat > .kilocode/rules/20-terminal-pro-release.md <<'RULE'
# Terminal Pro release reality check
- Linux artifacts live under: `terminal-pro/<channel>/` in R2 (via download.rinawarptech.com Worker).
- Windows must publish `latest.yml` referencing `.exe` (never AppImage).
- macOS must publish `latest-mac.yml` referencing `.dmg/.zip` (never AppImage).
Before declaring "updates working", verify:
- `curl -fsSL https://download.rinawarptech.com/terminal-pro/stable/latest-linux.yml | head -80`
- `curl -sI https://download.rinawarptech.com/terminal-pro/stable/latest.yml | sed -n '1,25p'`
RULE

cat > .kilocode/rules/30-command-safety.md <<'RULE'
# Command safety + action policy
Allowed without asking (safe):
- read-only: ls, cat, sed, grep, find, git status/diff/log, curl -I, npm ci/install, npm run build, node scripts/*
Allowed but MUST show output:
- aws s3 ls/cp/sync (only within terminal-pro/<channel>/)
- wrangler deploy (only in workers/download-proxy)
Blocked unless you explicitly approve:
- git filter-branch/filter-repo, force pushes
- rm -rf outside repo
- anything touching ~/.ssh, ~/.aws, ~/.config unless requested
RULE

# ----------------------------
# Ignore huge/noisy stuff
# ----------------------------
cat > .kilocodeignore <<'IGN'
# Don't let the agent waste time / get confused by artifacts
node_modules/
dist*/
build-output/
squashfs-root/
.wrangler/state/
**/*-unpacked/
**/*.AppImage
**/*.deb
**/*.dmg
**/*.exe
**/*.zip
**/*.snap
IGN

# ----------------------------
# Windows checkout breaker detector
# This detects filenames that break Windows Git checkout
# ----------------------------
cat > scripts/check-windows-checkout-breakers.sh <<'SH'
#!/usr/bin/env bash
set -euo pipefail

# Flags filenames that break Windows Git checkout:
# - contains reserved characters: < > : " / \ | ? *
# - ends with dot or space
# - contains control chars
# - matches reserved device names (CON, PRN, AUX, NUL, COM1.., LPT1..)
python3 - <<'PY'
import re, subprocess, sys

bad = []
names = subprocess.check_output(["git","ls-files","-z"]).decode("utf-8","surrogateescape").split("\0")
reserved = re.compile(r'^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$', re.I)
win_bad_chars = re.compile(r'[<>:"/\\|?*\x00-\x1F]')

for n in names:
    if not n:
        continue
    if win_bad_chars.search(n):
        bad.append((n, "contains reserved/ctrl char"))
        continue
    base = n.split("/")[-1]
    if base.endswith(" ") or base.endswith("."):
        bad.append((n, "ends with space/dot"))
        continue
    if reserved.match(base):
        bad.append((n, "reserved device name"))
        continue

if bad:
    print("❌ Windows checkout breakers found:")
    for n, why in bad:
        print(f" - {n}  [{why}]")
    sys.exit(2)
else:
    print("✅ No Windows checkout breaker filenames found.")
PY
SH
chmod +x scripts/check-windows-checkout-breakers.sh

# ----------------------------
# VS Code tasks (optional convenience)
# ----------------------------
cat > .vscode/tasks.json <<'JSON'
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Proof loop (git)",
      "type": "shell",
      "command": "git status --porcelain && echo && git diff --stat",
      "problemMatcher": []
    },
    {
      "label": "Check Windows checkout breaker filenames",
      "type": "shell",
      "command": "scripts/check-windows-checkout-breakers.sh",
      "problemMatcher": []
    },
    {
      "label": "Verify download endpoints (stable)",
      "type": "shell",
      "command": "curl -sI https://download.rinawarptech.com/terminal-pro/stable/latest-linux.yml | sed -n '1,25p' && echo && curl -sI https://download.rinawarptech.com/terminal-pro/stable/latest.yml | sed -n '1,25p'",
      "problemMatcher": []
    }
  ]
}
JSON

echo "✅ Bootstrapped Kilo Code workspace rules + scripts:"
echo " - .kilocode/rules/*"
echo " - .kilocodeignore"
echo " - scripts/check-windows-checkout-breakers.sh"
echo " - .vscode/tasks.json"