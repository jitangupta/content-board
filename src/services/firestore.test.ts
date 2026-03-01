import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockAddDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockDeleteDoc = vi.fn();
const mockOnSnapshot = vi.fn();
const mockRunTransaction = vi.fn();
const mockServerTimestamp = vi.fn();
const mockArrayUnion = vi.fn();
const mockDoc = vi.fn();
const mockCollection = vi.fn();
const mockQuery = vi.fn();
const mockOrderBy = vi.fn();

vi.mock('firebase/firestore', () => ({
  addDoc: (...args: unknown[]) => mockAddDoc(...args),
  updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
  deleteDoc: (...args: unknown[]) => mockDeleteDoc(...args),
  onSnapshot: (...args: unknown[]) => mockOnSnapshot(...args),
  runTransaction: (...args: unknown[]) => mockRunTransaction(...args),
  serverTimestamp: () => mockServerTimestamp(),
  arrayUnion: (...args: unknown[]) => mockArrayUnion(...args),
  doc: (...args: unknown[]) => mockDoc(...args),
  collection: (...args: unknown[]) => mockCollection(...args),
  query: (...args: unknown[]) => mockQuery(...args),
  orderBy: (...args: unknown[]) => mockOrderBy(...args),
}));

vi.mock('@/services/firebase', () => ({
  db: 'mock-db',
}));

const mockCaptureError = vi.fn();
const mockAddBreadcrumb = vi.fn();

vi.mock('@/services/sentry', () => ({
  captureError: (...args: unknown[]) => mockCaptureError(...args),
  addBreadcrumb: (...args: unknown[]) => mockAddBreadcrumb(...args),
}));

