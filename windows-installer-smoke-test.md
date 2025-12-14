# Windows Installer Smoke Test Checklist
*Final validation before shipping RinaWarp Terminal Pro*

---

## 🚀 Ship Blocker Checklist

**If all boxes pass, you ship. If any fail, you fix first.**

---

## A) Install & Launch

### ⬜ Run installer on clean Windows VM
- **Windows 10** (latest patch level)
- **Windows 11** (latest patch level)  
- **Fresh VM** with no existing RinaWarp installations
- **Admin user** and **Standard user** accounts

### ⬜ SmartScreen warning acceptable
- **OV certificate** properly installed
- **Publisher name** shows "RinaWarp Technologies LLC"
- **Warning is dismissible** but informative
- **No false positive malware flags**

### ⬜ App launches without admin privileges
- **Standard user** can run app successfully
- **No UAC prompts** on normal operation
- **All features accessible** without admin rights
- **Proper file permissions** in user directories

### ⬜ No crash on first launch
- **Clean startup** - no error dialogs
- **Terminal window appears** within 5 seconds
- **Welcome screen** displays correctly
- **Agent process** starts successfully

---

## B) Core Terminal

### ⬜ Shell opens
- **PowerShell** available by default
- **Command Prompt** accessible
- **Windows Terminal** integration works
- **Custom shell support** (WSL, etc.)

### ⬜ Commands execute (dir, git, node)
```bash
dir                    # Directory listing works
git --version          # Git integration functional
node --version         # Node.js available
npm --version          # Package managers work
python --version       # Python support
```

### ⬜ Terminal usable offline
- **Disconnect network** - terminal still works
- **Basic commands** all functional
- **No error spam** about connectivity
- **File system access** unaffected

---

## C) Rina Agent (Local)

### ⬜ Agent process spawns
- **Check logs** - agent starts successfully
- **PID visible** in Task Manager
- **Memory usage** reasonable (< 100MB baseline)
- **No crash loops** or restarts

### ⬜ Ghost text appears
- **Suggestions show** in terminal
- **Context-aware** based on current directory
- **No interference** with typing
- **Performance** - no lag or stuttering

### ⬜ Tab accepts suggestion
- **Tab completion** works for ghost text
- **Smooth acceptance** - no visual glitches
- **Proper cursor positioning** after accept
- **Undo works** (Ctrl+Z) after suggestion use

### ⬜ Memory persists after restart
- **Command history** saved locally
- **Learning persists** between sessions
- **Settings preserved** across reboots
- **SQLite database** accessible and intact

---

## D) Gating

### ⬜ AI features locked without Agent Pro
- **Deep analysis** buttons disabled
- **Multi-step planning** shows upgrade prompt
- **Cloud AI features** require subscription
- **Graceful messaging** - no error spam

### ⬜ Upgrade CTA visible but non-blocking
- **Upgrade prompts** appear at appropriate times
- **Non-intrusive** - doesn't break workflow
- **Clear value proposition** in copy
- **Easy dismissal** without losing work

### ⬜ No error spam
- **Graceful degradation** when AI unavailable
- **Informative messages** instead of error dumps
- **Retry logic** for transient failures
- **User-friendly error handling**

---

## E) Licensing

### ⬜ Enter valid license → unlocks Terminal Pro
- **License validation** works immediately
- **Feature unlock** happens in real-time
- **No restart required** for basic features
- **Receipt/activation email** sent correctly

### ⬜ Invalid license handled gracefully
- **Clear error message** - not cryptic
- **No application crash** or freeze
- **Retry mechanism** available
- **Contact support** path visible

### ⬜ Offline launch still works after activation
- **License persists** locally
- **No daily re-validation** required
- **Grace period** for network issues
- **Device binding** works correctly

---

## F) Uninstall

### ⬜ App uninstalls cleanly
- **Windows Add/Remove Programs** removes app
- **No leftover files** in Program Files
- **User data** optionally preserved or removed
- **Registry cleanup** complete

### ⬜ No orphan background processes
- **Agent process** terminates cleanly
- **No lingering Node.js** processes
- **Task Manager** shows clean state
- **System resources** freed properly

---

## 🔧 Testing Commands

### Terminal Functionality:
```bash
# Test basic shell operations
dir
cd C:\
mkdir test-folder
echo "Hello World" > test.txt
type test.txt
rm test.txt
rmdir test-folder

# Test development tools
git init test-repo
git --version
node --version
npm --version
python --version

# Test Rina Agent
# Type commands and verify ghost text appears
# Press Tab to accept suggestions
# Verify memory persists across sessions
```

### System Verification:
```powershell
# Check running processes
Get-Process | Where-Object {$_.ProcessName -like "*rina*"}

# Check network connectivity test
Test-NetConnection google.com -Port 80

# Check disk space
Get-WmiObject -Class Win32_LogicalDisk | Select-Object DeviceID, FreeSpace, Size
```

---

## 📋 Test Environment Setup

### VM Specifications:
- **OS**: Windows 10 Pro 22H2 / Windows 11 Pro 22H2
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 50GB free space
- **Network**: Isolated for offline testing

### Test Accounts:
- **Local Admin**: Full system access
- **Standard User**: Limited privileges
- **Corporate Domain**: If applicable

### Required Software:
- **Git** (latest version)
- **Node.js** (LTS version)
- **Python** (3.8+)
- **Windows Terminal** (optional)

---

## 🎯 Success Criteria

### Must Pass (Ship Blockers):
- ✅ All installation scenarios work
- ✅ Terminal fully functional offline
- ✅ Local agent works reliably
- ✅ Feature gating non-intrusive
- ✅ Licensing system robust
- ✅ Clean uninstall process

### Performance Benchmarks:
- ✅ App launch < 5 seconds
- ✅ Ghost text appears < 500ms
- ✅ Memory usage < 200MB baseline
- ✅ CPU usage < 5% idle
- ✅ Disk I/O minimal during normal operation

### Quality Gates:
- ✅ Zero crashes during testing
- ✅ No memory leaks detected
- ✅ All upgrade flows work
- ✅ Error messages user-friendly
- ✅ Documentation accurate

---

## 🚨 Emergency Rollback

### If critical issues found:
1. **Stop distribution** immediately
2. **Identify scope** of problem
3. **Quick fix** or rollback decision
4. **Re-test** affected components
5. **Re-deploy** when validated

### Contact Information:
- **Build Team**: [Contact for installer issues]
- **QA Team**: [Contact for functional issues]
- **Product Team**: [Contact for gating/licensing issues]

---

**Remember**: This is your final quality gate before real users get the software. Take the time to test thoroughly — your reputation depends on first impressions.
