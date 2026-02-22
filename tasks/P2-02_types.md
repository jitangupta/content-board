# P2-02: Types & Data Model

> **Phase:** 2 — Auth & Data Layer (Sequential)
> **Branch:** `main`
> **Depends on:** P2-01 (authentication)
> **Status:** [ ] Not started

## Objective

Define all TypeScript interfaces and types for the Content Board data model. These types are the contract — every other task imports from here. After this task, the full data shape is defined and status/phase helpers work.

## Skills to Load

- `.claude/skills/status-transitions.md` (for STATUS_ORDER, phase mapping)

## Steps

1. **Create `src/types/content.ts`** — core data model:
   ```typescript
   // Status union type (all 9 statuses)
   type ContentStatus = 'draft' | 'technically-ready' | 'shooting-script-ready' | 'ready-to-record' | 'recorded' | 'edited' | 'published' | 'extracted-shorts' | 'lifetime-value-ends';

   // Phase union type
   type ContentPhase = 'pre-production' | 'production' | 'post-production';

   // DemoItem interface
   interface DemoItem { id, type, description, verified }
   // DemoItem type: 'repo' | 'command' | 'live-coding' | 'config-file' | 'tool-setup'

   // TalkingPoint interface
   interface TalkingPoint { id, text, category, priority, order }
   // category: 'technical' | 'engagement' | 'cta'
   // priority: 'must-say' | 'nice-to-have'

   // LinkedContent interface
   interface LinkedContent { id, platform, url, label }
   // platform: 'blog' | 'linkedin' | 'twitter' | 'other'

   // Learning interface
   interface Learning { id, text, dateAdded, appliedInContentId }

   // Feedback interface
   interface Feedback { id, source, text, dateAdded }
   // source: 'self' | 'peer' | 'family' | 'comment'

   // Timestamps interface
   interface ContentTimestamps {
     created, technicallyReady, shootingScriptReady, readyToRecord,
     recorded, edited, published, shortsExtracted, lifetimeValueEnds, updated
   }

   // ContentItem — the main document
   interface ContentItem {
     id, title, description, tags, status, phase, order,
     youtubeUrl, demoItems, talkingPoints, shootingScript, thumbnailIdeas,
     linkedContent, notes, learnings, feedback, timestamps
   }
   ```

2. **Create `src/types/common.ts`** — shared types:
   ```typescript
   // DataState — three-state pattern for async data
   interface DataState<T> { data: T; loading: boolean; error: string | null; }

   // Action types for reducers
   type ContentAction =
     | { type: 'SET_CONTENTS'; payload: ContentItem[] }
     | { type: 'SET_LOADING'; payload: boolean }
     | { type: 'SET_ERROR'; payload: string }
     | { type: 'UPDATE_CONTENT'; payload: ContentItem }
     | { type: 'REMOVE_CONTENT'; payload: string };
   ```

3. **Create `src/utils/statusHelpers.ts`**:
   - `STATUS_ORDER` array (all 9 statuses in order)
   - `getPhaseForStatus(status)` — returns the phase
   - `getValidTransitions(currentStatus)` — returns allowed next/prev statuses
   - `STATUS_TIMESTAMP_MAP` — maps status to its timestamp field name
   - `getStatusLabel(status)` — human-readable label ("Technically Ready")

4. **Write tests for `statusHelpers.ts`:**
   - Test every status maps to correct phase
   - Test forward transitions (each status → next)
   - Test backward transitions (each status → prev)
   - Test invalid transitions are rejected
   - Test edge cases: first status has no backward, last has no forward

## Acceptance Criteria

- [ ] `src/types/content.ts` exports all interfaces: ContentItem, ContentStatus, ContentPhase, DemoItem, TalkingPoint, LinkedContent, Learning, Feedback, ContentTimestamps
- [ ] `src/types/common.ts` exports DataState and ContentAction
- [ ] All types use `interface` (not `type`) for object shapes
- [ ] ContentStatus is a discriminated union of exactly 9 string literals
- [ ] `src/utils/statusHelpers.ts` exports STATUS_ORDER, getPhaseForStatus, getValidTransitions, STATUS_TIMESTAMP_MAP, getStatusLabel
- [ ] Phase is always derived from status (getPhaseForStatus), never hardcoded separately
- [ ] `npx tsc --noEmit` passes
- [ ] All statusHelpers tests pass (forward, backward, invalid, edge cases)

## Files Created / Modified

- `src/types/content.ts` — all content-related interfaces (NEW)
- `src/types/common.ts` — shared types (NEW)
- `src/utils/statusHelpers.ts` — status/phase helpers (NEW)
- `src/utils/statusHelpers.test.ts` — tests (NEW)
