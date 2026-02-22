# P5-01: Drag-and-Drop Reordering

> **Phase:** 5 — Interactions & Search (Parallel)
> **Branch:** `feature/dnd`
> **Worktree:** `../cb-dnd`
> **Depends on:** P3-02 (sidebar)
> **Parallel with:** P5-02 (search), P5-03 (auto-save)
> **Status:** [ ] Not started

## Objective

Add drag-to-reorder for content items within pre-production statuses in the sidebar, and for talking points in the Production tab. After this task, users can prioritize their content pipeline and reorder talking points by dragging.

## Skills to Load

- None specific — follow @dnd-kit docs and CLAUDE.md rules

## Steps

1. **Create `src/hooks/useDragAndDrop.ts`**:
   - Generic hook wrapping @dnd-kit/core and @dnd-kit/sortable
   - Accepts an items array and an onReorder callback
   - Returns DndContext props, SortableContext props, and sensors

2. **Update `src/components/Sidebar/PhaseGroup.tsx`**:
   - Wrap Pre-Production items in SortableContext
   - Each ContentItem becomes a sortable item using `useSortable`
   - On drag end: update `order` field via service layer
   - Only Pre-Production phase supports reordering (Production and Post-Production are chronological)
   - Add drag handle icon to draggable items

3. **Update `src/features/production/TalkingPointList.tsx`** — add drag-to-reorder:
   - P4-01 renders talking points with static order numbers. This task replaces those with drag handles.
   - Wrap talking points in SortableContext
   - Each TalkingPoint becomes a sortable item using `useSortable`
   - On drag end: call `reorderTalkingPoints()` from service layer
   - Remove the static order numbers (drag handle replaces them)

4. **Create `src/services/firestore.ts` addition** — `reorderContents(orderedIds)`:
   - Batch write to update `order` field for each content item
   - Scope to Pre-Production items only

5. **Write tests:**
   - useDragAndDrop: returns correct DnD context structure
   - PhaseGroup: drag events trigger reorder callback
   - Verify only Pre-Production supports drag

## Acceptance Criteria

- [ ] Content items in Pre-Production phases can be dragged to reorder
- [ ] Production and Post-Production items cannot be dragged
- [ ] Drag handle is visible on draggable items
- [ ] New order persists to Firestore
- [ ] Talking points in Production tab can be reordered by drag
- [ ] Drag animations are smooth (@dnd-kit handles this)
- [ ] Keyboard drag support works (accessibility)
- [ ] Tests pass

## Files Created / Modified

- `src/hooks/useDragAndDrop.ts` (NEW)
- `src/components/Sidebar/PhaseGroup.tsx` (MODIFIED)
- `src/components/Sidebar/ContentItem.tsx` (MODIFIED — add sortable wrapper)
- `src/features/production/TalkingPointList.tsx` (MODIFIED)
- `src/services/firestore.ts` (MODIFIED — add reorderContents)
