---
allowed-tools: Bash(npm:*), Bash(git:*), Read, Glob, Grep, Task
description: Security review focused on Content Board's threat model
---

# Security Check

Review the codebase against Content Board's security threat model.

## Checks

### 1. Firestore Security Rules
Read `firestore.rules` and verify:
- All reads/writes require `request.auth != null`
- Owner email check is present and correct
- No wildcard allows that bypass auth

### 2. Firebase Config Exposure
Grep for any actual secrets (service account keys, private keys) in the codebase:
```bash
git grep -i "private_key\|service_account\|FIREBASE_SERVICE_ACCOUNT" -- ':!.git'
```
**Expected**: Zero matches. Firebase client config (apiKey, projectId) is fine — it's not secret.

### 3. XSS Vectors
Grep for unsafe patterns:
```bash
git grep -n "dangerouslySetInnerHTML\|innerHTML\|eval(" -- 'src/'
```
**Expected**: Zero matches.

### 4. Content Security Policy
Read `firebase.json` and verify CSP headers are configured. Flag if missing.

### 5. Dependency Audit
```bash
npm audit --production
```
Report high and critical vulnerabilities.

### 6. Environment Files
Verify `.env.local` and any `.env.*` files are in `.gitignore`. Check no secrets committed:
```bash
git log --all --diff-filter=A -- '*.env*' '.env*'
```

### 7. Console Logs
```bash
git grep -n "console.log\|console.warn\|console.error" -- 'src/' ':!src/services/firebase.ts'
```
Flag any remaining console statements in production code.

## Output

Report each check as pass/fail with details. End with overall security posture assessment.