describe('firestore service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDoc.mockReturnValue('mock-doc-ref');
    mockCollection.mockReturnValue('mock-collection-ref');
    mockQuery.mockReturnValue('mock-query');
    mockOrderBy.mockReturnValue('mock-order');
    mockServerTimestamp.mockReturnValue('SERVER_TIMESTAMP');
  });

  describe('subscribeToContents', () => {
    it('sets up onSnapshot listener with correct ordering', async () => {
      const mockUnsubscribe = vi.fn();
      mockOnSnapshot.mockReturnValue(mockUnsubscribe);

      const { subscribeToContents } = await import('@/services/firestore');
      const callback = vi.fn();
      const onError = vi.fn();
      const unsub = subscribeToContents(callback, onError);

      expect(mockCollection).toHaveBeenCalledWith('mock-db', 'contents');
      expect(mockOrderBy).toHaveBeenCalledWith('phase');
      expect(mockOrderBy).toHaveBeenCalledWith('status');
      expect(mockOrderBy).toHaveBeenCalledWith('order');
      expect(mockOnSnapshot).toHaveBeenCalledOnce();
      expect(unsub).toBe(mockUnsubscribe);
    });

    it('maps snapshot docs to ContentItem array', async () => {
      mockOnSnapshot.mockImplementation(
        (_query: unknown, successCb: (snap: unknown) => void) => {
          successCb({
            docs: [
              { id: 'doc-1', data: () => ({ title: 'Test Video' }) },
              { id: 'doc-2', data: () => ({ title: 'Another Video' }) },
            ],
          });
          return vi.fn();
        },
      );

      const { subscribeToContents } = await import('@/services/firestore');
      const callback = vi.fn();
      subscribeToContents(callback, vi.fn());

      expect(callback).toHaveBeenCalledWith([
        { id: 'doc-1', title: 'Test Video' },
        { id: 'doc-2', title: 'Another Video' },
      ]);
    });
  });

  describe('createContent', () => {
    it('sets correct defaults for a new content item', async () => {
      mockAddDoc.mockResolvedValue({ id: 'new-doc-id' });

      const { createContent } = await import('@/services/firestore');
      const id = await createContent({ title: 'My Video' });

      expect(id).toBe('new-doc-id');
      expect(mockAddDoc).toHaveBeenCalledWith('mock-collection-ref', {
        title: 'My Video',
        description: '',
        tags: [],
        status: 'draft',
        phase: 'pre-production',
        order: 0,
        youtubeUrl: null,
        demoItems: [],
        talkingPoints: [],
        shootingScript: '',
        thumbnailIdeas: [],
        linkedContent: [],
        notes: '',
        learnings: [],
        feedback: [],
        timestamps: {
          created: 'SERVER_TIMESTAMP',
          technicallyReady: null,
          shootingScriptReady: null,
          readyToRecord: null,
          recorded: null,
          edited: null,
          published: null,
          shortsExtracted: null,
          lifetimeValueEnds: null,
          updated: 'SERVER_TIMESTAMP',
        },
      });
    });

    it('uses serverTimestamp for created and updated fields', async () => {
      mockAddDoc.mockResolvedValue({ id: 'new-id' });

      const { createContent } = await import('@/services/firestore');
      await createContent({});

      const calledWith = mockAddDoc.mock.calls[0][1] as Record<
        string,
        unknown
      >;
      const timestamps = calledWith.timestamps as Record<string, unknown>;
      expect(timestamps.created).toBe('SERVER_TIMESTAMP');
      expect(timestamps.updated).toBe('SERVER_TIMESTAMP');
    });

    it('adds breadcrumb after creation', async () => {
      mockAddDoc.mockResolvedValue({ id: 'abc' });

      const { createContent } = await import('@/services/firestore');
      await createContent({ title: 'Test' });

      expect(mockAddBreadcrumb).toHaveBeenCalledWith(
        'content',
        'Created content: "Test"',
        { contentId: 'abc' },
      );
    });

    it('captures error and re-throws on failure', async () => {
      const error = new Error('Firestore write failed');
      mockAddDoc.mockRejectedValue(error);

      const { createContent } = await import('@/services/firestore');

      await expect(createContent({ title: 'Fail' })).rejects.toThrow(
        'Firestore write failed',
      );
      expect(mockCaptureError).toHaveBeenCalledWith(error, {
        operation: 'createContent',
      });
    });
  });

  describe('updateContent', () => {
    it('calls updateDoc with updates and timestamps.updated', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      const { updateContent } = await import('@/services/firestore');
      await updateContent('doc-1', { title: 'Updated Title' });

      expect(mockUpdateDoc).toHaveBeenCalledWith('mock-doc-ref', {
        title: 'Updated Title',
        'timestamps.updated': 'SERVER_TIMESTAMP',
      });
    });

    it('captures error and re-throws on failure', async () => {
      const error = new Error('Update failed');
      mockUpdateDoc.mockRejectedValue(error);

      const { updateContent } = await import('@/services/firestore');

      await expect(
        updateContent('doc-1', { title: 'Fail' }),
      ).rejects.toThrow('Update failed');
      expect(mockCaptureError).toHaveBeenCalledWith(error, {
        operation: 'updateContent',
        contentId: 'doc-1',
      });
    });
  });

  describe('deleteContent', () => {
    it('calls deleteDoc and adds breadcrumb', async () => {
      mockDeleteDoc.mockResolvedValue(undefined);

      const { deleteContent } = await import('@/services/firestore');
      await deleteContent('doc-1');

      expect(mockDeleteDoc).toHaveBeenCalledWith('mock-doc-ref');
      expect(mockAddBreadcrumb).toHaveBeenCalledWith(
        'content',
        'Deleted content',
        { contentId: 'doc-1' },
      );
    });

    it('captures error and re-throws on failure', async () => {
      const error = new Error('Delete failed');
      mockDeleteDoc.mockRejectedValue(error);

      const { deleteContent } = await import('@/services/firestore');

      await expect(deleteContent('doc-1')).rejects.toThrow('Delete failed');
      expect(mockCaptureError).toHaveBeenCalledWith(error, {
        operation: 'deleteContent',
        contentId: 'doc-1',
      });
    });
  });

  describe('updateContentStatus', () => {
    const mockTransactionGet = vi.fn();
    const mockTransactionUpdate = vi.fn();

    beforeEach(() => {
      mockTransactionGet.mockReset();
      mockTransactionUpdate.mockReset();
      mockRunTransaction.mockImplementation(
        async (
          _db: unknown,
          callback: (transaction: unknown) => Promise<void>,
        ) => {
          return callback({
            get: mockTransactionGet,
            update: mockTransactionUpdate,
          });
        },
      );
    });

    it('validates transition and allows valid forward move', async () => {
      mockTransactionGet.mockResolvedValue({
        exists: () => true,
        data: () => ({ status: 'draft' }),
      });

      const { updateContentStatus } = await import('@/services/firestore');
      await updateContentStatus('doc-1', 'technically-ready');

      expect(mockTransactionUpdate).toHaveBeenCalledWith('mock-doc-ref', {
        status: 'technically-ready',
        phase: 'pre-production',
        'timestamps.updated': 'SERVER_TIMESTAMP',
        'timestamps.technicallyReady': 'SERVER_TIMESTAMP',
      });
    });

    it('sets correct timestamp for forward transition to recorded', async () => {
      mockTransactionGet.mockResolvedValue({
        exists: () => true,
        data: () => ({ status: 'ready-to-record' }),
      });

      const { updateContentStatus } = await import('@/services/firestore');
      await updateContentStatus('doc-1', 'recorded');

      expect(mockTransactionUpdate).toHaveBeenCalledWith('mock-doc-ref', {
        status: 'recorded',
        phase: 'production',
        'timestamps.updated': 'SERVER_TIMESTAMP',
        'timestamps.recorded': 'SERVER_TIMESTAMP',
      });
    });

    it('clears timestamp when moving backward', async () => {
      mockTransactionGet.mockResolvedValue({
        exists: () => true,
        data: () => ({ status: 'technically-ready' }),
      });

      const { updateContentStatus } = await import('@/services/firestore');
      await updateContentStatus('doc-1', 'draft');

      expect(mockTransactionUpdate).toHaveBeenCalledWith('mock-doc-ref', {
        status: 'draft',
        phase: 'pre-production',
        'timestamps.updated': 'SERVER_TIMESTAMP',
        'timestamps.technicallyReady': null,
      });
    });

    it('clears timestamp when moving backward from recorded to ready-to-record', async () => {
      mockTransactionGet.mockResolvedValue({
        exists: () => true,
        data: () => ({ status: 'recorded' }),
      });

      const { updateContentStatus } = await import('@/services/firestore');
      await updateContentStatus('doc-1', 'ready-to-record');

      expect(mockTransactionUpdate).toHaveBeenCalledWith('mock-doc-ref', {
        status: 'ready-to-record',
        phase: 'pre-production',
        'timestamps.updated': 'SERVER_TIMESTAMP',
        'timestamps.recorded': null,
      });
    });

    it('throws error for invalid transition', async () => {
      mockTransactionGet.mockResolvedValue({
        exists: () => true,
        data: () => ({ status: 'draft' }),
      });

      const { updateContentStatus } = await import('@/services/firestore');

      await expect(
        updateContentStatus('doc-1', 'published'),
      ).rejects.toThrow('Invalid transition from draft to published');
      expect(mockCaptureError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid transition from draft to published',
        }),
        { operation: 'updateContentStatus', contentId: 'doc-1' },
      );
    });

    it('throws error when document does not exist', async () => {
      mockTransactionGet.mockResolvedValue({
        exists: () => false,
      });

      const { updateContentStatus } = await import('@/services/firestore');

      await expect(
        updateContentStatus('missing', 'technically-ready'),
      ).rejects.toThrow('Content missing not found');
    });

    it('adds breadcrumb on successful transition', async () => {
      mockTransactionGet.mockResolvedValue({
        exists: () => true,
        data: () => ({ status: 'draft' }),
      });

      const { updateContentStatus } = await import('@/services/firestore');
      await updateContentStatus('doc-1', 'technically-ready');

      expect(mockAddBreadcrumb).toHaveBeenCalledWith(
        'status',
        'Status changed to technically-ready',
        { contentId: 'doc-1' },
      );
    });
  });

  describe('sub-document operations', () => {
    it('addDemoItem uses arrayUnion', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      const { addDemoItem } = await import('@/services/firestore');
      const demoItem = {
        id: 'demo-1',
        type: 'repo' as const,
        description: 'Test repo',
        verified: false,
      };
      await addDemoItem('doc-1', demoItem);

      expect(mockArrayUnion).toHaveBeenCalledWith(demoItem);
      expect(mockUpdateDoc).toHaveBeenCalledWith('mock-doc-ref', {
        demoItems: undefined,
        'timestamps.updated': 'SERVER_TIMESTAMP',
      });
    });

    it('removeDemoItem uses transaction read-modify-write', async () => {
      const mockTransactionGet = vi.fn();
      const mockTransactionUpdate = vi.fn();
      mockRunTransaction.mockImplementation(
        async (
          _db: unknown,
          callback: (transaction: unknown) => Promise<void>,
        ) => {
          return callback({
            get: mockTransactionGet,
            update: mockTransactionUpdate,
          });
        },
      );
      mockTransactionGet.mockResolvedValue({
        exists: () => true,
        data: () => ({
          demoItems: [
            {
              id: 'demo-1',
              type: 'repo',
              description: 'Keep',
              verified: true,
            },
            {
              id: 'demo-2',
              type: 'command',
              description: 'Remove',
              verified: false,
            },
          ],
        }),
      });

      const { removeDemoItem } = await import('@/services/firestore');
      await removeDemoItem('doc-1', 'demo-2');

      expect(mockTransactionUpdate).toHaveBeenCalledWith('mock-doc-ref', {
        demoItems: [
          {
            id: 'demo-1',
            type: 'repo',
            description: 'Keep',
            verified: true,
          },
        ],
        'timestamps.updated': 'SERVER_TIMESTAMP',
      });
    });

    it('reorderTalkingPoints rewrites array with new order', async () => {
      const mockTransactionGet = vi.fn();
      const mockTransactionUpdate = vi.fn();
      mockRunTransaction.mockImplementation(
        async (
          _db: unknown,
          callback: (transaction: unknown) => Promise<void>,
        ) => {
          return callback({
            get: mockTransactionGet,
            update: mockTransactionUpdate,
          });
        },
      );
      mockTransactionGet.mockResolvedValue({
        exists: () => true,
        data: () => ({
          talkingPoints: [
            {
              id: 'tp-1',
              text: 'First',
              category: 'technical',
              priority: 'must-say',
              order: 0,
            },
            {
              id: 'tp-2',
              text: 'Second',
              category: 'engagement',
              priority: 'nice-to-have',
              order: 1,
            },
          ],
        }),
      });

      const { reorderTalkingPoints } = await import('@/services/firestore');
      await reorderTalkingPoints('doc-1', ['tp-2', 'tp-1']);

      expect(mockTransactionUpdate).toHaveBeenCalledWith('mock-doc-ref', {
        talkingPoints: [
          {
            id: 'tp-2',
            text: 'Second',
            category: 'engagement',
            priority: 'nice-to-have',
            order: 0,
          },
          {
            id: 'tp-1',
            text: 'First',
            category: 'technical',
            priority: 'must-say',
            order: 1,
          },
        ],
        'timestamps.updated': 'SERVER_TIMESTAMP',
      });
    });
  });

  describe('error handling', () => {
    it('captures and re-throws errors from updateContent', async () => {
      const error = new Error('Permission denied');
      mockUpdateDoc.mockRejectedValue(error);

      const { updateContent } = await import('@/services/firestore');

      await expect(
        updateContent('doc-1', { title: 'Fail' }),
      ).rejects.toThrow('Permission denied');
      expect(mockCaptureError).toHaveBeenCalledWith(error, {
        operation: 'updateContent',
        contentId: 'doc-1',
      });
    });

    it('captures and re-throws errors from deleteContent', async () => {
      const error = new Error('Not found');
      mockDeleteDoc.mockRejectedValue(error);

      const { deleteContent } = await import('@/services/firestore');

      await expect(deleteContent('doc-1')).rejects.toThrow('Not found');
      expect(mockCaptureError).toHaveBeenCalledWith(error, {
        operation: 'deleteContent',
        contentId: 'doc-1',
      });
    });

    it('captures and re-throws errors from sub-document operations', async () => {
      const error = new Error('Array write failed');
      mockUpdateDoc.mockRejectedValue(error);

      const { addDemoItem } = await import('@/services/firestore');
      const demoItem = {
        id: 'd1',
        type: 'repo' as const,
        description: 'test',
        verified: false,
      };

      await expect(addDemoItem('doc-1', demoItem)).rejects.toThrow(
        'Array write failed',
      );
      expect(mockCaptureError).toHaveBeenCalledWith(error, {
        operation: 'addDemoItem',
        contentId: 'doc-1',
      });
    });
  });
});
