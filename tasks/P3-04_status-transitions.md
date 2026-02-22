# P3-04: Status Transitions UI

> **Phase:** 3 — Layout & Core UI
> **Branch:** `feature/status-transitions`
> **Depends on:** P3-03 (detail panel — needs ContentTab to attach the transition UI)
> **Status:** [ ] Not started

## Objective

Add status transition controls to the detail panel — buttons to advance or revert a content item's status. After this task, users can move content through the full 9-stage lifecycle.

## Skills to Load

- `.claude/skills/status-transitions.md` (for valid transitions, timestamp recording)
- `.claude/skills/ui-patterns.md` (for confirm dialogs on backward transitions)

## Steps

1. **Create `src/components/DetailPanel/StatusTransition.tsx`**:
   - Shows current status with StatusBadge
   - "Advance" button → next valid status (forward transition)
   - "Move Back" button → previous valid status (backward transition)
   - Disable advance button if no forward transition exists
   - Hide move-back button if at first status (draft)
   - Backward transition shows a confirmation dialog (shadcn AlertDialog)
   - Calls `updateStatus(contentId, newStatus)` from useContent
   - Shows a brief success indicator after transition

2. **Add StatusTransition to the detail panel header** (above the tabs, visible on all tabs)

3. **Show timestamps for completed stages:**
   - Below the status controls, show a timeline or list of completed timestamps
   - Only show timestamps that have values
   - Format: "Technically Ready: Jan 15, 2026"
   - Use `Intl.DateTimeFormat` (no moment/dayjs)

4. **Write tests:**
   - StatusTransition: shows correct buttons for each status
   - Advance: calls updateStatus with next status
   - Move back: shows confirmation, calls updateStatus on confirm
   - Draft status: no move-back button
   - lifetime-value-ends: no advance button
   - Timestamps: displays correct dates

## Acceptance Criteria

- [ ] Advance button shows the next status label
- [ ] Clicking advance transitions to the next status
- [ ] Move-back button shows the previous status label
- [ ] Moving back shows a confirmation dialog
- [ ] Draft has no move-back button
- [ ] lifetime-value-ends has no advance button
- [ ] Completed timestamps are displayed
- [ ] Timestamps use `Intl.DateTimeFormat` (no external library)
- [ ] Transition errors show a toast/inline error
- [ ] Tests pass

## Files Created / Modified

- `src/components/DetailPanel/StatusTransition.tsx` (NEW)
- `src/components/DetailPanel/TimestampTimeline.tsx` (NEW)
- `src/components/DetailPanel/DetailPanel.tsx` (MODIFIED — add StatusTransition)
