---
name: firestore-patterns
description: Firestore service layer patterns — listeners, CRUD, error handling, offline support
when_to_use: "Use when writing any Firestore operation, setting up real-time listeners, or handling Firebase errors. Examples: 'add Firestore listener', 'create content in Firestore', 'set up offline persistence'"
---

# Firestore Patterns

## Service Layer Structure

All Firestore operations live in `src/services/firestore.ts`. Components import from here, never from `firebase/firestore` directly.

```typescript
// src/services/firestore.ts
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, where, serverTimestamp,
  enableIndexedDbPersistence,
} from 'firebase/firestore';
import { db } from './firebase';
```

## Real-Time Listeners

Use `onSnapshot` for all data reads. No `getDoc`/`getDocs` except one-time lookups.

```typescript
export function subscribeToContents(
  callback: (contents: Content[]) => void,
  onError: (error: Error) => void
): () => void {
  const q = query(
    collection(db, 'contents'),
    orderBy('phase'),
    orderBy('order')
  );
  return onSnapshot(q, (snapshot) => {
    const contents = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Content[];
    callback(contents);
  }, onError);
}
```

The returned unsubscribe function must be called on component unmount.

## Connecting Listeners to Context

```typescript
// src/features/content/ContentProvider.tsx
useEffect(() => {
  const unsubscribe = subscribeToContents(
    (contents) => dispatch({ type: 'SET_CONTENTS', payload: contents }),
    (error) => dispatch({ type: 'SET_ERROR', payload: error.message })
  );
  return unsubscribe;
}, []);
```

## CRUD Operations

```typescript
export async function createContent(title: string): Promise<string> {
  const newContent: Omit<Content, 'id'> = {
    title,
    description: '',
    tags: [],
    status: 'draft',
    phase: 'pre-production',
    order: 0,  // will be set by reorder logic
    youtubeUrl: null,
    // ... all fields with defaults
    timestamps: {
      created: serverTimestamp(),
      updated: serverTimestamp(),
      // all others null
    },
  };
  const docRef = await addDoc(collection(db, 'contents'), newContent);
  return docRef.id;
}

export async function updateContentField(
  contentId: string,
  field: string,
  value: unknown
): Promise<void> {
  await updateDoc(doc(db, 'contents', contentId), {
    [field]: value,
    'timestamps.updated': serverTimestamp(),
  });
}

export async function deleteContent(contentId: string): Promise<void> {
  await deleteDoc(doc(db, 'contents', contentId));
}
```

## Error Handling

Every service function is async and must be wrapped in try/catch at the call site. The service layer throws, the caller catches and updates UI state.

```typescript
// In a hook or component
try {
  await createContent('New Video Idea');
} catch (error) {
  if (error instanceof FirebaseError) {
    if (error.code === 'permission-denied') {
      setError('You do not have permission. Are you signed in?');
    } else {
      setError(`Database error: ${error.message}`);
    }
  } else {
    setError('An unexpected error occurred');
  }
}
```

## Offline Persistence

Enable once at app startup:

```typescript
// src/services/firebase.ts — called once during init
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open — persistence can only be enabled in one tab
    console.warn('Firestore persistence unavailable: multiple tabs open');
  } else if (err.code === 'unimplemented') {
    // Browser doesn't support persistence
    console.warn('Firestore persistence unavailable: browser unsupported');
  }
});
```

When offline, reads serve from cache, writes queue locally and sync when reconnected. No special handling needed in components.

## Rules

- Always use `serverTimestamp()` for timestamp fields, never `new Date()` or `Date.now()`
- Never read and write in the same operation (read-then-write creates race conditions). Use Firestore transactions for atomic updates if needed
- Batch related writes using `writeBatch()` when updating multiple documents
- Unsubscribe listeners on component unmount — leaked listeners cause memory leaks and unexpected updates
