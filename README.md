# RinaWarp Monorepo

RinaWarp is a multi-app ecosystem built by Karina ("Rina Vex") that combines:
- 🖥️ **RinaWarp Terminal Pro** – AI-powered terminal, dev assistant, and workflow hub  
- 🎬 **AI Music Video Creator** – (coming soon) AI-driven video + avatar creation  
- 📱 **Phone / Device Tools** – (future) device management / unlock utilities  

This repo is the **single source of truth** for all RinaWarp apps, scripts, and docs.

---

## 🔧 Repository Structure

```text
RinaWarp/
├── apps/
│   └── terminal-pro/           # RinaWarp Terminal Pro app (Electron + React + Node)
│       ├── backend/            # API server, Stripe, license system, monitoring
│       ├── frontend/           # React frontend, marketing site frontend code
│       ├── desktop/            # Electron packaging, AppImage / .deb builds
│       ├── docs/               # Terminal Pro docs, guides, IP proof
│       ├── scripts/            # Release, cleanup, path guardian, helpers
│       ├── .devcontainer/      # Dev container configuration
│       └── misplaced/          # Consolidated orphan/misplaced files
├── docs/                       # Top-level RinaWarp documentation
├── scripts/                    # Monorepo-wide tooling (versioning, backups, integrity)
├── tools/                      # RinaWarp CLI and helper utilities
├── .github/
│   └── workflows/              # CI/CD pipelines
├── VERSION                     # RinaWarp global version
└── CHANGELOG.md                # Global release history


For detailed Terminal Pro docs, see: apps/terminal-pro/docs/.


🚀 Quick Start (Terminal Pro)
1. Clone + enter workspace
git clone <your-repo-url> ~/Documents/RinaWarp
cd ~/Documents/RinaWarp

2. Install dependencies
From the repo root:
cd apps/terminal-pro

# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..

# Desktop (Electron)
cd desktop
npm install
cd ..

(Adjust these if you already have combined scripts like npm run install:all.)
3. Run in development
Typical pattern (adjust to your existing scripts):
cd apps/terminal-pro

# Backend
cd backend
npm run dev &
cd ..

# Frontend (web / marketing)
cd frontend
npm run dev &
cd ..

# Desktop app (Electron)
cd desktop
npm run dev

Open the URLs your dev servers print (usually http://localhost:5173 or similar).

🧾 Versioning & Releases
RinaWarp uses:


Semantic Versioning: MAJOR.MINOR.PATCH


Global version stored in VERSION


Release history recorded in CHANGELOG.md


Basic flow:


Update VERSION


Update CHANGELOG.md


Commit changes


Run ./scripts/release-tag.sh


Push tags to GitHub → CI publishes builds/releases



Terminal Pro may also maintain its own version field in apps/terminal-pro/package.json / desktop package config. Keep that in sync with the root VERSION (see tools/sync-version.mjs once you wire it in).


🛡️ Integrity & Protection
RinaWarp includes a Path Guardian and cleanup tooling to keep the repo clean:


apps/terminal-pro/scripts/rinawarp_path_guardian.py


Git pre-commit hook to block old-path contamination


VS Code tasks for quick scans


Monorepo integrity runner: ./scripts/rw-doctor.sh


Use:
# Fast check (recommended before commits)
./scripts/rw-doctor.sh

# Path Guardian strict mode (from terminal-pro dir)
cd apps/terminal-pro
python3 scripts/rinawarp_path_guardian.py --pre-commit


🔁 CI/CD
GitHub Actions workflows live in .github/workflows/:


terminal-pro-ci.yml – build & test Terminal Pro (backend + frontend + desktop)


terminal-pro-release.yml – build artifacts on tagged releases (v*)



You'll need to add any required secrets (e.g. Stripe keys, Netlify tokens) in GitHub repo settings.


💾 Backups
Use:
./scripts/rw-backup.sh

This creates timestamped .tar.gz archives of the entire repo under ~/Backups/rinawarp/.

🧰 RinaWarp CLI (rw)
A lightweight CLI wrapper lives at tools/rw.
Example usage from repo root:
./tools/rw doctor     # Run integrity checks
./tools/rw backup     # Create backup
./tools/rw release    # Tag release using VERSION
./tools/rw ci-test    # Run CI-like test pipeline locally

You can add an alias:
alias rw='~/Documents/RinaWarp/tools/rw'


📚 Documentation
Top-level docs index: docs/README.md
Detailed Terminal Pro docs: apps/terminal-pro/docs/
Planned documentation areas:


Product overviews


Install & onboarding


License system / Stripe


AI integrations


Release notes and upgrade paths



🧪 Testing
Typical (adjust to your actual scripts):
cd apps/terminal-pro/backend
npm test

cd ../frontend
npm test

The CI pipeline will run these automatically on push/PR.

👩‍💻 Author
Built by Karina ("Rina Vex")
Brand: RinaWarp / RinaWarp Terminal Pro
This repo is the foundation for the full RinaWarp tech + creative ecosystem.