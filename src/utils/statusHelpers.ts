import type { ContentPhase, ContentStatus, ContentTimestamps } from '@/types/content.ts';

export const STATUS_ORDER: ContentStatus[] = [
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

const PRE_PRODUCTION_STATUSES: ContentStatus[] = [
  'draft',
  'technically-ready',
  'shooting-script-ready',
  'ready-to-record',
];

const PRODUCTION_STATUSES: ContentStatus[] = ['recorded', 'edited'];

export function getPhaseForStatus(status: ContentStatus): ContentPhase {
  if (PRE_PRODUCTION_STATUSES.includes(status)) return 'pre-production';
  if (PRODUCTION_STATUSES.includes(status)) return 'production';
  return 'post-production';
}

export function getValidTransitions(currentStatus: ContentStatus): ContentStatus[] {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const transitions: ContentStatus[] = [];

  const prev = STATUS_ORDER[currentIndex - 1];
  if (prev !== undefined) {
    transitions.push(prev);
  }

  const next = STATUS_ORDER[currentIndex + 1];
  if (next !== undefined) {
    transitions.push(next);
  }

  return transitions;
}

export const STATUS_TIMESTAMP_MAP: Record<ContentStatus, keyof ContentTimestamps | null> = {
  'draft': null,
  'technically-ready': 'technicallyReady',
  'shooting-script-ready': 'shootingScriptReady',
  'ready-to-record': 'readyToRecord',
  'recorded': 'recorded',
  'edited': 'edited',
  'published': 'published',
  'extracted-shorts': 'shortsExtracted',
  'lifetime-value-ends': 'lifetimeValueEnds',
};

const STATUS_LABELS: Record<ContentStatus, string> = {
  'draft': 'Draft',
  'technically-ready': 'Technically Ready',
  'shooting-script-ready': 'Shooting Script Ready',
  'ready-to-record': 'Ready to Record',
  'recorded': 'Recorded',
  'edited': 'Edited',
  'published': 'Published',
  'extracted-shorts': 'Extracted Shorts',
  'lifetime-value-ends': 'Lifetime Value Ends',
};

export function getStatusLabel(status: ContentStatus): string {
  return STATUS_LABELS[status];
}
