# Security Operations Runbook

## Log Locations

- Application logs: `<userData>/logs/app-YYYY-MM-DD.log`
- Security events logged with redaction for tokens/passwords
- Max log entry size: 3000 characters


## Debug Logging

- Set `DEBUG=1` environment variable to enable verbose logging
- Security events always logged regardless of debug level


## State Reset (Corrupt Data)

- Clear userData directory: `rm -rf ~/Library/Application\ Support/RinaWarp/` (macOS)
- Or: `%APPDATA%\\RinaWarp\\` (Windows) / `~/.config/RinaWarp/` (Linux)
- Preserves logs directory for forensics


## Security Tests (Pre-Release)

```bash
# Renderer security scan
pnpm --filter terminal-pro run smoke:security

# Unit security tests
pnpm --filter terminal-pro test tests/security.test.js

# Supply chain checks
pnpm audit --prod
pnpm dlx knip
pnpm dlx syncpack lint
```

## Emergency Response

1. **Suspicious Activity**: Check logs for unauthorized IPC calls or file access
2. **Data Breach**: Rotate all stored tokens via secure-store API
3. **Malware**: Verify preload integrity hash matches build artifact
4. **Update Issues**: Check update signatures and rollback to last-good version


## Monitoring

- IPC calls logged with validation results
- File operations logged with size limits
- External URL opens validated and logged
- Failed security validations trigger error logs


## Build Security

- Preload script integrity checked at startup
- CSP headers prevent XSS in renderer
- Sandbox prevents renderer Node.js access
- COOP/COEP headers prevent Spectre attacks
