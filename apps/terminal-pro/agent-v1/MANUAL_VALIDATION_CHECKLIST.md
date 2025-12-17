# Agent v1 Manual Validation Checklist

## 🎯 Quick Start

The Agent v1 scaffolding is **ready for integration**. This checklist helps you validate the end-to-end implementation.

## ✅ Pre-Integration Verification

### 1. Safety Contracts Verified

- [x] Tool registry with explicit tools only
- [x] Confirmation gates for high-impact operations
- [x] Failure handling with structured UX
- [x] Visible tool usage (no silent operations)
- [x] Proper tool categorization
- [x] Intent handling with user experience features

### 2. File Structure Check

```
agent-v1/
├── core/
│   ├── types.ts          ✅ ToolSpec, ToolResult, ToolContext
│   ├── agent.ts          ✅ Intent handling
│   └── toolRunner.ts     ✅ Confirmation gates + execution
├── tools/
│   ├── fs.ts            ✅ File system tools (read/safe-write/high-impact)
│   ├── git.ts           ✅ Git tools
│   ├── shell.ts         ✅ Shell tools (build.run, deploy.prod)
│   └── process.ts       ✅ Process tools
├── policy/
│   ├── registry.ts      ✅ Tool registry + validation
│   ├── confirm.ts       ✅ Confirmation request building
│   └── failure.ts       ✅ Failure categorization + messaging
├── ux/
│   └── wording.ts       ✅ Bubbly/witty/read-the-room safe messaging
├── tests/
│   └── neverDo.test.ts  ✅ "Never Do" regression tests
├── INTEGRATION_GUIDE.md ✅ Complete integration instructions
├── INTEGRATION_EXAMPLE.ts ✅ Drop-in integration example
└── verify-safety.js    ✅ Safety contract verification script
```

### 3. Run Safety Verification

```bash
cd apps/terminal-pro/agent-v1
node verify-safety.js
```

**Expected Output:** All tests should pass ✅

## 🧪 Manual Testing Scenarios

### Test 1: Build Flow (No Confirmation Required)

**Setup:**

1. Import the agent into your chat handler (see INTEGRATION_EXAMPLE.ts)
2. Wire confirmation modal to show/hide based on tool category
3. Connect tool output display to your UI

**Test Steps:**

1. Type in chat: `build`
2. Press Enter

**Expected Behavior:**

```
User: build
Rina: Okay—sounds like you want to build your project.
Rina: Rina is using build.run...
[Build output appears]
Rina: Build finished. Want tests next?
```

**Validation:**

- [ ] No confirmation modal appears
- [ ] Tool execution is visible
- [ ] Output is displayed
- [ ] Ends with helpful next step suggestion

### Test 2: Deploy Flow (Confirmation Required)

**Test Steps:**

1. Type in chat: `deploy`
2. Press Enter

**Expected Behavior:**

```
User: deploy
Rina: Got it. I'll propose a safe deploy plan.
Rina: Plan:
1) Build + tests
2) Deploy to production
3) Quick health check
Rina: Rina is using build.run...
[Build output appears]
Rina is using deploy.prod...
[Confirmation modal appears with:]
Title: "deploy.prod confirmation"
Body:
- "Okay—sounds like you want to deploy to production."
- "Run the production deploy script (`./deploy-final.sh`)."
- "⚠ This will update the live production site."
Prompt: "I've got you. Want me to proceed safely?"
```

**Validation:**

- [ ] Build runs first without confirmation
- [ ] Confirmation modal appears for deploy
- [ ] Modal shows risk warning
- [ ] User can cancel (see Test 3)
- [ ] Only executes after explicit "Yes"

### Test 3: Cancel Path (User Control)

**Test Steps:**

1. Start a deploy flow (Test 2)
2. When confirmation modal appears, click "No" or "Cancel"

**Expected Behavior:**

```
User clicks: Cancel
Rina: No problem—stopping here. If you want, tell me what to change and I'll adjust the plan.
```

