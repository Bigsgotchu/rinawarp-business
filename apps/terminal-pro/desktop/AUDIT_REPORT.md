# Repo Audit Report
Generated: 2026-01-03T15:33:10.613Z

## Entrypoint candidates (check for duplicates)

- src/main/main.js
- src/main/main.ts
- src/preload.js
- src/renderer/main.tsx
- src/renderer/renderer.js

## Conflicts: same stem has TS + JS variants

- src/brain/auth  (.js, .ts)
- src/brain/plan  (.js, .ts)
- src/brain/server  (.js, .ts)
- src/brain/status  (.js, .ts)
- src/main/main  (.js, .ts)
- src/renderer/main  (.js, .tsx)

## Exact duplicate files (same content hash)

- scripts/security-audit.cjs
  scripts/security-audit.js

## Prettier

Command: `npx prettier . --write`
Exit: 2

STDOUT:
```
.eslintrc.cjs 90ms
.github/release_template.md 34ms
.github/workflows/harden-git.yml 33ms
.github/workflows/release-appimage.yml 18ms
.github/workflows/release-r2-win.yml 17ms
.github/workflows/release.yml 14ms
.github/workflows/reusable-hardening.yml 9ms
.markdownlint.json 2ms
.prettierrc.json 2ms
API_ERROR_FIX_GUIDE.md 77ms
APPIMAGE_OPTIMIZATION_REPORT.md 30ms
ARCHITECTURE.md 99ms (unchanged)
AUDIT_REPORT.md 32ms
BUILD_SYSTEM.md 115ms (unchanged)
certs/README.md 10ms
CHANGELOG.md 12ms
COMPONENT_SPECIFICATION.md 121ms (unchanged)
dashboard/telemetry-dashboard-hardened.html 161ms
dashboard/telemetry-dashboard.html 70ms
debug-api-failures.js 16ms
DEPLOYMENT_INSTRUCTIONS.md 17ms (unchanged)
docs/CDN-DISTRIBUTION-SETUP.md 46ms
docs/COMPREHENSIVE-DEPLOYMENT-GUIDE.md 24ms
docs/MACOS-BUILD-SETUP-COMPLETE.md 38ms
docs/POST-DEPLOYMENT-VALIDATION-CHECKLIST.md 56ms
docs/UAT-SCENARIOS.md 47ms
electron-builder-config.js 4ms
generate-test-report.js 29ms
GITHUB_ACTIONS_APPIMAGE_RELEASE_GUIDE.md 28ms
GITHUB_ACTIONS_FIX_GUIDE.md 14ms
GITHUB_ACTIONS_RELEASE_SETUP_GUIDE.md 20ms (unchanged)
GO_TO_MARKET_PLAN.md 9ms
LAUNCH_POST.md 4ms (unchanged)
LIVE_SESSION_VERIFICATION.md 16ms
package-lock.json 98ms (unchanged)
package.json 2ms
PIPELINE_TESTING_GUIDE.md 34ms (unchanged)
PIPELINE_TESTING_SUMMARY.md 36ms (unchanged)
POST_MORTEM_TEMPLATE.md 6ms
PRODUCTION_HARDENING_CHECKLIST.md 30ms (unchanged)
PRODUCTION_READINESS.md 18ms (unchanged)
PRODUCTION_READY_RELEASE_GUIDE.md 34ms
R2_SETUP_EXECUTION_SUMMARY.md 21ms (unchanged)
README.md 3ms
RELEASE_ENGINEERING_GUIDE.md 30ms
RELEASE_NOTES_v1.0.0.md 8ms
RELEASE_NOTES.md 5ms
RELEASE.md 10ms
rinawarp.d.ts 29ms (unchanged)
run-tests.js 21ms
SANITY_CHECK_VERIFICATION.md 12ms
scripts/ai-qa-summary.mjs 10ms
scripts/check-arch.js 22ms
scripts/check-runtime.js 16ms
scripts/gen-types.js 10ms
scripts/generate-release-notes.mjs 4ms
scripts/lint.js 1ms (unchanged)
scripts/preflight.js 2ms
scripts/release-checklist.md 16ms
scripts/release-engineering.js 34ms
scripts/security-audit.cjs 42ms
scripts/security-audit.js 43ms
scripts/smoke-pty.mjs 6ms
security-audit-config.json 8ms
security-audit-report.json 23ms
SECURITY.md 8ms
shared/constants.ts 37ms (unchanged)
shared/types/conversation.types.ts 41ms (unchanged)
SMOKE_TEST_IMPLEMENTATION.md 21ms (unchanged)
smoke.js 2ms
src/brain/auth.js 1ms
src/brain/auth.ts 2ms
src/brain/plan.js 6ms
src/brain/plan.ts 8ms
src/brain/server.js 6ms
src/brain/server.ts 10ms
src/brain/status.js 2ms
src/brain/status.ts 4ms
src/brain/types.ts 3ms
src/core/CanaryUpdateManager.js 9ms
src/core/CrashTelemetry.js 6ms
src/core/test-canary-updates.js 12ms
src/main.js 39ms
src/main/agent-supervisor.js 7ms
src/main/agents/agent-manager.ts 6ms (unchanged)
src/main/core/app.ts 5ms (unchanged)
src/main/core/config.ts 5ms (unchanged)
src/main/core/lifecycle.ts 3ms (unchanged)
src/main/core/security.ts 3ms (unchanged)
src/main/crash-telemetry.js 19ms
src/main/ipc-guard.ts 5ms
src/main/ipc/agent.ts 4ms (unchanged)
src/main/ipc/app.ts 6ms (unchanged)
src/main/ipc/appIpc.ts 2ms
src/main/ipc/billing.ts 9ms
src/main/ipc/conversation.ts 5ms (unchanged)
src/main/ipc/filesystem.ts 14ms (unchanged)
src/main/ipc/filesystemIpc.ts 10ms
src/main/ipc/intent.ts 4ms (unchanged)
src/main/ipc/license.ts 22ms
src/main/ipc/policyIpc.ts 3ms
src/main/ipc/rinaIpc.ts 5ms
src/main/ipc/terminal.ts 15ms
src/main/ipc/terminalIpc.ts 12ms
src/main/main.js 84ms
src/main/main.ts 16ms
src/main/policy/runtimePolicy.ts 11ms
src/main/rina/cloudflareWorkerClient.ts 12ms
src/main/rina/installNetworkGuards.ts 4ms
src/main/rina/networkGate.ts 5ms
src/main/rina/policyRinaAdapter.ts 5ms
src/main/rina/policyRinaProvider.ts 9ms
src/main/rina/rinaProvider.ts 9ms
src/main/rina/types.ts 2ms
src/main/security/approvalStore.ts 5ms
src/main/security/productionSecurity.ts 9ms
src/main/smokeTest.ts 13ms
src/main/terminal/terminalService.ts 10ms
src/main/tsconfig.json 1ms
src/preload.js 4ms
src/preload/ipc.ts 26ms
src/renderer/components/App.css 13ms (unchanged)
src/renderer/components/conversation/ConversationHeader.tsx 13ms (unchanged)
src/renderer/components/conversation/ConversationInterface.tsx 9ms (unchanged)
src/renderer/components/conversation/IntentInput.tsx 7ms (unchanged)
src/renderer/components/conversation/MessageBubble.tsx 8ms (unchanged)
src/renderer/components/GhostTextRenderer.ts 12ms
src/renderer/components/intent/IntentProcessor.tsx 12ms (unchanged)
src/renderer/components/layout/Header.tsx 13ms
src/renderer/components/terminal/TerminalPanel.tsx 9ms (unchanged)
src/renderer/hooks/useIntent.ts 8ms (unchanged)
src/renderer/index-conversation.html 48ms (unchanged)
src/renderer/index-original.html 45ms (unchanged)
src/renderer/index.html 44ms
src/renderer/main.js 1ms
src/renderer/main.tsx 4ms (unchanged)
src/renderer/package.json 1ms (unchanged)
src/renderer/renderer.js 47ms
src/renderer/styles/changelog.css 5ms
src/renderer/styles/components.css 69ms
src/renderer/styles/conversation.css 19ms (unchanged)
src/renderer/styles/layout.css 9ms
src/renderer/styles/main.css 31ms
src/renderer/styles/terminal.css 42ms
src/renderer/styles/themes.css 19ms
src/renderer/styles/update-banner.css 2ms
src/renderer/testing/analytics-tracker.js 27ms (unchanged)
src/renderer/testing/feedback-collector.js 25ms (unchanged)
src/renderer/testing/friction-observer.js 33ms (unchanged)
src/renderer/testing/user-testing-integration.js 31ms (unchanged)
src/renderer/tsconfig.json 1ms
src/shared/ipc-map.ts 8ms
STAGING_SOLUTION_REPORT.md 24ms
SUPPORT_SOP.md 11ms
TECHNICAL_WRITEUP.md 5ms (unchanged)
test-report-template.html 50ms
test-report.html 47ms
test-results-basic.json 1ms
test-results-comprehensive.json 2ms
test-results/.last-run.json 1ms
TESTING.md 26ms
tools/repo-audit.mjs 18ms
tsconfig.eslint.json 1ms
tsconfig.json 2ms
UI_FIXES_SUMMARY.md 4ms (unchanged)
vite.config.js 3ms
vitest.config.js 1ms
WINDOWS_TEST_SCRIPT.md 7ms
worker/package-lock.json 13ms
worker/package.json 1ms
worker/src/index.ts 53ms
worker/tsconfig.json 1ms
```

