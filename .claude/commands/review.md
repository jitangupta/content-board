---
allowed-tools: Bash(git:*), Read, Glob, Grep, Task
description: Code review against Content Board standards
argument-hint: "[file or path to review]"
---

# Code Review

Review code changes against Content Board's coding standards and architecture rules.

## What to check

### Architecture
- No direct Firebase imports in components — all through `src/services/`
- No business logic in components — must be in hooks or utils
- Feature code stays within its `src/features/` directory
- Types defined in `src/types/`, not inline

### TypeScript
- No `any` types
- No `@ts-ignore` or `@ts-expect-error`
- No `as` type casting without a justification comment
- All function parameters and return types explicitly typed
- Interfaces used for object shapes (not `type` aliases)

### React
- Functional components only
- Props have typed interfaces
- No `dangerouslySetInnerHTML`
- No inline styles — Tailwind only
- No `useEffect` for data fetching — use `onSnapshot` listeners set up in providers
- Components handle loading, error, and empty states

### Firestore
- All operations go through service layer
- Error handling with try/catch on every async call
- `serverTimestamp()` used, never `new Date()`
- Listeners unsubscribed on unmount

### Auto-save
- Uses `useAutoSave` hook pattern (debounce + blur)
- Save indicator shown, not toasts
- Errors handled gracefully

### Status transitions
- Only valid transitions allowed (forward one, backward one)
- Timestamps recorded in service layer, not components
- Phase derived from status via `getPhaseForStatus()`

## Output

For each file, report:
- **Pass** — meets all standards
- **Issues** — list each violation with file, line, rule violated, and fix suggestion

End with a summary: X files reviewed, Y issues found.
