# RinaWarp Brain Client for VS Code

A VS Code extension that serves as a thin client for the RinaWarp Brain Terminal Pro system.

## Architecture Principle

**VS Code never decides. RinaWarp always decides.**

VS Code:
- Edits files
- Displays plans  
- Executes instructions

RinaWarp:
- Interprets intent
- Evaluates safety
- Plans actions
- Validates outcomes
- Owns state

## Features

- **RinaWarp: Status** - Check RinaWarp service status
- **RinaWarp: Explain Selection** - Explain selected code via RinaWarp
- **RinaWarp: Plan Action** - Plan complex actions safely
- **RinaWarp: Execute Plan** - Execute approved plans

## Requirements

- VS Code 1.85.0 or higher
- RinaWarp Terminal Pro running locally on port 9337

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Build the extension:
```bash
npm run build
```

3. Launch in debug mode:
- Press F5 in VS Code to open a new Extension Development Host window

## Communication Contract

The extension communicates with RinaWarp via JSON schemas:

- **Intent Request** - User intent with workspace context
- **Plan Response** - RinaWarp's planned approach
- **Execution Result** - Results from plan execution
- **Status Response** - Service health information

See `/schemas` directory for complete JSON Schema definitions.

## API Endpoints

The extension expects these endpoints on `http://127.0.0.1:9337`:

- `GET /status` - Service status
- `POST /explain` - Explain selection
- `POST /plan` - Create action plan
- `POST /execute` - Execute plan

## Security

- Loopback-only API (127.0.0.1)
- Session token authentication
- Dev/prod channel enforcement server-side

## License

Proprietary - RinaWarp Business