STDERR:
```
[error] .github/workflows/production-release.yml: SyntaxError: All collection items must start at the same column (2:1)
[error]    1 | # Production Release CI - Hard Gates for vX.Y.Z tags
[error] >  2 | name: Production Release
[error]      | ^^^^^^^^^^^^^^^^^^^^^^^^
[error] >  3 |
[error]      | ^
[error] >  4 | on:
[error]      | ^
[error] >  5 |   push:
[error]      | ^
[error] >  6 |     tags:
[error]      | ^
[error] >  7 |       - "v*.*.*"
[error]      | ^
[error] >  8 |
[error]      | ^
[error] >  9 | env:
[error]      | ^
[error] >  10 |   APP_NAME: RinaWarp-Terminal-Pro
[error]       | ^
[error] >  11 |   BUILD_DIR: dist-terminal-pro
[error]       | ^
[error] >  12 |
[error]       | ^
[error] >  13 | jobs:
[error]       | ^
[error] >  14 |   build-and-test:
[error]       | ^
[error] >  15 |     name: Build & Run All Gates
[error]       | ^
[error] >  16 |     runs-on: ubuntu-22.04
[error]       | ^
[error] >  17 |     timeout-minutes: 60
[error]       | ^
[error] >  18 |
[error]       | ^
[error] >  19 |     steps:
[error]       | ^
[error] >  20 |       - name: Checkout
[error]       | ^
[error] >  21 |         uses: actions/checkout@v4
[error]       | ^
[error] >  22 |
[error]       | ^
[error] >  23 |       - name: Setup Node.js
[error]       | ^
[error] >  24 |         uses: actions/setup-node@v4
[error]       | ^
[error] >  25 |         with:
[error]       | ^
[error] >  26 |           node-version: 20
[error]       | ^
[error] >  27 |           cache: "npm"
[error]       | ^
[error] >  28 |
[error]       | ^
[error] >  29 |       - name: Install dependencies
[error]       | ^
[error] >  30 |         run: npm ci
[error]       | ^
[error] >  31 |
[error]       | ^
[error] >  32 |       - name: Lint & Type Check
[error]       | ^
[error] >  33 |         run: npm run lint && npm run type-check
[error]       | ^
[error] >  34 |
[error]       | ^
[error] >  35 |       - name: Build AppImage
[error]       | ^
[error] >  36 |         run: npm run build:appimage
[error]       | ^
[error] >  37 |
[error]       | ^
[error] >  38 |       - name: Scope Guard - Verify no unwanted files
[error]       | ^
[error] >  39 |         run: |
[error]       | ^
[error] >  40 |           set -euo pipefail
[error]       | ^
[error] >  41 |           echo "Checking for unwanted files in build..."
[error]       | ^
[error] >  42 |           # Should not contain source files
[error]       | ^
[error] >  43 |           if find "${{ env.BUILD_DIR }}" -name "*.ts" -o -name "*.js" -o -name "*.map" | grep -q .; then
[error]       | ^
[error] >  44 |             echo "❌ Found source files in build output"
[error]       | ^
[error] >  45 |             exit 1
[error]       | ^
[error] >  46 |           fi
[error]       | ^
[error] >  47 |           echo "✅ Scope guard passed"
[error]       | ^
[error] >  48 |
[error]       | ^
[error] >  49 |       - name: Size Budget Check
[error]       | ^
[error] >  50 |         run: |
[error]       | ^
[error] >  51 |           set -euo pipefail
[error]       | ^
[error] >  52 |           APP="$(ls -1 ${{ env.BUILD_DIR }}/*.AppImage | head -n 1)"
[error]       | ^
[error] >  53 |           SIZE_MB=$(du -m "$APP" | cut -f1)
[error]       | ^
[error] >  54 |           echo "AppImage size: ${SIZE_MB}MB"
[error]       | ^
[error] >  55 |           if [ "$SIZE_MB" -gt 200 ]; then
[error]       | ^
[error] >  56 |             echo "❌ AppImage exceeds 200MB budget"
[error]       | ^
[error] >  57 |             exit 1
[error]       | ^
[error] >  58 |           fi
[error]       | ^
[error] >  59 |           echo "✅ Size budget passed"
[error]       | ^
[error] >  60 |
[error]       | ^
[error] >  61 |       - name: Electron Boot Smoke Test
[error]       | ^
[error] >  62 |         run: |
[error]       | ^
[error] >  63 |           set -euo pipefail
[error]       | ^
[error] >  64 |           APP="$(ls -1 ${{ env.BUILD_DIR }}/*.AppImage | head -n 1)"
[error]       | ^
[error] >  65 |           chmod +x "$APP"
[error]       | ^
[error] >  66 |           export APPIMAGE_EXTRACT_AND_RUN=1
[error]       | ^
[error] >  67 |           timeout 30s xvfb-run -a "$APP" --version || (
[error]       | ^
[error] >  68 |             echo "❌ Electron failed to boot"
[error]       | ^
[error] >  69 |             exit 1
[error]       | ^
[error] >  70 |           )
[error]       | ^
[error] >  71 |           echo "✅ Electron boot smoke passed"
[error]       | ^
[error] >  72 |
[error]       | ^
[error] >  73 |       - name: IPC Smoke Test (Offline)
[error]       | ^
[error] >  74 |         run: |
[error]       | ^
[error] >  75 |           set -euo pipefail
[error]       | ^
[error] >  76 |           APP="$(ls -1 ${{ env.BUILD_DIR }}/*.AppImage | head -n 1)"
[error]       | ^
[error] >  77 |           chmod +x "$APP"
[error]       | ^
[error] >  78 |           export APPIMAGE_EXTRACT_AND_RUN=1
[error]       | ^
[error] >  79 |           xvfb-run -a "$APP" --smoke-test --smoke-ipc --smoke-offline --smoke-timeout-ms 45000 --smoke-no-sandbox || (
[error]       | ^
[error] >  80 |             echo "❌ IPC smoke test failed"
[error]       | ^
[error] >  81 |             exit 1
[error]       | ^
[error] >  82 |           )
[error]       | ^
[error] >  83 |           echo "✅ IPC smoke test passed"
[error]       | ^
[error] >  84 |
[error]       | ^
[error] >  85 |       - name: Rina Offline Smoke Test
[error]       | ^
[error] >  86 |         run: |
[error]       | ^
[error] >  87 |           set -euo pipefail
[error]       | ^
[error] >  88 |           APP="$(ls -1 ${{ env.BUILD_DIR }}/*.AppImage | head -n 1)"
[error]       | ^
[error] >  89 |           chmod +x "$APP"
[error]       | ^
[error] >  90 |           export APPIMAGE_EXTRACT_AND_RUN=1
[error]       | ^
[error] >  91 |           xvfb-run -a "$APP" --smoke-test --smoke-rina-roundtrip --smoke-offline --smoke-timeout-ms 45000 --smoke-no-sandbox || (
[error]       | ^
[error] >  92 |             echo "❌ Rina offline smoke test failed"
[error]       | ^
[error] >  93 |             exit 1
[error]       | ^
[error] >  94 |           )
[error]       | ^
[error] >  95 |           echo "✅ Rina offline smoke test passed"
[error]       | ^
[error] >  96 |
[error]       | ^
[error] >  97 |       - name: node-pty Smoke Test
[error]       | ^
[error] >  98 |         run: |
[error]       | ^
[error] >  99 |           set -euo pipefail
[error]       | ^
[error] > 100 |           APP="$(ls -1 ${{ env.BUILD_DIR }}/*.AppImage | head -n 1)"
[error]       | ^
[error] > 101 |           chmod +x "$APP"
[error]       | ^
[error] > 102 |           export APPIMAGE_EXTRACT_AND_RUN=1
[error]       | ^
[error] > 103 |           xvfb-run -a "$APP" --smoke-test --smoke-terminal-pty --smoke-timeout-ms 30000 --smoke-no-sandbox || (
[error]       | ^
[error] > 104 |             echo "❌ node-pty smoke test failed"
[error]       | ^
[error] > 105 |             exit 1
[error]       | ^
[error] > 106 |           )
[error]       | ^
[error] > 107 |           echo "✅ node-pty smoke test passed"
[error]       | ^
[error] > 108 |
[error]       | ^
[error] > 109 |       - name: Rina Online Smoke Test (with secrets)
[error]       | ^
[error] > 110 |         if: env.RINA_WORKER_BASE_URL != '' && env.RINA_WORKER_API_KEY != ''
[error]       | ^
[error] > 111 |         env:
[error]       | ^
[error] > 112 |           RINA_WORKER_BASE_URL: ${{ secrets.RINA_WORKER_BASE_URL }}
[error]       | ^
[error] > 113 |           RINA_WORKER_API_KEY: ${{ secrets.RINA_WORKER_API_KEY }}
[error]       | ^
[error] > 114 |         run: |
[error]       | ^
[error] > 115 |           set -euo pipefail
[error]       | ^
[error] > 116 |           APP="$(ls -1 ${{ env.BUILD_DIR }}/*.AppImage | head -n 1)"
[error]       | ^
[error] > 117 |           chmod +x "$APP"
[error]       | ^
[error] > 118 |           export APPIMAGE_EXTRACT_AND_RUN=1
[error]       | ^
[error] > 119 |           xvfb-run -a "$APP" --smoke-test --smoke-rina-roundtrip --smoke-timeout-ms 60000 --smoke-no-sandbox || (
[error]       | ^
[error] > 120 |             echo "❌ Rina online smoke test failed"
[error]       | ^
[error] > 121 |             exit 1
[error]       | ^
[error] > 122 |           )
[error]       | ^
[error] > 123 |           echo "✅ Rina online smoke test passed"
[error]       | ^
[error] > 124 |
[error]       | ^
[error] > 125 |       - name: Compute SHA256
[error]       | ^
[error] > 126 |         run: |
[error]       | ^
[error] > 127 |           set -euo pipefail
[error]       | ^
[error] > 128 |           APP="$(ls -1 ${{ env.BUILD_DIR }}/*.AppImage | head -n 1)"
[error]       | ^
[error] > 129 |           sha256sum "$APP" | tee "${APP}.sha256"
[error]       | ^
[error] > 130 |           echo "APPIMAGE=$APP" >> $GITHUB_ENV
[error]       | ^
[error] > 131 |           echo "APPIMAGE_SHA_FILE=${APP}.sha256" >> $GITHUB_ENV
[error]       | ^
[error] > 132 |           echo "APPIMAGE_SHA=$(cut -d' ' -f1 < ${APP}.sha256)" >> $GITHUB_ENV
[error]       | ^
[error] > 133 |
[error]       | ^
[error] > 134 |       - name: Install awscli
[error]       | ^
[error] > 135 |         run: |
[error]       | ^
[error] > 136 |           python3 -m pip install --upgrade pip
[error]       | ^
[error] > 137 |           pip3 install awscli
[error]       | ^
[error] > 138 |
[error]       | ^
[error] > 139 |       - name: Upload to Cloudflare R2 (S3 API)
[error]       | ^
[error] > 140 |         env:
[error]       | ^
[error] > 141 |           AWS_ACCESS_KEY_ID: ${{ secrets.R2_ACCESS_KEY_ID }}
[error]       | ^
[error] > 142 |           AWS_SECRET_ACCESS_KEY: ${{ secrets.R2_SECRET_ACCESS_KEY }}
[error]       | ^
[error] > 143 |           AWS_DEFAULT_REGION: auto
[error]       | ^
[error] > 144 |           R2_ACCOUNT_ID: ${{ secrets.R2_ACCOUNT_ID }}
[error]       | ^
[error] > 145 |           R2_BUCKET: ${{ secrets.R2_BUCKET }}
[error]       | ^
[error] > 146 |           R2_PUBLIC_BASE_URL: ${{ secrets.R2_PUBLIC_BASE_URL }}
[error]       | ^
[error] > 147 |         run: |
[error]       | ^
[error] > 148 |           set -euo pipefail
[error]       | ^
[error] > 149 |           VERSION="${GITHUB_REF_NAME#v}" # tag v1.0.2 -> 1.0.2
[error]       | ^
[error] > 150 |           KEY_PREFIX="terminal-pro/v${VERSION}"
[error]       | ^
[error] > 151 |
[error]       | ^
[error] > 152 |           ENDPOINT="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
[error]       | ^
[error] > 153 |
[error]       | ^
[error] > 154 |           aws --endpoint-url "$ENDPOINT" s3 cp "$APPIMAGE" "s3://${R2_BUCKET}/${KEY_PREFIX}/$(basename "$APPIMAGE")"
[error]       | ^
[error] > 155 |           aws --endpoint-url "$ENDPOINT" s3 cp "$APPIMAGE_SHA_FILE" "s3://${R2_BUCKET}/${KEY_PREFIX}/$(basename "$APPIMAGE").sha256"
[error]       | ^
[error] > 156 |
[error]       | ^
[error] > 157 |           echo "PUBLIC_URL=${R2_PUBLIC_BASE_URL}/${KEY_PREFIX}/$(basename "$APPIMAGE")" >> $GITHUB_ENV
[error]       | ^
[error] > 158 |
[error]       | ^
[error] > 159 |       - name: Set release notes URL
[error]       | ^
[error] > 160 |         run: |
[error]       | ^
[error] > 161 |           echo "NOTES_URL=${{ github.server_url }}/${{ github.repository }}/releases/tag/${{ github.ref_name }}" >> $GITHUB_ENV
[error]       | ^
[error] > 162 |
[error]       | ^
[error] > 163 |       - name: Update latest download manifest (Admin API)
[error]       | ^
[error] > 164 |         env:
[error]       | ^
[error] > 165 |           ADMIN_API_BASE_URL: ${{ secrets.ADMIN_API_BASE_URL }}
[error]       | ^
[error] > 166 |           ADMIN_API_TOKEN: ${{ secrets.ADMIN_API_TOKEN }}
[error]       | ^
[error] > 167 |         run: |
[error]       | ^
[error] > 168 |           set -euo pipefail
[error]       | ^
[error] > 169 |           VERSION="${GITHUB_REF_NAME#v}"
[error]       | ^
[error] > 170 |
[error]       | ^
[error] > 171 |           curl -sS -X PUT "${ADMIN_API_BASE_URL}/api/admin/downloads/latest" \
[error]       | ^
[error] > 172 |             -H "Authorization: Bearer ${ADMIN_API_TOKEN}" \
[error]       | ^
[error] > 173 |             -H "Content-Type: application/json" \
[error]       | ^
[error] > 174 |             -d "$(jq -n \
[error]       | ^
[error] > 175 |               --arg version "$VERSION" \
[error]       | ^
[error] > 176 |               --arg url "$PUBLIC_URL" \
[error]       | ^
[error] > 177 |               --arg sha "$APPIMAGE_SHA" \
[error]       | ^
[error] > 178 |               --arg notes "$NOTES_URL" \
[error]       | ^
[error] > 179 |               '{
[error]       | ^
[error] > 180 |                 product: "terminal-pro",
[error]       | ^
[error] > 181 |                 version: $version,
[error]       | ^
[error] > 182 |                 linuxAppImageUrl: $url,
[error]       | ^
[error] > 183 |                 linuxAppImageSha256: $sha,
[error]       | ^
[error] > 184 |                 notesUrl: $notes
[error]       | ^
[error] > 185 |               }')"
[error]       | ^
[error] > 186 |
[error]       | ^
[error] > 187 |       - name: Create Release
[error]       | ^
[error] > 188 |         uses: softprops/action-gh-release@v1
[error]       | ^
[error] > 189 |         with:
[error]       | ^
[error] > 190 |           files: ${{ env.BUILD_DIR }}/*.AppImage
[error]       | ^
[error] > 191 |           generate_release_notes: true
[error]       | ^
[error] > 192 |           draft: false
[error]       | ^
[error] > 193 |           prerelease: false
[error]       | ^
[error] > 194 |         env:
[error]       | ^
[error] > 195 |           GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
[error]       | ^
[error] > 196 |
[error]       | ^
[error] > 197 |  security-audit:
[error]       | ^
[error] > 198 |    name: Security Audit
[error]       | ^
[error] > 199 |    runs-on: ubuntu-22.04
[error]       | ^
[error] > 200 |    needs: build-and-test
[error]       | ^
[error] > 201 |    steps:
[error]       | ^
[error] > 202 |      - name: Checkout
[error]       | ^
[error] > 203 |        uses: actions/checkout@v4
[error]       | ^
[error] > 204 |      - name: Audit dependencies
[error]       | ^
[error] > 205 |        run: npm audit --production
[error]       | ^
[error] > 206 |      - name: Check for vulnerable patterns
[error]       | ^
[error] > 207 |        run: |
[error]       | ^
[error] > 208 |          echo "Checking for common security issues..."
[error]       | ^
[error] > 209 |          # Check for eval() usage
[error]       | ^
[error] > 210 |          if grep -r "eval(" src/ --include="*.ts" --include="*.js" | grep -v "node_modules"; then
[error]       | ^
[error] > 211 |            echo "⚠️  Found eval() usage"
[error]       | ^
[error] > 212 |          fi
[error]       | ^
[error] > 213 |          # Check for dangerous regex
[error]       | ^
[error] > 214 |          if grep -r "new RegExp" src/ --include="*.ts" --include="*.js" | grep -v "node_modules"; then
[error]       | ^
[error] > 215 |            echo "ℹ️  Found RegExp usage - review for ReDoS"
[error]       | ^
[error] > 216 |          fi
[error]       | ^
[error] > 217 |          echo "✅ Security audit completed"
[error]       | ^
[error] > 218 |
[error]       | ^
[error] src/renderer/styles/license-ui.css: SyntaxError: CssSyntaxError: Missed semicolon (521:17)
[error]   519 |     .license-dialog-content {
[error]   520 |         top: 40px;
[error] > 521 |         left: 20: 20px;
[error]       |                 ^
[error]   522 |         transform: none;
[error]   523 |         widthpx;
[error]   524 |         right: auto;
```

## Markdownlint

Command: `npx markdownlint "**/*.md"`
Exit: 1

STDOUT:
```

```