**Validation:**

- [ ] No tool execution occurs
- [ ] Calm, helpful response
- [ ] User remains in control
- [ ] Agent offers to adjust plan

### Test 4: Unknown Tool (Safety Block)

**Test Steps:**

1. Type in chat: `danger.yolo`
2. Press Enter

**Expected Behavior:**

```
User: danger.yolo
Rina: Tell me the goal (deploy, fix an error, set up backend, make production-ready) and I'll propose the safest next steps.
```

**Validation:**

- [ ] Unknown tools are blocked
- [ ] Helpful guidance provided
- [ ] No errors or crashes

### Test 5: Frustrated User (De-escalation)

**Test Steps:**

1. Type in chat: `I'm stuck and frustrated`
2. Press Enter

**Expected Behavior:**

```
User: I'm stuck and frustrated
Rina: I hear you. We'll keep this simple and get you moving again—one clean step at a time.
```

**Validation:**

- [ ] De-escalation message appears
- [ ] Tone is supportive and calming
- [ ] No tool execution attempted

## 🔧 Integration Checklist

### Phase 1: Basic Integration

- [ ] Copy INTEGRATION_EXAMPLE.ts patterns into your chat handler
- [ ] Import `handleUserIntent` from `../../agent-v1/core/agent`
- [ ] Create ToolContext with projectRoot and env
- [ ] Implement confirmation resolver with your modal system
- [ ] Wire agent events to your UI components

### Phase 2: UI Components

- [ ] Chat message display (assistant:message)
- [ ] System status display (tool:declare)
- [ ] Expandable output panel (tool:output)
- [ ] Confirmation modal (confirm:request)
- [ ] Error message display (tool:error)

### Phase 3: Testing

- [ ] Test all 5 scenarios above
- [ ] Verify safety contracts in your environment
- [ ] Test both positive and negative paths
- [ ] Validate user control at every step

## 📊 Expected Tool Behavior

| Tool           | Category    | Confirmation | Example Input                 | Expected Output       |
| -------------- | ----------- | ------------ | ----------------------------- | --------------------- |
| `fs.list`      | read        | No           | `list files in src`           | Directory contents    |
| `fs.read`      | read        | No           | `show me package.json`        | File contents         |
| `fs.edit`      | safe-write  | No           | `update README with new info` | Before/after diff     |
| `fs.delete`    | high-impact | Yes          | `delete old files`            | Confirmation → Delete |
| `build.run`    | safe-write  | No           | `build the project`           | Build output          |
| `deploy.prod`  | high-impact | Yes          | `deploy to production`        | Confirmation → Deploy |
| `git.status`   | read        | No           | `check git status`            | Git status            |
| `git.diff`     | read        | No           | `show changes`                | Git diff              |
| `git.commit`   | safe-write  | No           | `commit my changes`           | Commit result         |
| `process.list` | read        | No           | `show running processes`      | Process list          |
| `process.kill` | high-impact | Yes          | `kill process 1234`           | Confirmation → Kill   |

## 🚨 Critical Safety Rules

**Never Allow:**

- [ ] Auto-confirmation of high-impact tools
- [ ] Silent tool execution
- [ ] Hidden tool output
- [ ] Unknown/dynamic tools
- [ ] Path traversal outside project root

**Always Require:**

- [ ] Explicit user confirmation for high-impact operations
- [ ] Visible tool usage declarations
- [ ] Structured error handling
- [ ] User control over execution

## ✅ Final Validation

When all tests pass and all checklist items are complete:

**🎉 v1 Implementation is Complete!**

You now have:

- [x] A real execution agent
- [x] Bounded power (explicit tools only)
- [x] Human personality (intent reflection + de-escalation)
- [x] Safety guarantees (confirmation gates + regression tests)
- [x] Testable contracts (automated verification)

**This is not a demo. This is a product foundation.**
