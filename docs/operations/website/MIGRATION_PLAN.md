# RW Terminal Migration Plan (Local-Only)

Goal: Move everything needed from "RinaWarp NDS" into "RW Terminal" so RW Terminal becomes the main working project.

---

## 0. Folder Locations (EDIT THESE)

- RinaWarp NDS folder:
  - <REPLACE WITH YOUR REAL LOCAL PATH>

- RW Terminal folder:
  - <REPLACE WITH YOUR REAL LOCAL PATH>

Example:

- NDS: `C:/Users/me/Projects/RinaWarp-NDS`
- RW: `C:/Users/me/Projects/RW-Terminal`

---

## 1. What RW Terminal must contain

RW Terminal must be self-contained:

- Terminal UI code
- Core logic (commands, handlers)
- All configs (`package.json`, `tsconfig`, Electron config)
- Assets (icons, logos, themes)
- Build scripts
- Docs needed to run/build

This ensures RW Terminal becomes the only project I work on.

---

## 2. What to copy from RinaWarp NDS → RW Terminal

Copy ONLY these types of folders and files:

### Must-copy folders (IF they exist in NDS)

- `src/`
- `app/`
- `client/`
- `frontend/`
- `desktop/`
- `assets/`
- `public/`
- `scripts/`
- `tools/`
- `docs/` (only the ones needed for RW Terminal)

### Must-copy files

- `package.json` (merge into RW Terminal, never overwrite)
- `tsconfig.json` or `jsconfig.json` (merge)
- Any build config file:
  - `vite.config.*`
  - `webpack.config.*`
  - `electron-builder.*`
- `.env.example` / `.env.development`

---

## 3. Fix imports & dependencies

After copying everything:

1. Search RW Terminal for old paths referencing:
   - `RinaWarp NDS`
   - old folder names
2. Update import paths.
3. Run:

npm install
npm run dev

4. Fix:

- Missing modules
- Wrong paths
- Build errors

---

## 4. When RW Terminal builds successfully

RW Terminal becomes the *official* project.

Do NOT work inside "RinaWarp NDS" anymore.

You may rename it locally to:

> `RinaWarp-NDS-ARCHIVE`

That file will be your "map" while you work.

✅ PART 2 — TERMINAL COMMANDS YOU CAN RUN LOCALLY

Below is exactly what to paste into your VS Code terminal (kilo).

These commands:

✔ set your folder paths
✔ create needed subfolders
✔ copy only what's useful
✔ never overwrite RW Terminal configs
✔ work on macOS, Linux, and WSL
(Windows PowerShell version is below)

Step 1 — Set your project paths

EDIT THESE PATHS BEFORE RUNNING

export NDS_DIR="/ABSOLUTE/PATH/TO/RinaWarp-NDS"
export RW_DIR="/ABSOLUTE/PATH/TO/RW-Terminal"

echo "NDS_DIR = $NDS_DIR"
echo "RW_DIR  = $RW_DIR"

Example:

export NDS_DIR="$HOME/Projects/RinaWarp-NDS"
export RW_DIR="$HOME/Projects/RW-Terminal"

Step 2 — Create folders in RW Terminal if missing
mkdir -p "$RW_DIR/src"
mkdir -p "$RW_DIR/assets"
mkdir -p "$RW_DIR/public"
mkdir -p "$RW_DIR/scripts"
mkdir -p "$RW_DIR/tools"
mkdir -p "$RW_DIR/docs"

Step 3 — Copy only what should move

These commands try to copy and skip anything that doesn't exist.

Paste this block as-is:

rsync -av --ignore-existing "$NDS_DIR/src/"      "$RW_DIR/src/"      2>/dev/null || echo "No src/"
rsync -av --ignore-existing "$NDS_DIR/app/"      "$RW_DIR/app/"      2>/dev/null || echo "No app/"
rsync -av --ignore-existing "$NDS_DIR/client/"   "$RW_DIR/client/"   2>/dev/null || echo "No client/"
rsync -av --ignore-existing "$NDS_DIR/frontend/" "$RW_DIR/frontend/" 2>/dev/null || echo "No frontend/"
rsync -av --ignore-existing "$NDS_DIR/desktop/"  "$RW_DIR/desktop/"  2>/dev/null || echo "No desktop/"
rsync -av --ignore-existing "$NDS_DIR/assets/"   "$RW_DIR/assets/"   2>/dev/null || echo "No assets/"
rsync -av --ignore-existing "$NDS_DIR/public/"   "$RW_DIR/public/"   2>/dev/null || echo "No public/"
rsync -av --ignore-existing "$NDS_DIR/scripts/"  "$RW_DIR/scripts/"  2>/dev/null || echo "No scripts/"
rsync -av --ignore-existing "$NDS_DIR/tools/"    "$RW_DIR/tools/"    2>/dev/null || echo "No tools/"
rsync -av --ignore-existing "$NDS_DIR/docs/"     "$RW_DIR/docs/"     2>/dev/null || echo "No docs/"

That copies everything without overwriting any file RW Terminal already has.

Step 4 — Manually merge configs (IMPORTANT)

In VS Code:

Open both:

RinaWarp-NDS/package.json

RW-Terminal/package.json

Copy these ONLY if they're missing:

dependencies

devDependencies

scripts

Save RW Terminal package.json

Then in terminal:

cd "$RW_DIR"
npm install

Step 5 — Test RW Terminal
npm run dev

Fix errors one by one (I can help if you paste them).

💡 WINDOWS POWERSHELL VERSION

If you are on Windows, use this instead of rsync:

$NDS_DIR = "C:\PATH\TO\RinaWarp-NDS"
$RW_DIR  = "C:\PATH\TO\RW-Terminal"

Copy-Item -Recurse -Force "$NDS_DIR\src\*"      "$RW_DIR\src\"      -ErrorAction SilentlyContinue
Copy-Item -Recurse -Force "$NDS_DIR\app\*"      "$RW_DIR\app\"      -ErrorAction SilentlyContinue
Copy-Item -Recurse -Force "$NDS_DIR\client\*"   "$RW_DIR\client\"   -ErrorAction SilentlyContinue
Copy-Item -Recurse -Force "$NDS_DIR\frontend\*" "$RW_DIR\frontend\" -ErrorAction SilentlyContinue
Copy-Item -Recurse -Force "$NDS_DIR\desktop\*"  "$RW_DIR\desktop\"  -ErrorAction SilentlyContinue
Copy-Item -Recurse -Force "$NDS_DIR\assets\*"   "$RW_DIR\assets\"   -ErrorAction SilentlyContinue
Copy-Item -Recurse -Force "$NDS_DIR\public\*"   "$RW_DIR\public\"   -ErrorAction SilentlyContinue
Copy-Item -Recurse -Force "$NDS_DIR\scripts\*"  "$RW_DIR\scripts\"  -ErrorAction SilentlyContinue
Copy-Item -Recurse -Force "$NDS_DIR\tools\*"    "$RW_DIR\tools\"    -ErrorAction SilentlyContinue
Copy-Item -Recurse -Force "$NDS_DIR\docs\*"     "$RW_DIR\docs\"     -ErrorAction SilentlyContinue

🔥 NEXT STEP (super helpful)

If you can send me just two folder trees, I can generate a perfect, custom migration script for your setup.

Run this inside VS Code terminal:

tree -L 2 /ABSOLUTE/PATH/TO/RinaWarp-NDS
tree -L 2 /ABSOLUTE/PATH/TO/RW-Terminal

Paste the output here and I'll build you:
