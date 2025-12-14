# Client Tool Disabling Guide

## Issue Summary
Your client is sending tool messages that reference tool call IDs that were never issued by the model, causing errors like "2013 tool id not found". This happens when clients have tools enabled but the local rina-agent server doesn't support OpenAI-style tool calls.

## Server Fix Applied
✅ **IMPLEMENTED**: Server-side message sanitization in `apps/terminal-pro/agent/src/app.ts`
- Added `sanitizeMessagesForNonToolModel()` function
- Converts stray tool/function messages to assistant notes for traceability
- Applied to both `/v1/chat/completions` and `/chat` endpoints

## Client Fixes (Prevent the issue at source)

### Continue IDE
**File**: `~/.continue/config.yaml`
```yaml
version: 3
experimental:
  enableTools: false
```

**Status**: ✅ Created in `config/continue-config.yaml` (copy to `~/.continue/config.yaml`)

### KiloCode / Cline
**Settings to change**:
1. Open settings/preferences
2. Look for "Tools/Functions" or "Tool Calling" section
3. Set to **OFF** or **Disabled**
4. Or select a plain chat model profile (no tools enabled)

**Alternative**: Create a plain chat model profile without tool support

### Other AI Clients
**General Instructions**:
1. Disable any "Tool Calling", "Function Calling", or "Tools" features
2. Use plain chat models without tool support
3. Check for "experimental" or "advanced features" toggles

## Verification
After applying client settings:
1. Test with a simple chat message
2. Check server logs for any remaining tool-related errors
3. Monitor for the specific error: "tool id not found" or "2013"

## Why This Fixes It
- **Root Cause**: Minimax and other providers require every `role:"tool"` message to reference a prior assistant `tool_calls[].id`
- **Client Fix**: Prevents stray tool messages from being sent
- **Server Fix**: Sanitizes any that do get through, maintaining thread consistency

## Next Steps (Optional)
1. Consider implementing full OpenAI tool_calls support end-to-end
2. Add server flag `ALLOW_TOOL_MESSAGES=true` to reject tool messages with clear 400 errors
3. Enable tools selectively when full support is ready
