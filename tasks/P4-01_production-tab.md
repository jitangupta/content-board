# P4-01: Production Tab

> **Phase:** 4 — Feature Tabs (Parallel)
> **Branch:** `feature/production-tab`
> **Worktree:** `../cb-production`
> **Depends on:** P3-03 (detail panel)
> **Parallel with:** P4-02 (learn tab), P4-03 (feedback tab) — different feature directories
> **Status:** [ ] Not started

## Objective

Build the Production tab with demo items, talking points, shooting script, and thumbnail ideas. After this task, users can plan their video production within the app.

## Skills to Load

- `.claude/skills/ui-patterns.md` (for list interactions, empty states)
- `.claude/skills/firestore-patterns.md` (for array sub-document operations)

## Steps

1. **Replace `src/components/DetailPanel/tabs/ProductionTab.tsx`** (the placeholder):
   - Receives contentId from parent
   - Sections: Demo Items, Talking Points, Shooting Script, Thumbnail Ideas
   - Each section has a header and an "Add" button

2. **Create `src/features/production/DemoItemList.tsx`**:
   - List of demo items with: type badge, description, verified checkbox
   - "Add Demo Item" button → inline form (type dropdown + description input)
   - Type options: repo, command, live-coding, config-file, tool-setup
   - Checkbox to mark as "verified" (tested and working)
   - Delete button per item (with confirm)
   - Uses `addDemoItem`, `updateDemoItem`, `removeDemoItem` from firestore service

3. **Create `src/features/production/TalkingPointList.tsx`**:
   - Ordered list of talking points
   - Each point: text, category badge, priority flag
   - "Add Talking Point" button → inline form
   - Category options: technical, engagement, cta
   - Priority: must-say (red dot), nice-to-have (gray dot)
   - Display order numbers (1, 2, 3...) next to each point — drag-to-reorder is added later in P5-01
   - Uses `addTalkingPoint`, `updateTalkingPoint`, `removeTalkingPoint` from firestore service

4. **Shooting Script section:**
   - Textarea/markdown editor for the shooting script outline
   - Auto-saves via the content `shootingScript` field
   - Placeholder text: "Outline your scene-by-scene flow..."

5. **Thumbnail Ideas section:**
   - Simple textarea for visual concepts
   - Auto-saves via the content `thumbnailIdeas` field

6. **Create `src/features/production/useProduction.ts`** — convenience hook:
   - Wraps the firestore service functions for demo items and talking points
   - Provides loading/error state per operation

7. **Write tests:**
   - DemoItemList: add, verify, delete demo items
   - TalkingPointList: add, delete talking points (reorder via drag is P5-01)
   - ProductionTab: renders all four sections

## Acceptance Criteria

- [ ] Production tab shows four sections: Demo Items, Talking Points, Shooting Script, Thumbnail Ideas
- [ ] Can add a demo item with type and description
- [ ] Can mark demo items as verified (checkbox)
- [ ] Can delete demo items (with confirmation)
- [ ] Can add talking points with text, category, and priority
- [ ] Talking points display with order numbers, category badges, and priority indicators
- [ ] Talking points are NOT draggable yet (P5-01 adds drag-to-reorder later)
- [ ] Can delete talking points
- [ ] Shooting script textarea saves to Firestore
- [ ] Thumbnail ideas textarea saves to Firestore
- [ ] Empty states show helpful messages for each section
- [ ] All Firestore operations go through the service layer
- [ ] Tests pass

## Files Created / Modified

- `src/components/DetailPanel/tabs/ProductionTab.tsx` (REPLACED)
- `src/features/production/DemoItemList.tsx` (NEW)
- `src/features/production/TalkingPointList.tsx` (NEW)
- `src/features/production/useProduction.ts` (NEW)
