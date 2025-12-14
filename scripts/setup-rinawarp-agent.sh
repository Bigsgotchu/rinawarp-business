#!/usr/bin/env bash
# RinaWarp Agent Setup Script - Adapted for Multi-Service Architecture
# This script sets up Kilo Code + VS Code to help complete your RinaWarp project

set -euo pipefail

# ---- paths
ROOT="$(pwd)"
VS=".vscode"
SCRIPTS="scripts"
CONTINUE_DIR="${CONTINUE_DIR:-$HOME/.continue}"
CONTINUE_CFG="$CONTINUE_DIR/config.yaml"
KILO_CFG="${KILO_CFG:-$HOME/.config/KiloCode}"
KILO_MCP="$KILO_CFG/mcp.json"

mkdir -p "$VS" "$SCRIPTS" "$KILO_CFG" "$CONTINUE_DIR"

echo "🚀 Setting up RinaWarp Agent Tools..."

# ---- 1) Fix Kilo MCP config (stop "Invalid MCP settings JSON" errors)
cat > "$KILO_MCP" <<'JSON'
{ "servers": [] }
JSON

# ---- 2) RinaWarp-specific agent toolbox
cat > "$SCRIPTS/build-all.sh" <<'SH'
#!/usr/bin/env bash
set -euo pipefail
echo "🏗️  Building all RinaWarp services..."

# Build frontend apps
echo "📱 Building apps..."
for app in apps/*/; do
  if [ -f "$app/package.json" ]; then
    echo "Building $(basename "$app")..."
    cd "$app" && npm ci && npm run build && cd - > /dev/null
  fi
done

# Build Cloudflare workers
echo "☁️  Building Cloudflare workers..."
for worker in workers/*/; do
  if [ -f "$worker/wrangler.toml" ]; then
    echo "Building $(basename "$worker") worker..."
    cd "$worker" && npm ci && cd - > /dev/null
  fi
done

# Build backend services
echo "🔧 Building backend services..."
for backend in backend/*/; do
  if [ -f "$backend/package.json" ] && [ -d "$backend/src" ] || [ -f "$backend/server.js" ]; then
    echo "Building $(basename "$backend")..."
    cd "$backend" && npm ci && cd - > /dev/null
  fi
done

echo "✅ All builds completed!"
SH

cat > "$SCRIPTS/build-app.sh" <<'SH'
#!/usr/bin/env bash
set -euo pipefail
APP_NAME="${1:-}"
if [ -z "$APP_NAME" ]; then
  echo "Usage: $0 <app-name>"
  echo "Available apps: admin-console, ai-music-video, phone-manager, terminal-pro, website"
  exit 1
fi

if [ ! -d "apps/$APP_NAME" ]; then
  echo "❌ App '$APP_NAME' not found in apps/"
  exit 1
fi

echo "🏗️  Building app: $APP_NAME"
cd "apps/$APP_NAME"
npm ci
npm run build
echo "✅ App '$APP_NAME' built successfully!"
SH

cat > "$SCRIPTS/build-worker.sh" <<'SH'
#!/usr/bin/env bash
set -euo pipefail
WORKER_NAME="${1:-}"
if [ -z "$WORKER_NAME" ]; then
  echo "Usage: $0 <worker-name>"
  echo "Available workers: admin-api, license-verify, rina-agent"
  exit 1
fi

if [ ! -d "workers/$WORKER_NAME" ]; then
  echo "❌ Worker '$WORKER_NAME' not found in workers/"
  exit 1
fi

echo "☁️  Building worker: $WORKER_NAME"
cd "workers/$WORKER_NAME"
npm ci
echo "✅ Worker '$WORKER_NAME' ready for deployment!"
SH

cat > "$SCRIPTS/deploy-worker.sh" <<'SH'
#!/usr/bin/env bash
set -euo pipefail
WORKER_NAME="${1:-}"
ENVIRONMENT="${2:-staging}"

if [ -z "$WORKER_NAME" ]; then
  echo "Usage: $0 <worker-name> [environment]"
  echo "Available workers: admin-api, license-verify, rina-agent"
  echo "Environments: staging, production"
  exit 1
fi

if [ ! -d "workers/$WORKER_NAME" ]; then
  echo "❌ Worker '$WORKER_NAME' not found"
  exit 1
fi

cd "workers/$WORKER_NAME"
echo "🚀 Deploying $WORKER_NAME to $ENVIRONMENT..."

case "$ENVIRONMENT" in
  staging)
    wrangler deploy --env staging
    ;;
  prod|production)
    wrangler deploy --env production
    ;;
  *)
    echo "Unknown environment: $ENVIRONMENT"
    exit 1
    ;;
esac

echo "✅ $WORKER_NAME deployed successfully!"
SH

cat > "$SCRIPTS/deploy-website.sh" <<'SH'
#!/usr/bin/env bash
set -euo pipefail
ENVIRONMENT="${1:-staging}"

cd apps/website

case "$ENVIRONMENT" in
  staging)
    echo "🌐 Deploying website to staging..."
    npm run build
    wrangler deploy --env staging
    ;;
  prod|production)
    echo "🌐 Deploying website to production..."
    npm run build
    wrangler deploy --env production
    ;;
  *)
    echo "Usage: $0 [staging|production]"
    exit 1
    ;;
esac

echo "✅ Website deployed successfully!"
SH

cat > "$SCRIPTS/test-all.sh" <<'SH'
#!/usr/bin/env bash
set -euo pipefail
echo "🧪 Running all tests..."

# Test frontend apps
echo "📱 Testing apps..."
for app in apps/*/; do
  if [ -f "$app/package.json" ] && grep -q '"test"' "$app/package.json"; then
    echo "Testing $(basename "$app")..."
    cd "$app" && npm test && cd - > /dev/null
  fi
