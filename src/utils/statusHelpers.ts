import type { ContentPhase, ContentStatus, ContentTimestamps, ContentType, ShortStatus } from '@/types/content';

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

export const SHORT_STATUS_ORDER: ShortStatus[] = [
  'draft',
  'ready-to-record',
  'recorded',
  'edited',
  'published',
];

const PHASE_MAP: Record<ContentStatus, ContentPhase> = {
  'draft': 'pre-production',
  'technically-ready': 'pre-production',
  'shooting-script-ready': 'pre-production',
  'ready-to-record': 'pre-production',
  'recorded': 'production',
  'edited': 'production',
  'published': 'post-production',
  'extracted-shorts': 'post-production',
  'lifetime-value-ends': 'post-production',
};

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

export const SHORT_STATUS_TIMESTAMP_MAP: Record<ShortStatus, keyof ContentTimestamps | null> = {
  'draft': null,
  'ready-to-record': 'readyToRecord',
  'recorded': 'recorded',
  'edited': 'edited',
  'published': 'published',
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

export function getPhaseForStatus(status: ContentStatus): ContentPhase {
  return PHASE_MAP[status];
}

export function getStatusOrderForType(contentType: ContentType): ContentStatus[] {
  return contentType === 'short' ? SHORT_STATUS_ORDER : STATUS_ORDER;
}

export function getStatusTimestampMap(contentType: ContentType): Record<string, keyof ContentTimestamps | null> {
  return contentType === 'short' ? SHORT_STATUS_TIMESTAMP_MAP : STATUS_TIMESTAMP_MAP;
}

export function getValidTransitions(currentStatus: ContentStatus): ContentStatus[] {
  const index = STATUS_ORDER.indexOf(currentStatus);
  const transitions: ContentStatus[] = [];

  if (index > 0) {
    transitions.push(STATUS_ORDER[index - 1]);
  }
  if (index < STATUS_ORDER.length - 1) {
    transitions.push(STATUS_ORDER[index + 1]);
  }

  return transitions;
}

export function getValidTransitionsForType(currentStatus: ContentStatus, contentType: ContentType): ContentStatus[] {
  const order = getStatusOrderForType(contentType);
  const index = order.indexOf(currentStatus);
  const transitions: ContentStatus[] = [];

  if (index > 0) {
    transitions.push(order[index - 1]);
  }
  if (index < order.length - 1) {
    transitions.push(order[index + 1]);
  }

  return transitions;
}

export function getNextStatus(status: ContentStatus): ContentStatus | null {
  const index = STATUS_ORDER.indexOf(status);
  return index < STATUS_ORDER.length - 1 ? STATUS_ORDER[index + 1] : null;
}

export function getNextStatusForType(status: ContentStatus, contentType: ContentType): ContentStatus | null {
  const order = getStatusOrderForType(contentType);
  const index = order.indexOf(status);
  return index >= 0 && index < order.length - 1 ? order[index + 1] : null;
}

export function getPreviousStatus(status: ContentStatus): ContentStatus | null {
  const index = STATUS_ORDER.indexOf(status);
  return index > 0 ? STATUS_ORDER[index - 1] : null;
}

export function getPreviousStatusForType(status: ContentStatus, contentType: ContentType): ContentStatus | null {
  const order = getStatusOrderForType(contentType);
  const index = order.indexOf(status);
  return index > 0 ? order[index - 1] : null;
}

export function getStatusLabel(status: ContentStatus): string {
  return STATUS_LABELS[status];
}
