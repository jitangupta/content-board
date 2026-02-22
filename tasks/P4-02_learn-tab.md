# P4-02: Learn Tab

> **Phase:** 4 — Feature Tabs (Parallel)
> **Branch:** `feature/learn-tab`
> **Worktree:** `../cb-learn`
> **Depends on:** P3-03 (detail panel)
> **Parallel with:** P4-01 (production tab), P4-03 (feedback tab)
> **Status:** [ ] Not started

## Objective

Build the Learn tab where users capture learnings from each video and link them to future content. After this task, the learning capture flow works end to end.

## Skills to Load

- `.claude/skills/ui-patterns.md` (for list interactions, empty states)
- `.claude/skills/firestore-patterns.md` (for array operations)

## Steps

1. **Replace `src/components/DetailPanel/tabs/LearnTab.tsx`** (the placeholder):
   - Receives contentId from parent
   - Shows list of learnings for this content item
   - "Add Learning" button

2. **Create `src/features/learn/LearningList.tsx`**:
   - Each learning shows: text, date added, "Applied in" link (if set)
   - "Add Learning" button → inline textarea + save button
   - Edit button per learning → inline edit mode
   - Delete button per learning (with confirm)
   - Date format: "Jan 15, 2026" using `Intl.DateTimeFormat`
   - Uses `addLearning`, `updateLearning`, `removeLearning` from firestore service

3. **"Applied in" link:**
   - Dropdown of other content items (from useContent)
   - When selected, stores `appliedInContentId`
   - Shows as a clickable link that navigates to that content item

4. **Create `src/features/learn/useLearnings.ts`** — convenience hook

5. **Write tests:**
   - LearningList: add, edit, delete learnings
   - "Applied in" dropdown: shows other content items, saves selection

## Acceptance Criteria

- [ ] Learn tab shows list of learnings with date added
- [ ] Can add a new learning via inline form
- [ ] Can edit existing learnings inline
- [ ] Can delete learnings (with confirmation)
- [ ] "Applied in" dropdown shows other content items
- [ ] Selecting "Applied in" saves the linked content ID
- [ ] Clicking "Applied in" link navigates to that content item
- [ ] Empty state: "No learnings yet. Capture what you learned while creating this video."
- [ ] Dates formatted with `Intl.DateTimeFormat`
- [ ] All operations go through service layer
- [ ] Tests pass

## Files Created / Modified

- `src/components/DetailPanel/tabs/LearnTab.tsx` (REPLACED)
- `src/features/learn/LearningList.tsx` (NEW)
- `src/features/learn/useLearnings.ts` (NEW)
