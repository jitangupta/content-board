import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';

vi.mock('firebase/firestore', () => ({
  addDoc: vi.fn(),
  arrayRemove: vi.fn((...args: unknown[]) => ({ _arrayRemove: args })),
  arrayUnion: vi.fn((...args: unknown[]) => ({ _arrayUnion: args })),
  collection: vi.fn(() => 'contents-collection-ref'),
  deleteDoc: vi.fn(),
  doc: vi.fn((_db: unknown, _col: unknown, id: unknown) => `doc-ref-${id}`),
  onSnapshot: vi.fn(),
  orderBy: vi.fn((field: string) => `orderBy-${field}`),
  query: vi.fn((...args: unknown[]) => args),
  runTransaction: vi.fn(),
  serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
  updateDoc: vi.fn(),
  writeBatch: vi.fn(() => ({
    update: vi.fn(),
    commit: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock('@/services/firebase', () => ({
  db: 'mock-db',
}));

vi.mock('@/services/sentry', () => ({
  captureError: vi.fn(),
}));

import {
  addDoc,
  deleteDoc,
  onSnapshot,
  runTransaction,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { captureError } from '@/services/sentry';
import {
  createContent,
  deleteContent,
  reorderContents,
  subscribeToContents,
  updateContent,
  updateContentStatus,
} from '@/services/firestore';

describe('firestore service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('subscribeToContents', () => {
    it('calls onSnapshot with query ordered by phase and order', () => {
      const callback = vi.fn();
      const onError = vi.fn();

      subscribeToContents(callback, onError);

      expect(onSnapshot).toHaveBeenCalledOnce();
      const [q, , errorHandler] = (onSnapshot as Mock).mock.calls[0];
      expect(q).toContain('orderBy-phase');
      expect(q).toContain('orderBy-order');
      expect(errorHandler).toBe(onError);
    });

    it('returns unsubscribe function', () => {
      const unsubscribe = vi.fn();
      (onSnapshot as Mock).mockReturnValue(unsubscribe);

      const result = subscribeToContents(vi.fn(), vi.fn());

      expect(result).toBe(unsubscribe);
    });
  });

  describe('createContent', () => {
    it('creates doc with defaults and returns id', async () => {
      (addDoc as Mock).mockResolvedValue({ id: 'new-id' });

      const id = await createContent({ title: 'Test Video' });

      expect(id).toBe('new-id');
      expect(addDoc).toHaveBeenCalledOnce();

      const docData = (addDoc as Mock).mock.calls[0][1];
      expect(docData.title).toBe('Test Video');
      expect(docData.status).toBe('draft');
      expect(docData.phase).toBe('pre-production');
      expect(docData.description).toBe('');
      expect(docData.tags).toEqual([]);
      expect(docData.demoItems).toEqual([]);
      expect(docData.talkingPoints).toEqual([]);
      expect(docData.youtubeUrl).toBeNull();
      expect(docData.timestamps.created).toBe('SERVER_TIMESTAMP');
      expect(docData.timestamps.updated).toBe('SERVER_TIMESTAMP');
      expect(docData.timestamps.technicallyReady).toBeNull();
    });

    it('captures error and re-throws on failure', async () => {
      const error = new Error('permission-denied');
      (addDoc as Mock).mockRejectedValue(error);

      await expect(createContent({ title: 'Fail' })).rejects.toThrow(
        'permission-denied',
      );
      expect(captureError).toHaveBeenCalledWith(error, {
        operation: 'createContent',
      });
    });
  });

  describe('updateContent', () => {
    it('updates fields with timestamps.updated', async () => {
      (updateDoc as Mock).mockResolvedValue(undefined);

      await updateContent('c1', { title: 'Updated Title' });

      expect(updateDoc).toHaveBeenCalledWith('doc-ref-c1', {
        title: 'Updated Title',
        'timestamps.updated': 'SERVER_TIMESTAMP',
      });
    });

    it('captures error and re-throws on failure', async () => {
      const error = new Error('not-found');
      (updateDoc as Mock).mockRejectedValue(error);

      await expect(
        updateContent('c1', { title: 'Fail' }),
      ).rejects.toThrow('not-found');
      expect(captureError).toHaveBeenCalledWith(error, {
        operation: 'updateContent',
        contentId: 'c1',
      });
    });
  });

  describe('deleteContent', () => {
    it('deletes the document', async () => {
      (deleteDoc as Mock).mockResolvedValue(undefined);

      await deleteContent('c1');

      expect(deleteDoc).toHaveBeenCalledWith('doc-ref-c1');
    });

    it('captures error and re-throws on failure', async () => {
      const error = new Error('permission-denied');
      (deleteDoc as Mock).mockRejectedValue(error);

      await expect(deleteContent('c1')).rejects.toThrow('permission-denied');
      expect(captureError).toHaveBeenCalledWith(error, {
        operation: 'deleteContent',
        contentId: 'c1',
      });
    });
  });

  describe('updateContentStatus', () => {
    function setupTransaction(currentStatus: string) {
      (runTransaction as Mock).mockImplementation(
        async (_db: unknown, callback: (t: unknown) => Promise<void>) => {
          const mockTransaction = {
            get: vi.fn().mockResolvedValue({
              exists: () => true,
              data: () => ({ status: currentStatus }),
            }),
            update: vi.fn(),
          };
          await callback(mockTransaction);
          return mockTransaction;
        },
      );
    }

    it('allows valid forward transition and sets timestamp', async () => {
      setupTransaction('draft');

      await updateContentStatus('c1', 'technically-ready');

      const callback = (runTransaction as Mock).mock.calls[0][1];
      const mockTransaction = {
        get: vi.fn().mockResolvedValue({
          exists: () => true,
          data: () => ({ status: 'draft' }),
        }),
        update: vi.fn(),
      };
      await callback(mockTransaction);

      const updateData = mockTransaction.update.mock.calls[0][1];
      expect(updateData.status).toBe('technically-ready');
      expect(updateData.phase).toBe('pre-production');
      expect(updateData['timestamps.technicallyReady']).toBe(
        'SERVER_TIMESTAMP',
      );
      expect(updateData['timestamps.updated']).toBe('SERVER_TIMESTAMP');
    });

    it('allows valid backward transition and clears timestamp', async () => {
      setupTransaction('technically-ready');

      await updateContentStatus('c1', 'draft');

      const callback = (runTransaction as Mock).mock.calls[0][1];
      const mockTransaction = {
        get: vi.fn().mockResolvedValue({
          exists: () => true,
          data: () => ({ status: 'technically-ready' }),
        }),
        update: vi.fn(),
      };
      await callback(mockTransaction);

      const updateData = mockTransaction.update.mock.calls[0][1];
      expect(updateData.status).toBe('draft');
      expect(updateData.phase).toBe('pre-production');
      expect(updateData['timestamps.technicallyReady']).toBeNull();
    });

    it('rejects invalid transition', async () => {
      (runTransaction as Mock).mockImplementation(
        async (_db: unknown, callback: (t: unknown) => Promise<void>) => {
          const mockTransaction = {
            get: vi.fn().mockResolvedValue({
              exists: () => true,
              data: () => ({ status: 'draft' }),
            }),
            update: vi.fn(),
          };
          await callback(mockTransaction);
        },
      );

      await expect(
        updateContentStatus('c1', 'published'),
      ).rejects.toThrow('Invalid transition from "draft" to "published"');
    });

    it('throws if document not found', async () => {
      (runTransaction as Mock).mockImplementation(
        async (_db: unknown, callback: (t: unknown) => Promise<void>) => {
          const mockTransaction = {
            get: vi.fn().mockResolvedValue({
              exists: () => false,
              data: () => null,
            }),
            update: vi.fn(),
          };
          await callback(mockTransaction);
        },
      );

      await expect(
        updateContentStatus('c1', 'technically-ready'),
      ).rejects.toThrow('Content c1 not found');
    });

    it('captures error on failure', async () => {
      const error = new Error('transaction failed');
      (runTransaction as Mock).mockRejectedValue(error);

      await expect(
        updateContentStatus('c1', 'technically-ready'),
      ).rejects.toThrow('transaction failed');
      expect(captureError).toHaveBeenCalledWith(error, {
        operation: 'updateContentStatus',
        contentId: 'c1',
        newStatus: 'technically-ready',
      });
    });
  });

  describe('reorderContents', () => {
    it('batch updates order field for each content id', async () => {
      const mockBatch = {
        update: vi.fn(),
        commit: vi.fn().mockResolvedValue(undefined),
      };
      (writeBatch as Mock).mockReturnValue(mockBatch);

      await reorderContents(['id-a', 'id-b', 'id-c']);

      expect(writeBatch).toHaveBeenCalledWith('mock-db');
      expect(mockBatch.update).toHaveBeenCalledTimes(3);
      expect(mockBatch.update).toHaveBeenCalledWith('doc-ref-id-a', { order: 0 });
      expect(mockBatch.update).toHaveBeenCalledWith('doc-ref-id-b', { order: 1 });
      expect(mockBatch.update).toHaveBeenCalledWith('doc-ref-id-c', { order: 2 });
      expect(mockBatch.commit).toHaveBeenCalledOnce();
    });

    it('captures error and re-throws on failure', async () => {
      const error = new Error('batch failed');
      const mockBatch = {
        update: vi.fn(),
        commit: vi.fn().mockRejectedValue(error),
      };
      (writeBatch as Mock).mockReturnValue(mockBatch);

      await expect(reorderContents(['id-a'])).rejects.toThrow('batch failed');
      expect(captureError).toHaveBeenCalledWith(error, {
        operation: 'reorderContents',
      });
    });
  });
});
