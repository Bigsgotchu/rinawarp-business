# RinaWarp Beta Testing Guide

Welcome to the RinaWarp private beta! Your feedback is crucial in making RinaWarp stable, reliable, and user-friendly before public launch.

## 🎯 Beta Program Overview

### What is the Beta Program?
The private beta is an invitation-only program for 10-20 developers to:
- Test core functionality
- Provide feedback on safety features
- Help identify bugs
- Suggest improvements
- Shape the final product

### Beta Duration
- **Start Date**: 2026-01-15
- **End Date**: 2026-02-15 (4 weeks)
- **Public Launch**: 2026-03-01 (target)

### What to Test
1. **Terminal Core**: Fast, predictable, local execution
2. **AI Assistant**: Context-aware suggestions
3. **Command Safety**: Validation and confirmation
4. **Local Project Isolation**: Scope restrictions
5. **License Check**: Stripe API integration
6. **VS Code Extension**: RPC/WebSocket communication
7. **Rollback**: Undo destructive operations

## 📋 Testing Checklist

### Week 1: Core Functionality
- [ ] Install and launch Terminal Pro
- [ ] Test basic command execution
- [ ] Verify safety classifications
- [ ] Test confirmation workflows
- [ ] Review command history
- [ ] Test rollback functionality

### Week 2: AI Assistant
- [ ] Enable AI suggestions
- [ ] Test inline completions
- [ ] Review suggestion quality
- [ ] Test hover explanations
- [ ] Verify confirmation requirements

### Week 3: VS Code Integration
- [ ] Install VS Code extension
- [ ] Test RPC communication
- [ ] Verify execution authority delegation
- [ ] Test inline suggestions in VS Code
- [ ] Check confirmation UI

### Week 4: Edge Cases & Stress Testing
- [ ] Test with large projects
- [ ] Try complex command chains
- [ ] Test network operations
- [ ] Verify scope restrictions
- [ ] Test crash recovery

## 🛠️ How to Test

### 1. Install Terminal Pro
```bash
# Clone the repository
git clone https://github.com/yourusername/rinawarp.git
cd rinawarp

# Install dependencies
npm install

# Build and launch
npm run build
npm start
```

### 2. Authenticate
1. Click **Sign In** in the top-right corner
2. Use your beta tester credentials (provided via email)
3. Complete 2FA verification

### 3. Activate License
1. Go to **Settings → License**
2. Enter your beta license key (provided via email)
3. Click **Activate**

### 4. Test Core Features

#### Command Execution
```bash
# Test safe commands (should execute immediately)
ls -la
cat package.json
git status

# Test ambiguous commands (should require confirmation)
npm install
git pull
docker build

# Test destructive commands (should require explicit confirmation)
rm test-file.txt
mv old/ new/
chmod 777 script.sh
```

#### AI Assistant
1. Enable AI suggestions in Settings
2. Type commands and observe suggestions
3. Review inline completions
4. Check hover explanations
5. Verify confirmation is required

#### Rollback
1. Create a test file: `echo "test" > test.txt`
2. Delete it: `rm test.txt`
3. Open History panel
4. Click **Rollback**
5. Verify file is restored

#### VS Code Extension
1. Install the extension from VS Code Marketplace
2. Open VS Code settings
3. Configure RinaWarp connection
4. Test command execution
5. Verify suggestions appear inline
6. Check confirmation workflows

### 5. Test Edge Cases

#### Large Projects
- Test with repositories > 1GB
- Verify performance with many files
- Check memory usage

#### Complex Commands
- Test command chaining: `cat file.txt | grep pattern | wc -l`
- Test background processes: `sleep 100 &`
- Test pipes and redirects: `ls > files.txt`

#### Network Operations
- Test `curl` and `wget` (should require confirmation)
- Test `git clone` (should require confirmation)
- Test `npm install` (should require confirmation)

#### Scope Restrictions
- Try to execute commands outside project root
- Verify warnings appear
- Test explicit scope expansion

#### Crash Recovery
- Force quit Terminal Pro
- Restart and verify session recovery
- Check if command history is preserved

## 📝 Feedback Guidelines