STDERR:
```
API_ERROR_FIX_GUIDE.md:12:81 MD013/line-length Line length [Expected: 80; Actual: 146]
API_ERROR_FIX_GUIDE.md:16:81 MD013/line-length Line length [Expected: 80; Actual: 93]
API_ERROR_FIX_GUIDE.md:82:1 MD029/ol-prefix Ordered list item prefix [Expected: 1; Actual: 2; Style: 1/1/1]
API_ERROR_FIX_GUIDE.md:107 MD040/fenced-code-language Fenced code blocks should have a language specified [Context: "```"]
API_ERROR_FIX_GUIDE.md:142:81 MD013/line-length Line length [Expected: 80; Actual: 161]
API_ERROR_FIX_GUIDE.md:160:81 MD013/line-length Line length [Expected: 80; Actual: 91]
APPIMAGE_OPTIMIZATION_REPORT.md:5:81 MD013/line-length Line length [Expected: 80; Actual: 180]
APPIMAGE_OPTIMIZATION_REPORT.md:98:81 MD013/line-length Line length [Expected: 80; Actual: 118]
APPIMAGE_OPTIMIZATION_REPORT.md:99:81 MD013/line-length Line length [Expected: 80; Actual: 292]
APPIMAGE_OPTIMIZATION_REPORT.md:108:81 MD013/line-length Line length [Expected: 80; Actual: 93]
APPIMAGE_OPTIMIZATION_REPORT.md:169:81 MD013/line-length Line length [Expected: 80; Actual: 165]
ARCHITECTURE.md:5:81 MD013/line-length Line length [Expected: 80; Actual: 264]
ARCHITECTURE.md:31 MD040/fenced-code-language Fenced code blocks should have a language specified [Context: "```"]
ARCHITECTURE.md:82 MD040/fenced-code-language Fenced code blocks should have a language specified [Context: "```"]
AUDIT_REPORT.md:34 MD040/fenced-code-language Fenced code blocks should have a language specified [Context: "```"]
AUDIT_REPORT.md:41 MD040/fenced-code-language Fenced code blocks should have a language specified [Context: "```"]
AUDIT_REPORT.md:45:81 MD013/line-length Line length [Expected: 80; Actual: 119]
AUDIT_REPORT.md:129:81 MD013/line-length Line length [Expected: 80; Actual: 120]
AUDIT_REPORT.md:147:81 MD013/line-length Line length [Expected: 80; Actual: 84]
AUDIT_REPORT.md:171:81 MD013/line-length Line length [Expected: 80; Actual: 84]
AUDIT_REPORT.md:195:81 MD013/line-length Line length [Expected: 80; Actual: 84]
AUDIT_REPORT.md:201:81 MD013/line-length Line length [Expected: 80; Actual: 134]
AUDIT_REPORT.md:219:81 MD013/line-length Line length [Expected: 80; Actual: 84]
AUDIT_REPORT.md:225:81 MD013/line-length Line length [Expected: 80; Actual: 145]
AUDIT_REPORT.md:243:81 MD013/line-length Line length [Expected: 80; Actual: 84]
AUDIT_REPORT.md:249:81 MD013/line-length Line length [Expected: 80; Actual: 127]
AUDIT_REPORT.md:263:81 MD013/line-length Line length [Expected: 80; Actual: 91]
AUDIT_REPORT.md:267:81 MD013/line-length Line length [Expected: 80; Actual: 83]
AUDIT_REPORT.md:275:81 MD013/line-length Line length [Expected: 80; Actual: 84]
AUDIT_REPORT.md:281:81 MD013/line-length Line length [Expected: 80; Actual: 129]
AUDIT_REPORT.md:299:81 MD013/line-length Line length [Expected: 80; Actual: 84]
AUDIT_REPORT.md:307:81 MD013/line-length Line length [Expected: 80; Actual: 93]
AUDIT_REPORT.md:327:81 MD013/line-length Line length [Expected: 80; Actual: 84]
AUDIT_REPORT.md:351:81 MD013/line-length Line length [Expected: 80; Actual: 132]
AUDIT_REPORT.md:353:81 MD013/line-length Line length [Expected: 80; Actual: 148]
AUDIT_REPORT.md:357:81 MD013/line-length Line length [Expected: 80; Actual: 118]
AUDIT_REPORT.md:365:81 MD013/line-length Line length [Expected: 80; Actual: 143]
AUDIT_REPORT.md:385:81 MD013/line-length Line length [Expected: 80; Actual: 94]
AUDIT_REPORT.md:463:81 MD013/line-length Line length [Expected: 80; Actual: 113]
AUDIT_REPORT.md:471:81 MD013/line-length Line length [Expected: 80; Actual: 118]
AUDIT_REPORT.md:579:81 MD013/line-length Line length [Expected: 80; Actual: 98]
AUDIT_REPORT.md:620 MD040/fenced-code-language Fenced code blocks should have a language specified [Context: "```"]
AUDIT_REPORT.md:626 MD040/fenced-code-language Fenced code blocks should have a language specified [Context: "````"]
AUDIT_REPORT.md:627:81 MD013/line-length Line length [Expected: 80; Actual: 162]
AUDIT_REPORT.md:628:81 MD013/line-length Line length [Expected: 80; Actual: 119]
AUDIT_REPORT.md:629:81 MD013/line-length Line length [Expected: 80; Actual: 86]
AUDIT_REPORT.md:630:81 MD013/line-length Line length [Expected: 80; Actual: 158]
AUDIT_REPORT.md:631:81 MD013/line-length Line length [Expected: 80; Actual: 85]
AUDIT_REPORT.md:632:81 MD013/line-length Line length [Expected: 80; Actual: 140]
AUDIT_REPORT.md:633:81 MD013/line-length Line length [Expected: 80; Actual: 172]
AUDIT_REPORT.md:634:81 MD013/line-length Line length [Expected: 80; Actual: 162]
AUDIT_REPORT.md:635:81 MD013/line-length Line length [Expected: 80; Actual: 140]
AUDIT_REPORT.md:636:81 MD013/line-length Line length [Expected: 80; Actual: 161]
AUDIT_REPORT.md:637:81 MD013/line-length Line length [Expected: 80; Actual: 140]
AUDIT_REPORT.md:638:81 MD013/line-length Line length [Expected: 80; Actual: 194]
AUDIT_REPORT.md:639:81 MD013/line-length Line length [Expected: 80; Actual: 128]
AUDIT_REPORT.md:640:81 MD013/line-length Line length [Expected: 80; Actual: 187]
AUDIT_REPORT.md:641:81 MD013/line-length Line length [Expected: 80; Actual: 128]
AUDIT_REPORT.md:642:81 MD013/line-length Line length [Expected: 80; Actual: 177]
AUDIT_REPORT.md:643:81 MD013/line-length Line length [Expected: 80; Actual: 135]
AUDIT_REPORT.md:644:81 MD013/line-length Line length [Expected: 80; Actual: 134]
AUDIT_REPORT.md:645:81 MD013/line-length Line length [Expected: 80; Actual: 107]
AUDIT_REPORT.md:646:81 MD013/line-length Line length [Expected: 80; Actual: 140]
AUDIT_REPORT.md:647:81 MD013/line-length Line length [Expected: 80; Actual: 134]
AUDIT_REPORT.md:648:81 MD013/line-length Line length [Expected: 80; Actual: 161]
AUDIT_REPORT.md:649:81 MD013/line-length Line length [Expected: 80; Actual: 140]
AUDIT_REPORT.md:650:81 MD013/line-length Line length [Expected: 80; Actual: 178]
AUDIT_REPORT.md:651:81 MD013/line-length Line length [Expected: 80; Actual: 124]
AUDIT_REPORT.md:652:81 MD013/line-length Line length [Expected: 80; Actual: 121]
AUDIT_REPORT.md:653:81 MD013/line-length Line length [Expected: 80; Actual: 177]
AUDIT_REPORT.md:654:81 MD013/line-length Line length [Expected: 80; Actual: 128]
AUDIT_REPORT.md:655:81 MD013/line-length Line length [Expected: 80; Actual: 87]
AUDIT_REPORT.md:656:81 MD013/line-length Line length [Expected: 80; Actual: 86]
AUDIT_REPORT.md:657:81 MD013/line-length Line length [Expected: 80; Actual: 94]
AUDIT_REPORT.md:658:81 MD013/line-length Line length [Expected: 80; Actual: 96]
AUDIT_REPORT.md:659:81 MD013/line-length Line length [Expected: 80; Actual: 96]
AUDIT_REPORT.md:660:81 MD013/line-length Line length [Expected: 80; Actual: 95]
AUDIT_REPORT.md:661:81 MD013/line-length Line length [Expected: 80; Actual: 96]
AUDIT_REPORT.md:663:81 MD013/line-length Line length [Expected: 80; Actual: 114]
AUDIT_REPORT.md:664:81 MD013/line-length Line length [Expected: 80; Actual: 114]
AUDIT_REPORT.md:670:81 MD013/line-length Line length [Expected: 80; Actual: 125]
AUDIT_REPORT.md:671:81 MD013/line-length Line length [Expected: 80; Actual: 90]
AUDIT_REPORT.md:672:81 MD013/line-length Line length [Expected: 80; Actual: 126]
AUDIT_REPORT.md:673:81 MD013/line-length Line length [Expected: 80; Actual: 126]
AUDIT_REPORT.md:674:81 MD013/line-length Line length [Expected: 80; Actual: 126]
AUDIT_REPORT.md:675:81 MD013/line-length Line length [Expected: 80; Actual: 91]
AUDIT_REPORT.md:676:81 MD013/line-length Line length [Expected: 80; Actual: 88]
AUDIT_REPORT.md:677:81 MD013/line-length Line length [Expected: 80; Actual: 90]
AUDIT_REPORT.md:678:81 MD013/line-length Line length [Expected: 80; Actual: 163]
AUDIT_REPORT.md:679:81 MD013/line-length Line length [Expected: 80; Actual: 93]
AUDIT_REPORT.md:680:81 MD013/line-length Line length [Expected: 80; Actual: 176]
AUDIT_REPORT.md:681:81 MD013/line-length Line length [Expected: 80; Actual: 147]
AUDIT_REPORT.md:683:81 MD013/line-length Line length [Expected: 80; Actual: 180]
AUDIT_REPORT.md:684:81 MD013/line-length Line length [Expected: 80; Actual: 136]
AUDIT_REPORT.md:685:81 MD013/line-length Line length [Expected: 80; Actual: 183]
AUDIT_REPORT.md:686:81 MD013/line-length Line length [Expected: 80; Actual: 132]
AUDIT_REPORT.md:687:81 MD013/line-length Line length [Expected: 80; Actual: 129]
AUDIT_REPORT.md:688:81 MD013/line-length Line length [Expected: 80; Actual: 183]
AUDIT_REPORT.md:689:81 MD013/line-length Line length [Expected: 80; Actual: 145]
AUDIT_REPORT.md:690:81 MD013/line-length Line length [Expected: 80; Actual: 182]
AUDIT_REPORT.md:691:81 MD013/line-length Line length [Expected: 80; Actual: 142]
AUDIT_REPORT.md:692:81 MD013/line-length Line length [Expected: 80; Actual: 177]
AUDIT_REPORT.md:693:81 MD013/line-length Line length [Expected: 80; Actual: 145]
AUDIT_REPORT.md:694:81 MD013/line-length Line length [Expected: 80; Actual: 175]
AUDIT_REPORT.md:695:81 MD013/line-length Line length [Expected: 80; Actual: 136]
AUDIT_REPORT.md:696:81 MD013/line-length Line length [Expected: 80; Actual: 174]
AUDIT_REPORT.md:697:81 MD013/line-length Line length [Expected: 80; Actual: 149]
AUDIT_REPORT.md:698:81 MD013/line-length Line length [Expected: 80; Actual: 170]
AUDIT_REPORT.md:699:81 MD013/line-length Line length [Expected: 80; Actual: 138]
AUDIT_REPORT.md:700:81 MD013/line-length Line length [Expected: 80; Actual: 181]
AUDIT_REPORT.md:701:81 MD013/line-length Line length [Expected: 80; Actual: 143]
AUDIT_REPORT.md:702:81 MD013/line-length Line length [Expected: 80; Actual: 178]
AUDIT_REPORT.md:703:81 MD013/line-length Line length [Expected: 80; Actual: 141]
AUDIT_REPORT.md:704:81 MD013/line-length Line length [Expected: 80; Actual: 179]
AUDIT_REPORT.md:705:81 MD013/line-length Line length [Expected: 80; Actual: 137]
AUDIT_REPORT.md:706:81 MD013/line-length Line length [Expected: 80; Actual: 175]
AUDIT_REPORT.md:707:81 MD013/line-length Line length [Expected: 80; Actual: 137]
AUDIT_REPORT.md:708:81 MD013/line-length Line length [Expected: 80; Actual: 142]
AUDIT_REPORT.md:709:81 MD013/line-length Line length [Expected: 80; Actual: 177]
AUDIT_REPORT.md:710:81 MD013/line-length Line length [Expected: 80; Actual: 137]
AUDIT_REPORT.md:711:81 MD013/line-length Line length [Expected: 80; Actual: 172]
AUDIT_REPORT.md:712:81 MD013/line-length Line length [Expected: 80; Actual: 149]
AUDIT_REPORT.md:713:81 MD013/line-length Line length [Expected: 80; Actual: 182]
AUDIT_REPORT.md:714:81 MD013/line-length Line length [Expected: 80; Actual: 143]
AUDIT_REPORT.md:715:81 MD013/line-length Line length [Expected: 80; Actual: 174]
AUDIT_REPORT.md:716:81 MD013/line-length Line length [Expected: 80; Actual: 137]
AUDIT_REPORT.md:717:81 MD013/line-length Line length [Expected: 80; Actual: 180]
AUDIT_REPORT.md:718:81 MD013/line-length Line length [Expected: 80; Actual: 137]
AUDIT_REPORT.md:719:81 MD013/line-length Line length [Expected: 80; Actual: 182]
AUDIT_REPORT.md:720:81 MD013/line-length Line length [Expected: 80; Actual: 149]
AUDIT_REPORT.md:721:81 MD013/line-length Line length [Expected: 80; Actual: 179]
AUDIT_REPORT.md:722:81 MD013/line-length Line length [Expected: 80; Actual: 149]
AUDIT_REPORT.md:723:81 MD013/line-length Line length [Expected: 80; Actual: 184]
AUDIT_REPORT.md:724:81 MD013/line-length Line length [Expected: 80; Actual: 149]
AUDIT_REPORT.md:725:81 MD013/line-length Line length [Expected: 80; Actual: 177]
AUDIT_REPORT.md:726:81 MD013/line-length Line length [Expected: 80; Actual: 149]
AUDIT_REPORT.md:727:81 MD013/line-length Line length [Expected: 80; Actual: 171]
AUDIT_REPORT.md:728:81 MD013/line-length Line length [Expected: 80; Actual: 149]
AUDIT_REPORT.md:729:81 MD013/line-length Line length [Expected: 80; Actual: 173]
AUDIT_REPORT.md:730:81 MD013/line-length Line length [Expected: 80; Actual: 149]
AUDIT_REPORT.md:731:81 MD013/line-length Line length [Expected: 80; Actual: 102]
AUDIT_REPORT.md:732:81 MD013/line-length Line length [Expected: 80; Actual: 137]
AUDIT_REPORT.md:733:81 MD013/line-length Line length [Expected: 80; Actual: 137]
AUDIT_REPORT.md:734:81 MD013/line-length Line length [Expected: 80; Actual: 102]
AUDIT_REPORT.md:735:81 MD013/line-length Line length [Expected: 80; Actual: 102]
AUDIT_REPORT.md:736:81 MD013/line-length Line length [Expected: 80; Actual: 102]
AUDIT_REPORT.md:737:81 MD013/line-length Line length [Expected: 80; Actual: 103]
AUDIT_REPORT.md:738:81 MD013/line-length Line length [Expected: 80; Actual: 102]
AUDIT_REPORT.md:739:81 MD013/line-length Line length [Expected: 80; Actual: 103]
AUDIT_REPORT.md:740:81 MD013/line-length Line length [Expected: 80; Actual: 102]
AUDIT_REPORT.md:741:81 MD013/line-length Line length [Expected: 80; Actual: 102]
AUDIT_REPORT.md:742:81 MD013/line-length Line length [Expected: 80; Actual: 102]
AUDIT_REPORT.md:743:81 MD013/line-length Line length [Expected: 80; Actual: 103]
AUDIT_REPORT.md:744:81 MD013/line-length Line length [Expected: 80; Actual: 103]
AUDIT_REPORT.md:745:81 MD013/line-length Line length [Expected: 80; Actual: 103]
AUDIT_REPORT.md:746:81 MD013/line-length Line length [Expected: 80; Actual: 195]
AUDIT_REPORT.md:747:81 MD013/line-length Line length [Expected: 80; Actual: 152]
AUDIT_REPORT.md:748:81 MD013/line-length Line length [Expected: 80; Actual: 208]
AUDIT_REPORT.md:749:81 MD013/line-length Line length [Expected: 80; Actual: 152]
AUDIT_REPORT.md:750:81 MD013/line-length Line length [Expected: 80; Actual: 205]
AUDIT_REPORT.md:751:81 MD013/line-length Line length [Expected: 80; Actual: 152]
AUDIT_REPORT.md:752:81 MD013/line-length Line length [Expected: 80; Actual: 194]
AUDIT_REPORT.md:753:81 MD013/line-length Line length [Expected: 80; Actual: 152]
AUDIT_REPORT.md:754:81 MD013/line-length Line length [Expected: 80; Actual: 199]
AUDIT_REPORT.md:755:81 MD013/line-length Line length [Expected: 80; Actual: 152]
AUDIT_REPORT.md:756:81 MD013/line-length Line length [Expected: 80; Actual: 196]
AUDIT_REPORT.md:757:81 MD013/line-length Line length [Expected: 80; Actual: 152]
AUDIT_REPORT.md:758:81 MD013/line-length Line length [Expected: 80; Actual: 196]
AUDIT_REPORT.md:759:81 MD013/line-length Line length [Expected: 80; Actual: 152]
AUDIT_REPORT.md:760:81 MD013/line-length Line length [Expected: 80; Actual: 195]
AUDIT_REPORT.md:761:81 MD013/line-length Line length [Expected: 80; Actual: 152]
AUDIT_REPORT.md:762:81 MD013/line-length Line length [Expected: 80; Actual: 199]
AUDIT_REPORT.md:763:81 MD013/line-length Line length [Expected: 80; Actual: 152]
AUDIT_REPORT.md:764:81 MD013/line-length Line length [Expected: 80; Actual: 198]
AUDIT_REPORT.md:765:81 MD013/line-length Line length [Expected: 80; Actual: 152]
AUDIT_REPORT.md:766:81 MD013/line-length Line length [Expected: 80; Actual: 205]
AUDIT_REPORT.md:767:81 MD013/line-length Line length [Expected: 80; Actual: 152]
AUDIT_REPORT.md:768:81 MD013/line-length Line length [Expected: 80; Actual: 203]
AUDIT_REPORT.md:769:81 MD013/line-length Line length [Expected: 80; Actual: 152]
AUDIT_REPORT.md:770:81 MD013/line-length Line length [Expected: 80; Actual: 189]
AUDIT_REPORT.md:771:81 MD013/line-length Line length [Expected: 80; Actual: 137]
AUDIT_REPORT.md:772:81 MD013/line-length Line length [Expected: 80; Actual: 134]
AUDIT_REPORT.md:773:81 MD013/line-length Line length [Expected: 80; Actual: 184]
AUDIT_REPORT.md:774:81 MD013/line-length Line length [Expected: 80; Actual: 153]
AUDIT_REPORT.md:775:81 MD013/line-length Line length [Expected: 80; Actual: 198]
AUDIT_REPORT.md:776:81 MD013/line-length Line length [Expected: 80; Actual: 153]
AUDIT_REPORT.md:777:81 MD013/line-length Line length [Expected: 80; Actual: 186]
AUDIT_REPORT.md:778:81 MD013/line-length Line length [Expected: 80; Actual: 153]
AUDIT_REPORT.md:779:81 MD013/line-length Line length [Expected: 80; Actual: 181]
AUDIT_REPORT.md:780:81 MD013/line-length Line length [Expected: 80; Actual: 153]
AUDIT_REPORT.md:781:81 MD013/line-length Line length [Expected: 80; Actual: 181]
AUDIT_REPORT.md:782:81 MD013/line-length Line length [Expected: 80; Actual: 150]
AUDIT_REPORT.md:783:81 MD013/line-length Line length [Expected: 80; Actual: 179]
AUDIT_REPORT.md:784:81 MD013/line-length Line length [Expected: 80; Actual: 153]
AUDIT_REPORT.md:785:81 MD013/line-length Line length [Expected: 80; Actual: 181]
AUDIT_REPORT.md:786:81 MD013/line-length Line length [Expected: 80; Actual: 177]
AUDIT_REPORT.md:787:81 MD013/line-length Line length [Expected: 80; Actual: 153]
AUDIT_REPORT.md:788:81 MD013/line-length Line length [Expected: 80; Actual: 99]
AUDIT_REPORT.md:789:81 MD013/line-length Line length [Expected: 80; Actual: 204]
AUDIT_REPORT.md:790:81 MD013/line-length Line length [Expected: 80; Actual: 205]
AUDIT_REPORT.md:791:81 MD013/line-length Line length [Expected: 80; Actual: 171]
AUDIT_REPORT.md:792:81 MD013/line-length Line length [Expected: 80; Actual: 188]
AUDIT_REPORT.md:793:81 MD013/line-length Line length [Expected: 80; Actual: 148]
AUDIT_REPORT.md:794:81 MD013/line-length Line length [Expected: 80; Actual: 199]
AUDIT_REPORT.md:795:81 MD013/line-length Line length [Expected: 80; Actual: 162]
AUDIT_REPORT.md:796:81 MD013/line-length Line length [Expected: 80; Actual: 194]
AUDIT_REPORT.md:797:81 MD013/line-length Line length [Expected: 80; Actual: 162]
AUDIT_REPORT.md:798:81 MD013/line-length Line length [Expected: 80; Actual: 185]
AUDIT_REPORT.md:799:81 MD013/line-length Line length [Expected: 80; Actual: 158]
AUDIT_REPORT.md:800:81 MD013/line-length Line length [Expected: 80; Actual: 108]
AUDIT_REPORT.md:801:81 MD013/line-length Line length [Expected: 80; Actual: 196]
AUDIT_REPORT.md:802:81 MD013/line-length Line length [Expected: 80; Actual: 162]
AUDIT_REPORT.md:803:81 MD013/line-length Line length [Expected: 80; Actual: 130]
AUDIT_REPORT.md:804:81 MD013/line-length Line length [Expected: 80; Actual: 193]
AUDIT_REPORT.md:805:81 MD013/line-length Line length [Expected: 80; Actual: 162]
AUDIT_REPORT.md:806:81 MD013/line-length Line length [Expected: 80; Actual: 197]
AUDIT_REPORT.md:807:81 MD013/line-length Line length [Expected: 80; Actual: 163]
AUDIT_REPORT.md:808:81 MD013/line-length Line length [Expected: 80; Actual: 194]
AUDIT_REPORT.md:809:81 MD013/line-length Line length [Expected: 80; Actual: 152]
AUDIT_REPORT.md:810:81 MD013/line-length Line length [Expected: 80; Actual: 194]
AUDIT_REPORT.md:811:81 MD013/line-length Line length [Expected: 80; Actual: 160]
AUDIT_REPORT.md:812:81 MD013/line-length Line length [Expected: 80; Actual: 190]
AUDIT_REPORT.md:813:81 MD013/line-length Line length [Expected: 80; Actual: 154]
AUDIT_REPORT.md:814:81 MD013/line-length Line length [Expected: 80; Actual: 190]
AUDIT_REPORT.md:815:81 MD013/line-length Line length [Expected: 80; Actual: 156]
AUDIT_REPORT.md:816:81 MD013/line-length Line length [Expected: 80; Actual: 191]
AUDIT_REPORT.md:817:81 MD013/line-length Line length [Expected: 80; Actual: 159]
AUDIT_REPORT.md:818:81 MD013/line-length Line length [Expected: 80; Actual: 189]
AUDIT_REPORT.md:819:81 MD013/line-length Line length [Expected: 80; Actual: 151]
AUDIT_REPORT.md:820:81 MD013/line-length Line length [Expected: 80; Actual: 131]
AUDIT_REPORT.md:821:81 MD013/line-length Line length [Expected: 80; Actual: 191]
AUDIT_REPORT.md:822:81 MD013/line-length Line length [Expected: 80; Actual: 153]
AUDIT_REPORT.md:823:81 MD013/line-length Line length [Expected: 80; Actual: 195]
AUDIT_REPORT.md:824:81 MD013/line-length Line length [Expected: 80; Actual: 158]
AUDIT_REPORT.md:825:81 MD013/line-length Line length [Expected: 80; Actual: 191]
AUDIT_REPORT.md:826:81 MD013/line-length Line length [Expected: 80; Actual: 155]
AUDIT_REPORT.md:827:81 MD013/line-length Line length [Expected: 80; Actual: 192]
AUDIT_REPORT.md:828:81 MD013/line-length Line length [Expected: 80; Actual: 159]
AUDIT_REPORT.md:829:81 MD013/line-length Line length [Expected: 80; Actual: 122]
AUDIT_REPORT.md:830:81 MD013/line-length Line length [Expected: 80; Actual: 190]
AUDIT_REPORT.md:831:81 MD013/line-length Line length [Expected: 80; Actual: 163]
AUDIT_REPORT.md:832:81 MD013/line-length Line length [Expected: 80; Actual: 192]
AUDIT_REPORT.md:833:81 MD013/line-length Line length [Expected: 80; Actual: 163]
AUDIT_REPORT.md:834:81 MD013/line-length Line length [Expected: 80; Actual: 192]
AUDIT_REPORT.md:835:81 MD013/line-length Line length [Expected: 80; Actual: 160]
AUDIT_REPORT.md:836:81 MD013/line-length Line length [Expected: 80; Actual: 193]
AUDIT_REPORT.md:837:81 MD013/line-length Line length [Expected: 80; Actual: 156]
AUDIT_REPORT.md:838:81 MD013/line-length Line length [Expected: 80; Actual: 188]
AUDIT_REPORT.md:839:81 MD013/line-length Line length [Expected: 80; Actual: 156]
AUDIT_REPORT.md:840:81 MD013/line-length Line length [Expected: 80; Actual: 185]
AUDIT_REPORT.md:841:81 MD013/line-length Line length [Expected: 80; Actual: 191]
AUDIT_REPORT.md:842:81 MD013/line-length Line length [Expected: 80; Actual: 163]
AUDIT_REPORT.md:843:81 MD013/line-length Line length [Expected: 80; Actual: 122]
AUDIT_REPORT.md:844:81 MD013/line-length Line length [Expected: 80; Actual: 189]
AUDIT_REPORT.md:845:81 MD013/line-length Line length [Expected: 80; Actual: 163]
AUDIT_REPORT.md:846:81 MD013/line-length Line length [Expected: 80; Actual: 191]
AUDIT_REPORT.md:847:81 MD013/line-length Line length [Expected: 80; Actual: 163]
AUDIT_REPORT.md:848:81 MD013/line-length Line length [Expected: 80; Actual: 109]
AUDIT_REPORT.md:849:81 MD013/line-length Line length [Expected: 80; Actual: 85]
AUDIT_REPORT.md:850:81 MD013/line-length Line length [Expected: 80; Actual: 103]
AUDIT_REPORT.md:851:81 MD013/line-length Line length [Expected: 80; Actual: 105]
AUDIT_REPORT.md:852:81 MD013/line-length Line length [Expected: 80; Actual: 90]
AUDIT_REPORT.md:853:81 MD013/line-length Line length [Expected: 80; Actual: 90]
AUDIT_REPORT.md:854:81 MD013/line-length Line length [Expected: 80; Actual: 90]
AUDIT_REPORT.md:855:81 MD013/line-length Line length [Expected: 80; Actual: 90]
AUDIT_REPORT.md:856:81 MD013/line-length Line length [Expected: 80; Actual: 92]
AUDIT_REPORT.md:857:81 MD013/line-length Line length [Expected: 80; Actual: 92]
AUDIT_REPORT.md:858:81 MD013/line-length Line length [Expected: 80; Actual: 91]
AUDIT_REPORT.md:859:81 MD013/line-length Line length [Expected: 80; Actual: 100]
AUDIT_REPORT.md:860:81 MD013/line-length Line length [Expected: 80; Actual: 136]
AUDIT_REPORT.md:861:81 MD013/line-length Line length [Expected: 80; Actual: 136]
AUDIT_REPORT.md:862:81 MD013/line-length Line length [Expected: 80; Actual: 101]
AUDIT_REPORT.md:863:81 MD013/line-length Line length [Expected: 80; Actual: 102]
AUDIT_REPORT.md:864:81 MD013/line-length Line length [Expected: 80; Actual: 101]
AUDIT_REPORT.md:865:81 MD013/line-length Line length [Expected: 80; Actual: 102]
AUDIT_REPORT.md:866:81 MD013/line-length Line length [Expected: 80; Actual: 102]
AUDIT_REPORT.md:867:81 MD013/line-length Line length [Expected: 80; Actual: 102]
AUDIT_REPORT.md:868:81 MD013/line-length Line length [Expected: 80; Actual: 187]
AUDIT_REPORT.md:869:81 MD013/line-length Line length [Expected: 80; Actual: 137]
AUDIT_REPORT.md:870:81 MD013/line-length Line length [Expected: 80; Actual: 181]
AUDIT_REPORT.md:871:81 MD013/line-length Line length [Expected: 80; Actual: 138]
AUDIT_REPORT.md:872:81 MD013/line-length Line length [Expected: 80; Actual: 132]
AUDIT_REPORT.md:873:81 MD013/line-length Line length [Expected: 80; Actual: 122]
AUDIT_REPORT.md:874:81 MD013/line-length Line length [Expected: 80; Actual: 132]
AUDIT_REPORT.md:875:81 MD013/line-length Line length [Expected: 80; Actual: 122]
AUDIT_REPORT.md:876:81 MD013/line-length Line length [Expected: 80; Actual: 181]
AUDIT_REPORT.md:877:81 MD013/line-length Line length [Expected: 80; Actual: 138]
AUDIT_REPORT.md:878:81 MD013/line-length Line length [Expected: 80; Actual: 138]
AUDIT_REPORT.md:879:81 MD013/line-length Line length [Expected: 80; Actual: 174]
AUDIT_REPORT.md:880:81 MD013/line-length Line length [Expected: 80; Actual: 138]
AUDIT_REPORT.md:881:81 MD013/line-length Line length [Expected: 80; Actual: 163]
AUDIT_REPORT.md:882:81 MD013/line-length Line length [Expected: 80; Actual: 134]
AUDIT_REPORT.md:883:81 MD013/line-length Line length [Expected: 80; Actual: 164]
AUDIT_REPORT.md:884:81 MD013/line-length Line length [Expected: 80; Actual: 133]
AUDIT_REPORT.md:886:81 MD013/line-length Line length [Expected: 80; Actual: 145]
AUDIT_REPORT.md:887:81 MD013/line-length Line length [Expected: 80; Actual: 146]
AUDIT_REPORT.md:888:81 MD013/line-length Line length [Expected: 80; Actual: 134]
AUDIT_REPORT.md:889:81 MD013/line-length Line length [Expected: 80; Actual: 134]
AUDIT_REPORT.md:890:81 MD013/line-length Line length [Expected: 80; Actual: 91]
AUDIT_REPORT.md:891:81 MD013/line-length Line length [Expected: 80; Actual: 91]
AUDIT_REPORT.md:892:81 MD013/line-length Line length [Expected: 80; Actual: 140]
AUDIT_REPORT.md:893:81 MD013/line-length Line length [Expected: 80; Actual: 134]
AUDIT_REPORT.md:894:81 MD013/line-length Line length [Expected: 80; Actual: 146]
AUDIT_REPORT.md:895:81 MD013/line-length Line length [Expected: 80; Actual: 136]
AUDIT_REPORT.md:897:81 MD013/line-length Line length [Expected: 80; Actual: 136]
AUDIT_REPORT.md:898:81 MD013/line-length Line length [Expected: 80; Actual: 136]
AUDIT_REPORT.md:899:81 MD013/line-length Line length [Expected: 80; Actual: 134]
AUDIT_REPORT.md:900:81 MD013/line-length Line length [Expected: 80; Actual: 135]
AUDIT_REPORT.md:901:81 MD013/line-length Line length [Expected: 80; Actual: 147]
AUDIT_REPORT.md:902:81 MD013/line-length Line length [Expected: 80; Actual: 175]
AUDIT_REPORT.md:903:81 MD013/line-length Line length [Expected: 80; Actual: 147]
AUDIT_REPORT.md:904:81 MD013/line-length Line length [Expected: 80; Actual: 175]
AUDIT_REPORT.md:905:81 MD013/line-length Line length [Expected: 80; Actual: 147]
AUDIT_REPORT.md:906:81 MD013/line-length Line length [Expected: 80; Actual: 175]
AUDIT_REPORT.md:907:81 MD013/line-length Line length [Expected: 80; Actual: 135]
AUDIT_REPORT.md:908:81 MD013/line-length Line length [Expected: 80; Actual: 168]
AUDIT_REPORT.md:909:81 MD013/line-length Line length [Expected: 80; Actual: 147]
AUDIT_REPORT.md:910:81 MD013/line-length Line length [Expected: 80; Actual: 88]
AUDIT_REPORT.md:911:81 MD013/line-length Line length [Expected: 80; Actual: 88]
AUDIT_REPORT.md:912:81 MD013/line-length Line length [Expected: 80; Actual: 88]
AUDIT_REPORT.md:913:81 MD013/line-length Line length [Expected: 80; Actual: 88]
AUDIT_REPORT.md:914:81 MD013/line-length Line length [Expected: 80; Actual: 90]
AUDIT_REPORT.md:915:81 MD013/line-length Line length [Expected: 80; Actual: 125]
AUDIT_REPORT.md:916:81 MD013/line-length Line length [Expected: 80; Actual: 90]
AUDIT_REPORT.md:917:81 MD013/line-length Line length [Expected: 80; Actual: 90]
AUDIT_REPORT.md:918:81 MD013/line-length Line length [Expected: 80; Actual: 91]
AUDIT_REPORT.md:919:81 MD013/line-length Line length [Expected: 80; Actual: 127]
AUDIT_REPORT.md:920:81 MD013/line-length Line length [Expected: 80; Actual: 92]
AUDIT_REPORT.md:921:81 MD013/line-length Line length [Expected: 80; Actual: 95]
AUDIT_REPORT.md:922:81 MD013/line-length Line length [Expected: 80; Actual: 98]
AUDIT_REPORT.md:923:81 MD013/line-length Line length [Expected: 80; Actual: 122]
AUDIT_REPORT.md:924:81 MD013/line-length Line length [Expected: 80; Actual: 86]
AUDIT_REPORT.md:925:81 MD013/line-length Line length [Expected: 80; Actual: 88]
AUDIT_REPORT.md:926:81 MD013/line-length Line length [Expected: 80; Actual: 87]
AUDIT_REPORT.md:927:81 MD013/line-length Line length [Expected: 80; Actual: 87]
AUDIT_REPORT.md:928:81 MD013/line-length Line length [Expected: 80; Actual: 88]
AUDIT_REPORT.md:929:81 MD013/line-length Line length [Expected: 80; Actual: 96]
AUDIT_REPORT.md:930:81 MD013/line-length Line length [Expected: 80; Actual: 137]
AUDIT_REPORT.md:931:81 MD013/line-length Line length [Expected: 80; Actual: 98]
AUDIT_REPORT.md:932:81 MD013/line-length Line length [Expected: 80; Actual: 92]
AUDIT_REPORT.md:933:81 MD013/line-length Line length [Expected: 80; Actual: 128]
AUDIT_REPORT.md:934:81 MD013/line-length Line length [Expected: 80; Actual: 128]
AUDIT_REPORT.md:935:81 MD013/line-length Line length [Expected: 80; Actual: 128]
AUDIT_REPORT.md:936:81 MD013/line-length Line length [Expected: 80; Actual: 93]
AUDIT_REPORT.md:937:81 MD013/line-length Line length [Expected: 80; Actual: 94]
AUDIT_REPORT.md:939:81 MD013/line-length Line length [Expected: 80; Actual: 91]
AUDIT_REPORT.md:940:81 MD013/line-length Line length [Expected: 80; Actual: 127]
AUDIT_REPORT.md:941:81 MD013/line-length Line length [Expected: 80; Actual: 146]
AUDIT_REPORT.md:942:81 MD013/line-length Line length [Expected: 80; Actual: 134]
AUDIT_REPORT.md:943:81 MD013/line-length Line length [Expected: 80; Actual: 140]
AUDIT_REPORT.md:944:81 MD013/line-length Line length [Expected: 80; Actual: 134]
AUDIT_REPORT.md:945:81 MD013/line-length Line length [Expected: 80; Actual: 146]
AUDIT_REPORT.md:946:81 MD013/line-length Line length [Expected: 80; Actual: 146]
AUDIT_REPORT.md:947:81 MD013/line-length Line length [Expected: 80; Actual: 133]
AUDIT_REPORT.md:948:81 MD013/line-length Line length [Expected: 80; Actual: 147]
AUDIT_REPORT.md:949:81 MD013/line-length Line length [Expected: 80; Actual: 147]
AUDIT_REPORT.md:950:81 MD013/line-length Line length [Expected: 80; Actual: 147]
AUDIT_REPORT.md:951:81 MD013/line-length Line length [Expected: 80; Actual: 141]
AUDIT_REPORT.md:952:81 MD013/line-length Line length [Expected: 80; Actual: 143]
AUDIT_REPORT.md:953:81 MD013/line-length Line length [Expected: 80; Actual: 173]
AUDIT_REPORT.md:954:81 MD013/line-length Line length [Expected: 80; Actual: 147]
AUDIT_REPORT.md:955:81 MD013/line-length Line length [Expected: 80; Actual: 170]
AUDIT_REPORT.md:956:81 MD013/line-length Line length [Expected: 80; Actual: 147]
AUDIT_REPORT.md:957:81 MD013/line-length Line length [Expected: 80; Actual: 170]
AUDIT_REPORT.md:958:81 MD013/line-length Line length [Expected: 80; Actual: 144]
AUDIT_REPORT.md:959:81 MD013/line-length Line length [Expected: 80; Actual: 171]
AUDIT_REPORT.md:960:81 MD013/line-length Line length [Expected: 80; Actual: 147]
AUDIT_REPORT.md:961:81 MD013/line-length Line length [Expected: 80; Actual: 172]
AUDIT_REPORT.md:962:81 MD013/line-length Line length [Expected: 80; Actual: 147]
AUDIT_REPORT.md:963:81 MD013/line-length Line length [Expected: 80; Actual: 173]
AUDIT_REPORT.md:964:81 MD013/line-length Line length [Expected: 80; Actual: 147]
AUDIT_REPORT.md:965:81 MD013/line-length Line length [Expected: 80; Actual: 177]
AUDIT_REPORT.md:966:81 MD013/line-length Line length [Expected: 80; Actual: 135]
AUDIT_REPORT.md:967:81 MD013/line-length Line length [Expected: 80; Actual: 170]
AUDIT_REPORT.md:968:81 MD013/line-length Line length [Expected: 80; Actual: 135]
AUDIT_REPORT.md:969:81 MD013/line-length Line length [Expected: 80; Actual: 169]
AUDIT_REPORT.md:970:81 MD013/line-length Line length [Expected: 80; Actual: 138]
AUDIT_REPORT.md:971:81 MD013/line-length Line length [Expected: 80; Actual: 167]
AUDIT_REPORT.md:972:81 MD013/line-length Line length [Expected: 80; Actual: 137]
AUDIT_REPORT.md:973:81 MD013/line-length Line length [Expected: 80; Actual: 135]
AUDIT_REPORT.md:974:81 MD013/line-length Line length [Expected: 80; Actual: 135]
AUDIT_REPORT.md:975:81 MD013/line-length Line length [Expected: 80; Actual: 135]
AUDIT_REPORT.md:976:81 MD013/line-length Line length [Expected: 80; Actual: 135]
AUDIT_REPORT.md:977:81 MD013/line-length Line length [Expected: 80; Actual: 178]
AUDIT_REPORT.md:978:81 MD013/line-length Line length [Expected: 80; Actual: 147]
AUDIT_REPORT.md:979:81 MD013/line-length Line length [Expected: 80; Actual: 175]
AUDIT_REPORT.md:980:81 MD013/line-length Line length [Expected: 80; Actual: 147]
AUDIT_REPORT.md:981:81 MD013/line-length Line length [Expected: 80; Actual: 147]
AUDIT_REPORT.md:982:81 MD013/line-length Line length [Expected: 80; Actual: 147]
AUDIT_REPORT.md:983:81 MD013/line-length Line length [Expected: 80; Actual: 141]
AUDIT_REPORT.md:984:81 MD013/line-length Line length [Expected: 80; Actual: 147]
AUDIT_REPORT.md:986:81 MD013/line-length Line length [Expected: 80; Actual: 165]
AUDIT_REPORT.md:987:81 MD013/line-length Line length [Expected: 80; Actual: 141]
AUDIT_REPORT.md:988:81 MD013/line-length Line length [Expected: 80; Actual: 163]
AUDIT_REPORT.md:989:81 MD013/line-length Line length [Expected: 80; Actual: 141]
AUDIT_REPORT.md:990:81 MD013/line-length Line length [Expected: 80; Actual: 173]
AUDIT_REPORT.md:991:81 MD013/line-length Line length [Expected: 80; Actual: 141]
AUDIT_REPORT.md:992:81 MD013/line-length Line length [Expected: 80; Actual: 175]
AUDIT_REPORT.md:993:81 MD013/line-length Line length [Expected: 80; Actual: 141]
AUDIT_REPORT.md:994:81 MD013/line-length Line length [Expected: 80; Actual: 176]
AUDIT_REPORT.md:995:81 MD013/line-length Line length [Expected: 80; Actual: 141]
AUDIT_REPORT.md:996:81 MD013/line-length Line length [Expected: 80; Actual: 130]
AUDIT_REPORT.md:997:81 MD013/line-length Line length [Expected: 80; Actual: 147]
AUDIT_REPORT.md:998:81 MD013/line-length Line length [Expected: 80; Actual: 134]
AUDIT_REPORT.md:999:81 MD013/line-length Line length [Expected: 80; Actual: 150]
AUDIT_REPORT.md:1000:81 MD013/line-length Line length [Expected: 80; Actual: 134]
AUDIT_REPORT.md:1001:81 MD013/line-length Line length [Expected: 80; Actual: 148]
AUDIT_REPORT.md:1002:81 MD013/line-length Line length [Expected: 80; Actual: 134]
AUDIT_REPORT.md:1003:81 MD013/line-length Line length [Expected: 80; Actual: 130]
AUDIT_REPORT.md:1006:81 MD013/line-length Line length [Expected: 80; Actual: 91]
AUDIT_REPORT.md:1007:81 MD013/line-length Line length [Expected: 80; Actual: 91]
AUDIT_REPORT.md:1008:81 MD013/line-length Line length [Expected: 80; Actual: 135]
AUDIT_REPORT.md:1009:81 MD013/line-length Line length [Expected: 80; Actual: 93]
AUDIT_REPORT.md:1010:81 MD013/line-length Line length [Expected: 80; Actual: 166]
AUDIT_REPORT.md:1011:81 MD013/line-length Line length [Expected: 80; Actual: 145]
AUDIT_REPORT.md:1012:81 MD013/line-length Line length [Expected: 80; Actual: 171]
AUDIT_REPORT.md:1013:81 MD013/line-length Line length [Expected: 80; Actual: 146]
AUDIT_REPORT.md:1014:81 MD013/line-length Line length [Expected: 80; Actual: 173]
AUDIT_REPORT.md:1015:81 MD013/line-length Line length [Expected: 80; Actual: 146]
AUDIT_REPORT.md:1016:81 MD013/line-length Line length [Expected: 80; Actual: 173]
AUDIT_REPORT.md:1017:81 MD013/line-length Line length [Expected: 80; Actual: 146]
AUDIT_REPORT.md:1018:81 MD013/line-length Line length [Expected: 80; Actual: 172]
AUDIT_REPORT.md:1019:81 MD013/line-length Line length [Expected: 80; Actual: 142]
AUDIT_REPORT.md:1020:81 MD013/line-length Line length [Expected: 80; Actual: 168]
AUDIT_REPORT.md:1021:81 MD013/line-length Line length [Expected: 80; Actual: 142]
AUDIT_REPORT.md:1022:81 MD013/line-length Line length [Expected: 80; Actual: 169]
AUDIT_REPORT.md:1023:81 MD013/line-length Line length [Expected: 80; Actual: 146]
AUDIT_REPORT.md:1024:81 MD013/line-length Line length [Expected: 80; Actual: 168]
AUDIT_REPORT.md:1025:81 MD013/line-length Line length [Expected: 80; Actual: 143]
AUDIT_REPORT.md:1026:81 MD013/line-length Line length [Expected: 80; Actual: 167]
AUDIT_REPORT.md:1027:81 MD013/line-length Line length [Expected: 80; Actual: 141]
AUDIT_REPORT.md:1028:81 MD013/line-length Line length [Expected: 80; Actual: 175]
AUDIT_REPORT.md:1029:81 MD013/line-length Line length [Expected: 80; Actual: 146]
AUDIT_REPORT.md:1030:81 MD013/line-length Line length [Expected: 80; Actual: 176]
AUDIT_REPORT.md:1031:81 MD013/line-length Line length [Expected: 80; Actual: 146]
AUDIT_REPORT.md:1032:81 MD013/line-length Line length [Expected: 80; Actual: 165]
AUDIT_REPORT.md:1033:81 MD013/line-length Line length [Expected: 80; Actual: 140]
AUDIT_REPORT.md:1034:81 MD013/line-length Line length [Expected: 80; Actual: 169]
AUDIT_REPORT.md:1035:81 MD013/line-length Line length [Expected: 80; Actual: 147]
AUDIT_REPORT.md:1036:81 MD013/line-length Line length [Expected: 80; Actual: 169]
AUDIT_REPORT.md:1037:81 MD013/line-length Line length [Expected: 80; Actual: 147]
AUDIT_REPORT.md:1038:81 MD013/line-length Line length [Expected: 80; Actual: 128]
AUDIT_REPORT.md:1039:81 MD013/line-length Line length [Expected: 80; Actual: 91]
AUDIT_REPORT.md:1040:81 MD013/line-length Line length [Expected: 80; Actual: 92]
AUDIT_REPORT.md:1041:81 MD013/line-length Line length [Expected: 80; Actual: 91]
AUDIT_REPORT.md:1042:81 MD013/line-length Line length [Expected: 80; Actual: 127]
AUDIT_REPORT.md:1043:81 MD013/line-length Line length [Expected: 80; Actual: 92]
AUDIT_REPORT.md:1044:81 MD013/line-length Line length [Expected: 80; Actual: 92]
AUDIT_REPORT.md:1045:81 MD013/line-length Line length [Expected: 80; Actual: 93]
AUDIT_REPORT.md:1046:81 MD013/line-length Line length [Expected: 80; Actual: 92]
AUDIT_REPORT.md:1047:81 MD013/line-length Line length [Expected: 80; Actual: 93]
AUDIT_REPORT.md:1048:81 MD013/line-length Line length [Expected: 80; Actual: 93]
AUDIT_REPORT.md:1049:81 MD013/line-length Line length [Expected: 80; Actual: 89]
AUDIT_REPORT.md:1050:81 MD013/line-length Line length [Expected: 80; Actual: 89]
AUDIT_REPORT.md:1051:81 MD013/line-length Line length [Expected: 80; Actual: 89]
AUDIT_REPORT.md:1052:81 MD013/line-length Line length [Expected: 80; Actual: 89]
AUDIT_REPORT.md:1053:81 MD013/line-length Line length [Expected: 80; Actual: 90]
AUDIT_REPORT.md:1054:81 MD013/line-length Line length [Expected: 80; Actual: 125]
AUDIT_REPORT.md:1055:81 MD013/line-length Line length [Expected: 80; Actual: 91]
AUDIT_REPORT.md:1056:81 MD013/line-length Line length [Expected: 80; Actual: 91]
AUDIT_REPORT.md:1057:81 MD013/line-length Line length [Expected: 80; Actual: 91]
AUDIT_REPORT.md:1058:81 MD013/line-length Line length [Expected: 80; Actual: 146]
AUDIT_REPORT.md:1059:81 MD013/line-length Line length [Expected: 80; Actual: 168]
AUDIT_REPORT.md:1060:81 MD013/line-length Line length [Expected: 80; Actual: 110]
AUDIT_REPORT.md:1061:81 MD013/line-length Line length [Expected: 80; Actual: 168]
AUDIT_REPORT.md:1062:81 MD013/line-length Line length [Expected: 80; Actual: 162]
AUDIT_REPORT.md:1063:81 MD013/line-length Line length [Expected: 80; Actual: 115]
AUDIT_REPORT.md:1064:81 MD013/line-length Line length [Expected: 80; Actual: 120]
AUDIT_REPORT.md:1065:81 MD013/line-length Line length [Expected: 80; Actual: 166]
AUDIT_REPORT.md:1066:81 MD013/line-length Line length [Expected: 80; Actual: 115]
AUDIT_REPORT.md:1067:81 MD013/line-length Line length [Expected: 80; Actual: 157]
AUDIT_REPORT.md:1068:81 MD013/line-length Line length [Expected: 80; Actual: 132]
AUDIT_REPORT.md:1069:81 MD013/line-length Line length [Expected: 80; Actual: 126]
AUDIT_REPORT.md:1072:81 MD013/line-length Line length [Expected: 80; Actual: 128]
AUDIT_REPORT.md:1073:81 MD013/line-length Line length [Expected: 80; Actual: 116]
AUDIT_REPORT.md:1074:81 MD013/line-length Line length [Expected: 80; Actual: 116]
AUDIT_REPORT.md:1075:81 MD013/line-length Line length [Expected: 80; Actual: 171]
AUDIT_REPORT.md:1076:81 MD013/line-length Line length [Expected: 80; Actual: 124]
AUDIT_REPORT.md:1077:81 MD013/line-length Line length [Expected: 80; Actual: 173]
AUDIT_REPORT.md:1078:81 MD013/line-length Line length [Expected: 80; Actual: 129]
AUDIT_REPORT.md:1079:81 MD013/line-length Line length [Expected: 80; Actual: 167]
AUDIT_REPORT.md:1080:81 MD013/line-length Line length [Expected: 80; Actual: 124]
AUDIT_REPORT.md:1081:81 MD013/line-length Line length [Expected: 80; Actual: 167]
AUDIT_REPORT.md:1082:81 MD013/line-length Line length [Expected: 80; Actual: 113]
AUDIT_REPORT.md:1083:81 MD013/line-length Line length [Expected: 80; Actual: 161]
AUDIT_REPORT.md:1084:81 MD013/line-length Line length [Expected: 80; Actual: 118]
AUDIT_REPORT.md:1085:81 MD013/line-length Line length [Expected: 80; Actual: 160]
AUDIT_REPORT.md:1086:81 MD013/line-length Line length [Expected: 80; Actual: 129]
AUDIT_REPORT.md:1087:81 MD013/line-length Line length [Expected: 80; Actual: 156]
AUDIT_REPORT.md:1088:81 MD013/line-length Line length [Expected: 80; Actual: 129]
AUDIT_REPORT.md:1089:81 MD013/line-length Line length [Expected: 80; Actual: 154]
AUDIT_REPORT.md:1090:81 MD013/line-length Line length [Expected: 80; Actual: 119]
AUDIT_REPORT.md:1091:81 MD013/line-length Line length [Expected: 80; Actual: 163]
AUDIT_REPORT.md:1092:81 MD013/line-length Line length [Expected: 80; Actual: 123]
AUDIT_REPORT.md:1093:81 MD013/line-length Line length [Expected: 80; Actual: 109]
AUDIT_REPORT.md:1094:81 MD013/line-length Line length [Expected: 80; Actual: 122]
AUDIT_REPORT.md:1095:81 MD013/line-length Line length [Expected: 80; Actual: 129]
AUDIT_REPORT.md:1096:81 MD013/line-length Line length [Expected: 80; Actual: 129]
AUDIT_REPORT.md:1097:81 MD013/line-length Line length [Expected: 80; Actual: 129]
AUDIT_REPORT.md:1098:81 MD013/line-length Line length [Expected: 80; Actual: 116]
AUDIT_REPORT.md:1099:81 MD013/line-length Line length [Expected: 80; Actual: 157]
AUDIT_REPORT.md:1100:81 MD013/line-length Line length [Expected: 80; Actual: 162]
AUDIT_REPORT.md:1101:81 MD013/line-length Line length [Expected: 80; Actual: 139]
AUDIT_REPORT.md:1102:81 MD013/line-length Line length [Expected: 80; Actual: 166]
AUDIT_REPORT.md:1103:81 MD013/line-length Line length [Expected: 80; Actual: 140]
AUDIT_REPORT.md:1104:81 MD013/line-length Line length [Expected: 80; Actual: 167]
AUDIT_REPORT.md:1105:81 MD013/line-length Line length [Expected: 80; Actual: 140]
AUDIT_REPORT.md:1106:81 MD013/line-length Line length [Expected: 80; Actual: 166]
AUDIT_REPORT.md:1107:81 MD013/line-length Line length [Expected: 80; Actual: 140]
AUDIT_REPORT.md:1108:81 MD013/line-length Line length [Expected: 80; Actual: 167]
AUDIT_REPORT.md:1109:81 MD013/line-length Line length [Expected: 80; Actual: 140]
AUDIT_REPORT.md:1110:81 MD013/line-length Line length [Expected: 80; Actual: 177]
AUDIT_REPORT.md:1111:81 MD013/line-length Line length [Expected: 80; Actual: 140]
AUDIT_REPORT.md:1112:81 MD013/line-length Line length [Expected: 80; Actual: 166]
AUDIT_REPORT.md:1113:81 MD013/line-length Line length [Expected: 80; Actual: 140]
AUDIT_REPORT.md:1123 MD040/fenced-code-language Fenced code blocks should have a language specified [Context: "```"]
AUDIT_REPORT.md:1126:81 MD013/line-length Line length [Expected: 80; Actual: 147]
AUDIT_REPORT.md:1127:81 MD013/line-length Line length [Expected: 80; Actual: 146]
AUDIT_REPORT.md:1128:81 MD013/line-length Line length [Expected: 80; Actual: 146]
AUDIT_REPORT.md:1131:81 MD013/line-length Line length [Expected: 80; Actual: 133]
AUDIT_REPORT.md:1140:81 MD013/line-length Line length [Expected: 80; Actual: 127]
AUDIT_REPORT.md:1141:81 MD013/line-length Line length [Expected: 80; Actual: 127]
AUDIT_REPORT.md:1142:81 MD013/line-length Line length [Expected: 80; Actual: 127]
AUDIT_REPORT.md:1265:81 MD013/line-length Line length [Expected: 80; Actual: 135]
AUDIT_REPORT.md:1266:81 MD013/line-length Line length [Expected: 80; Actual: 136]
AUDIT_REPORT.md:1288:81 MD013/line-length Line length [Expected: 80; Actual: 131]
AUDIT_REPORT.md:1291:81 MD013/line-length Line length [Expected: 80; Actual: 131]
AUDIT_REPORT.md:1292:81 MD013/line-length Line length [Expected: 80; Actual: 135]
AUDIT_REPORT.md:1293:81 MD013/line-length Line length [Expected: 80; Actual: 135]
AUDIT_REPORT.md:1294:81 MD013/line-length Line length [Expected: 80; Actual: 135]
AUDIT_REPORT.md:1295:81 MD013/line-length Line length [Expected: 80; Actual: 135]
AUDIT_REPORT.md:1296:81 MD013/line-length Line length [Expected: 80; Actual: 135]
AUDIT_REPORT.md:1323:81 MD013/line-length Line length [Expected: 80; Actual: 136]
AUDIT_REPORT.md:1324:81 MD013/line-length Line length [Expected: 80; Actual: 135]
AUDIT_REPORT.md:1325:81 MD013/line-length Line length [Expected: 80; Actual: 110]
AUDIT_REPORT.md:1332:81 MD013/line-length Line length [Expected: 80; Actual: 135]
AUDIT_REPORT.md:1339 MD040/fenced-code-language Fenced code blocks should have a language specified [Context: "```"]
AUDIT_REPORT.md:1340:81 MD013/line-length Line length [Expected: 80; Actual: 221]
AUDIT_REPORT.md:1351 MD040/fenced-code-language Fenced code blocks should have a language specified [Context: "```"]
AUDIT_REPORT.md:1357 MD040/fenced-code-language Fenced code blocks should have a language specified [Context: "```"]
BUILD_SYSTEM.md:5:81 MD013/line-length Line length [Expected: 80; Actual: 237]
BUILD_SYSTEM.md:13:81 MD013/line-length Line length [Expected: 80; Actual: 130]
BUILD_SYSTEM.md:35:81 MD013/line-length Line length [Expected: 80; Actual: 117]
BUILD_SYSTEM.md:586:81 MD013/line-length Line length [Expected: 80; Actual: 97]
BUILD_SYSTEM.md:724:81 MD013/line-length Line length [Expected: 80; Actual: 150]
CHANGELOG.md:7 MD036/no-emphasis-as-heading Emphasis used instead of a heading [Context: "Production-Grade License State..."]
COMPONENT_SPECIFICATION.md:110:81 MD013/line-length Line length [Expected: 80; Actual: 82]
COMPONENT_SPECIFICATION.md:495 MD040/fenced-code-language Fenced code blocks should have a language specified [Context: "```"]
COMPONENT_SPECIFICATION.md:503 MD040/fenced-code-language Fenced code blocks should have a language specified [Context: "```"]
COMPONENT_SPECIFICATION.md:511 MD040/fenced-code-language Fenced code blocks should have a language specified [Context: "```"]
COMPONENT_SPECIFICATION.md:592:81 MD013/line-length Line length [Expected: 80; Actual: 191]
DEPLOYMENT_INSTRUCTIONS.md:5:81 MD013/line-length Line length [Expected: 80; Actual: 92]
DEPLOYMENT_INSTRUCTIONS.md:80:81 MD013/line-length Line length [Expected: 80; Actual: 119]
docs/CDN-DISTRIBUTION-SETUP.md:5:81 MD013/line-length Line length [Expected: 80; Actual: 124]
docs/CDN-DISTRIBUTION-SETUP.md:12:17 MD034/no-bare-urls Bare URL used [Context: "https://rinawarptech.com"]
docs/CDN-DISTRIBUTION-SETUP.md:36 MD040/fenced-code-language Fenced code blocks should have a language specified [Context: "```"]
docs/CDN-DISTRIBUTION-SETUP.md:227 MD024/no-duplicate-heading Multiple headings with the same content [Context: "## Performance Optimization"]
docs/COMPREHENSIVE-DEPLOYMENT-GUIDE.md:18:81 MD013/line-length Line length [Expected: 80; Actual: 209]
docs/COMPREHENSIVE-DEPLOYMENT-GUIDE.md:22 MD040/fenced-code-language Fenced code blocks should have a language specified [Context: "```"]
docs/COMPREHENSIVE-DEPLOYMENT-GUIDE.md:71 MD040/fenced-code-language Fenced code blocks should have a language specified [Context: "```"]
docs/COMPREHENSIVE-DEPLOYMENT-GUIDE.md:186:81 MD013/line-length Line length [Expected: 80; Actual: 84]
docs/COMPREHENSIVE-DEPLOYMENT-GUIDE.md:187:81 MD013/line-length Line length [Expected: 80; Actual: 83]
docs/COMPREHENSIVE-DEPLOYMENT-GUIDE.md:190:81 MD013/line-length Line length [Expected: 80; Actual: 95]
docs/COMPREHENSIVE-DEPLOYMENT-GUIDE.md:230:81 MD013/line-length Line length [Expected: 80; Actual: 112]
docs/COMPREHENSIVE-DEPLOYMENT-GUIDE.md:270:81 MD013/line-length Line length [Expected: 80; Actual: 98]
docs/COMPREHENSIVE-DEPLOYMENT-GUIDE.md:341:81 MD013/line-length Line length [Expected: 80; Actual: 101]
docs/COMPREHENSIVE-DEPLOYMENT-GUIDE.md:391:81 MD013/line-length Line length [Expected: 80; Actual: 91]
docs/COMPREHENSIVE-DEPLOYMENT-GUIDE.md:392:81 MD013/line-length Line length [Expected: 80; Actual: 91]
docs/COMPREHENSIVE-DEPLOYMENT-GUIDE.md:417:81 MD013/line-length Line length [Expected: 80; Actual: 97]
docs/COMPREHENSIVE-DEPLOYMENT-GUIDE.md:550:81 MD013/line-length Line length [Expected: 80; Actual: 104]
docs/COMPREHENSIVE-DEPLOYMENT-GUIDE.md:756:81 MD013/line-length Line length [Expected: 80; Actual: 194]
docs/COMPREHENSIVE-DEPLOYMENT-GUIDE.md:774:81 MD013/line-length Line length [Expected: 80; Actual: 206]
docs/MACOS-BUILD-SETUP-COMPLETE.md:139 MD040/fenced-code-language Fenced code blocks should have a language specified [Context: "```"]
docs/MACOS-BUILD-SETUP-COMPLETE.md:244:81 MD013/line-length Line length [Expected: 80; Actual: 164]
docs/POST-DEPLOYMENT-VALIDATION-CHECKLIST.md:3 MD025/single-title/single-h1 Multiple top-level headings in the same document [Context: "# RinaWarp Terminal Pro - macO..."]
docs/POST-DEPLOYMENT-VALIDATION-CHECKLIST.md:65:81 MD013/line-length Line length [Expected: 80; Actual: 111]
docs/POST-DEPLOYMENT-VALIDATION-CHECKLIST.md:80:20 MD034/no-bare-urls Bare URL used [Context: "https://download.rinawarptech...."]
docs/POST-DEPLOYMENT-VALIDATION-CHECKLIST.md:220:21 MD034/no-bare-urls Bare URL used [Context: "https://download.rinawarptech...."]
docs/POST-DEPLOYMENT-VALIDATION-CHECKLIST.md:278:22 MD034/no-bare-urls Bare URL used [Context: "support@rinawarptech.com"]
docs/POST-DEPLOYMENT-VALIDATION-CHECKLIST.md:382:21 MD034/no-bare-urls Bare URL used [Context: "support@rinawarptech.com"]
docs/POST-DEPLOYMENT-VALIDATION-CHECKLIST.md:419:81 MD013/line-length Line length [Expected: 80; Actual: 165]
docs/UAT-SCENARIOS.md:498:81 MD013/line-length Line length [Expected: 80; Actual: 88]
GITHUB_ACTIONS_APPIMAGE_RELEASE_GUIDE.md:3:81 MD013/line-length Line length [Expected: 80; Actual: 146]
GITHUB_ACTIONS_APPIMAGE_RELEASE_GUIDE.md:229:81 MD013/line-length Line length [Expected: 80; Actual: 130]
GITHUB_ACTIONS_FIX_GUIDE.md:5:81 MD013/line-length Line length [Expected: 80; Actual: 144]
GITHUB_ACTIONS_FIX_GUIDE.md:9:81 MD013/line-length Line length [Expected: 80; Actual: 111]
GITHUB_ACTIONS_FIX_GUIDE.md:58:81 MD013/line-length Line length [Expected: 80; Actual: 92]
GITHUB_ACTIONS_FIX_GUIDE.md:70:81 MD013/line-length Line length [Expected: 80; Actual: 98]
GITHUB_ACTIONS_FIX_GUIDE.md:104:81 MD013/line-length Line length [Expected: 80; Actual: 103]
GITHUB_ACTIONS_FIX_GUIDE.md:139:81 MD013/line-length Line length [Expected: 80; Actual: 128]
GITHUB_ACTIONS_FIX_GUIDE.md:146:81 MD013/line-length Line length [Expected: 80; Actual: 90]
GITHUB_ACTIONS_RELEASE_SETUP_GUIDE.md:5:81 MD013/line-length Line length [Expected: 80; Actual: 162]
GITHUB_ACTIONS_RELEASE_SETUP_GUIDE.md:31 MD040/fenced-code-language Fenced code blocks should have a language specified [Context: "```"]
GITHUB_ACTIONS_RELEASE_SETUP_GUIDE.md:40 MD040/fenced-code-language Fenced code blocks should have a language specified [Context: "```"]
GITHUB_ACTIONS_RELEASE_SETUP_GUIDE.md:74:81 MD013/line-length Line length [Expected: 80; Actual: 179]
GITHUB_ACTIONS_RELEASE_SETUP_GUIDE.md:100:81 MD013/line-length Line length [Expected: 80; Actual: 106]
GITHUB_ACTIONS_RELEASE_SETUP_GUIDE.md:120:81 MD013/line-length Line length [Expected: 80; Actual: 93]
GITHUB_ACTIONS_RELEASE_SETUP_GUIDE.md:123:81 MD013/line-length Line length [Expected: 80; Actual: 117]
GITHUB_ACTIONS_RELEASE_SETUP_GUIDE.md:148:81 MD013/line-length Line length [Expected: 80; Actual: 106]
GITHUB_ACTIONS_RELEASE_SETUP_GUIDE.md:246:81 MD013/line-length Line length [Expected: 80; Actual: 175]
GO_TO_MARKET_PLAN.md:29 MD031/blanks-around-fences Fenced code blocks should be surrounded by blank lines [Context: "```powershell"]
GO_TO_MARKET_PLAN.md:34 MD031/blanks-around-fences Fenced code blocks should be surrounded by blank lines [Context: "```"]
GO_TO_MARKET_PLAN.md:36 MD031/blanks-around-fences Fenced code blocks should be surrounded by blank lines [Context: "```powershell"]
GO_TO_MARKET_PLAN.md:38 MD031/blanks-around-fences Fenced code blocks should be surrounded by blank lines [Context: "```"]
LAUNCH_POST.md:20:81 MD013/line-length Line length [Expected: 80; Actual: 137]
LIVE_SESSION_VERIFICATION.md:16 MD031/blanks-around-fences Fenced code blocks should be surrounded by blank lines [Context: "```bash"]
LIVE_SESSION_VERIFICATION.md:28:81 MD013/line-length Line length [Expected: 80; Actual: 98]
LIVE_SESSION_VERIFICATION.md:29:81 MD013/line-length Line length [Expected: 80; Actual: 96]
LIVE_SESSION_VERIFICATION.md:64:18 MD034/no-bare-urls Bare URL used [Context: "https://jwt.io/"]
PIPELINE_TESTING_GUIDE.md:3:81 MD013/line-length Line length [Expected: 80; Actual: 150]
PIPELINE_TESTING_GUIDE.md:9:81 MD013/line-length Line length [Expected: 80; Actual: 109]
PIPELINE_TESTING_GUIDE.md:10:81 MD013/line-length Line length [Expected: 80; Actual: 87]
PIPELINE_TESTING_GUIDE.md:11:81 MD013/line-length Line length [Expected: 80; Actual: 89]
PIPELINE_TESTING_GUIDE.md:111:81 MD013/line-length Line length [Expected: 80; Actual: 107]
PIPELINE_TESTING_GUIDE.md:325 MD040/fenced-code-language Fenced code blocks should have a language specified [Context: "```"]
PIPELINE_TESTING_GUIDE.md:373:81 MD013/line-length Line length [Expected: 80; Actual: 103]
PIPELINE_TESTING_SUMMARY.md:5:81 MD013/line-length Line length [Expected: 80; Actual: 167]
PIPELINE_TESTING_SUMMARY.md:13:81 MD013/line-length Line length [Expected: 80; Actual: 111]
PIPELINE_TESTING_SUMMARY.md:295 MD040/fenced-code-language Fenced code blocks should have a language specified [Context: "```"]
PIPELINE_TESTING_SUMMARY.md:343:81 MD013/line-length Line length [Expected: 80; Actual: 151]
PRODUCTION_HARDENING_CHECKLIST.md:3:81 MD013/line-length Line length [Expected: 80; Actual: 90]
PRODUCTION_HARDENING_CHECKLIST.md:221:81 MD013/line-length Line length [Expected: 80; Actual: 135]
PRODUCTION_READINESS.md:51 MD040/fenced-code-language Fenced code blocks should have a language specified [Context: "```"]
PRODUCTION_READINESS.md:80:81 MD013/line-length Line length [Expected: 80; Actual: 98]
PRODUCTION_READINESS.md:130:81 MD013/line-length Line length [Expected: 80; Actual: 120]
PRODUCTION_READINESS.md:131:81 MD013/line-length Line length [Expected: 80; Actual: 96]
PRODUCTION_READINESS.md:132:81 MD013/line-length Line length [Expected: 80; Actual: 88]
PRODUCTION_READINESS.md:144:81 MD013/line-length Line length [Expected: 80; Actual: 111]
PRODUCTION_READY_RELEASE_GUIDE.md:3:81 MD013/line-length Line length [Expected: 80; Actual: 193]
PRODUCTION_READY_RELEASE_GUIDE.md:334 MD024/no-duplicate-heading Multiple headings with the same content [Context: "### User Experience"]
PRODUCTION_READY_RELEASE_GUIDE.md:365:81 MD013/line-length Line length [Expected: 80; Actual: 166]
R2_SETUP_EXECUTION_SUMMARY.md:5:81 MD013/line-length Line length [Expected: 80; Actual: 130]
R2_SETUP_EXECUTION_SUMMARY.md:39 MD040/fenced-code-language Fenced code blocks should have a language specified [Context: "```"]
R2_SETUP_EXECUTION_SUMMARY.md:53 MD040/fenced-code-language Fenced code blocks should have a language specified [Context: "```"]
R2_SETUP_EXECUTION_SUMMARY.md:62 MD040/fenced-code-language Fenced code blocks should have a language specified [Context: "```"]
R2_SETUP_EXECUTION_SUMMARY.md:76:81 MD013/line-length Line length [Expected: 80; Actual: 103]
R2_SETUP_EXECUTION_SUMMARY.md:120:81 MD013/line-length Line length [Expected: 80; Actual: 250]
README.md:11:81 MD013/line-length Line length [Expected: 80; Actual: 141]
RELEASE_ENGINEERING_GUIDE.md:3:81 MD013/line-length Line length [Expected: 80; Actual: 185]
RELEASE_ENGINEERING_GUIDE.md:18 MD040/fenced-code-language Fenced code blocks should have a language specified [Context: "```"]
RELEASE_ENGINEERING_GUIDE.md:269 MD031/blanks-around-fences Fenced code blocks should be surrounded by blank lines [Context: "```bash"]
RELEASE_ENGINEERING_GUIDE.md:315:17 MD034/no-bare-urls Bare URL used [Context: "devops@rinawarptech.com"]
RELEASE_NOTES.md:39 MD036/no-emphasis-as-heading Emphasis used instead of a heading [Context: "Built with ❤️ by RinaWarp Tech..."]
RELEASE.md:108:81 MD013/line-length Line length [Expected: 80; Actual: 97]
RELEASE.md:174:81 MD013/line-length Line length [Expected: 80; Actual: 113]
SANITY_CHECK_VERIFICATION.md:12:81 MD013/line-length Line length [Expected: 80; Actual: 94]
SANITY_CHECK_VERIFICATION.md:13:81 MD013/line-length Line length [Expected: 80; Actual: 94]
SANITY_CHECK_VERIFICATION.md:14:81 MD013/line-length Line length [Expected: 80; Actual: 93]
SANITY_CHECK_VERIFICATION.md:15:81 MD013/line-length Line length [Expected: 80; Actual: 93]
SANITY_CHECK_VERIFICATION.md:16:81 MD013/line-length Line length [Expected: 80; Actual: 93]
SANITY_CHECK_VERIFICATION.md:94 MD036/no-emphasis-as-heading Emphasis used instead of a heading [Context: "✅ FIX SUCCESSFULLY APPLIED"]
SANITY_CHECK_VERIFICATION.md:102:81 MD013/line-length Line length [Expected: 80; Actual: 152]
scripts/release-checklist.md:128 MD040/fenced-code-language Fenced code blocks should have a language specified [Context: "```"]
SMOKE_TEST_IMPLEMENTATION.md:5:81 MD013/line-length Line length [Expected: 80; Actual: 155]
SMOKE_TEST_IMPLEMENTATION.md:13:81 MD013/line-length Line length [Expected: 80; Actual: 173]
SMOKE_TEST_IMPLEMENTATION.md:15:81 MD013/line-length Line length [Expected: 80; Actual: 95]
SMOKE_TEST_IMPLEMENTATION.md:62 MD040/fenced-code-language Fenced code blocks should have a language specified [Context: "```"]
SMOKE_TEST_IMPLEMENTATION.md:93:81 MD013/line-length Line length [Expected: 80; Actual: 103]
SMOKE_TEST_IMPLEMENTATION.md:95:81 MD013/line-length Line length [Expected: 80; Actual: 142]
SMOKE_TEST_IMPLEMENTATION.md:105:81 MD013/line-length Line length [Expected: 80; Actual: 124]
SMOKE_TEST_IMPLEMENTATION.md:127:81 MD013/line-length Line length [Expected: 80; Actual: 89]
SMOKE_TEST_IMPLEMENTATION.md:146:81 MD013/line-length Line length [Expected: 80; Actual: 243]
SMOKE_TEST_IMPLEMENTATION.md:148:81 MD013/line-length Line length [Expected: 80; Actual: 138]
STAGING_SOLUTION_REPORT.md:5:81 MD013/line-length Line length [Expected: 80; Actual: 262]
STAGING_SOLUTION_REPORT.md:22:81 MD013/line-length Line length [Expected: 80; Actual: 94]
STAGING_SOLUTION_REPORT.md:33:81 MD013/line-length Line length [Expected: 80; Actual: 98]
STAGING_SOLUTION_REPORT.md:36:81 MD013/line-length Line length [Expected: 80; Actual: 99]
STAGING_SOLUTION_REPORT.md:37:81 MD013/line-length Line length [Expected: 80; Actual: 115]
STAGING_SOLUTION_REPORT.md:69 MD040/fenced-code-language Fenced code blocks should have a language specified [Context: "```"]
STAGING_SOLUTION_REPORT.md:116:81 MD013/line-length Line length [Expected: 80; Actual: 244]
STAGING_SOLUTION_REPORT.md:159:81 MD013/line-length Line length [Expected: 80; Actual: 227]
STAGING_SOLUTION_REPORT.md:166:81 MD013/line-length Line length [Expected: 80; Actual: 142]
TECHNICAL_WRITEUP.md:5:81 MD013/line-length Line length [Expected: 80; Actual: 151]
TESTING.md:5:81 MD013/line-length Line length [Expected: 80; Actual: 93]
TESTING.md:205 MD024/no-duplicate-heading Multiple headings with the same content [Context: "### Debug Mode"]
```

## ESLint

Command: `npm run -s lint`
Exit: 1

STDOUT:
```

