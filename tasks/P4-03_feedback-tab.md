# P4-03: Feedback Tab

> **Phase:** 4 — Feature Tabs (Parallel)
> **Branch:** `feature/feedback-tab`
> **Worktree:** `../cb-feedback`
> **Depends on:** P3-03 (detail panel)
> **Parallel with:** P4-01 (production tab), P4-02 (learn tab)
> **Status:** [ ] Not started

## Objective

Build the Feedback tab where users collect feedback from multiple sources (self-reflection, peers, family, comments). After this task, the feedback capture flow works end to end.

## Skills to Load

- `.claude/skills/ui-patterns.md` (for list interactions, empty states)
- `.claude/skills/firestore-patterns.md` (for array operations)

## Steps

1. **Replace `src/components/DetailPanel/tabs/FeedbackTab.tsx`** (the placeholder):
   - Receives contentId from parent
   - Shows list of feedback for this content item
   - "Add Feedback" button

2. **Create `src/features/feedback/FeedbackList.tsx`**:
   - Each feedback shows: source badge, text, date added
   - "Add Feedback" button → inline form with source dropdown + textarea
   - Source options: Self, Peer, Family, Comment
   - Edit button per feedback → inline edit mode (same pattern as LearningList in P4-02)
   - Delete button per feedback (with confirm)
   - Date format: "Jan 15, 2026" using `Intl.DateTimeFormat`
   - Source badges: color-coded (Self = blue, Peer = purple, Family = green, Comment = orange)
   - Uses `addFeedback`, `updateFeedback`, `removeFeedback` from firestore service

3. **Create `src/features/feedback/useFeedback.ts`** — convenience hook

4. **Write tests:**
   - FeedbackList: add with source, edit inline, delete feedback
   - Source badges: correct colors per source

## Acceptance Criteria

- [ ] Feedback tab shows list of feedback with source badge and date
- [ ] Can add new feedback with source selection and text
- [ ] Can edit existing feedback inline (text and source)
- [ ] Can delete feedback (with confirmation)
- [ ] Source dropdown shows: Self, Peer, Family, Comment
- [ ] Source badges are color-coded
- [ ] Empty state: "No feedback yet. Collect feedback from yourself, peers, or viewers."
- [ ] Dates formatted with `Intl.DateTimeFormat`
- [ ] All operations go through service layer
- [ ] Tests pass

## Files Created / Modified

- `src/components/DetailPanel/tabs/FeedbackTab.tsx` (REPLACED)
- `src/features/feedback/FeedbackList.tsx` (NEW)
- `src/features/feedback/useFeedback.ts` (NEW)
