# Terminal Pro release reality check
- Linux artifacts live under: `terminal-pro/<channel>/` in R2 (via download.rinawarptech.com Worker).
- Windows must publish `latest.yml` referencing `.exe` (never AppImage).
- macOS must publish `latest-mac.yml` referencing `.dmg/.zip` (never AppImage).
Before declaring "updates working", verify:
- `curl -fsSL https://download.rinawarptech.com/terminal-pro/stable/latest-linux.yml | head -80`
- `curl -sI https://download.rinawarptech.com/terminal-pro/stable/latest.yml | sed -n '1,25p'`
