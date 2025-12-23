# Electron Governed Platform Template

A governed Electron application template with enforced architecture, typed IPC, crash recovery, and deterministic CI.

## Features

- **Strict IPC Allowlisting** - Single source of truth for all IPC channels
- **Runtime Guards** - Prevent unauthorized IPC access at runtime
- **Crash Recovery** - Stable signature hashing and safe-mode recovery
- **Deterministic CI** - Architecture enforcement and drift detection
- **Zero-Hallucination** - Pinned versions and explicit dependencies

## Architecture

```
src/
├── main/          # Main process with IPC guards
├── preload/       # Type-safe IPC exposure
├── renderer/      # Isolated renderer process
└── shared/        # Shared types and utilities
```

## Getting Started

1. Clone this repository
2. Install dependencies: `npm install`
3. Run architecture checks: `npm run check:arch`
4. Start development: `npm run dev`

## Governance Rules

- No direct `ipcRenderer` in renderer
- No `node-pty` in renderer
- Context isolation required
- Typed IPC contracts mandatory
- Crash recovery must be implemented

## Support

See [SUPPORT_SOP.md](SUPPORT_SOP.md) for support procedures.

## Security

See [SECURITY.md](SECURITY.md) for security policy.

## Contributing

This template enforces strict architectural boundaries.
All changes must pass architecture validation.