# RinaWarp VS Code Extension - Audit, Clean & Verify Guide

This guide explains how to use the `audit-clean-verify.sh` script to maintain your VS Code extension project.

## Overview

The `audit-clean-verify.sh` script performs a comprehensive audit of your RinaWarp VS Code extension project, including:

1. **Project Structure Verification** - Checks for essential folders (src, out, media) and files
2. **Cleanup Operations** - Removes old VSIX files, stale documentation, and compiled JS
3. **Security Checks** - Verifies .env is properly gitignored
4. **Dependency Verification** - Ensures all required npm packages are installed
5. **Type Definition Checks** - Verifies TypeScript and VS Code type definitions
6. **Compilation** - Compiles TypeScript and reports errors
7. **VSIX Packaging** - Creates a test VSIX package and verifies its contents
8. **Sensitive Data Check** - Ensures no secrets or sensitive files are included

## Usage

### Basic Usage

Run the audit script from the extension directory:

```bash
cd rinawarp/apps/vscode-extension
./audit-clean-verify.sh
```

### Expected Output

The script provides color-coded output:

- **ℹ** (Blue) - Informational messages
- **✔** (Green) - Success/check passed
- **⚠** (Yellow) - Warnings (non-critical issues)
- **✗** (Red) - Errors (critical issues that need fixing)

### Exit Codes

- **0** - All checks passed (or only warnings present)
- **1** - Critical issues found that need attention

## What the Script Does

### 1. Folder Verification

Checks that essential directories exist:
- `src/` - Source TypeScript files
- `out/` - Compiled JavaScript output
- `media/` - Extension icons and assets

### 2. File Verification

Verifies essential files are present:
- `package.json` - Extension manifest
- `tsconfig.json` - TypeScript configuration
- `.gitignore` - Git ignore rules
- `README.md` - Project documentation
- `CHANGELOG.md` - Version history

### 3. Cleanup Operations

**Removes old VSIX files** - Any `.vsix` files found in the directory

**Removes stale documentation** - Any `.md` files except `README.md` and `CHANGELOG.md` (excluding files in `/docs/` and `/schemas/` directories)

**Cleans compiled JS** - Removes and recreates the `out/` directory

**Removes old VS Code extensions** - Deletes any `rinawarp*` extensions from `~/.vscode/extensions/` to prevent the "looping reload" issue caused by stale installs

### 4. Security Checks

- Verifies `.env` is in `.gitignore`
- Checks that `.env` file exists (for development)
- Later verifies VSIX doesn't contain sensitive files

### 5. Dependency Management

- Checks if `node_modules/` exists
- Installs dependencies if missing
- Verifies TypeScript and type definitions are installed
- Reinstalls missing type definitions if needed

### 6. TypeScript Compilation

- Runs `npm run compile`
- Verifies compilation was successful
- Checks that `out/` directory contains compiled files

### 7. VSIX Packaging

- Creates a test VSIX package using `vsce package --no-dependencies`
- Verifies the VSIX file was created
- Checks VSIX contents for expected files
- Verifies no sensitive files are included

## Troubleshooting

### Common Issues

#### Missing Dependencies

If you see errors about missing packages:

```bash
npm install
```

#### TypeScript Compilation Errors

If compilation fails:
1. Check the error messages in the output
2. Fix any TypeScript errors in your source files
3. Run the script again

#### vsce Command Not Found

Install VS Code Extension Manager globally:

```bash
npm install -g @vscode/vsce
```

#### Permission Issues

Make the script executable:

```bash
chmod +x audit-clean-verify.sh
```

## Best Practices

1. **Run before publishing** - Always run this script before creating a production VSIX
2. **Run before commits** - Use it to ensure your project is clean
3. **Run after major changes** - Verify everything still works
4. **Fix all errors** - Don't publish with critical issues
5. **Review warnings** - Address warnings when possible

## Integration with CI/CD

You can integrate this script into your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
name: RinaWarp Extension CI

on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Run Audit Script
        run: |
          cd rinawarp/apps/vscode-extension
          chmod +x audit-clean-verify.sh
          ./audit-clean-verify.sh
```

## Manual Verification

If you need to verify specific aspects manually:

### Check VSIX Contents

```bash
vsce package
unzip -l *.vsix
```

### Verify Type Definitions

```bash
ls -la node_modules/@types/
```

### Check Git Ignore

```bash
cat .gitignore
```

## Support

For issues with the script, check:
1. File permissions
2. Node.js and npm versions
3. Network connectivity (for npm install)
4. Disk space

If issues persist, review the script logic or open an issue in the project repository.
