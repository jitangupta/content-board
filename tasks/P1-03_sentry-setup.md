# P1-03: Sentry Setup

> **Phase:** 1 — Foundation (Sequential)
> **Branch:** `main`
> **Depends on:** P1-01 (scaffolding)
> **Status:** [ ] Not started

## Objective

Configure Sentry error tracking with the service layer pattern, error boundary, and breadcrumb helpers. After this task, unhandled errors are captured and visible in the Sentry dashboard.

## Skills to Load

- `.claude/skills/observability.md` (follow this exactly)

## Steps

1. **Create Sentry project** (via sentry.io):
   - Create a new React project
   - Copy the DSN

2. **Create `src/services/sentry.ts`** — service layer for error tracking:
   - `initSentry()` — called once in `main.tsx`
   - `captureError(error, context?)` — wraps `Sentry.captureException`
   - `addBreadcrumb(category, message, data?)` — wraps `Sentry.addBreadcrumb`
   - `setUserContext(email)` / `clearUserContext()` — user identification
   - `enabled: import.meta.env.PROD` — no noise in development
   - `tracesSampleRate: 0` — errors only, no performance tracing

3. **Update `src/main.tsx`** — call `initSentry()` before `ReactDOM.createRoot`

4. **Update `src/App.tsx`** — wrap content in `Sentry.ErrorBoundary` with fallback UI:
   - Fallback shows "Something went wrong" + reload button
   - Error is automatically captured by Sentry

5. **Verify:** Throw a test error in a component, confirm it appears in Sentry dashboard (remove test error after verification)

## Acceptance Criteria

- [ ] `src/services/sentry.ts` exists with all 5 exported functions
- [ ] Sentry DSN is hardcoded in `sentry.ts` (not in .env — it's public)
- [ ] `initSentry()` is called in `main.tsx` before React renders
- [ ] `Sentry.ErrorBoundary` wraps the app in `App.tsx`
- [ ] Error fallback UI shows a message and reload button
- [ ] No `@sentry/react` imports outside `src/services/sentry.ts`
- [ ] Sentry is disabled in development (`enabled: import.meta.env.PROD`)
- [ ] `tracesSampleRate` is `0`
- [ ] Build succeeds with Sentry integrated

## Files Created / Modified

- `src/services/sentry.ts` — Sentry service layer (NEW)
- `src/main.tsx` — add `initSentry()` call (MODIFIED)
- `src/App.tsx` — add `Sentry.ErrorBoundary` wrapper (MODIFIED)
