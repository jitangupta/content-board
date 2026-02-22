---
name: status-transitions
description: Status transition logic — valid transitions, timestamp recording, and phase derivation
when_to_use: "Use when implementing status changes, lifecycle management, or the status dropdown. Examples: 'change status to recorded', 'move content to published', 'build the status dropdown'"
---

# Status Transitions

## Lifecycle

```
Pre-Production:  draft → technically-ready → shooting-script-ready → ready-to-record
Production:      recorded → edited
Post-Production: published → extracted-shorts → lifetime-value-ends
```

## Valid Transitions

Status can only move forward or one step backward. No arbitrary jumps.

```typescript
// src/utils/statusHelpers.ts

const STATUS_ORDER: Status[] = [
  'draft',
  'technically-ready',
  'shooting-script-ready',
  'ready-to-record',
  'recorded',
  'edited',
  'published',
  'extracted-shorts',
  'lifetime-value-ends',
];

export function getValidTransitions(current: Status): Status[] {
  const currentIndex = STATUS_ORDER.indexOf(current);
  const next = STATUS_ORDER[currentIndex + 1];
  const prev = STATUS_ORDER[currentIndex - 1];
  return [prev, next].filter(Boolean) as Status[];
}

export function getPhaseForStatus(status: Status): Phase {
  const preProduction: Status[] = ['draft', 'technically-ready', 'shooting-script-ready', 'ready-to-record'];
  const production: Status[] = ['recorded', 'edited'];
  if (preProduction.includes(status)) return 'pre-production';
  if (production.includes(status)) return 'production';
  return 'post-production';
}
```

## Timestamp Recording

When status changes, the service layer records the timestamp automatically. Components never set timestamps directly.

```typescript
// In src/services/firestore.ts
export async function updateContentStatus(contentId: string, newStatus: Status): Promise<void> {
  const timestampField = STATUS_TIMESTAMP_MAP[newStatus];
  const update: Partial<Content> = {
    status: newStatus,
    phase: getPhaseForStatus(newStatus),
    'timestamps.updated': serverTimestamp(),
  };
  if (timestampField) {
    update[`timestamps.${timestampField}`] = serverTimestamp();
  }
  await updateDoc(doc(db, 'contents', contentId), update);
}
```

The `STATUS_TIMESTAMP_MAP`:

```typescript
const STATUS_TIMESTAMP_MAP: Record<Status, keyof Timestamps | null> = {
  'draft': null,  // created timestamp is set on creation, not transition
  'technically-ready': 'technicallyReady',
  'shooting-script-ready': 'shootingScriptReady',
  'ready-to-record': 'readyToRecord',
  'recorded': 'recorded',
  'edited': 'edited',
  'published': 'published',
  'extracted-shorts': 'shortsExtracted',
  'lifetime-value-ends': 'lifetimeValueEnds',
};
```

## Rules

- Phase is always derived from status using `getPhaseForStatus()`. Never store an inconsistent phase
- The status dropdown only shows valid transitions (forward one, backward one)
- Moving backward clears the timestamp for the status being left (e.g., going from `recorded` back to `ready-to-record` clears `timestamps.recorded`)
- All transition logic lives in `src/utils/statusHelpers.ts` and `src/services/firestore.ts`, never in components
