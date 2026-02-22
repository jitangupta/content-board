# P2-04: Content Context + Reducer

> **Phase:** 2 — Auth & Data Layer (Sequential)
> **Branch:** `main`
> **Depends on:** P2-03 (Firestore service)
> **Status:** [ ] Not started

## Objective

Create the ContentProvider that connects Firestore real-time data to React state via useReducer. After this task, any component can consume live content data via `useContent()`.

## Skills to Load

- `.claude/skills/firestore-patterns.md` (for connecting onSnapshot to dispatch)
- `.claude/skills/ui-patterns.md` (for DataState three-state pattern)

## Steps

1. **Create `src/features/content/contentReducer.ts`**:
   - State shape: `DataState<ContentItem[]>` (data, loading, error)
   - Actions: SET_CONTENTS, SET_LOADING, SET_ERROR, UPDATE_CONTENT, REMOVE_CONTENT
   - Initial state: `{ data: [], loading: true, error: null }`

2. **Create `src/features/content/ContentProvider.tsx`**:
   - Uses `useReducer(contentReducer, initialState)`
   - In `useEffect`: calls `subscribeToContents()` which dispatches SET_CONTENTS on each snapshot
   - Returns unsubscribe on cleanup
   - Only subscribes when user is authenticated (uses `useAuth()`)
   - Provides: `contents`, `loading`, `error`, plus action wrappers:
     - `createContent(data)`
     - `updateContent(id, updates)`
     - `deleteContent(id)`
     - `updateStatus(id, newStatus)`

3. **Create `src/features/content/useContent.ts`**:
   - Hook that consumes ContentContext
   - Throws if used outside ContentProvider

4. **Wire into `App.tsx`**:
   - Wrap protected routes in `<ContentProvider>`
   - Placement: inside AuthProvider, wrapping the authenticated Outlet

5. **Write tests:**
   - ContentProvider: test that it subscribes on mount, unsubscribes on unmount
   - contentReducer: test all action types produce correct state
   - useContent: test it throws outside provider

## Acceptance Criteria

- [ ] `ContentProvider` subscribes to Firestore on mount
- [ ] `ContentProvider` unsubscribes on unmount (no memory leak)
- [ ] `ContentProvider` only subscribes when user is authenticated
- [ ] State follows DataState pattern: `{ data: ContentItem[], loading: boolean, error: string | null }`
- [ ] `useContent()` returns contents, loading, error, and action functions
- [ ] `useContent()` throws meaningful error if used outside provider
- [ ] Reducer handles all 5 action types correctly
- [ ] Action wrappers call service layer functions (not Firestore directly)
- [ ] `npx tsc --noEmit` passes
- [ ] Tests pass for reducer, provider lifecycle, and hook

## Files Created / Modified

- `src/features/content/contentReducer.ts` — reducer + actions (NEW)
- `src/features/content/ContentProvider.tsx` — context provider (NEW)
- `src/features/content/useContent.ts` — consumer hook (NEW)
- `src/features/content/contentReducer.test.ts` — reducer tests (NEW)
- `src/App.tsx` — add ContentProvider (MODIFIED)
