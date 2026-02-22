---
name: ui-patterns
description: UI patterns for loading states, error handling, empty states, and toasts
when_to_use: "Use when building any component that has loading, error, or empty states. Examples: 'show loading spinner', 'handle error state', 'empty state for content list', 'add toast notification'"
---

# UI Patterns

## Loading States

Use skeleton loaders for initial data load, not spinners. Skeletons feel faster because they show the layout shape.

```typescript
// Sidebar loading
function SidebarSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-4">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
    </div>
  );
}
```

Use inline spinners only for actions (saving, deleting) — small, next to the action trigger.

Three states every data component must handle:

```typescript
interface DataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
```

```typescript
if (loading) return <SidebarSkeleton />;
if (error) return <ErrorMessage message={error} onRetry={retry} />;
if (!data || data.length === 0) return <EmptyState />;
return <ContentList data={data} />;
```

## Error Handling in UI

Two types of errors, two patterns:

**Action errors** (save failed, delete failed) — show a toast notification. Don't block the UI. Auto-dismiss after 5 seconds. Include a retry action.

**Data errors** (listener failed, auth failed) — show inline error with a retry button, replacing the content area. Don't use toasts for persistent errors.

```typescript
// src/components/common/ErrorMessage.tsx
interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <p className="text-sm text-red-600 mb-3">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-sm text-blue-600 hover:underline">
          Try again
        </button>
      )}
    </div>
  );
}
```

## Toast Notifications

Use a simple toast system for action feedback. No external library needed for v1.

```typescript
// src/hooks/useToast.ts
// Provides: showToast(message, type) where type is 'success' | 'error' | 'info'
// Toast auto-dismisses after 5 seconds
// Only one toast visible at a time (new toast replaces old)
// Position: bottom-right, doesn't block sidebar or detail panel
```

When to toast:
- Content created — success toast
- Content deleted — success toast with undo (undo within 5 seconds)
- Save failed — error toast with retry
- Status changed — no toast (the sidebar position change is the feedback)

When NOT to toast:
- Auto-save success — show subtle inline indicator, not a toast
- Loading started — never toast for loading
- Routine operations — toasts are for outcomes, not processes

## Empty States

Every list needs an empty state. Never show a blank area.

```typescript
// Sidebar when no content exists
function EmptyContentList() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
      <p className="text-sm mb-2">No content yet</p>
      <p className="text-xs">Click "+ New Content" to get started</p>
    </div>
  );
}

// Filtered list with no matches
function NoFilterResults({ filter }: { filter: string }) {
  return (
    <div className="p-4 text-center text-gray-500 text-sm">
      No content matching "{filter}"
    </div>
  );
}
```

## Confirm Dialogs

Use for destructive actions only: delete content. Not for status changes (those are reversible).

```typescript
// Use shadcn/ui AlertDialog for confirm dialogs
// Always tell the user what will be lost: "This will permanently delete [title] and all its learnings and feedback."
// Primary action button uses red/destructive styling
// Cancel is always the default focused button
```

## Rules

- Every component that fetches data must handle all three states: loading, error, data (including empty)
- Skeletons for initial load, spinners for actions, never both at the same time
- Error messages must be user-friendly. Never show raw Firebase error codes to the user
- Toasts for action feedback only, inline errors for persistent data issues
- Empty states always tell the user what to do next