/home/karina/Documents/Workspace/rinawarp-business/apps/terminal-pro/desktop/src/brain/plan.ts
   3:33  error    Unexpected any. Specify a different type                                                       @typescript-eslint/no-explicit-any
  23:9   warning  'mediumRiskKeywords' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
  43:40  warning  'context' is defined but never used. Allowed unused args must match /^_/u                      @typescript-eslint/no-unused-vars

/home/karina/Documents/Workspace/rinawarp-business/apps/terminal-pro/desktop/src/brain/server.ts
  46:20  warning  'error' is defined but never used. Allowed unused caught errors must match /^_/u  @typescript-eslint/no-unused-vars

/home/karina/Documents/Workspace/rinawarp-business/apps/terminal-pro/desktop/src/brain/status.ts
  3:35  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/karina/Documents/Workspace/rinawarp-business/apps/terminal-pro/desktop/src/main/agents/agent-manager.ts
  8:25  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/karina/Documents/Workspace/rinawarp-business/apps/terminal-pro/desktop/src/main/core/security.ts
   1:10  warning  'SECURITY' is defined but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
  31:15  warning  'url' is defined but never used. Allowed unused args must match /^_/u       @typescript-eslint/no-unused-vars
  36:20  warning  'filePath' is defined but never used. Allowed unused args must match /^_/u  @typescript-eslint/no-unused-vars

