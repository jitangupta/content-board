import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { type ReactNode } from 'react';

const mockSubscribeToContents = vi.fn();
const mockCreateContent = vi.fn();
const mockUpdateContent = vi.fn();
const mockDeleteContent = vi.fn();
const mockUpdateContentStatus = vi.fn();

vi.mock('@/services/firestore', () => ({
  subscribeToContents: (...args: unknown[]) =>
    mockSubscribeToContents(...args),
  createContent: (...args: unknown[]) => mockCreateContent(...args),
  updateContent: (...args: unknown[]) => mockUpdateContent(...args),
  deleteContent: (...args: unknown[]) => mockDeleteContent(...args),
  updateContentStatus: (...args: unknown[]) =>
    mockUpdateContentStatus(...args),
}));

const mockUseAuth = vi.fn();

vi.mock('@/features/auth/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('ContentProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('subscription lifecycle', () => {
    it('subscribes to Firestore when user is authenticated', async () => {
      const mockUnsubscribe = vi.fn();
      mockSubscribeToContents.mockReturnValue(mockUnsubscribe);
      mockUseAuth.mockReturnValue({ user: { email: 'test@example.com' } });

      const { ContentProvider } = await import(
        '@/features/content/ContentProvider'
      );

      render(
        <ContentProvider>
          <div>child</div>
        </ContentProvider>,
      );

      expect(mockSubscribeToContents).toHaveBeenCalledOnce();
    });

    it('unsubscribes on unmount', async () => {
      const mockUnsubscribe = vi.fn();
      mockSubscribeToContents.mockReturnValue(mockUnsubscribe);
      mockUseAuth.mockReturnValue({ user: { email: 'test@example.com' } });

      const { ContentProvider } = await import(
        '@/features/content/ContentProvider'
      );

      const { unmount } = render(
        <ContentProvider>
          <div>child</div>
        </ContentProvider>,
      );

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalledOnce();
    });

    it('does not subscribe when user is null', async () => {
      mockUseAuth.mockReturnValue({ user: null });

      const { ContentProvider } = await import(
        '@/features/content/ContentProvider'
      );

      render(
        <ContentProvider>
          <div>child</div>
        </ContentProvider>,
      );

      expect(mockSubscribeToContents).not.toHaveBeenCalled();
    });
  });

  describe('data dispatch', () => {
    it('dispatches SET_CONTENTS when snapshot arrives', async () => {
      mockUseAuth.mockReturnValue({ user: { email: 'test@example.com' } });
      mockSubscribeToContents.mockImplementation(
        (callback: (contents: unknown[]) => void) => {
          callback([{ id: '1', title: 'Test' }]);
          return vi.fn();
        },
      );

      const { ContentProvider } = await import(
        '@/features/content/ContentProvider'
      );
      const { useContent } = await import(
        '@/features/content/useContent'
      );

      function Consumer(): ReactNode {
        const { contents, loading } = useContent();
        return (
          <div>
            <span data-testid="loading">{String(loading)}</span>
            <span data-testid="count">{contents.length}</span>
          </div>
        );
      }

      render(
        <ContentProvider>
          <Consumer />
        </ContentProvider>,
      );

      expect(screen.getByTestId('loading').textContent).toBe('false');
      expect(screen.getByTestId('count').textContent).toBe('1');
    });

    it('dispatches SET_ERROR when listener errors', async () => {
      mockUseAuth.mockReturnValue({ user: { email: 'test@example.com' } });
      mockSubscribeToContents.mockImplementation(
        (
          _callback: unknown,
          onError: (error: Error) => void,
        ) => {
          onError(new Error('Listener failed'));
          return vi.fn();
        },
      );

      const { ContentProvider } = await import(
        '@/features/content/ContentProvider'
      );
      const { useContent } = await import(
        '@/features/content/useContent'
      );

      function Consumer(): ReactNode {
        const { error } = useContent();
        return <span data-testid="error">{error}</span>;
      }

      render(
        <ContentProvider>
          <Consumer />
        </ContentProvider>,
      );

      expect(screen.getByTestId('error').textContent).toBe('Listener failed');
    });
  });

  describe('action wrappers', () => {
    it('calls service layer functions, not Firestore directly', async () => {
      mockUseAuth.mockReturnValue({ user: { email: 'test@example.com' } });
      mockSubscribeToContents.mockReturnValue(vi.fn());
      mockCreateContent.mockResolvedValue('new-id');
      mockUpdateContent.mockResolvedValue(undefined);
      mockDeleteContent.mockResolvedValue(undefined);
      mockUpdateContentStatus.mockResolvedValue(undefined);

      const { ContentProvider } = await import(
        '@/features/content/ContentProvider'
      );
      const { useContent } = await import(
        '@/features/content/useContent'
      );

      let actions: {
        createContent: (data: Record<string, unknown>) => Promise<string>;
        updateContent: (
          id: string,
          updates: Record<string, unknown>,
        ) => Promise<void>;
        deleteContent: (id: string) => Promise<void>;
        updateStatus: (id: string, status: string) => Promise<void>;
      };

      function Consumer(): ReactNode {
        const ctx = useContent();
        actions = ctx as unknown as typeof actions;
        return null;
      }

      render(
        <ContentProvider>
          <Consumer />
        </ContentProvider>,
      );

      await act(async () => {
        await actions!.createContent({ title: 'Test' });
        await actions!.updateContent('id', { title: 'Updated' });
        await actions!.deleteContent('id');
        await actions!.updateStatus('id', 'technically-ready');
      });

      expect(mockCreateContent).toHaveBeenCalledWith({ title: 'Test' });
      expect(mockUpdateContent).toHaveBeenCalledWith('id', {
        title: 'Updated',
      });
      expect(mockDeleteContent).toHaveBeenCalledWith('id');
      expect(mockUpdateContentStatus).toHaveBeenCalledWith(
        'id',
        'technically-ready',
      );
    });
  });
});

describe('useContent', () => {
  it('throws when used outside ContentProvider', async () => {
    const { useContent } = await import('@/features/content/useContent');

    function BadConsumer(): ReactNode {
      useContent();
      return null;
    }

    expect(() => render(<BadConsumer />)).toThrow(
      'useContent must be used within a ContentProvider',
    );
  });
});
