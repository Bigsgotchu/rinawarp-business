# WINDOWS SMOKE TEST SCRIPT

## 🎯 Purpose

Verify RinaWarp Terminal Pro works correctly on Windows before sales

## 📋 Test Checklist

### Pre-Test Setup

1. Fresh Windows machine or VM (recommended)
2. No development tools installed
3. Copy build from: `apps/terminal-pro/desktop/build-output/win-unpacked/`

### Installation Test

- [ ] **Launch App**: Double-click executable
- [ ] **No Errors**: App starts without popup errors
- [ ] **UI Clean**: No "API Error" or "Request Failed" messages
- [ ] **Terminal Opens**: Command line interface appears

### Functionality Test

- [ ] **Basic Commands**: Test `dir`, `ls`, `echo hello`
- [ ] **Offline Mode**: Disconnect internet, verify terminal still works
- [ ] **New Tab**: Create additional terminal tab
- [ ] **License Screen**: Check "Free/Trial" displays cleanly

### License Flow Test

- [ ] **Enter License**: Click license activation
- [ ] **Invalid Key**: Enter fake key, should reject silently
- [ ] **Real Key**: Enter actual Stripe-purchased key
- [ ] **Activation**: Should activate without errors

### Final Verification

- [ ] **No Console Errors**: Check Windows Event Viewer
- [ ] **Smooth Performance**: No lag or crashes
- [ ] **Clean Exit**: App closes properly

## 🐛 Common Issues to Watch For

- Popup alerts (should be eliminated ✅)
- Console error spam (should be eliminated ✅)
- License UI showing raw errors (should be fixed ✅)
- Terminal not responding (would indicate new issues)

## ✅ Success Criteria

- App launches in under 5 seconds
- Terminal accepts commands immediately
- No user-visible error messages
- License flow completes smoothly
- Works completely offline

---

**Test Result**: PASS/FAIL with notes
**Date**: ****\_\_\_****
**Tester**: ****\_\_\_****
