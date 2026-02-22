---
allowed-tools: Bash(npm:*), Bash(npx:*), Bash(git:*)
description: Pre-deployment verification — lint, type-check, test, build, and audit
---

# Deploy Check

Run all verification steps before deploying to Firebase Hosting.

## Steps

### 1. Check git status
```bash
git status --porcelain
```
If there are uncommitted changes, warn and ask whether to proceed.

### 2. Lint
```bash
npx eslint src/ --max-warnings 0
```
**Success criteria**: Zero warnings, zero errors.

### 3. Type check
```bash
npx tsc --noEmit
```
**Success criteria**: No type errors.

### 4. Run tests
```bash
npx vitest run
```
**Success criteria**: All tests pass.

### 5. Build
```bash
npm run build
```
**Success criteria**: Build completes without errors. Report the bundle size from Vite output.

### 6. Security audit
```bash
npm audit --production
```
**Success criteria**: No high or critical vulnerabilities.

### 7. Report

Summarize results:
- Lint: pass/fail
- Types: pass/fail
- Tests: X passed, Y failed
- Build: pass/fail (bundle size)
- Audit: X vulnerabilities (high/critical)
- **GO / NO-GO** recommendation