### What We Need
1. **Bug Reports**: Clear, reproducible steps
2. **Feature Requests**: Well-justified improvements
3. **UX Feedback**: Usability issues and suggestions
4. **Performance Data**: Memory/CPU usage observations
5. **Safety Concerns**: Any bypasses or weaknesses

### How to Provide Feedback

#### 1. Bug Reports
**Template:**
```markdown
## Bug Report

**Description**: Clear description of the issue

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**: What should happen

**Actual Behavior**: What actually happened

**Screenshots**: If applicable

**Logs**: From Help → View Logs

**Environment**:
- OS: [macOS/Windows/Linux]
- Version: [e.g., 1.0.0-beta.1]
- License Tier: [Starter/Pro/Team]
```

#### 2. Feature Requests
**Template:**
```markdown
## Feature Request

**Description**: What feature you'd like

**Use Case**: Why it's important

**Priority**: [Low/Medium/High]

**Alternatives**: Current workarounds
```

#### 3. UX Feedback
**Template:**
```markdown
## UX Feedback

**Component**: Which part of the UI/UX

**Issue**: What's problematic

**Suggestion**: How to improve

**Screenshots**: If helpful
```

### Where to Submit
- **GitHub Issues**: [github.com/rinawarp/rinawarp/issues](https://github.com/rinawarp/rinawarp/issues)
- **Discord**: #beta-testers channel
- **Email**: beta@rinawarp.com
- **Survey**: Weekly feedback surveys (links sent via email)

## 📊 Test Cases

### Safety Classification Tests
| Command | Expected Safety Level | Should Require Confirmation |
|---------|----------------------|-----------------------------|
| `ls` | Safe | No |
| `cat file.txt` | Safe | No |
| `git status` | Safe | No |
| `npm install` | Ambiguous | Yes |
| `git pull` | Ambiguous | Yes |
| `docker build` | Ambiguous | Yes |
| `rm file.txt` | Destructive | Yes |
| `mv old/ new/` | Destructive | Yes |
| `chmod 777 script.sh` | Destructive | Yes |
| `cd / && rm -rf *` | Destructive | Yes |

### Rollback Tests
1. Create a file
2. Delete it
3. Rollback
4. Verify file is restored
5. Check file contents

### AI Suggestion Tests
1. Type `npm` and verify suggestions appear
2. Type `git` and verify suggestions appear
3. Type `docker` and verify suggestions appear
4. Verify suggestions require confirmation
5. Check hover explanations

### VS Code Integration Tests
1. Install extension
2. Connect to Terminal Pro
3. Execute commands
4. Verify suggestions
5. Test confirmation workflows

## 🎯 Test Scenarios

### Scenario 1: Developer Workflow
1. Open a project in Terminal Pro
2. Run `npm install` (should require confirmation)
3. Accept and verify installation
4. Run `npm run dev` (should require confirmation)
5. Accept and verify server starts
6. Check command history

### Scenario 2: Accidental Destruction
1. Create test files
2. Try to delete them without reading carefully
3. Verify confirmation appears
4. Cancel and verify files are safe
5. Delete intentionally and test rollback

### Scenario 3: VS Code Integration
1. Open VS Code
2. Install RinaWarp extension
3. Connect to Terminal Pro
4. Type commands in VS Code terminal
5. Verify suggestions appear
6. Test confirmation workflows

### Scenario 4: Large Project
1. Open a large repository (> 1GB)
2. Run various commands
3. Check performance
4. Verify no memory leaks
5. Test command execution speed

### Scenario 5: Network Operations
1. Try `curl https://api.example.com` (should require confirmation)
2. Try `git clone https://github.com/user/repo` (should require confirmation)
3. Try `npm install` (should require confirmation)
4. Verify warnings about network operations

## 📈 Metrics to Track

### Performance
- Terminal startup time
- Command execution speed
- Memory usage
- CPU usage
- Response time for AI suggestions

### Reliability
- Crash frequency
- Recovery success rate
- Rollback success rate
- Connection stability (VS Code extension)

### Usability
- Time to first command
- Confirmation workflow completion time
- Navigation ease
- Settings accessibility

### Safety
- False positives in safety classification
- False negatives in safety classification
- User confirmation compliance
- Rollback effectiveness

## 🚨 Known Issues

### Current Limitations
1. **AI suggestions** may be slow with large projects
2. **Rollback** doesn't work for all file types
3. **VS Code extension** may disconnect if Terminal Pro restarts
4. **License check** requires internet connection
5. **Command history** may slow down with > 10,000 entries

### Workarounds
- For slow AI: Disable suggestions temporarily
- For rollback issues: Manual file recovery
- For VS Code disconnections: Reconnect manually
- For license issues: Check internet connection
- For large history: Clear old entries

## 📅 Beta Schedule

### Week 1 (Jan 15-21)
- **Focus**: Core functionality
- **Priority**: Command execution, safety, history
- **Deliverable**: Bug reports on core features

### Week 2 (Jan 22-28)
- **Focus**: AI assistant
- **Priority**: Suggestions, completions, explanations
- **Deliverable**: Feedback on AI quality

### Week 3 (Jan 29-Feb 4)
- **Focus**: VS Code integration
- **Priority**: RPC, WebSocket, UI
- **Deliverable**: Integration feedback

### Week 4 (Feb 5-11)
- **Focus**: Edge cases
- **Priority**: Large projects, crashes, recovery
- **Deliverable**: Stress test results

### Week 5 (Feb 12-15)
- **Focus**: Final feedback
- **Priority**: Overall experience
- **Deliverable**: Final report

## 🎁 Beta Tester Rewards

### For Participation
- **All testers**: Free Pro tier for 3 months
- **Top contributors**: Free Pro tier for 6 months
- **Feature suggestions implemented**: Credit in release notes
- **Bug reports leading to fixes**: Public recognition

### For Feedback Quality
- **Detailed bug reports**: Entry into prize draw
- **Creative feature ideas**: Consideration for implementation
- **UX improvements**: Credit in documentation
- **Test case contributions**: Added to test suite

## 📞 Support During Beta

### Getting Help
- **Discord**: #beta-testers channel (real-time help)
- **Email**: beta@rinawarp.com (response < 24 hours)
- **GitHub**: Issues labeled "beta" (public tracking)
- **Weekly Office Hours**: Every Thursday 2-3 PM UTC

### Urgent Issues
For critical bugs that block testing:
1. Post in Discord #beta-testers with "URGENT" prefix
2. Email beta@rinawarp.com with "URGENT" in subject
3. We'll respond within 1 hour

## 📝 Final Report Template

At the end of the beta, please provide a final report:

```markdown
# Beta Tester Final Report

## Overall Experience
- Rating: [1-5 stars]
- Would you use RinaWarp after beta? [Yes/No/Maybe]
- What's your favorite feature?
- What's your least favorite feature?

## Bugs Encountered
- [List bugs with status: Fixed/Unfixed/Workaround]

## Features Tested
- [List features with rating: Excellent/Good/Fair/Poor]

## Suggestions
- [List feature requests and improvements]

## Performance
- Startup time: [fast/medium/slow]
- Command execution: [fast/medium/slow]
- Memory usage: [low/medium/high]
- CPU usage: [low/medium/high]

## Safety
- Safety classifications: [Accurate/Inaccurate]
- Confirmation workflows: [Useful/Annoying]
- Rollback effectiveness: [Good/Fair/Poor]

## VS Code Integration
- Connection stability: [Good/Fair/Poor]
- Suggestion quality: [Good/Fair/Poor]
- Confirmation UI: [Good/Fair/Poor]

## Final Thoughts
- What would make you switch from your current terminal?
- What's missing that you need?
- Would you recommend RinaWarp to colleagues?
```

## 🎉 Public Launch Preparation

### What We're Looking For
1. **Stability**: No crashes, reliable execution
2. **Safety**: Effective command validation
3. **Performance**: Fast response times
4. **Usability**: Intuitive workflows
5. **Feedback**: Positive user experience

### Your Role
- Test thoroughly and provide honest feedback
- Report bugs promptly
- Suggest improvements
- Help us identify edge cases
- Shape the final product

### Next Steps
1. **After beta**: We'll analyze all feedback
2. **Fix critical bugs**: Before public launch
3. **Implement top features**: Based on demand
4. **Final testing**: Internal QA
5. **Public launch**: March 1, 2026

---

**Version**: 1.0.0-beta
**Last Updated**: 2026-01-15

Thank you for being part of the RinaWarp beta! Your contributions are invaluable in making this the best terminal experience possible.