/home/karina/Documents/Workspace/rinawarp-business/apps/terminal-pro/desktop/src/main/ipc-guard.ts
  11:65  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  11:75  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  12:44  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  20:61  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  21:44  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/karina/Documents/Workspace/rinawarp-business/apps/terminal-pro/desktop/src/main/ipc/agent.ts
  21:35  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  21:49  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  21:63  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  26:44  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  26:58  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  26:72  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/karina/Documents/Workspace/rinawarp-business/apps/terminal-pro/desktop/src/main/ipc/app.ts
  23:41  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  23:55  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  23:69  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  28:43  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  28:57  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  28:71  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  33:40  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  33:54  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  33:68  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  38:40  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  38:54  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  38:68  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/karina/Documents/Workspace/rinawarp-business/apps/terminal-pro/desktop/src/main/ipc/billing.ts
  23:66  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  23:80  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  47:12  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  49:14  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/karina/Documents/Workspace/rinawarp-business/apps/terminal-pro/desktop/src/main/ipc/conversation.ts
  30:42  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  30:56  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  30:70  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  35:41  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  35:55  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  35:69  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  40:43  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  40:57  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  40:71  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/karina/Documents/Workspace/rinawarp-business/apps/terminal-pro/desktop/src/main/ipc/filesystem.ts
  35:39  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  35:53  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  35:67  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  49:40  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  49:54  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  49:68  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  67:40  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  67:54  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  67:68  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  81:37  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  81:51  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  81:65  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/karina/Documents/Workspace/rinawarp-business/apps/terminal-pro/desktop/src/main/ipc/intent.ts
  21:38  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  21:52  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  21:66  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  26:44  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  26:58  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  26:72  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/karina/Documents/Workspace/rinawarp-business/apps/terminal-pro/desktop/src/main/ipc/license.ts
   29:66  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   29:80  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   52:37  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   52:71  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   75:34  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   75:48  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   75:62  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   82:38  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   82:72  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  108:38  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  108:72  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/karina/Documents/Workspace/rinawarp-business/apps/terminal-pro/desktop/src/main/ipc/terminal.ts
   45:37  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   45:51  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   45:65  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   61:36  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   61:50  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   61:64  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   72:35  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   72:49  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   72:63  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   84:42  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   84:56  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   84:70  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  102:42  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  102:56  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  102:70  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  119:43  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  119:57  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  119:71  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  125:43  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  125:57  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  125:71  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  135:31  error  A `require()` style import is forbidden   @typescript-eslint/no-require-imports
  142:31  error  A `require()` style import is forbidden   @typescript-eslint/no-require-imports

