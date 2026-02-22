# P6-02: CI/CD Pipelines

> **Phase:** 6 — Polish & Deploy (Parallel)
> **Branch:** `feature/cicd`
> **Worktree:** `../cb-cicd`
> **Depends on:** P1-01 (scaffolding)
> **Parallel with:** P6-01 (PWA), P6-04 (responsive)
> **Status:** [ ] Not started

## Objective

Set up GitHub Actions workflows for CI (lint, type-check, test, build on PRs) and CD (deploy to Firebase on merge to main). After this task, every PR is automatically validated and merges auto-deploy.

## Steps

1. **Create `.github/workflows/ci.yml`** — runs on PR:
   ```yaml
   name: CI
   on:
     pull_request:
       branches: [main]
   jobs:
     validate:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with: { node-version: 20, cache: npm }
         - run: npm ci
         - run: npx eslint src/ --max-warnings 0
         - run: npx tsc --noEmit
         - run: npx vitest run
         - run: npm run build
         - run: npm audit --audit-level=moderate
   ```

2. **Create `.github/workflows/deploy.yml`** — runs on push to main:
   ```yaml
   name: Deploy
   on:
     push:
       branches: [main]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with: { node-version: 20, cache: npm }
         - run: npm ci
         - run: npm run build
         - uses: FirebaseExtended/action-hosting-deploy@v0
           with:
             repoToken: ${{ secrets.GITHUB_TOKEN }}
             firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
             channelId: live
   ```

3. **Create `.github/workflows/claude-review.yml`** — Claude code review on PR (Video 7 content):
   - Trigger: PR opened, or `@claude` mentioned in PR comment
   - Uses Claude to review changed files
   - Posts review comments on the PR
   - Reference: this is content for Video 7

4. **Add Lighthouse CI step** to ci.yml:
   - Install `@lhci/cli`
   - Run Lighthouse against the built files
   - Assert: performance > 90, accessibility > 90, PWA passes
   - Fail the CI if thresholds aren't met

5. **Set up GitHub Secrets** (manual — document the steps):
   - `FIREBASE_SERVICE_ACCOUNT` — Firebase service account JSON
   - Instructions: Firebase Console → Project Settings → Service Accounts → Generate Key

6. **Verify:** Create a test PR, confirm CI runs, merge it, confirm deploy runs.

## Acceptance Criteria

- [ ] `.github/workflows/ci.yml` runs on every PR
- [ ] CI steps: lint, type-check, test, build, npm audit
- [ ] CI fails if any step fails (strict)
- [ ] `.github/workflows/deploy.yml` runs on push to main
- [ ] Deploy builds and deploys to Firebase Hosting
- [ ] `.github/workflows/claude-review.yml` exists (even as a placeholder)
- [ ] Lighthouse CI checks are included
- [ ] GitHub Secrets setup is documented in the task file
- [ ] `npm audit` step uses `--audit-level=moderate`

## Files Created / Modified

- `.github/workflows/ci.yml` (NEW)
- `.github/workflows/deploy.yml` (NEW)
- `.github/workflows/claude-review.yml` (NEW)
