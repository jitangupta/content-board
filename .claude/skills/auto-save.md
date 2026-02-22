---
name: auto-save
description: Auto-save pattern for Content Board — debounce on keystroke, immediate save on blur
when_to_use: "Use when implementing any form field, textarea, or input that writes to Firestore. Examples: 'add a title field', 'create the notes editor', 'build the description input'"
---

# Auto-Save Pattern

All editable fields in Content Board auto-save. No save buttons.

## Pattern

Two triggers, one save function:

1. **On blur** — save immediately when the user leaves the field
2. **On keystroke** — debounce 1500ms, then save. Resets on each keystroke

Both call the same service function. The debounce prevents hammering Firestore during typing. The blur ensures no data loss when switching tabs or closing the app.

## Implementation

```typescript
// src/hooks/useAutoSave.ts
import { useCallback, useRef } from 'react';

export function useAutoSave(
  saveFn: (value: string) => Promise<void>,
  debounceMs: number = 1500
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const latestValueRef = useRef<string>('');

  const debouncedSave = useCallback((value: string) => {
    latestValueRef.current = value;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => saveFn(value), debounceMs);
  }, [saveFn, debounceMs]);

  const immediateSave = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    saveFn(latestValueRef.current);
  }, [saveFn]);

  return { debouncedSave, immediateSave };
}
```

## Usage in Components

```typescript
const { debouncedSave, immediateSave } = useAutoSave(
  (value) => updateContentField(contentId, 'title', value)
);

<input
  onChange={(e) => debouncedSave(e.target.value)}
  onBlur={immediateSave}
/>
```

## Rules

- Auto-save goes through the service layer (`src/services/firestore.ts`), never direct Firestore calls
- The `updateContentField` service function also updates `timestamps.updated` automatically
- Show a subtle save indicator (small checkmark or "Saved" text) after successful save. No toasts for routine saves
- Show an error indicator if save fails. Retry once automatically, then show persistent error
- Never block the UI during save — saves are fire-and-forget with error handling
