import { describe, it, expect } from 'vitest';
import type { ContentStatus } from '@/types/content';
import {
  STATUS_ORDER,
  STATUS_TIMESTAMP_MAP,
  getNextStatus,
  getPhaseForStatus,
  getPreviousStatus,
  getStatusLabel,
  getValidTransitions,
} from '@/utils/statusHelpers';

describe('statusHelpers', () => {
  describe('STATUS_ORDER', () => {
    it('contains exactly 9 statuses', () => {
      expect(STATUS_ORDER).toHaveLength(9);
    });

    it('starts with draft and ends with lifetime-value-ends', () => {
      expect(STATUS_ORDER[0]).toBe('draft');
      expect(STATUS_ORDER[8]).toBe('lifetime-value-ends');
    });
  });

  describe('getPhaseForStatus', () => {
    it.each([
      ['draft', 'pre-production'],
      ['technically-ready', 'pre-production'],
      ['shooting-script-ready', 'pre-production'],
      ['ready-to-record', 'pre-production'],
    ] as const)('maps %s to pre-production', (status, phase) => {
      expect(getPhaseForStatus(status)).toBe(phase);
    });

    it.each([
      ['recorded', 'production'],
      ['edited', 'production'],
    ] as const)('maps %s to production', (status, phase) => {
      expect(getPhaseForStatus(status)).toBe(phase);
    });

    it.each([
      ['published', 'post-production'],
      ['extracted-shorts', 'post-production'],
      ['lifetime-value-ends', 'post-production'],
    ] as const)('maps %s to post-production', (status, phase) => {
      expect(getPhaseForStatus(status)).toBe(phase);
    });

    it('every status in STATUS_ORDER has a phase', () => {
      for (const status of STATUS_ORDER) {
        expect(getPhaseForStatus(status)).toBeDefined();
      }
    });
  });

  describe('getValidTransitions', () => {
    it('draft can only move forward to technically-ready', () => {
      expect(getValidTransitions('draft')).toEqual(['technically-ready']);
    });

    it('lifetime-value-ends can only move backward to extracted-shorts', () => {
      expect(getValidTransitions('lifetime-value-ends')).toEqual([
        'extracted-shorts',
      ]);
    });

    it('middle statuses can move forward and backward', () => {
      expect(getValidTransitions('recorded')).toEqual([
        'ready-to-record',
        'edited',
      ]);
    });

    it('every status has at least one valid transition', () => {
      for (const status of STATUS_ORDER) {
        const transitions = getValidTransitions(status);
        expect(transitions.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('forward transitions follow STATUS_ORDER sequence', () => {
      for (let i = 0; i < STATUS_ORDER.length - 1; i++) {
        const transitions = getValidTransitions(STATUS_ORDER[i]);
        expect(transitions).toContain(STATUS_ORDER[i + 1]);
      }
    });

    it('backward transitions follow STATUS_ORDER sequence', () => {
      for (let i = 1; i < STATUS_ORDER.length; i++) {
        const transitions = getValidTransitions(STATUS_ORDER[i]);
        expect(transitions).toContain(STATUS_ORDER[i - 1]);
      }
    });

    it('does not allow arbitrary jumps', () => {
      const transitions = getValidTransitions('draft');
      expect(transitions).not.toContain('recorded');
      expect(transitions).not.toContain('published');
    });
  });

  describe('STATUS_TIMESTAMP_MAP', () => {
    it('maps draft to null (uses created timestamp)', () => {
      expect(STATUS_TIMESTAMP_MAP['draft']).toBeNull();
    });

    it('maps every non-draft status to a timestamp field', () => {
      for (const status of STATUS_ORDER) {
        if (status === 'draft') continue;
        expect(STATUS_TIMESTAMP_MAP[status]).toBeTruthy();
      }
    });

    it('maps specific statuses to correct fields', () => {
      const expectedMappings: [ContentStatus, string][] = [
        ['technically-ready', 'technicallyReady'],
        ['shooting-script-ready', 'shootingScriptReady'],
        ['ready-to-record', 'readyToRecord'],
        ['recorded', 'recorded'],
        ['edited', 'edited'],
        ['published', 'published'],
        ['extracted-shorts', 'shortsExtracted'],
        ['lifetime-value-ends', 'lifetimeValueEnds'],
      ];
      for (const [status, field] of expectedMappings) {
        expect(STATUS_TIMESTAMP_MAP[status]).toBe(field);
      }
    });
  });

  describe('getNextStatus', () => {
    it('returns the next status in order', () => {
      expect(getNextStatus('draft')).toBe('technically-ready');
      expect(getNextStatus('recorded')).toBe('edited');
      expect(getNextStatus('published')).toBe('extracted-shorts');
    });

    it('returns null for the last status', () => {
      expect(getNextStatus('lifetime-value-ends')).toBeNull();
    });
  });

  describe('getPreviousStatus', () => {
    it('returns the previous status in order', () => {
      expect(getPreviousStatus('technically-ready')).toBe('draft');
      expect(getPreviousStatus('recorded')).toBe('ready-to-record');
      expect(getPreviousStatus('published')).toBe('edited');
    });

    it('returns null for the first status', () => {
      expect(getPreviousStatus('draft')).toBeNull();
    });
  });

  describe('getStatusLabel', () => {
    it('returns human-readable labels', () => {
      expect(getStatusLabel('draft')).toBe('Draft');
      expect(getStatusLabel('technically-ready')).toBe('Technically Ready');
      expect(getStatusLabel('shooting-script-ready')).toBe(
        'Shooting Script Ready',
      );
      expect(getStatusLabel('lifetime-value-ends')).toBe(
        'Lifetime Value Ends',
      );
    });

    it('every status has a label', () => {
      for (const status of STATUS_ORDER) {
        expect(getStatusLabel(status)).toBeTruthy();
      }
    });
  });
});
