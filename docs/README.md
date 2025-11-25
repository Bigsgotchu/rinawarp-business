# RinaWarp Documentation

This folder centralizes documentation for the entire RinaWarp ecosystem.

---

## 📚 Sections

- **Terminal Pro** – app-specific docs live under  
  `apps/terminal-pro/docs/`

  Suggested structure:
  - `apps/terminal-pro/docs/INSTALLATION.md`
  - `apps/terminal-pro/docs/USER-GUIDE.md`
  - `apps/terminal-pro/docs/DEVELOPER-GUIDE.md`
  - `apps/terminal-pro/docs/RELEASE-NOTES.md`
  - `apps/terminal-pro/docs/WORKSPACE-SETUP-REFERENCE.md` (already exists)
  - `apps/terminal-pro/docs/RinaWarp-IP-Proof/` (already exists)

- **AI Music Video Creator** (planned)
  - Architecture
  - API & pipelines
  - Credits / coin system

- **Phone / Device Tools** (planned)
  - Unlock workflow
  - Risk & safety guidelines
  - Legal considerations

---

## 🔧 Operational Docs

- **Versioning & Releases**
  - Root `VERSION` file
  - Root `CHANGELOG.md`
  - `scripts/release-tag.sh`
  - `.github/workflows/terminal-pro-release.yml`

- **Integrity & Path Protection**
  - `apps/terminal-pro/scripts/rinawarp_path_guardian.py`
  - Git pre-commit hook in `apps/terminal-pro/.git/hooks/pre-commit`
  - `scripts/rw-doctor.sh`

- **Backups**
  - `scripts/rw-backup.sh`

- **CLI**
  - `tools/rw`

---

## 🧭 Conventions

- All paths should reference the new monorepo layout:

  - Root: `~/Documents/RinaWarp`
  - Terminal Pro: `~/Documents/RinaWarp/apps/terminal-pro`

- Old path to avoid:
  - `~/Documents/RinaWarp-Terminal-Pro`

Use Path Guardian + `./tools/rw doctor` regularly to keep everything clean.