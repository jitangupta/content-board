# P5-02: Search + Filter

> **Phase:** 5 — Interactions & Search (Parallel)
> **Branch:** `feature/search-filter`
> **Worktree:** `../cb-search`
> **Depends on:** P3-02 (sidebar)
> **Parallel with:** P5-01 (dnd), P5-03 (auto-save)
> **Status:** [ ] Not started

## Objective

Add search by title/tags and filter by status/phase to the sidebar. After this task, users can quickly find content items in a growing list.

## Steps

1. **Create `src/components/Sidebar/SidebarSearch.tsx`**:
   - Search input at the top of the sidebar
   - Filters content items by title (case-insensitive substring match)
   - Also matches against tags
   - Debounce input by 300ms
   - Clear button (X) when search has text

2. **Create `src/components/Sidebar/SidebarFilter.tsx`**:
   - Dropdown filter below the search input
   - Options: All, Pre-Production, Production, Post-Production, or individual statuses
   - Use shadcn/ui Select component
   - Default: All

3. **Create `src/features/content/useContentFilters.ts`**:
   - Hook that accepts `contents[]`, `searchQuery`, `filterValue`
   - Returns filtered content array
   - Client-side filtering (Firestore doesn't support full-text search)
   - Memoize with `useMemo` to avoid re-filtering on every render

4. **Update `src/components/Sidebar/Sidebar.tsx`**:
   - Add SidebarSearch and SidebarFilter above the phase groups
   - Use `useContentFilters` to filter the content list
   - When filtering by a specific status, only show that phase group (expanded)
   - When search has no results, show "No results for '...'"

5. **Write tests:**
   - useContentFilters: filters by title, by tags, by status, combined
   - SidebarSearch: debounces input, clears on X
   - SidebarFilter: selects filter option

## Acceptance Criteria

- [ ] Search input filters content by title substring (case-insensitive)
- [ ] Search also matches tag values
- [ ] Search is debounced (300ms)
- [ ] Clear button appears when search has text
- [ ] Filter dropdown shows: All, Pre-Production, Production, Post-Production, + each status
- [ ] Filtering by phase shows only that phase group
- [ ] Search + filter work together (AND logic)
- [ ] "No results" message when nothing matches
- [ ] Filter and search state resets don't break the sidebar
- [ ] Tests pass

## Files Created / Modified

- `src/components/Sidebar/SidebarSearch.tsx` (NEW)
- `src/components/Sidebar/SidebarFilter.tsx` (NEW)
- `src/features/content/useContentFilters.ts` (NEW)
- `src/components/Sidebar/Sidebar.tsx` (MODIFIED)
