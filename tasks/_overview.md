# Content Board — Task Overview

> Single source of truth for implementation progress. Each task file is self-contained — a new Claude session reads the task file and has everything needed to execute.

## How to Resume a Session

1. Open a new Claude Code terminal in the `content-board/` repo
2. Claude reads `CLAUDE.md` (auto-loaded) for guardrails
3. Point Claude to the specific task file: "Read `tasks/P3-01_sidebar.md` and implement it"
4. Claude reads the task, checks acceptance criteria, builds it
5. When done, update the status checkbox in this file AND in the task file

## How Parallel Development Works (Git Worktrees)

Phases 1-2 run sequentially in the main working directory. From Phase 3 onward, each task runs in its own git worktree on a separate branch. Multiple Claude terminals work simultaneously.

```bash
# Setup (run once from the repo root)
git worktree add ../cb-sidebar    feature/sidebar
git worktree add ../cb-detail     feature/detail-panel
git worktree add ../cb-production feature/production-tab

# Each Claude terminal gets its own folder
# Terminal 1: cd ../cb-sidebar     → works on P3-01
# Terminal 2: cd ../cb-detail      → works on P3-02
# Terminal 3: cd ../cb-production  → works on P4-01
```

After each task is complete: PR → review → merge to `main` → pull into other worktrees.

## Task Naming Convention

```
P{phase}-{sequence}_{short-name}.md
```

Example: `P3-01_sidebar.md` = Phase 3, first task, sidebar component.

---

## Phase 1 — Foundation (Sequential)

| Task | File | Branch | Status | Depends On |
|------|------|--------|--------|------------|
| Project scaffolding | `P1-01_scaffolding.md` | `main` | [x] | — |
| Firebase setup | `P1-02_firebase-setup.md` | `main` | [x] | P1-01 |
| Sentry setup | `P1-03_sentry-setup.md` | `main` | [x] | P1-01 |

## Phase 2 — Auth & Data Layer (Sequential)

| Task | File | Branch | Status | Depends On |
|------|------|--------|--------|------------|
| Authentication | `P2-01_authentication.md` | `main` | [x] | P1-02 |
| Types & data model | `P2-02_types.md` | `main` | [x] | P2-01 |
| Firestore service layer | `P2-03_firestore-service.md` | `main` | [x] | P2-02 |
| Content Context + reducer | `P2-04_content-context.md` | `main` | [x] | P2-03 |

## Phase 3 — Layout & Core UI (Parallel)

| Task | File | Branch | Status | Depends On |
|------|------|--------|--------|------------|
| Layout shell + routing | `P3-01_layout-shell.md` | `feature/layout-shell` | [x] | P2-04 |
| Sidebar + phase groups | `P3-02_sidebar.md` | `feature/sidebar` | [x] | P3-01 |
| Detail panel + Content tab | `P3-03_detail-panel.md` | `feature/detail-panel` | [x] | P3-01 |
| Status transitions UI | `P3-04_status-transitions.md` | `feature/status-transitions` | [ ] | P3-03 |

**Parallel strategy:** P3-01 (layout shell) must land first — it creates the Outlet structure. Then P3-02 and P3-03 run in parallel (sidebar and detail panel are separate component trees). P3-04 depends on P3-03.

## Phase 4 — Feature Tabs (Parallel)

| Task | File | Branch | Status | Depends On |
|------|------|--------|--------|------------|
| Production tab | `P4-01_production-tab.md` | `feature/production-tab` | [ ] | P3-03 |
| Learn tab | `P4-02_learn-tab.md` | `feature/learn-tab` | [ ] | P3-03 |
| Feedback tab | `P4-03_feedback-tab.md` | `feature/feedback-tab` | [ ] | P3-03 |

**Parallel strategy:** All three tabs are independent feature directories. Three agents, three worktrees, zero file conflicts.

## Phase 5 — Interactions & Search (Parallel)

| Task | File | Branch | Status | Depends On |
|------|------|--------|--------|------------|
| Drag-and-drop reordering | `P5-01_drag-and-drop.md` | `feature/dnd` | [ ] | P3-02 |
| Search + filter | `P5-02_search-filter.md` | `feature/search-filter` | [ ] | P3-02 |
| Auto-save | `P5-03_auto-save.md` | `feature/auto-save` | [ ] | P3-03 |

**Parallel strategy:** DnD touches sidebar, search touches sidebar filter, auto-save touches detail panel. Minimal overlap — can run in parallel with care.

## Phase 6 — Polish & Deploy (Parallel)

| Task | File | Branch | Status | Depends On |
|------|------|--------|--------|------------|
| PWA setup | `P6-01_pwa.md` | `feature/pwa` | [ ] | P1-01 |
| CI/CD pipelines | `P6-02_cicd.md` | `feature/cicd` | [ ] | P1-01 |
| Custom domain + Cloudflare | `P6-03_custom-domain.md` | `feature/custom-domain` | [ ] | P6-02 |
| Responsive mobile UI | `P6-04_responsive.md` | `feature/responsive` | [ ] | P3-01 |

**Parallel strategy:** PWA, CI/CD, and responsive are completely independent. Custom domain depends on CI/CD being set up first.

---

## Resumability Checklist

When starting a new session on any task:

1. **Read `CLAUDE.md`** — guardrails (auto-loaded if in repo root)
2. **Read the task file** — everything needed is self-contained
3. **Check git status** — which branch, any uncommitted work
4. **Check this overview** — understand what's done and what's in flight
5. **Read relevant skills** — task file tells you which `.claude/skills/` to load
