# RinaWarp Production Release Playbook

This document is the source of truth for releasing:

- Desktop app (Terminal Pro)
- Admin API Worker (Stripe + licensing + downloads manifest)
- Rina Worker (agent backend)
- Website (pricing/download/success wiring)

## 0) Golden rule: one release commit per repo, no drift

All repos should be on the same release branch (e.g. `fix/windows-r2`) and aligned.
Before releasing:

- ensure each repo is pushed (no "ahead by 1 commit" locally)
- ensure each repo CI is green on that branch

Recommended: Tag releases from the **desktop repo** commit you intend to ship.

## 1) Required infrastructure (must exist)

### Stripe

- Product/Price IDs for:
  - Starter Monthly: $29/mo
  - Creator Monthly: $69/mo
  - Pro Monthly: $99/mo
- Webhook endpoint configured to Admin API:
  - `POST /api/stripe/webhook`

### Cloudflare

- Admin API Worker:
  - `/api/stripe/create-checkout-session`
  - `/api/stripe/webhook`
  - `/api/license/activate`
  - `/api/license/validate`
  - `/api/downloads/latest.json`
  - `/api/admin/downloads/latest` (protected by ADMIN_TOKEN)
- Rina Worker:
  - `/health`
  - (optional but recommended) `/smoke` deterministic marker

### R2 (downloads)

- R2 bucket + public URL (or routed domain like `download.rinawarptech.com`)
- Object layout:
  - `terminal-pro/v{version}/RinaWarp-Terminal-Pro-{version}-x86_64.AppImage`
  - `terminal-pro/v{version}/RinaWarp-Terminal-Pro-{version}-x86_64.AppImage.sha256`

## 2) Secrets (GitHub Actions)

Set these in the **desktop repo** (and any repo that uploads artifacts):

### R2

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `R2_PUBLIC_BASE_URL` (e.g. <https://download.rinawarptech.com>)

### Admin API

- `ADMIN_API_BASE_URL` (e.g. <https://rinawarp-admin-api.workers.dev>)
- `ADMIN_API_TOKEN` (bearer token for /api/admin/\*)

### Rina online smoke (optional but recommended)

- `RINA_WORKER_BASE_URL`
- `RINA_WORKER_API_KEY`

### Stripe (Admin API Worker secrets)

Set these in Cloudflare Worker secrets (not GitHub):

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_STARTER_MONTHLY`
- `STRIPE_PRICE_CREATOR_MONTHLY`
- `STRIPE_PRICE_PRO_MONTHLY`
- `ADMIN_TOKEN`

## 3) Repo alignment procedure (do this before any release)

For each repo (backend, live-session-worker, workers, website, desktop):

```bash
git checkout fix/windows-r2
git fetch origin
git status

# If the repo is ahead (local commits not pushed):
git push origin fix/windows-r2

# If the repo is behind:
git pull --ff-only


Optional: lock release state with tags in each repo:

git tag -a "release-sync/v1.0.2" -m "Release sync v1.0.2"
git push origin "release-sync/v1.0.2"

4) Desktop app release steps (Terminal Pro)
4.1 Update version

Update version in apps/terminal-pro/desktop/package.json (and any other version file you publish)

Ensure changelog/release notes exist (GitHub release notes are OK)

4.2 Local verification (before tagging)

From desktop repo:

npm ci
npm run lint
npm test

# Linux staged AppImage build
npm run dist:linux:staged

# Smoke tests (online/offline if supported)
./dist-terminal-pro/*.AppImage --smoke-test --smoke-ipc --smoke-rina-roundtrip
./dist-terminal-pro/*.AppImage --smoke-test --smoke-ipc --smoke-rina-roundtrip --smoke-offline

4.3 Tag + push
git tag -a v1.0.2 -m "Terminal Pro v1.0.2"
git push origin v1.0.2


CI should now:

build staged AppImage

compute sha256

upload to R2

set Admin API latest manifest

publish GitHub Release assets (if configured)

5) Admin API "latest.json" wiring (post-build)

Your release pipeline updates:

PUT /api/admin/downloads/latest

{ version, linuxAppImageUrl, linuxAppImageSha256, notesUrl }

Verify:

curl -sS "$ADMIN_API_BASE_URL/api/downloads/latest.json" | jq

6) Website wiring verification

Verify:

Pricing page loads /api/pricing and checkout creates sessions

Download page displays:

AppImage URL

SHA256 (no "pending")

version

Success page can show license via session_id mapping (optional)

7) Production verification (must do)
7.1 Download + checksum
curl -L -o app.AppImage "$(curl -sS $ADMIN_API_BASE_URL/api/downloads/latest.json | jq -r '.linux.appimage.url')"
sha_expected="$(curl -sS $ADMIN_API_BASE_URL/api/downloads/latest.json | jq -r '.linux.appimage.sha256')"
sha_actual="$(sha256sum app.AppImage | awk '{print $1}')"
test "$sha_expected" = "$sha_actual"
chmod +x app.AppImage

7.2 Run smoke tests
./app.AppImage --smoke-test --smoke-ipc --smoke-rina-roundtrip
./app.AppImage --smoke-test --smoke-ipc --smoke-rina-roundtrip --smoke-offline

7.3 Local install (Linux)
bash scripts/install-local-linux.sh ./app.AppImage

8) Rollback procedure (if something goes wrong)
8.1 Stop advertising broken build

Re-point latest manifest to previous version by calling:

PUT /api/admin/downloads/latest with the previous version/url/sha256

8.2 Yank GitHub release asset (optional)

Remove/mark the broken release as draft or delete assets

8.3 License/business rollback (rare)

If a release causes license corruption, disable activation temporarily at Admin API

If refunds are issued, webhook should mark licenses revoked
```
