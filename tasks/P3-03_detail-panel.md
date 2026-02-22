# P3-03: Detail Panel + Content Tab

> **Phase:** 3 — Layout & Core UI (Parallel with P3-02)
> **Branch:** `feature/detail-panel`
> **Worktree:** `../cb-detail`
> **Depends on:** P3-01 (layout shell)
> **Parallel with:** P3-02 (sidebar) — no file conflicts
> **Status:** [ ] Not started

## Objective

Build the detail panel with tab navigation and the Content tab form. After this task, users can select a content item and edit its core fields (title, description, tags, notes, YouTube URL, linked content).

## Skills to Load

- `.claude/skills/routing.md` (for tab URL pattern)
- `.claude/skills/ui-patterns.md` (for loading/error/empty states)

## Steps

1. **Create `src/components/DetailPanel/DetailPanel.tsx`**:
   - Reads `contentId` from URL params
   - Fetches the matching ContentItem from `useContent()`
   - Shows "Select a content item" empty state when no contentId
   - Shows "Content not found" error when contentId doesn't match
   - Renders `TabNavigation` + the active tab component

2. **Create `src/components/DetailPanel/TabNavigation.tsx`**:
   - Four tabs: Content, Production, Learn, Feedback
   - Uses shadcn/ui Tabs component
   - Active tab determined by URL param `:tab` (default: "content")
   - Clicking a tab navigates to `/content/:contentId/:tab`

3. **Create `src/components/DetailPanel/tabs/ContentTab.tsx`**:
   - Title: text input
   - Description: textarea (markdown support later)
   - Tags: ChipInput component (add/remove tags)
   - Status: read-only display with StatusBadge (transitions handled in P3-04)
   - YouTube URL: URL input (shown when status is published or later)
   - Linked Content: list of links with add/remove
   - Notes: textarea
   - **Interim save strategy (before P5-03 auto-save exists):** save on blur only. Each field calls `updateContent()` when the user leaves the field — NOT on every keystroke. P5-03 will later add debounced auto-save on typing + immediate save on blur.

4. **Create `src/components/common/ChipInput.tsx`**:
   - Input field where typing + Enter adds a chip
   - Each chip has an X button to remove
   - Returns array of strings

5. **Delete content button** in the detail panel header:
   - Delete icon/button next to the content title
   - Clicking shows shadcn AlertDialog: "Delete [title]? This cannot be undone."
   - On confirm: calls `deleteContent(contentId)` from useContent
   - After deletion: navigate to `/content` (no item selected)

6. **Linked Content section** in ContentTab:
   - List of existing links showing: platform badge, label, URL (clickable)
   - "Add Link" button → inline form with:
     - Platform dropdown (shadcn Select): Blog, LinkedIn, Twitter, Other
     - URL input (validated as URL format)
     - Label text input
   - Delete button per link (with confirm)
   - Uses `addLinkedContent`, `removeLinkedContent` from firestore service

7. **Create placeholder tab components** (will be built in Phase 4):
   - `ProductionTab.tsx` — "Production tab coming soon"
   - `LearnTab.tsx` — "Learn tab coming soon"
   - `FeedbackTab.tsx` — "Feedback tab coming soon"

8. **Replace the detail panel placeholder** in routes with `<DetailPanel />`

9. **Write tests:**
   - DetailPanel: shows empty state, shows content when selected
   - TabNavigation: renders 4 tabs, navigates on click
   - ContentTab: renders all fields, calls updateContent on change
   - ChipInput: adds chips on Enter, removes on X click
   - Delete: shows confirm dialog, calls deleteContent, navigates away
   - Linked content: add link, remove link

## Acceptance Criteria

- [ ] Detail panel shows content when a contentId is in the URL
- [ ] Detail panel shows "Select a content item" when no contentId
- [ ] Four tabs render and are clickable
- [ ] Tab navigation updates the URL (e.g., `/content/abc123/production`)
- [ ] Default tab is "content" when no tab in URL
- [ ] Content tab shows all fields: title, description, tags, status, YouTube URL, linked content, notes
- [ ] ChipInput adds tags on Enter, removes on X
- [ ] YouTube URL field only appears when status is published or later
- [ ] Delete button shows confirmation dialog, deletes on confirm, navigates to `/content`
- [ ] Linked content: can add with platform + URL + label, can remove
- [ ] Linked content URLs are validated
- [ ] Text fields save on blur only (not on every keystroke — P5-03 adds debounced auto-save later)
- [ ] Placeholder tabs exist for Production, Learn, Feedback
- [ ] Tests pass

## Files Created / Modified

- `src/components/DetailPanel/DetailPanel.tsx` (NEW)
- `src/components/DetailPanel/TabNavigation.tsx` (NEW)
- `src/components/DetailPanel/tabs/ContentTab.tsx` (NEW)
- `src/components/DetailPanel/tabs/ProductionTab.tsx` (NEW — placeholder)
- `src/components/DetailPanel/tabs/LearnTab.tsx` (NEW — placeholder)
- `src/components/DetailPanel/tabs/FeedbackTab.tsx` (NEW — placeholder)
- `src/components/common/ChipInput.tsx` (NEW)
- `src/App.tsx` (MODIFIED — replace route placeholder)
