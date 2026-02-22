# P3-01: Layout Shell + Routing

> **Phase:** 3 — Layout & Core UI (must land before P3-02 and P3-03)
> **Branch:** `feature/layout-shell`
> **Depends on:** P2-04 (content context)
> **Parallel:** No — this must merge first. P3-02 and P3-03 build on top of this.
> **Status:** [ ] Not started

## Objective

Create the dashboard layout with Navbar, Sidebar placeholder, and Detail Panel placeholder using React Router's Outlet pattern. After this task, the app shows a two-column layout with routing wired up.

## Skills to Load

- `.claude/skills/routing.md` (for route structure and URL patterns)
- `.claude/skills/ui-patterns.md` (for loading/empty states)

## Steps

1. **Create `src/components/Navbar/Navbar.tsx`**:
   - App title "Content Board" (left)
   - "+ New Content" button: calls `createContent` from useContent, then navigates to `/content/:newId` so the detail panel opens with Content tab active
   - User avatar + sign-out dropdown (right)
   - Use shadcn/ui DropdownMenu for the profile menu
   - Responsive: hamburger menu on mobile (future, just leave the hook point)

2. **Create `src/components/DashboardLayout.tsx`**:
   - Navbar at top (full width)
   - Below: two-column flex layout
     - Left: Sidebar area (placeholder div with border, ~280px width)
     - Right: `<Outlet />` for detail panel content
   - Responsive: on mobile, sidebar collapses (basic breakpoint, refined in P6-04)

3. **Update routing in `App.tsx`**:
   ```
   <Route element={<AuthGuard />}>
     <Route element={<DashboardLayout />}>
       <Route path="/" element={<Navigate to="/content" />} />
       <Route path="/content" element={<ContentListPlaceholder />} />
       <Route path="/content/:contentId" element={<DetailPanelPlaceholder />} />
       <Route path="/content/:contentId/:tab" element={<DetailPanelPlaceholder />} />
     </Route>
   </Route>
   ```

4. **Create placeholder components** (will be replaced in P3-02 and P3-03):
   - `ContentListPlaceholder` — "Select a content item" message
   - `DetailPanelPlaceholder` — reads `contentId` and `tab` from URL params, displays them

5. **Verify:** Navigation between routes works, layout is stable, sidebar and detail area are clearly separated.

## Acceptance Criteria

- [ ] Navbar shows app title, "+ New Content" button, and user profile
- [ ] Two-column layout: sidebar (fixed width left) + content area (flexible right)
- [ ] `<Outlet />` renders in the content area
- [ ] URL `/content` shows the content list placeholder
- [ ] URL `/content/:contentId` shows the detail placeholder with the correct ID
- [ ] URL `/content/:contentId/:tab` shows the correct tab name
- [ ] "+ New Content" button creates a new content item via service layer
- [ ] Sign-out works from the profile dropdown
- [ ] `npm run build` succeeds, no type errors

## Files Created / Modified

- `src/components/Navbar/Navbar.tsx` — top navigation bar (NEW)
- `src/components/DashboardLayout.tsx` — layout with sidebar + outlet (NEW)
- `src/App.tsx` — updated routing structure (MODIFIED)
