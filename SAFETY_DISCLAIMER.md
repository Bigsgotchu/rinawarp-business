# RinaWarp Safety Disclaimer

## 🔒 Safety First

RinaWarp is designed with safety as a core principle. However, no system can guarantee 100% protection against all possible risks. This disclaimer explains our safety measures and your responsibilities.

## ✅ What RinaWarp Does to Keep You Safe

### 1. Command Safety Classification
RinaWarp classifies all commands into three safety levels:

**Safe Commands** (execute immediately):
- Read-only operations (e.g., `ls`, `cat`, `git status`)
- No file modifications
- No system changes

**Ambiguous Commands** (require confirmation):
- Potentially risky operations (e.g., `npm install`, `git pull`)
- May modify dependencies or configuration
- Require explicit user confirmation

**Destructive Commands** (require explicit confirmation):
- File deletions (e.g., `rm`, `del`)
- File modifications (e.g., `mv`, `cp`)
- Permission changes (e.g., `chmod`, `chown`)
- System modifications (e.g., `apt install`, `yum update`)
- **Always require explicit user confirmation**

### 2. Scope Restrictions
- Commands are restricted to the project root by default
- System-wide commands require explicit approval
- Network operations require explicit approval
- You can explicitly expand scope, but this is logged and requires confirmation

### 3. Immutable Logging
- All commands are logged with:
  - Timestamp
  - Command text
  - Safety classification
  - User confirmation status
  - Exit code
  - Output (truncated for large outputs)
- Logs are immutable and cannot be modified
- Logs support rollback of destructive operations

### 4. Rollback Capability
- For destructive commands, RinaWarp takes snapshots
- You can rollback to previous state
- Rollback operations are also logged
- Rollback is atomic and reversible

### 5. AI Assistance (Pro Tier)
- AI suggestions are context-aware
- Suggestions never auto-execute
- You must confirm each suggestion
- AI follows safety rules and never suggests obviously destructive commands without clear justification

## ⚠️ Your Responsibilities

While RinaWarp provides robust safety features, you are ultimately responsible for:

### 1. Command Execution
- **You must review all commands** before execution
- **You must understand what a command does** before confirming
- **You must verify the scope** of each command
- **You must confirm destructive operations** explicitly

### 2. Scope Management
- **You must ensure commands stay within intended scope**
- **You must explicitly approve scope expansions** when needed
- **You must verify working directory** before executing commands

### 3. License Compliance
- **You must use valid licenses** for all features
- **You must comply with our terms of service**
- **You must not bypass safety features**

### 4. System Security
- **You must keep your system secure**
- **You must not run untrusted commands**
- **You must verify command sources** before execution
- **You must not share sensitive information** in commands

## ❌ What RinaWarp Does NOT Protect Against

### 1. User Error
- Typing the wrong command
- Confirming a destructive command by mistake
- Not reviewing AI suggestions carefully
- Not understanding what a command does

### 2. Malicious Commands
- Running commands from untrusted sources
- Executing commands that appear safe but have hidden effects
- Not verifying command origins

### 3. System Vulnerabilities
- Exploiting system vulnerabilities through commands
- Running privileged commands without proper safeguards
- Not keeping your system updated

### 4. Data Loss
- Not backing up important files
- Not testing rollback before relying on it
- Not verifying file integrity after operations

## 🛡️ Best Practices

### 1. Command Review
- **Always read commands carefully** before confirming
- **Verify the full command text**, not just the first part
- **Check for dangerous flags** (e.g., `-rf`, `--force`)
- **Understand what each part of the command does**

### 2. Scope Verification
- **Check your current working directory** (`pwd`)
- **Verify you're in the right project**
- **Confirm scope before executing** system-wide commands
- **Use absolute paths** when in doubt

### 3. Destructive Operations
- **Double-check file paths** before deletion
- **Verify you have the right files** selected
- **Consider using `echo` first** to preview what would happen
- **Test on non-critical files** before destructive operations

### 4. Network Operations
- **Verify URLs** before downloading
- **Check file hashes** after downloading
- **Use HTTPS** for all connections
- **Don't run untrusted scripts**

### 5. Rollback Testing
- **Test rollback** on non-critical files first
- **Verify rollback works** before relying on it
- **Check file integrity** after rollback
- **Keep backups** in addition to relying on rollback

## 📋 Example Scenarios

### ✅ Safe Usage
```bash
# Safe: List files
ls -la

# Safe: View file contents
cat package.json

# Ambiguous but safe: Check git status
git status

# Destructive but safe with rollback:
rm old-file.txt  # Then rollback if needed
```

### ❌ Risky Usage
```bash
# Risky: No confirmation review
rm -rf /tmp/project/*  # Without reading carefully

# Risky: Not verifying scope
cd / && rm -rf important-data  # Outside project root

# Risky: Blindly trusting AI
# (Even with AI, you should review suggestions)

# Risky: Not testing rollback
rm -rf /important/files  # Without verifying rollback works
```

## 🚨 What to Do If Something Goes Wrong

### 1. Immediate Action
- **Stop executing commands**
- **Check the History panel** for what happened
- **Attempt rollback** if available
- **Don't panic** - most issues can be resolved

### 2. Recovery Steps
- **Use rollback** for destructive operations
- **Check logs** for details (Help → View Logs)
- **Manual recovery** if needed (e.g., file recovery tools)
- **Contact support** if you need assistance

### 3. Prevention
- **Review commands more carefully** in the future
- **Enable more safety warnings** in Settings
- **Test rollback** on non-critical files
- **Keep backups** of important files

## 📝 Legal Disclaimer

### Limitation of Liability
RinaWarp provides safety features as a best-effort service. We are not responsible for:
- Data loss caused by user error
- System damage from executing commands
- Consequences of not following safety best practices
- Any indirect, incidental, or consequential damages

### Indemnification
You agree to indemnify and hold harmless RinaWarp and its affiliates from any claims, liabilities, damages, losses, or expenses (including attorneys' fees) arising out of or in any way connected with your use of the service or violation of these terms.

### Modifications
We may update this disclaimer at any time. Continued use of RinaWarp constitutes acceptance of the current disclaimer.

## 📞 Support

If you have questions about safety features or need help recovering from an issue:
- **Email**: support@rinawarp.com
- **Discord**: [Join our community](https://discord.gg/rinawarp)
- **Website**: [rinawarp.com/support](https://rinawarp.com/support)

---

**Version**: 1.0.0-beta
**Last Updated**: 2026-01-15

By using RinaWarp, you acknowledge that you have read and understood this safety disclaimer.
