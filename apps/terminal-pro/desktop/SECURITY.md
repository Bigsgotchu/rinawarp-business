# Security Policy — RinaWarp Terminal Pro

## Supported Versions

| Version | Supported |
| ------- | --------- |
| v1.0.x  | ✅ Yes    |

Only the latest patch release of v1.0.x is supported.

---

## Reporting a Vulnerability

If you discover a security issue, please report it responsibly.

### Preferred Method

Email: **<security@rinawarptech.com>**

Include:

- Description of the issue
- Steps to reproduce (if applicable)
- Affected version(s)
- Any relevant logs or crash signatures

Please do NOT:

- Open public GitHub issues for security vulnerabilities
- Share exploit details publicly before disclosure is coordinated

---

## Scope

### In Scope

- IPC privilege escalation
- Renderer → main process bypass
- Unsafe preload exposure
- Native module abuse
- Update mechanism integrity
- License or billing bypass

### Out of Scope

- Denial-of-service from local resource exhaustion
- Issues caused by modified builds
- User-installed plugins or unsupported extensions

---

## Security Architecture Notes

RinaWarp Terminal Pro enforces:

- Context isolation
- IPC allowlisting
- No direct Node.js access in renderer
- Runtime IPC guards
- Safe-mode crash containment

These controls significantly reduce attack surface.

---

## Disclosure Timeline

- Acknowledgement: within 72 hours
- Fix or mitigation plan: within 14 days (severity dependent)
- Coordinated disclosure upon fix release