/home/karina/Documents/Workspace/rinawarp-business/apps/terminal-pro/desktop/src/main/ipc/terminalIpc.ts
   37:60  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  105:50  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  112:40  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  121:11  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/karina/Documents/Workspace/rinawarp-business/apps/terminal-pro/desktop/src/main/main.ts
   35:21  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   35:65  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   68:30  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   69:29  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   90:32  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  162:43  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/karina/Documents/Workspace/rinawarp-business/apps/terminal-pro/desktop/src/main/policy/runtimePolicy.ts
  55:13  warning  'offline' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
  96:44  error    Unexpected any. Specify a different type                                            @typescript-eslint/no-explicit-any

/home/karina/Documents/Workspace/rinawarp-business/apps/terminal-pro/desktop/src/main/rina/cloudflareWorkerClient.ts
  27:27  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  37:60  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  61:27  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  76:42  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/karina/Documents/Workspace/rinawarp-business/apps/terminal-pro/desktop/src/main/rina/installNetworkGuards.ts
   7:63  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   9:20  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   9:48  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   9:60  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  17:44  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  19:20  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  22:33  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/karina/Documents/Workspace/rinawarp-business/apps/terminal-pro/desktop/src/main/rina/networkGate.ts
  30:34  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  30:56  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/karina/Documents/Workspace/rinawarp-business/apps/terminal-pro/desktop/src/main/rina/policyRinaAdapter.ts
  7:25  warning  'assertAllowed' is defined but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars

