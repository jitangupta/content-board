---
name: observability
description: Sentry error tracking setup, error boundaries, and breadcrumb conventions
when_to_use: "Use when setting up error tracking, adding error boundaries, implementing breadcrumbs, or debugging error reporting. Examples: 'set up Sentry', 'add error boundary', 'track this error', 'add breadcrumbs'"
---

# Observability — Sentry

## Service Layer Setup

```typescript
// src/services/sentry.ts
import * as Sentry from '@sentry/react';

export function initSentry(): void {
  Sentry.init({
    dsn: 'https://YOUR_DSN@o0.ingest.sentry.io/0', // public, not secret
    environment: import.meta.env.MODE, // 'development' | 'production'
    enabled: import.meta.env.PROD, // only report in production
    tracesSampleRate: 0, // no performance tracing — we only want errors
    beforeSend(event) {
      // Strip any PII if needed
      return event;
    },
  });
}

export function captureError(error: unknown, context?: Record<string, string>): void {
  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, string>
): void {
  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level: 'info',
  });
}

export function setUserContext(email: string): void {
  Sentry.setUser({ email });
}

export function clearUserContext(): void {
  Sentry.setUser(null);
}
```

## Initialization

```typescript
// src/main.tsx
import { initSentry } from '@/services/sentry';

initSentry(); // call before React renders

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## Error Boundary

Wrap the app root in `Sentry.ErrorBoundary`. Provide a fallback UI that lets the user recover.

```typescript
// src/App.tsx
import * as Sentry from '@sentry/react';

function AppErrorFallback() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-gray-600">The error has been reported automatically.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Reload
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <Sentry.ErrorBoundary fallback={<AppErrorFallback />}>
      <BrowserRouter>
        {/* ... routes ... */}
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  );
}
```

## Error Handling in Service Layer

Every service function that catches errors must forward them to Sentry. Never swallow errors silently.

```typescript
// In src/services/firestore.ts
import { captureError } from '@/services/sentry';

export async function updateContent(
  contentId: string,
  updates: Partial<ContentItem>
): Promise<void> {
  try {
    const ref = doc(db, 'content', contentId);
    await updateDoc(ref, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    captureError(error, {
      operation: 'updateContent',
      contentId,
    });
    throw error; // re-throw so the UI can show an error state
  }
}
```

## Breadcrumb Conventions

Add breadcrumbs at key user action points so Sentry error reports include a trail of what the user did before the error.

| Category | When | Example message |
|---|---|---|
| `auth` | Login / logout | `User signed in` |
| `navigation` | Route change | `Navigated to /content/abc123` |
| `content` | CRUD on content items | `Created content: "Video Title"` |
| `status` | Status transitions | `Status changed: draft → technically-ready` |
| `ui` | Significant interactions | `Opened delete confirmation dialog` |

```typescript
// Example in auth service
import { addBreadcrumb, setUserContext } from '@/services/sentry';

export async function signIn(): Promise<void> {
  const result = await signInWithPopup(auth, googleProvider);
  setUserContext(result.user.email ?? 'unknown');
  addBreadcrumb('auth', 'User signed in');
}

// Example in status transition
import { addBreadcrumb } from '@/services/sentry';

export async function updateContentStatus(
  contentId: string,
  newStatus: ContentStatus
): Promise<void> {
  addBreadcrumb('status', `Status changed to ${newStatus}`, { contentId });
  // ... firestore update
}
```

## Rules

- `initSentry()` is called once in `main.tsx`, before `ReactDOM.createRoot`
- `Sentry.ErrorBoundary` wraps the entire app at the top level
- Components never import from `@sentry/react` — use `src/services/sentry.ts`
- Every `catch` block either re-throws or calls `captureError()` — never swallow
- Set user context on sign-in, clear on sign-out
- `enabled: import.meta.env.PROD` — no noise from development
- `tracesSampleRate: 0` — we only want error tracking, not performance tracing
