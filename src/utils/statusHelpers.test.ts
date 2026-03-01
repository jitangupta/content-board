import { describe, expect, it } from 'vitest';
import type { ContentStatus } from '@/types/content.ts';
import {
  STATUS_ORDER,
  STATUS_TIMESTAMP_MAP,
  getPhaseForStatus,
  getStatusLabel,
  getValidTransitions,
} from './statusHelpers.ts';

describe('STATUS_ORDER', () => {
  it('contains exactly 9 statuses', () => {
    expect(STATUS_ORDER).toHaveLength(9);
  });

  it('lists statuses in correct lifecycle order', () => {
    expect(STATUS_ORDER).toEqual([
      'draft',
      'technically-ready',
      'shooting-script-ready',
      'ready-to-record',
      'recorded',
      'edited',
      'published',
      'extracted-shorts',
      'lifetime-value-ends',
    ]);
  });
});

describe('getPhaseForStatus', () => {
  it.each<[ContentStatus, string]>([
    ['draft', 'pre-production'],
    ['technically-ready', 'pre-production'],
    ['shooting-script-ready', 'pre-production'],
    ['ready-to-record', 'pre-production'],
  ])('maps %s to pre-production', (status, expectedPhase) => {
    expect(getPhaseForStatus(status)).toBe(expectedPhase);
  });

  it.each<[ContentStatus, string]>([
    ['recorded', 'production'],
    ['edited', 'production'],
  ])('maps %s to production', (status, expectedPhase) => {
    expect(getPhaseForStatus(status)).toBe(expectedPhase);
  });

  it.each<[ContentStatus, string]>([
    ['published', 'post-production'],
    ['extracted-shorts', 'post-production'],
    ['lifetime-value-ends', 'post-production'],
  ])('maps %s to post-production', (status, expectedPhase) => {
    expect(getPhaseForStatus(status)).toBe(expectedPhase);
  });
});

describe('getValidTransitions', () => {
  it('returns only forward transition for first status (draft)', () => {
    const transitions = getValidTransitions('draft');
    expect(transitions).toEqual(['technically-ready']);
  });

  it('returns only backward transition for last status (lifetime-value-ends)', () => {
    const transitions = getValidTransitions('lifetime-value-ends');
    expect(transitions).toEqual(['extracted-shorts']);
  });

  it.each<[ContentStatus, ContentStatus[]]>([
    ['technically-ready', ['draft', 'shooting-script-ready']],
    ['shooting-script-ready', ['technically-ready', 'ready-to-record']],
    ['ready-to-record', ['shooting-script-ready', 'recorded']],
    ['recorded', ['ready-to-record', 'edited']],
    ['edited', ['recorded', 'published']],
    ['published', ['edited', 'extracted-shorts']],
    ['extracted-shorts', ['published', 'lifetime-value-ends']],
  ])('returns prev and next for %s', (status, expected) => {
    expect(getValidTransitions(status)).toEqual(expected);
  });

  it('does not allow arbitrary jumps', () => {
    const transitions = getValidTransitions('draft');
    expect(transitions).not.toContain('recorded');
    expect(transitions).not.toContain('published');
  });
});

describe('STATUS_TIMESTAMP_MAP', () => {
  it('maps draft to null (created timestamp set on creation)', () => {
    expect(STATUS_TIMESTAMP_MAP['draft']).toBeNull();
  });

  it.each<[ContentStatus, string]>([
    ['technically-ready', 'technicallyReady'],
    ['shooting-script-ready', 'shootingScriptReady'],
    ['ready-to-record', 'readyToRecord'],
    ['recorded', 'recorded'],
    ['edited', 'edited'],
    ['published', 'published'],
    ['extracted-shorts', 'shortsExtracted'],
    ['lifetime-value-ends', 'lifetimeValueEnds'],
  ])('maps %s to %s', (status, timestampField) => {
    expect(STATUS_TIMESTAMP_MAP[status]).toBe(timestampField);
  });

  it('has an entry for every status in STATUS_ORDER', () => {
    for (const status of STATUS_ORDER) {
      expect(STATUS_TIMESTAMP_MAP).toHaveProperty(status);
    }
  });
});

describe('getStatusLabel', () => {
  it.each<[ContentStatus, string]>([
    ['draft', 'Draft'],
    ['technically-ready', 'Technically Ready'],
    ['shooting-script-ready', 'Shooting Script Ready'],
    ['ready-to-record', 'Ready to Record'],
    ['recorded', 'Recorded'],
    ['edited', 'Edited'],
    ['published', 'Published'],
    ['extracted-shorts', 'Extracted Shorts'],
    ['lifetime-value-ends', 'Lifetime Value Ends'],
  ])('returns "%s" label as "%s"', (status, label) => {
    expect(getStatusLabel(status)).toBe(label);
  });
});
