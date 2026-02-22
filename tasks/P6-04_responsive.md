# P6-04: Responsive Mobile UI

> **Phase:** 6 — Polish & Deploy (Parallel)
> **Branch:** `feature/responsive`
> **Worktree:** `../cb-responsive`
> **Depends on:** P3-01 (layout shell — needs the two-column layout to make responsive)
> **Parallel with:** P6-01 (PWA), P6-02 (CI/CD)
> **Status:** [ ] Not started

## Objective

Make the dashboard layout work on mobile screens (phones and tablets). After this task, the app is usable on a phone installed as a PWA.

## Steps

1. **Update `src/components/DashboardLayout.tsx`** — responsive behavior:
   - Desktop (≥768px): sidebar + detail panel side by side (current behavior)
   - Mobile (<768px): sidebar takes full width, detail panel takes full width
   - Mobile navigation: sidebar is a slide-out drawer or toggled panel
   - Selecting a content item on mobile navigates to detail view (hides sidebar)
   - "Back" button on detail view returns to sidebar

2. **Update `src/components/Navbar/Navbar.tsx`**:
   - Mobile: hamburger menu button (toggles sidebar)
   - Mobile: hide app title or make it shorter
   - "+ New Content" button always visible

3. **Update `src/components/Sidebar/Sidebar.tsx`**:
   - On mobile: renders as an overlay/drawer
   - Close on item selection (navigate to detail)
   - Close on outside tap

4. **Update `src/components/DetailPanel/TabNavigation.tsx`**:
   - On mobile: tabs scroll horizontally if needed
   - Or use a compact tab bar

5. **Update all form fields in tabs**:
   - Full-width inputs on mobile
   - Appropriate touch targets (min 44px height)
   - Adequate spacing between interactive elements

6. **Test on multiple screen sizes:**
   - 375px (iPhone SE)
   - 390px (iPhone 14)
   - 768px (iPad)
   - 1024px+ (desktop)

## Acceptance Criteria

- [ ] Layout switches from two-column to single-column at 768px breakpoint
- [ ] Mobile sidebar is a drawer/overlay, not inline
- [ ] Selecting a content item on mobile shows detail view (full width)
- [ ] Back button on mobile detail view returns to sidebar
- [ ] Navbar has hamburger menu on mobile
- [ ] All touch targets are ≥ 44px
- [ ] Forms are full-width on mobile
- [ ] Tabs are usable on mobile (scroll or compact layout)
- [ ] App is usable at 375px width (smallest common phone)

## Files Created / Modified

- `src/components/DashboardLayout.tsx` (MODIFIED)
- `src/components/Navbar/Navbar.tsx` (MODIFIED)
- `src/components/Sidebar/Sidebar.tsx` (MODIFIED)
- `src/components/DetailPanel/TabNavigation.tsx` (MODIFIED)
