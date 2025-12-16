# RinaWarp Terminal Pro - First 10 Minutes Dogfood Script

# Generated: 2025-12-13T20:39:55.143Z

# Purpose: Systematic testing of core functionality before Agent Pro rollout

## 🚀 LAUNCH APP

cd /home/karina/Documents/rinawarp-business/apps/terminal-pro/desktop/build-output
./RinaWarp-Terminal-Pro-1.0.0-x86_64.AppImage

## 📋 TEST SEQUENCE (Run in order, inside the app)

### Test 1: Basic Commands (Should work naturally)

```bash
pwd
ls
git status
```

**✅ SUCCESS CRITERIA:**

- Ghost text appears naturally (not instantly, not delayed)
- Tab accepts suggestion cleanly
- No double execution
- No UI noise

### Test 2: Typo Recovery (Critical UX moment)

```bash
git sttaus  # Intentional typo
```

**✅ SUCCESS CRITERIA:**

- Helpful suggestion appears
- No crash
- No modal popup
- No upsell attempt
- Your reaction: "oh... that saved me time"

### Test 3: Memory Moment Check (Trust builder)

```bash
cd ~/Documents
cd ~/Downloads
cd ~/Documents
```

**✅ SUCCESS CRITERIA:**

- Memory toast fires once
- No repetition
- No "look at me" behavior
- Feels natural, not pushy

## 📊 MANUAL METRICS TRACKING

### Week-1 Core Metrics (Track even manually)

| Metric                   | Target | Your Result    |
| ------------------------ | ------ | -------------- |
| Ghost text accepted      | ≥3/day | \_\_\_/day     |
| Commands run per session | ≥10    | \_\_\_/session |
| Crashes                  | 0      | \_\_\_ crashes |
| "This is useful" feeling | Yes/No | \_\_\_         |

## 🛡️ STABILITY RULES (48-72 hours)

### ❌ DO NOT TOUCH:

- Agent Pro UI additions
- Pricing changes
- Analytics dashboards
- AI call modifications
- "Just one quick tweak" urges

### ✅ FOCUS ON:

- Stability over cleverness
- User experience feedback
- Crash-free operation
- Natural workflow integration

## 🧠 AGENT PRO SWITCH CRITERIA

**Wait until ALL 3 are true:**

1. You subconsciously hit Tab without thinking
2. App survives 48+ hours with zero crashes
3. You personally think: "Yeah... I'd pay for the next level of this"

**When ready:** Wire the trigger function you already wrote

- No announcement
- No modal
- Soft nudge only

## 🎯 SUCCESS INDICATORS

If you don't want to turn it off → users won't either

The goal: Make it so useful that turning it off feels like losing a superpower

## 📝 NOTES SECTION

Use this space for your observations:

Day 1: **\*\***\*\***\*\***\_\_\_\_**\*\***\*\***\*\***

Day 2: **\*\***\*\***\*\***\_\_\_\_**\*\***\*\***\*\***

Day 3: **\*\***\*\***\*\***\_\_\_\_**\*\***\*\***\*\***

## 🔄 ROLLBACK PROCEDURE (If needed)

If issues arise, restore using:

```bash
# Verify hash matches known-good build
sha256sum /home/karina/Documents/rinawarp-business/apps/terminal-pro/desktop/build-output/RinaWarp-Terminal-Pro-1.0.0-x86_64.AppImage
# Expected: 7f3ddbb8de76ea45ccbd0068c600d50387b87a79259fb842923fcbc24751069f
```
