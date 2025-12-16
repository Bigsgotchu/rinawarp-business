# /tools/debug-elifecycle.ps1
# Usage:
#   pwsh /tools/debug-elifecycle.ps1 <script> [--workspace <nameOrPath>] [--filter <selector>] [-- <args>]
param(
  [Parameter(Mandatory=$true)][string]$ScriptName,
  [string]$Workspace = "",
  [string]$Filter = "",
  [Parameter(ValueFromRemainingArguments=$true)][string[]]$Args
)
$ErrorActionPreference = "Stop"
$start = Get-Date
New-Item -ItemType Directory -Force -Path .debug | Out-Null
$log = ".debug\pm-run-$ScriptName-$($start.ToString('yyyyMMddTHHmmss')).log"

function Log([string]$msg){ $msg | Tee-Object -FilePath $log -Append | Out-Host }

Log "== Env ==================================================================="
try { node -v | Tee-Object -FilePath $log -Append } catch { "node: not found" | Tee-Object -FilePath $log -Append }
try { npm -v  | Tee-Object -FilePath $log -Append } catch { "npm: not found"  | Tee-Object -FilePath $log -Append }
try { pnpm -v | Tee-Object -FilePath $log -Append } catch {}
try { yarn -v | Tee-Object -FilePath $log -Append } catch {}

# PM detection
$pkgMgrField = ""
if (Test-Path package.json) {
  try { $pkgMgrField = (node -e "try{console.log(require('./package.json').packageManager||'')}catch{}") } catch {}
}
$pm = switch -regex ($pkgMgrField) { 'pnpm@' {'pnpm'; break}; 'yarn@' {'yarn'; break}; 'npm@' {'npm'; break}; default { "" } }
if (-not $pm) {
  if ((Test-Path pnpm-lock.yaml) -and (Get-Command pnpm -ErrorAction SilentlyContinue)) { $pm='pnpm' }
  elseif ((Test-Path yarn.lock) -and (Get-Command yarn -ErrorAction SilentlyContinue)) { $pm='yarn' }
  elseif (Test-Path package-lock.json) { $pm='npm' }
  else { $pm='npm' }
}
Log "Using: $pm"
if ($pkgMgrField) { Log "packageManager field: $pkgMgrField" }

# Workspace resolve
$wsDir = ""
$wsName = ""
if ($Workspace) {
  if ((Test-Path "$Workspace\package.json")) {
    $wsDir = (Resolve-Path $Workspace).Path
    $wsName = node -e "try{console.log(require(process.argv[1]).name||'')}catch{}" "$wsDir\package.json"
  } else {
    $json = node -e @'
const fs=require("fs"),path=require("path");
const name=process.env.WS_NAME; const root=process.cwd();
function read(p){try{return JSON.parse(fs.readFileSync(p,"utf8"))}catch{return null}}
function scan(dir, depth=3, out=[]){ if(depth<0)return out;
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    if(e.name.startsWith(".")) continue;
    const p=path.join(dir,e.name);
    if(e.isDirectory()){
      const pj=path.join(p,"package.json");
      if(fs.existsSync(pj)) out.push(p);
      scan(p, depth-1, out);
    }
  } return out;
}
const candidates=[...new Set(scan(root,3))];
for(const d of candidates){
  const pj=path.join(d,"package.json"); const pkg=read(pj)||{};
  if(pkg.name===name){ console.log(JSON.stringify({dir:d,name:pkg.name})); process.exit(0); }
}
process.exit(1);
'@ 2>$null
    if ($LASTEXITCODE -eq 0 -and $json) {
      $obj = $json | ConvertFrom-Json
      $wsDir = $obj.dir
      $wsName = $obj.name
    } else {
      throw "Workspace '$Workspace' not found by name or path."
    }
  }
  Log "Workspace dir: $($wsDir ?? 'root')  name: $($wsName)"
}

# Script existence check
$pkgJsonPath = if ($wsDir) { Join-Path $wsDir "package.json" } else { "package.json" }
$exists = node -e "try{const p=require('$pkgJsonPath');process.exit(p.scripts && p.scripts['$ScriptName']?0:1)}catch{process.exit(1)}"
if ($LASTEXITCODE -ne 0) {
  Log "Error: $pkgJsonPath has no scripts['$ScriptName']."
  Log "Available scripts:"
  node -e "try{const p=require('$pkgJsonPath');if(p.scripts){for(const k of Object.keys(p.scripts))console.log(k)}}catch{}" | Tee-Object -FilePath $log -Append
  exit 2
}