/home/karina/Documents/Workspace/rinawarp-business/apps/terminal-pro/desktop/src/main/security/productionSecurity.ts
    5:24  warning  'webContents' is defined but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
   69:26  error    A `require()` style import is forbidden                                        @typescript-eslint/no-require-imports
   70:16  error    A `require()` style import is forbidden                                        @typescript-eslint/no-require-imports
   73:35  error    A `require()` style import is forbidden                                        @typescript-eslint/no-require-imports
  103:24  error    A `require()` style import is forbidden                                        @typescript-eslint/no-require-imports
  104:14  error    A `require()` style import is forbidden                                        @typescript-eslint/no-require-imports

/home/karina/Documents/Workspace/rinawarp-business/apps/terminal-pro/desktop/src/main/smokeTest.ts
   35:21  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   35:65  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  122:13  error  Empty block statement                     no-empty
  130:13  error  Empty block statement                     no-empty

/home/karina/Documents/Workspace/rinawarp-business/apps/terminal-pro/desktop/src/preload/ipc.ts
   32:20  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   39:21  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   41:31  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   66:32  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   94:24  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  148:45  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  157:25  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  163:17  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  187:24  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  215:27  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/karina/Documents/Workspace/rinawarp-business/apps/terminal-pro/desktop/src/renderer/components/GhostTextRenderer.ts
   7:12  error  'HTMLInputElement' is not defined     no-undef
   7:31  error  'HTMLTextAreaElement' is not defined  no-undef
   8:17  error  'HTMLElement' is not defined          no-undef
  73:29  error  'KeyboardEvent' is not defined        no-undef

