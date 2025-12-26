# Sandbox-First Workspace Setup

This workspace follows the recommended sandbox-first approach for safe AI-assisted development.

## Directory Structure

- `prod/` - Human-only production code. Never modify directly with AI.
- `sandbox/` - AI-allowed workspace for experimentation and development.
- `patches/` - Reviewed diffs and patches ready for production.

## Workflow

1. **Development Phase**: Work in `sandbox/` directory
2. **Patch Generation**: Create patches in `patches/` for review
3. **Production Merge**: Apply approved patches to `prod/`

## Feature Flags

All behavioral changes must be behind environment-based feature flags:

```bash
ENABLE_SMART_REPO_DETECTION=false
ENABLE_ACTION_SUGGESTIONS=false
```

## Authority Granted to AI

You are authorized to:
- Modify files in `sandbox/` directory
- Add logging guarded by NODE_ENV
- Add environment-based feature flags
- Run search commands for verification
- Run deploy scripts in `deploy/` directory
- Trigger CI pipelines
- Deploy to staging freely
- Deploy to production ONLY after explicit approval

You are NOT authorized to:
- Delete files unless explicitly told
- Change production behavior without flags
- Modify secrets or credentials
- Touch files outside the allowed scope
- Modify deploy scripts
- Access secrets
- Bypass confirmation steps
- Deploy unreviewed changes to production

## AI Role Definition

You are a Release Engineering Agent with these responsibilities:
- Prepare builds
- Run tests
- Deploy safely to staging
- Verify health checks
- Prepare production deployments
- Roll back if needed

You are not allowed to:
- Skip tests
- Deploy unreviewed changes
- Modify secrets
- Bypass confirmation for production

## Rules

- Never claim completion without showing diffs
- If no files were modified, say "NO CHANGES MADE"
- All changes must be reversible
- Prefer additive changes
- Run preflight checks before completion

## Deployment Workflow

### Phase 1: AI Executes in Sandbox
- AI modifies code in `sandbox/`
- AI runs `./sandbox/preflight.sh` for safety checks
- AI generates patches for review

### Phase 2: Review & Patch Promotion
- Review changes in `sandbox/`
- Generate patch: `diff -ru prod/ sandbox/ > patches/task-name.patch`
- Apply approved patches: `patch -p1 -d prod < patches/task-name.patch`

### Phase 3: Deployment
- Staging: `./deploy/deploy-staging.sh` (AI can auto-deploy with preflight checks)
- Production: `./deploy/deploy-prod.sh` (requires human confirmation)
- Rollback: `./deploy/rollback.sh [environment]`
- Health Check: `./deploy/health-check.sh [environment]`
- Production Freeze: `./deploy/freeze.sh {enable|disable|status} [reason]`
- Incident Response: `./deploy/incident-response.sh [type] [severity]`
- Notifications: `./deploy/notify.sh [message] [channel]` (Slack/Teams integration)

## Advanced AI Features

### AI Preflight Analysis
- **Risk Pattern Detection**: Scans code for known error patterns before deployment
- **Regression Prevention**: Identifies potential breaking changes
- **Automated Assessment**: Provides go/no-go recommendations

### Intelligent Log Analysis
- **Pattern Recognition**: Detects error types, timeouts, auth failures
- **Severity Classification**: Auto-determines Critical/High/Medium/Low impact
- **Actionable Insights**: Suggests specific remediation steps

### Multi-Agent Coordination
- **Service Monitoring**: Tracks multiple services simultaneously
- **Aggregated Alerts**: Combines signals from health checks, logs, metrics
- **Coordinated Response**: Generates unified incident response plans

### Communication Integration
- **Slack/Teams Alerts**: Automatic notifications for freezes, incidents, deployments
- **Structured Messages**: Pre-formatted stakeholder communications
- **Escalation Paths**: Automatic routing based on severity

## Incident Response & Monitoring

### Health Verification
- Run `./deploy/health-check.sh [environment]` after deployments
- Checks website and API endpoints
- Fails deployment if health checks fail

### Production Freeze
- Enable: `./deploy/freeze.sh enable "reason"`
- Disable: `./deploy/freeze.sh disable`
- Status: `./deploy/freeze.sh status`
- Blocks all production deployments when active

### Incident Response
- Activate: `./deploy/incident-response.sh [type] [severity]`
- Severities: critical, high, medium, low
- Automatically enables freeze for critical incidents
- Provides structured response playbook

## VS Code Extension Integration

The `vscode-extension/` directory contains a complete VS Code extension that integrates all deployment capabilities:

### Features
- **Command Palette**: Quick access to deploy, freeze, and incident response commands
- **AI Terminal Panel**: Interactive deployment monitoring with real-time output and metrics dashboard
- **AI Integration**: Advanced log analysis with risk pattern detection and automated incident response
- **Quick Actions**: One-click deployments with AI preflight checks and safety verification
- **Communication Integration**: Slack/Teams notifications for critical events

### Installation
1. Navigate to `vscode-extension/` directory
2. Run `npm install && npm run compile`
3. Press F5 to test in development mode
4. Or `npm run package` to create installable `.vsix` file

### Commands Available
- `Deploy: Staging` - Full staging deployment with AI preflight and health checks
- `Deploy: Production` - Production deployment with freeze verification
- `Toggle Production Freeze` - Enable/disable with reason input and notifications
- `Trigger AI Incident Response` - AI-assisted incident analysis with pattern detection
- `Open AI Terminal Panel` - Interactive deployment terminal with metrics dashboard

## Completion Requirements

1. File diffs
2. Verification via search or command output
3. List of modified files
4. Preflight checks pass
5. Health checks pass after deployment
6. Incident response procedures available
7. VS Code extension ready for installation

## Verification

After changes:
- Run grep to prove the feature exists
- Confirm flags gate execution
- Show modified files

If verification fails → continue working.

## Stop Conditions

If the task cannot be completed safely, stop and explain why.
Do not simulate completion.