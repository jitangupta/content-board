---
name: routing
description: React Router v6 route structure, URL patterns, and navigation
when_to_use: "Use when setting up routes, adding navigation, implementing deep-links, or building URL-based features. Examples: 'set up routing', 'add a route', 'deep link to content'"
---

# Routing

## Route Structure

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AuthGuard />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to="/content" replace />} />
            <Route path="/content" element={<ContentList />} />
            <Route path="/content/:contentId" element={<ContentDetail />} />
            <Route path="/content/:contentId/:tab" element={<ContentDetail />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## URL Patterns

```
/login                              → Login page (unauthenticated)
/content                            → Dashboard with no content selected
/content/:contentId                 → Content selected, Content tab active
/content/:contentId/production      → Content selected, Production tab active
/content/:contentId/learn           → Content selected, Learn tab active
/content/:contentId/feedback        → Content selected, Feedback tab active
```

## AuthGuard

Wraps all authenticated routes. Uses `<Outlet />` for nested rendering.

```typescript
// src/features/auth/AuthGuard.tsx
function AuthGuard() {
  const { user, loading } = useAuth();
  if (loading) return <FullPageSkeleton />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
```

## DashboardLayout

The persistent layout with Navbar and Sidebar. Detail panel renders via `<Outlet />`.

```typescript
// src/components/DashboardLayout.tsx
function DashboardLayout() {
  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

## Navigation

Use `useNavigate` for programmatic navigation, `<Link>` for clickable elements.

```typescript
// Clicking a content item in sidebar
const navigate = useNavigate();
const handleSelect = (contentId: string) => {
  navigate(`/content/${contentId}`);
};

// Tab navigation within detail panel
const handleTabChange = (tab: string) => {
  navigate(`/content/${contentId}/${tab}`);
};
```

## Reading URL Params

```typescript
// src/components/DetailPanel/DetailPanel.tsx
import { useParams } from 'react-router-dom';

function ContentDetail() {
  const { contentId, tab = 'content' } = useParams<{
    contentId: string;
    tab?: string;
  }>();
  // tab defaults to 'content' if not in URL
}
```

## Rules

- Never use `window.location` for navigation — always use React Router's `useNavigate` or `<Link>`
- All routes are client-side. Firebase Hosting must be configured to rewrite all paths to `index.html` (in `firebase.json`: `"rewrites": [{ "source": "**", "destination": "/index.html" }]`)
- The `contentId` in the URL is the Firestore document ID
- Tab names in URLs are lowercase: `content`, `production`, `learn`, `feedback`
- Invalid `contentId` or `tab` should show a "not found" state in the detail panel, not a 404 page
