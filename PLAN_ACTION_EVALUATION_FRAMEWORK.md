# RinaWarp Plan Action Evaluation Framework
**Phase**: Dogfooding & Trust Building  
**Duration**: 2-3 days of evaluation  
**Goal**: Build trust in planning quality before enabling execution

---

## 🎯 EVALUATION PROTOCOL

### For Every Non-Trivial Task:
1. **Run**: `RinaWarp: Plan Action`
2. **Read**: The complete plan carefully
3. **Evaluate**: Against the criteria below
4. **Document**: Any issues or improvements needed
5. **DO NOTHING ELSE**: No execution, no modifications

### 🧠 Cognitive Load Assessment

**Ask yourself**:
- Does this plan reduce my cognitive load?
- Are the steps in a logical order?
- Do I feel confident following these steps?
- Would I have thought to include these details?

---

## ✅ QUALITY INDICATORS (Good Signals)

### Plan Structure
- [ ] **Context included**: Repository, environment, scope clearly defined
- [ ] **Risk assessment**: Appropriate risk level for the task
- [ ] **Step ordering**: Logical, dependency-aware sequence
- [ ] **Verification points**: Clear success/failure criteria
- [ ] **Rollback plan**: What to do if something goes wrong

### Communication Quality
- [ ] **Clear language**: No jargon, unambiguous instructions
- [ ] **Appropriate detail**: Neither too vague nor overwhelming
- [ ] **Actionable steps**: Each step can be executed directly
- [ ] **Expected outcomes**: Clear understanding of success state

### Safety & Trust
- [ ] **Permission awareness**: Respects file system and security boundaries
- [ ] **Confirmation points**: Critical actions require explicit approval
- [ ] **Non-destructive first**: Safe operations prioritized
- [ ] **Reversible actions**: Where possible, changes can be undone

---

## ⚠️ WEAK SIGNALS (Document These)

### Missing Context
- [ ] **No repository information**: Which project/directory?
- [ ] **No environment details**: Development, staging, production?
- [ ] **No scope definition**: What exactly needs to be done?
- [ ] **No constraints**: Time, permissions, dependencies?

### Vague Instructions
- [ ] **"Apply changes"**: To what? How?
- [ ] **"Update configuration"**: Which files? What settings?
- [ ] **"Fix the issue"**: What issue? How to verify?
- [ ] **"Optimize performance"**: Which metrics? By how much?

### Wrong Risk Assessment
- [ ] **Low risk for destructive operations**: Deleting files, changing production
- [ ] **High risk for safe operations**: Reading files, checking status
- [ ] **No risk assessment**: Missing safety considerations entirely

### Problematic Steps
- [ ] **Steps you'd never take**: Unexpected or dangerous approaches
- [ ] **Missing verification**: No way to confirm success
- [ ] **Circular logic**: Steps that depend on each other without resolution
- [ ] **Impossible actions**: Requiring permissions or resources you don't have

---

## 📊 EVALUATION TRACKING

### Daily Log Template
```
Date: ___________
Task: ___________
Plan Quality Score (1-10): ____
Good Signals: _____________
Weak Signals: ____________
Would Execute?: Yes/No
Trust Level: Low/Medium/High
Notes: _______________
```

### Trust Building Milestones
- **Day 1**: Establish baseline - what does "good" look like?
- **Day 2**: Compare multiple plans - consistency evaluation
- **Day 3**: Decision point - ready for /execute or need more time?

---

## 🔒 EXECUTION RESTRICTIONS (MAINTAIN)

**Until trust threshold is reached**:
- ❌ No `/execute` commands
- ❌ No file modifications
- ❌ No deployment operations
- ❌ No system changes
- ❌ No "quick fixes" or "small tweaks"

**The goal is trust, not productivity. Speed comes later.**

---

## 🎯 TRUST THRESHOLD INDICATORS

**You're ready for the next phase when**:

1. **Plan Acceptance**: You read plans and think "Yes, that's what I'd do"
2. **Reduced Double-Checking**: You don't need to open Copilot to verify
3. **Proactive Waiting**: You naturally wait for RinaWarp's plan before acting
4. **Consistent Quality**: Plans maintain quality across different task types

### Specific Signals
- [ ] Plans consistently include proper context
- [ ] Risk assessments feel accurate
- [ ] Step ordering matches your mental model
- [ ] You feel confident in the proposed approach
- [ ] Verification points are appropriate and sufficient

---

## 🚀 POST-TRUST TRANSITION

**When ready, the next safe step is**:
- Add `/execute` with mandatory confirmation
- Zero implicit behavior
- Explicit approval for each action
- Gradual rollout of capabilities

**But we'll design that carefully when you get there.**

---

## 💡 KEY INSIGHT

**This dogfooding phase is not about efficiency - it's about building a system you can trust with your most important work.**

The time invested in careful evaluation now will pay dividends in confidence and reliability later.

---

*Ready for Plan Action evaluation phase.*