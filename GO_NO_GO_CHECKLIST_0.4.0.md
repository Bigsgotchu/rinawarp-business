# Go/No-Go Checklist: RinaWarp Terminal Pro 0.4.0 (Linux-Only Release)

## Pre-Deploy Verification

- [ ] `REQUIRED_PLATFORMS=linux pnpm prepublish:verify` passes
- [ ] Only `stable/latest-linux.yml` exists in Pages output
- [ ] No `latest.yml` or `latest-mac.yml` in Pages output
- [ ] App code shows "Auto-updates disabled for non-Linux in 0.4.0" on Win/Mac

## Deploy Steps

- [ ] Deploy Pages with Linux feed only
- [ ] Run `pnpm cache:purge` (targets /stable/\*.yml)

## Post-Deploy Sanity Checks

- [ ] Feed headers: `content-type: text/yaml`, `cache-control: no-store`
- [ ] Artifact headers: `application/octet-stream`, `immutable`, `accept-ranges: bytes`
- [ ] Linux clients detect update via `update:check`
- [ ] Win/Mac clients show `feedURL: null` and log disable message

## Rollback Plan

- [ ] Git revert deploy commit + push
- [ ] Run `pnpm cache:purge`
- [ ] Monitor for any stuck clients (should auto-recover)

## Win/Mac Ready Checklist (Future)

- [ ] Real .exe, .exe.blockmap, .zip artifacts uploaded to R2
- [ ] latest.yml/latest-mac.yml updated with real sha512/size
- [ ] `pnpm prepublish:verify` passes with all platforms
- [ ] Full cache purge after adding Win/Mac feeds

## Success Criteria

- [ ] Linux users can update to 0.4.0
- [ ] No 404s or broken update checks on any platform
- [ ] Clean rollback path if issues arise

**Go Decision:** All pre-deploy checks pass + post-deploy sanity green.

**No-Go Decision:** Any verification fails or unexpected behavior detected.
