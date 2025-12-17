# Agent v1 Integration Guide

## Overview

This guide shows how to wire the new v1 Agent scaffolding into your existing Terminal Pro Electron application. The v1 Agent provides:

- **Tool Registry v1** (explicit tools only)
- **Confirmation Language Contract** (structured prompts)
- **Failure UX Contract** (ack → what failed → why → options)
- **Tool → Code mapping** (standard interface + guards)
- **"Never Do" regression tests** (unit-testable)

## Prerequisites

✅ **Vitest is already installed** in your Terminal Pro project (desktop/package.json)
✅ **Test script is configured**: `"test": "vitest run"`
✅ **Vitest config updated** to include agent-v1 tests

## Step 1: Import the Agent in Your Chat Handler

Find your existing chat input handler (likely in `desktop/src/renderer/` or similar). Here's the integration pattern:

```typescript
// Example integration in your chat input handler
import { handleUserIntent } from '../../agent-v1/core/agent';
import type { ToolContext } from '../../agent-v1/core/types';

// In your message handler
async function handleUserMessage(text: string, currentProjectPath: string) {
  const toolContext: ToolContext = {
    projectRoot: currentProjectPath,
    env: {
      NODE_ENV: process.env.NODE_ENV,
    },
    log: (msg, data) => console.log('[Agent]', msg, data),
  };

  // Confirmation resolver - integrate with your UI
  const confirmResolver = async (req: { id: string }): Promise<'yes' | 'no'> => {
    return new Promise((resolve) => {
      openConfirmationModal({
        id: req.id,
        onConfirm: () => resolve('yes'),
        onCancel: () => resolve('no'),
      });
    });
  };

  // Event emitter - integrate with your chat display
  const emit = (event: any) => {
    switch (event.type) {
      case 'assistant:message':
        addChatMessage('rina', event.text);
        break;
      case 'tool:declare':
        addSystemMessage(`Rina is using ${event.toolName}`);
        break;
      case 'confirm:request':
        openConfirmationModal({
          title: event.request.title,
          body: [
            event.request.intentReflection,
            event.request.actionPlain,
            event.request.risk && `⚠ ${event.request.risk}`,
          ].filter(Boolean),
          prompt: event.request.prompt,
        });
        break;
      case 'tool:output':
        showExpandableOutput(event.output);
        break;
      case 'tool:error':
        addChatMessage('rina', event.message);
        break;
    }
  };

  await handleUserIntent({
    text,
    ctx: toolContext,
    confirm: confirmResolver,
    emit,
  });
}
```

## Step 2: UI Integration Helpers

Integrate with your existing UI framework:

```typescript
function addChatMessage(sender: string, text: string) {
  // Your existing chat message adding logic
  console.log(`[Chat] ${sender}: ${text}`);
}

function addSystemMessage(text: string) {
  // Show in your status bar or system messages area
  console.log(`[System] ${text}`);
}

function showExpandableOutput(output: any) {
  // Display in your expandable output panel
  console.log('[Tool Output]', output);
}

function openConfirmationModal(config: {
  id: string;
  title: string;
  body: string[];
  prompt: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  // Your existing modal system
  // Example modal implementation:
  const modal = document.createElement('div');
  modal.className = 'agent-confirmation-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>${config.title}</h3>
      <div class="modal-body">
        ${config.body.map((line) => `<p>${line}</p>`).join('')}
        <p><strong>${config.prompt}</strong></p>
      </div>
      <div class="modal-actions">
        <button class="confirm-btn">Yes</button>
        <button class="cancel-btn">No</button>
      </div>
    </div>
  `;

  modal.querySelector('.confirm-btn')?.addEventListener('click', () => {
    config.onConfirm();
    document.body.removeChild(modal);
  });

  modal.querySelector('.cancel-btn')?.addEventListener('click', () => {
    config.onCancel();
    document.body.removeChild(modal);
  });

  document.body.appendChild(modal);
}
```

## Step 3: Wire Events to UI Components

You need four UI surfaces:

| Event               | UI                             |
| ------------------- | ------------------------------ |
| `assistant:message` | Chat bubble                    |
| `tool:declare`      | Small system/status line       |
| `tool:output`       | Expandable stdout / diff panel |
| `confirm:request`   | Confirmation modal             |

**Important:**

- Never auto-confirm
- Never hide output
- Never skip confirmation

## Step 4: Test the Integration

Run tests to ensure safety contracts are working:

```bash
cd apps/terminal-pro/desktop
npm test
```

You should see:

- ✅ Registry validation tests pass
- ✅ High-impact tools require confirmation
- ✅ Read tools don't require confirmation
- ✅ Unknown tools are blocked

## Step 5: Manual Validation

### Test 1 — Build Flow

**Type:** `build`

**Expected behavior:**

- Rina reflects intent
- Runs build.run
- Shows stdout
- No confirmation modal
- Ends with "Want tests next?"

### Test 2 — Deploy Flow

**Type:** `deploy`

**Expected behavior:**

- Rina proposes a plan
- Runs build
- Stops and asks for confirmation
- Mentions production impact
- Only deploys after explicit "yes"
- Shows output
- Offers next step

### Test 3 — Cancel Path

**Action:** When asked to confirm, click Cancel

**Expected:**

- No execution
- Calm response
- Offers to adjust plan

## Available Tools

### File System Tools

- `fs.list` - List directory contents (read, no confirmation)
- `fs.read` - Read file contents (read, no confirmation)
- `fs.edit` - Edit file contents (safe-write, no confirmation)
- `fs.delete` - Delete files/directories (high-impact, requires confirmation)

### Shell Tools

- `build.run` - Run build commands (safe-write, no confirmation)
- `deploy.prod` - Run production deploys (high-impact, requires confirmation)

### Git Tools

- `git.status` - Check git status (read, no confirmation)
- `git.diff` - Show git diff (read, no confirmation)
- `git.commit` - Commit changes (safe-write, no confirmation)

### Process Tools

- `process.list` - List running processes (read, no confirmation)
- `process.kill` - Kill a process (high-impact, requires confirmation)

## Complete Integration Example

See `INTEGRATION_EXAMPLE.ts` for a complete, drop-in integration example with all the patterns you need.

## Customization Points

1. **Tool Categories**: Modify `ToolCategory` in `core/types.ts`
2. **Confirmation Messages**: Update `ux/wording.ts` for your brand voice
3. **Failure Handling**: Customize `policy/failure.ts` for your error scenarios
4. **Intent Classification**: Enhance the basic classifier in `core/agent.ts`
5. **Security Guards**: Add more validation in tool implementations

## Final Checklist

- [ ] Vitest installed and configured
- [ ] Agent wired into chat handler
- [ ] Confirmation modal connected
- [ ] Tool outputs visible
- [ ] Tests passing
- [ ] Build workflow verified
- [ ] Deploy workflow gated

If all are checked: **v1 is implemented.**

The v1 scaffold is designed to be dropped in as-is and then customized for your specific needs while maintaining the safety contracts.
