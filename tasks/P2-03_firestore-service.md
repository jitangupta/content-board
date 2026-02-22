# P2-03: Firestore Service Layer

> **Phase:** 2 — Auth & Data Layer (Sequential)
> **Branch:** `main`
> **Depends on:** P2-02 (types)
> **Status:** [ ] Not started

## Objective

Build the complete Firestore service layer — all CRUD operations, real-time listener, and status transition logic. After this task, every data operation the app needs exists in one file, fully typed and error-handled.

## Skills to Load

- `.claude/skills/firestore-patterns.md` (follow exactly)
- `.claude/skills/status-transitions.md` (for updateContentStatus)
- `.claude/skills/observability.md` (for captureError in catch blocks)

## Steps

1. **Create `src/services/firestore.ts`** — all Firestore operations:

   **Read operations:**
   - `subscribeToContents(callback)` — `onSnapshot` listener on the `contents` collection, ordered by phase + status + order. Returns unsubscribe function.

   **Write operations:**
   - `createContent(data: Partial<ContentItem>)` — adds doc with defaults (status: draft, phase: pre-production, timestamps.created: serverTimestamp)
   - `updateContent(contentId, updates)` — updates fields, sets timestamps.updated to serverTimestamp
   - `deleteContent(contentId)` — deletes the document

   **Status transition:**
   - `updateContentStatus(contentId, newStatus)` — validates transition using getValidTransitions, updates status + phase + the corresponding timestamp. Uses a Firestore transaction.
   - **Forward transition:** sets the timestamp for the new status (e.g., moving to `technically-ready` sets `timestamps.technicallyReady`)
   - **Backward transition:** clears the timestamp for the status being left (e.g., moving back from `technically-ready` to `draft` clears `timestamps.technicallyReady` to null)

   **Sub-document operations:**
   - `addDemoItem(contentId, demoItem)` — arrayUnion
   - `updateDemoItem(contentId, demoItem)` — read-modify-write in transaction
   - `removeDemoItem(contentId, demoItemId)` — arrayRemove
   - `addTalkingPoint(contentId, talkingPoint)` — arrayUnion
   - `updateTalkingPoint(contentId, talkingPoint)` — read-modify-write
   - `removeTalkingPoint(contentId, talkingPointId)` — arrayRemove
   - `reorderTalkingPoints(contentId, orderedIds)` — rewrite array with new order
   - `addLearning(contentId, learning)` — arrayUnion
   - `updateLearning(contentId, learning)` — read-modify-write
   - `removeLearning(contentId, learningId)` — arrayRemove
   - `addFeedback(contentId, feedback)` — arrayUnion
   - `removeFeedback(contentId, feedbackId)` — arrayRemove
   - `addLinkedContent(contentId, link)` — arrayUnion
   - `removeLinkedContent(contentId, linkId)` — arrayRemove

2. **Error handling pattern** — every function:
   ```typescript
   try {
     // Firestore operation
   } catch (error) {
     captureError(error, { operation: 'functionName', contentId });
     throw error; // re-throw so UI can show error state
   }
   ```

3. **Write tests:**
   - Mock Firestore SDK functions
   - Test createContent sets correct defaults
   - Test updateContentStatus validates transitions
   - Test updateContentStatus records correct timestamp
   - Test invalid transition throws error
   - Test error handling — errors are captured and re-thrown

## Acceptance Criteria

- [ ] `src/services/firestore.ts` exports all CRUD + subscription functions
- [ ] All functions use serverTimestamp() for created/updated fields
- [ ] `subscribeToContents` uses `onSnapshot` (not getDoc)
- [ ] `updateContentStatus` validates transitions before writing
- [ ] `updateContentStatus` uses a Firestore transaction
- [ ] Moving backward clears the timestamp for the status being left
- [ ] Every function has try/catch with `captureError` + re-throw
- [ ] Every function has explicit TypeScript return types
- [ ] No Firestore imports outside this file and `firebase.ts`
- [ ] Tests pass for CRUD, transitions, and error handling

## Files Created / Modified

- `src/services/firestore.ts` — complete Firestore service (NEW)
- `src/services/firestore.test.ts` — tests (NEW)