# Install if needed
$targetDir = if ($wsDir) { $wsDir } else { (Get-Location).Path }
Log "== Install (if needed) in $targetDir ===================================="
if (-not (Test-Path (Join-Path $targetDir "node_modules"))) {
  if ($pm -eq "pnpm") {
    Push-Location $targetDir; try { pnpm i --frozen-lockfile *>>$log } catch { pnpm i *>>$log } finally { Pop-Location }
  } elseif ($pm -eq "yarn") {
    Push-Location $targetDir; try { yarn install --frozen-lockfile *>>$log } catch { yarn install *>>$log } finally { Pop-Location }
  } else {
    if (Test-Path (Join-Path $targetDir "package-lock.json")) {
      Push-Location $targetDir; npm ci *>>$log; Pop-Location
    } else {
      Push-Location $targetDir; npm install --no-audit --no-fund *>>$log; Pop-Location
    }
  }
}

# Run with max verbosity
Log "== Run with maximum verbosity ==========================================="
$exit = 0
if ($pm -eq "pnpm") {
  if ($Filter) {
    pnpm --reporter=ndjson -F $Filter run $ScriptName -- $Args *>>$log; $exit=$LASTEXITCODE
  } elseif ($wsDir) {
    pnpm --reporter=ndjson -C "$wsDir" run $ScriptName -- $Args *>>$log; $exit=$LASTEXITCODE
  } else {
    pnpm --reporter=ndjson run $ScriptName -- $Args *>>$log; $exit=$LASTEXITCODE
  }
} elseif ($pm -eq "yarn") {
  if ($wsName) {
    yarn workspace "$wsName" run $ScriptName --verbose -- $Args *>>$log; $exit=$LASTEXITCODE
  } elseif ($wsDir) {
    Push-Location $wsDir; yarn run $ScriptName --verbose -- $Args *>>$log; $exit=$LASTEXITCODE; Pop-Location
  } else {
    yarn run $ScriptName --verbose -- $Args *>>$log; $exit=$LASTEXITCODE
  }
} else {
  if ($wsDir) {
    Push-Location $wsDir; $env:npm_config_loglevel="silly"; npm run $ScriptName -- $Args *>>$log; $exit=$LASTEXITCODE; Pop-Location
  } else {
    $env:npm_config_loglevel="silly"; npm run $ScriptName -- $Args *>>$log; $exit=$LASTEXITCODE
  }
}

Log "== Exit code: $exit ======================================================="
if ($exit -ne 0) {
  Log "--- Error scan (context) --------------------------------------------------"
  try { Select-String -Path $log -Pattern 'ERR!|error |Error:|Failed|TS[0-9]{4}|node-gyp|ELIFECYCLE|eslint|TypeError|SyntaxError' -Context 3,3 | Select-Object -First 60 | ForEach-Object { $_.ToString() } | Tee-Object -FilePath $log -Append | Out-Host } catch {}
  Log "--- npm debug logs (if any) ----------------------------------------------"
  $npmlogs = Get-ChildItem "$HOME\.npm\_logs\*debug*log" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
  if ($npmlogs) { Get-Content $npmlogs -TotalCount 120 | Tee-Object -FilePath $log -Append | Out-Host } else { Log "No npm debug log found." }
  Log "--- Hints -----------------------------------------------------------------"
  if (Select-String -Quiet -Path $log -Pattern "tsc")     { Log "TS: npx tsc -p $((if($wsDir){$wsDir}else{"."}))/tsconfig.json --pretty false" }
  if (Select-String -Quiet -Path $log -Pattern "eslint")  { Log "ESLint: npx eslint $((if($wsDir){$wsDir}else{"."})) --max-warnings=0" }
  if (Select-String -Quiet -Path $log -Pattern "node-gyp"){ Log "Native deps: ensure Python 3 & build tools; npm rebuild in $((if($wsDir){$wsDir}else{"."}))" }
}
$dur = [int](New-TimeSpan -Start $start -End (Get-Date)).TotalSeconds
Write-Host "== Duration: ${dur}s"
Write-Host "Log saved to: $log"
exit $exit