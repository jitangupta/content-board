# P3-02: Sidebar + Phase Groups

> **Phase:** 3 — Layout & Core UI (Parallel with P3-03)
> **Branch:** `feature/sidebar`
> **Worktree:** `../cb-sidebar`
> **Depends on:** P3-01 (layout shell)
> **Parallel with:** P3-03 (detail panel) — no file conflicts
> **Status:** [ ] Not started

## Objective

Build the sidebar with collapsible phase groups, content item list with status badges, and item selection that updates the URL. After this task, users can browse their content organized by phase.

## Skills to Load

- `.claude/skills/status-transitions.md` (for phase grouping)
- `.claude/skills/ui-patterns.md` (for loading/empty states)

## Steps

1. **Create `src/components/Sidebar/Sidebar.tsx`**:
   - Consumes `useContent()` for the content list
   - Groups items by phase using `getPhaseForStatus()`
   - Renders three `PhaseGroup` components (Pre-Production, Production, Post-Production)
   - Shows loading skeleton while `loading === true`
   - Shows empty state when no content exists

2. **Create `src/components/Sidebar/PhaseGroup.tsx`**:
   - Collapsible section with phase name as header
   - Count badge showing number of items in the phase
   - Uses shadcn/ui Collapsible component
   - Default: all phases expanded

3. **Create `src/components/Sidebar/ContentItem.tsx`**:
   - Shows title (truncated if long)
   - StatusBadge showing current status with color
   - Click navigates to `/content/:contentId` using `useNavigate`
   - Highlight styling when selected (match URL param)

4. **Create `src/components/common/StatusBadge.tsx`**:
   - Color-coded badge per status
   - Pre-Production statuses: blue tones
   - Production statuses: amber/yellow tones
   - Post-Production statuses: green tones
   - `lifetime-value-ends`: gray

5. **Replace the sidebar placeholder** in `DashboardLayout.tsx` with `<Sidebar />`

6. **Write tests:**
   - Sidebar: renders phase groups, groups items correctly
   - PhaseGroup: collapses/expands on click
   - ContentItem: navigates on click, highlights when selected
   - StatusBadge: renders correct color for each status

## Acceptance Criteria

- [ ] Sidebar shows three collapsible phase groups
- [ ] Content items are grouped under the correct phase
- [ ] Each phase group shows item count
- [ ] Phase groups collapse/expand on click
- [ ] Clicking a content item navigates to `/content/:contentId`
- [ ] Selected item is visually highlighted
- [ ] Loading state shows skeleton UI
- [ ] Empty state says "No content yet" with a prompt to create
- [ ] StatusBadge shows correct color per status
- [ ] Tests pass

## Files Created / Modified

- `src/components/Sidebar/Sidebar.tsx` (NEW)
- `src/components/Sidebar/PhaseGroup.tsx` (NEW)
- `src/components/Sidebar/ContentItem.tsx` (NEW)
- `src/components/common/StatusBadge.tsx` (NEW)
- `src/components/DashboardLayout.tsx` (MODIFIED — replace placeholder)