/home/karina/Documents/Workspace/rinawarp-business/apps/terminal-pro/desktop/src/renderer/components/conversation/ConversationInterface.tsx
  12:30  error    Unexpected any. Specify a different type                                            @typescript-eslint/no-explicit-any
  20:3   warning  'onIntentDetected' is defined but never used. Allowed unused args must match /^_/u  @typescript-eslint/no-unused-vars
  23:33  error    'HTMLDivElement' is not defined                                                     no-undef

/home/karina/Documents/Workspace/rinawarp-business/apps/terminal-pro/desktop/src/renderer/components/conversation/IntentInput.tsx
  20:30  error  'HTMLTextAreaElement' is not defined  no-undef
  31:50  error  'HTMLTextAreaElement' is not defined  no-undef

/home/karina/Documents/Workspace/rinawarp-business/apps/terminal-pro/desktop/src/renderer/components/conversation/MessageBubble.tsx
  12:9  warning  'isSystem' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars

✖ 153 problems (142 errors, 11 warnings)
```

STDERR:
```
(node:576166) ESLintIgnoreWarning: The ".eslintignore" file is no longer supported. Switch to using the "ignores" property in "eslint.config.js": https://eslint.org/docs/latest/use/configure/migration-guide#ignoring-files
(Use `node --trace-warnings ...` to show where the warning was created)
```

## Typecheck

Command: `npm run -s typecheck:all`
Exit: 1

STDOUT:
```

```

STDERR:
```

```
