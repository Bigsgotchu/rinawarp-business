# Rina Super Deploy - VS Code Extension

AI-assisted production deployment, health verification, freeze system, and incident response for VS Code.

## Features

### Command Palette Commands
- **Deploy: Staging** - Run staging deployment with health checks
- **Deploy: Production** - Run production deployment with freeze and health checks
- **Toggle Production Freeze** - Enable/disable production freeze with reason
- **Trigger AI Incident Response** - AI-assisted incident analysis and response
- **Open AI Terminal Panel** - Interactive terminal with AI monitoring

### AI Terminal Panel
- Real-time command execution
- Quick deploy buttons
- Live output streaming
- AI log analysis integration

### Deployment Scripts Integration
Works with the deployment scripts in the `deploy/` directory:
- `health-check.sh` - Automated health verification
- `freeze.sh` - Production freeze management
- `incident-response.sh` - Structured incident response
- `deploy-staging.sh` / `deploy-prod.sh` - Environment deployments

## Installation

1. Clone this repository
2. Run `npm install` in the `vscode-extension/` directory
3. Run `npm run compile` to build
4. Press F5 to launch extension development host
5. Or package with `npm run package` and install the `.vsix` file

## Configuration

Set your OpenAI API key in environment variables for AI features:
```bash
OPENAI_API_KEY=your-api-key-here
```

## Usage

### Quick Start
1. Open Command Palette (Ctrl+Shift+P)
2. Type "Deploy: Staging" to run staging deployment
3. Use "Open AI Terminal Panel" for interactive deployment monitoring

### Incident Response
1. Run "Trigger AI Incident Response"
2. Describe the incident and select severity
3. Follow AI-generated response plan

### Production Freeze
1. Run "Toggle Production Freeze"
2. Choose Enable/Disable/Check Status
3. Enter reason when enabling freeze

## Architecture

- **Commands**: VS Code command palette integration
- **Panels**: Webview-based interactive terminal
- **AI Integration**: Log analysis and incident response
- **Script Integration**: Shell script execution for deployments

## Safety Features

- Production freeze prevents accidental deployments
- Health checks block deployments on failures
- Human confirmation required for production
- AI-assisted incident response with structured playbooks

## Development

### Project Structure
```
vscode-extension/
├── src/
│   ├── extension.ts          # Main extension entry point
│   ├── commands/             # Command implementations
│   ├── panels/               # Webview panels
│   └── ai/                   # AI integration
├── package.json              # Extension manifest
├── tsconfig.json            # TypeScript configuration
└── README.md                # This file
```

### Building
```bash
npm run compile    # Build once
npm run watch      # Watch mode
npm run package    # Create .vsix package
```

### Testing
- Press F5 to launch extension development host
- Test commands in the new VS Code window
- Check debug console for errors