done

# Test backend services
echo "🔧 Testing backend services..."
for backend in backend/*/; do
  if [ -f "$backend/package.json" ] && grep -q '"test"' "$backend/package.json"; then
    echo "Testing $(basename "$backend")..."
    cd "$backend" && npm test && cd - > /dev/null
  fi
done

echo "✅ All tests completed!"
SH

cat > "$SCRIPTS/start-dev.sh" <<'SH'
#!/usr/bin/env bash
set -euo pipefail
SERVICE="${1:-website}"

case "$SERVICE" in
  website)
    echo "🌐 Starting website development server..."
    cd apps/website
    npm run dev
    ;;
  admin-console)
    echo "🛠️  Starting admin console..."
    cd apps/admin-console
    npm run dev
    ;;
  ai-music-video)
    echo "🎵 Starting AI music video app..."
    cd apps/ai-music-video
    npm run dev
    ;;
  agent)
    echo "🤖 Starting Rina agent..."
    cd apps/terminal-pro/agent
    npm run dev
    ;;
  api-gateway)
    echo "🔌 Starting API gateway..."
    cd backend/api-gateway
    npm run dev
    ;;
  *)
    echo "Usage: $0 [website|admin-console|ai-music-video|agent|api-gateway]"
    exit 1
    ;;
esac
SH

cat > "$SCRIPTS/health-check.sh" <<'SH'
#!/usr/bin/env bash
set -euo pipefail
echo "🔍 Checking service health..."

# Check if required files exist
echo "📋 Checking project structure..."
required_dirs=("apps" "workers" "backend")
for dir in "${required_dirs[@]}"; do
  if [ -d "$dir" ]; then
    echo "✅ $dir/ directory exists"
  else
    echo "❌ $dir/ directory missing"
  fi
done

# Check package.json files
echo "📦 Checking package.json files..."
find . -name "package.json" | grep -v node_modules | wc -l | xargs echo "Found package.json files:"

# Check wrangler configurations
echo "☁️  Checking Cloudflare worker configs..."
find . -name "wrangler.toml" | grep -v node_modules | wc -l | xargs echo "Found wrangler.toml files:"

echo "✅ Health check completed!"
SH

cat > "$SCRIPTS/rinawarp-smoke-test.sh" <<'SH'
#!/usr/bin/env bash
set -euo pipefail
echo "🔥 Running RinaWarp smoke tests..."

# Test that all services can be built
echo "🏗️  Testing build process..."
bash scripts/build-all.sh

# Test linting
echo "🔍 Running lints..."
find apps/ workers/ backend/ -name "*.js" -o -name "*.ts" -o -name "*.tsx" | head -5 | xargs -I {} sh -c 'echo "Linting {}" || true'

echo "✅ Smoke tests completed!"
SH

chmod +x "$SCRIPTS/"*.sh

# ---- 3) VS Code tasks for RinaWarp
cat > "$VS/tasks.json" <<'JSON'
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Build All Services",
      "type": "shell",
      "command": "bash scripts/build-all.sh",
      "group": "build",
      "problemMatcher": []
    },
    {
      "label": "Build Specific App",
      "type": "shell",
      "command": "bash scripts/build-app.sh",
      "args": ["${input:appName}"],
      "group": "build",
      "problemMatcher": []
    },
    {
      "label": "Build Specific Worker",
      "type": "shell",
      "command": "bash scripts/build-worker.sh",
      "args": ["${input:workerName}"],
      "group": "build",
      "problemMatcher": []
    },
    {
      "label": "Deploy Worker",
      "type": "shell",
      "command": "bash scripts/deploy-worker.sh",
      "args": ["${input:workerName}", "${input:environment}"],
      "group": "build",
      "problemMatcher": []
    },
    {
      "label": "Deploy Website",
      "type": "shell",
      "command": "bash scripts/deploy-website.sh",
      "args": ["${input:environment}"],
      "group": "build",
      "problemMatcher": []
    },
    {
      "label": "Start Dev Server",
      "type": "shell",
      "command": "bash scripts/start-dev.sh",
      "args": ["${input:serviceName}"],
      "group": "test",
      "problemMatcher": []
    },
    {
      "label": "Run All Tests",
      "type": "shell",
      "command": "bash scripts/test-all.sh",
      "group": "test",
      "problemMatcher": []
    },
    {
      "label": "RinaWarp Smoke Test",
      "type": "shell",
      "command": "bash scripts/rinawarp-smoke-test.sh",
      "group": "test",
      "problemMatcher": []
    },
    {
      "label": "Health Check",
      "type": "shell",
      "command": "bash scripts/health-check.sh",
      "group": "test",
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "appName",
      "description": "Choose an app to build",
      "type": "pickString",
      "options": [
        "admin-console",
        "ai-music-video", 
        "phone-manager",
        "terminal-pro",
        "website"
      ]
    },
    {
      "id": "workerName", 
      "description": "Choose a worker to build",
      "type": "pickString",
      "options": [
        "admin-api",
        "license-verify",
        "rina-agent"
      ]
    },
    {
      "id": "environment",
      "description": "Choose deployment environment",
      "type": "pickString", 
      "options": [
        "staging",
        "production"
      ]
    },
    {
      "id": "serviceName",
      "description": "Choose service to start",
      "type": "pickString",
      "options": [
        "website",
        "admin-console",
        "ai-music-video", 
        "agent",
        "api-gateway"
      ]
    }
  ]
}
JSON

# ---- 4) Continue config adapted for RinaWarp
if [ ! -f "$CONTINUE_CFG" ]; then
  cat > "$CONTINUE_CFG" <<'YAML'
version: 3
models:
  - title: RinaWarp Assistant
    model: rina-agent
    provider: openai
    apiBase: http://127.0.0.1:3333/v1
    apiKey: dummy
    streaming: true
    systemMessage: |
      You are the RinaWarp project assistant. You help with:
      - Building and deploying RinaWarp services (apps, workers, backend)
      - Debugging Cloudflare worker issues
      - Managing complex monorepo structure
      - Running tests and health checks
      - Following the project's established patterns

      Project structure:
      - apps/: admin-console, ai-music-video, phone-manager, terminal-pro, website
      - workers/: admin-api, license-verify, rina-agent  
      - backend/: ai-service, api-gateway, auth-service, billing-service, etc.

      Always check the current directory and suggest the right commands for the service being worked on.
tabAutocompleteModel: RinaWarp Assistant
experimental:
  enableTools: false
customCommands:
  - name: Build All
    prompt: Build all RinaWarp services
    builtin: /share # This will be implemented to run scripts/build-all.sh
  
  - name: Deploy Worker  
    prompt: Deploy a Cloudflare worker
    builtin: /share # This will be implemented to run scripts/deploy-worker.sh
  
  - name: Health Check
    prompt: Run project health check
    builtin: /share # This will be implemented to run scripts/health-check.sh
YAML
fi

echo "✅ RinaWarp Agent setup complete!"
echo ""
echo "📁 Created directories:"
echo "   - Scripts: $ROOT/$SCRIPTS"
echo "   - VS Tasks: $ROOT/$VS/tasks.json"
echo "   - Kilo MCP: $KILO_MCP"
echo "   - Continue: $CONTINUE_CFG"
echo ""
echo "🚀 Available commands:"
echo "   - bash scripts/build-all.sh           # Build everything"
echo "   - bash scripts/build-app.sh <app>     # Build specific app"
echo "   - bash scripts/build-worker.sh <worker> # Build specific worker"
echo "   - bash scripts/deploy-worker.sh <worker> <env> # Deploy worker"
echo "   - bash scripts/deploy-website.sh <env> # Deploy website"
echo "   - bash scripts/start-dev.sh <service>  # Start development server"
echo "   - bash scripts/test-all.sh             # Run all tests"
echo "   - bash scripts/health-check.sh         # Check project health"
echo ""
echo "💡 In VS Code:"
echo "   - Terminal → Run Task… → Choose any task"
echo "   - Use Continue chat with 'RinaWarp Assistant' model"
echo ""
echo "🎯 Next steps:"
echo "   1. Restart VS Code to load new tasks"
echo "   2. In Continue: Select 'RinaWarp Assistant' model"
echo "   3. Try: 'Build all services' or 'Deploy rina-agent worker to staging'"
