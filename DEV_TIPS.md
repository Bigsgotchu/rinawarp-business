# Development Tips

## Windows Line Ending Configuration

To avoid file churn and ensure consistent line endings across platforms:

```bash
git config --global core.autocrlf input
```

This setting ensures:

- Git converts CRLF to LF on commit (Unix/Linux/macOS)
- No conversion on checkout (preserves LF as-is)
- Prevents unnecessary line ending changes in PRs

## Quick Commands

- **Fast verification**: `pnpm verify:quick`
- **Strict verification**: `pnpm verify:strict`
- **Pre-commit check**: `pnpm precommit`
- **Release guard**: `pnpm release:guard`
- **Auto-fix commit**: `pnpm commit:fix`
- **Changed files only**: `pnpm verify:changed`

### Day-2 Ops Commands

- **Cache cleanup**: `pnpm ops:cache:cleanup`
- **Hook health check**: `pnpm ops:hook:health`
- **Enhanced release guard**: `pnpm ops:release:guard`
- **Format commit freezing**: `pnpm ops:format:freeze`

### Changelog Generation

- **Generate changelog**: `pnpm changelog:gen`

## Main Branch Protection

The pre-push hook now prevents accidental pushes to main with uncommitted changes:

```bash
# If you have uncommitted changes and try to push to main:
git push origin main
# ❌ Commit your changes before pushing to main
# 💡 Uncommitted changes found:
#  M modified-file.js
# ?? new-file.js
```

This ensures main branch always has clean, committed code.

## Quick Smoke Test (Local)

```bash
# 0) Ensure clean install & caches
pnpm install
pnpm -w exec rimraf .cache/eslint || true

# 1) Full repo sweep (fast)
pnpm verify:quick

# 2) CI-equivalent
pnpm verify:strict
pnpm -r test --if-present

# 3) Pre-commit path
git add -A
pnpm precommit
```

## Troubleshooting

**ESLint complains about missing files again?**

```bash
git update-index -g
```

**Cache weirdness after config edits?**

```bash
rimraf .cache/eslint && pnpm verify:quick
```

**Pre-push safety check**

- Pre-push hook automatically runs `pnpm verify:quick` before any push
- Ensures main branch never breaks

## Performance Tips

- ESLint uses cache: `.cache/eslint/`
- Staged fixes only process changed files
- Auto-skip empty file buckets
- Fast pre-commit with git index refresh
- CI caching for instant runs
- Git blame ignores formatting commits
- Tool versions locked to prevent drift

## CI Observability & Budget Alerts

The enhanced CI pipeline now provides detailed performance metrics:

### Performance Budgets

- **ESLint**: < 120s (cold) / < 30s (warm)
- **Stylelint**: < 60s (cold) / < 20s (warm)
- **Fix Pipeline**: < 180s total

### CI Metrics Tracked

- Cache hit/miss rates for each tool
- Individual tool execution times
- Total pipeline duration
- Changed files count and processing time
- Warning counts per tool

### Accessing CI Metrics

Check the GitHub Actions summary for detailed performance reports including:

- Tool-specific timing breakdowns
- Cache effectiveness analysis
- Performance budget compliance
- System health indicators

### Performance Optimization

If tools exceed budgets:

1. **Enable more aggressive caching**
2. **Review file change patterns**
3. **Consider parallel processing**
4. **Optimize lint rules**

## Git Blame Optimization

Format-only commits are automatically ignored in blame:

```bash
git config blame.ignoreRevsFile .git-blame-ignore-revs
```

To ignore a formatting commit:

```bash
git log --oneline | grep -i format
echo "commit-hash-here" >> .git-blame-ignore-revs
```

Or use the helper script:

```bash
./scripts/blame-add-format.sh
```

## Drift Shields & Dependency Management

### Automated Dependency Updates

- **Renovate Bot**: Weekly updates on Mondays at 05:00
- **Smart Grouping**: Linting tools, build tools, testing frameworks grouped together
- **Security First**: Vulnerability alerts merge immediately
- **Version Pinning**: Critical dependencies (like Electron) have manual review for major versions

### Node Version Consistency

- **.nvmrc**: Ensures local and CI use same Node.js version
- **GitHub Actions**: Automatically reads from `.nvmrc` file
- **Local Development**: Use `nvm use` to match CI environment

### Dependency Update Commands

```bash
# Check for outdated dependencies
pnpm outdated

# Update all dependencies
pnpm update

# Update specific package
pnpm update eslint

# Security audit
pnpm audit
```

## Emergency Bypasses (Use Sparingly)

**Skip hooks completely:**

```bash
git commit -m "wip" --no-verify
git push --no-verify
```

**Temporarily disable Husky:**

```bash
HUSKY=0 git commit -m "hotfix"
```

**Fix git index after bad chmod/rename:**

```bash
git update-index -g
```

## Enhanced Security Features

### Large File Protection

- CI automatically blocks files > 15MB
- Prevents repository bloat and performance issues

### Secret Detection

- Real-time scanning for API keys, tokens, passwords
- Blocks commits containing sensitive data
- Works with common secret patterns (AKIA, ASIA, etc.)

### Enhanced Release Safety

- Comprehensive pre-publish verification
- Security audit integration
- Provenance verification for releases

## 🚀 Ship-It Cheat Sheet

Quick confidence checks and maintenance commands:

### 60-Second Confidence Sweep

```bash
pnpm verify:quick && pnpm ops:hook:health && pnpm changelog:gen
```

Complete system validation in under a minute!

### Pre-Release Hard Gate

```bash
pnpm ops:release:guard && pnpm prepublish:verify:prod
```

Bulletproof pre-release validation.

### Routine Maintenance

```bash
pnpm ops:cache:cleanup
```

Weekly cache cleanup and system health check.

### Commit Tidy-Up

```bash
pnpm commit:fix
```

Fixes staged files, amends commit, and force-pushes current branch.

### Emergency Operations

```bash
# Skip all hooks (use sparingly)
git commit -m "hotfix" --no-verify

# Temporarily disable Husky
HUSKY=0 git commit -m "urgent fix"

# Fix git index issues
git update-index -g
```
