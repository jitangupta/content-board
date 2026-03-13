import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GlobalLearningsPage } from '@/features/learn/GlobalLearningsPage';
import { useContent } from '@/features/content/useContent';
import type { ContentItem, Learning } from '@/types/content';

vi.mock('@/features/content/useContent');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Radix Select requires these APIs that jsdom doesn't provide
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.HTMLElement.prototype.hasPointerCapture = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
  window.HTMLElement.prototype.setPointerCapture = vi.fn();
  window.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});

function makeLearning(overrides: Partial<Learning> = {}): Learning {
  return {
    id: 'learn-1',
    text: 'Always test error boundaries',
    dateAdded: '2026-01-15T10:00:00.000Z',
    appliedInContentId: null,
    ...overrides,
  };
}

function makeContentItem(overrides: Partial<ContentItem> = {}): ContentItem {
  return {
    id: 'content-1',
    title: 'Test Video',
    description: '',
    tags: [],
    status: 'draft',
    phase: 'pre-production',
    order: 0,
    contentType: 'video',
    parentVideoId: null,
    script: null,
    platformVersions: [],
    youtubeUrl: null,
    demoItems: [],
    talkingPoints: [],
    shootingScript: null,
    thumbnailIdeas: null,
    linkedContent: [],
    notes: null,
    learnings: [],
    feedback: [],
    timestamps: {
      created: '2026-01-01T00:00:00.000Z',
      technicallyReady: null,
      shootingScriptReady: null,
      readyToRecord: null,
      recorded: null,
      edited: null,
      published: null,
      shortsExtracted: null,
      lifetimeValueEnds: null,
      updated: '2026-01-01T00:00:00.000Z',
    },
    ...overrides,
  };
}

interface MockOptions {
  loading?: boolean;
  error?: string | null;
}

function mockContentHook(
  contents: ContentItem[],
  options: MockOptions = {},
): void {
  vi.mocked(useContent).mockReturnValue({
    contents,
    loading: options.loading ?? false,
    error: options.error ?? null,
    createContent: vi.fn(),
    updateContent: vi.fn(),
    deleteContent: vi.fn(),
    updateStatus: vi.fn(),
    reorderContents: vi.fn(),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GlobalLearningsPage', () => {
  describe('loading state', () => {
    it('shows spinner while content is loading', () => {
      mockContentHook([], { loading: true });
      render(<GlobalLearningsPage />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(screen.queryByText('No learnings yet.')).not.toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('shows error message when content fails to load', () => {
      mockContentHook([], { error: 'Failed to load content' });
      render(<GlobalLearningsPage />);

      expect(
        screen.getByText('Failed to load content'),
      ).toBeInTheDocument();
      expect(screen.queryByText('No learnings yet.')).not.toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows empty message when no learnings exist', () => {
      mockContentHook([makeContentItem()]);
      render(<GlobalLearningsPage />);

      expect(screen.getByText('No learnings yet.')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Learnings you add to content items will appear here.',
        ),
      ).toBeInTheDocument();
    });

    it('shows empty message when no content exists', () => {
      mockContentHook([]);
      render(<GlobalLearningsPage />);

      expect(screen.getByText('No learnings yet.')).toBeInTheDocument();
    });
  });

  describe('displaying learnings', () => {
    it('renders learnings from multiple content items', () => {
      const content1 = makeContentItem({
        id: 'c1',
        title: 'Video A',
        learnings: [
          makeLearning({ id: 'l1', text: 'Learning from Video A' }),
        ],
      });
      const content2 = makeContentItem({
        id: 'c2',
        title: 'Video B',
        learnings: [
          makeLearning({ id: 'l2', text: 'Learning from Video B' }),
        ],
      });
      mockContentHook([content1, content2]);
      render(<GlobalLearningsPage />);

      expect(
        screen.getByText('Learning from Video A'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Learning from Video B'),
      ).toBeInTheDocument();
    });

    it('shows source content title for each learning', () => {
      const content = makeContentItem({
        id: 'c1',
        title: 'My Video',
        learnings: [makeLearning()],
      });
      mockContentHook([content]);
      render(<GlobalLearningsPage />);

      expect(screen.getByText('My Video')).toBeInTheDocument();
    });

    it('shows formatted date for each learning', () => {
      const content = makeContentItem({
        learnings: [
          makeLearning({ dateAdded: '2026-01-15T10:00:00.000Z' }),
        ],
      });
      mockContentHook([content]);
      render(<GlobalLearningsPage />);

      expect(screen.getByText('Jan 15, 2026')).toBeInTheDocument();
    });

    it('sorts learnings by date, most recent first', () => {
      const content = makeContentItem({
        learnings: [
          makeLearning({
            id: 'l-old',
            text: 'Old learning',
            dateAdded: '2026-01-01T10:00:00.000Z',
          }),
          makeLearning({
            id: 'l-new',
            text: 'New learning',
            dateAdded: '2026-02-01T10:00:00.000Z',
          }),
        ],
      });
      mockContentHook([content]);
      render(<GlobalLearningsPage />);

      const items = screen.getAllByText(/learning$/);
      expect(items[0].textContent).toBe('New learning');
      expect(items[1].textContent).toBe('Old learning');
    });

    it('shows applied-in link when set', () => {
      const content = makeContentItem({
        id: 'c1',
        title: 'Source Video',
        learnings: [
          makeLearning({ appliedInContentId: 'c2' }),
        ],
      });
      const appliedContent = makeContentItem({
        id: 'c2',
        title: 'Applied Video',
      });
      mockContentHook([content, appliedContent]);
      render(<GlobalLearningsPage />);

      expect(screen.getByText('Applied Video')).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('navigates to content learn tab when source title is clicked', async () => {
      const content = makeContentItem({
        id: 'c1',
        title: 'My Video',
        learnings: [makeLearning()],
      });
      mockContentHook([content]);
      render(<GlobalLearningsPage />);

      const link = screen.getByText('My Video');
      link.click();

      expect(mockNavigate).toHaveBeenCalledWith('/content/c1/learn');
    });

    it('navigates to applied-in content when link is clicked', async () => {
      const content = makeContentItem({
        id: 'c1',
        title: 'Source Video',
        learnings: [makeLearning({ appliedInContentId: 'c2' })],
      });
      const appliedContent = makeContentItem({
        id: 'c2',
        title: 'Applied Video',
      });
      mockContentHook([content, appliedContent]);
      render(<GlobalLearningsPage />);

      const link = screen.getByText('Applied Video');
      link.click();

      expect(mockNavigate).toHaveBeenCalledWith('/content/c2/learn');
    });
  });

  describe('filtering', () => {
    it('filters by content item', () => {
      const content1 = makeContentItem({
        id: 'c1',
        title: 'Video A',
        learnings: [
          makeLearning({ id: 'l1', text: 'Learning A' }),
        ],
      });
      const content2 = makeContentItem({
        id: 'c2',
        title: 'Video B',
        learnings: [
          makeLearning({ id: 'l2', text: 'Learning B' }),
        ],
      });
      mockContentHook([content1, content2]);
      render(<GlobalLearningsPage />);

      // Open content filter
      const contentFilter = screen.getByTestId('content-filter');
      fireEvent.pointerDown(contentFilter, {
        button: 0,
        ctrlKey: false,
        pointerType: 'mouse',
      });

      // Select Video A
      const options = screen.getAllByRole('option');
      const videoAOption = options.find((o) => o.textContent === 'Video A');
      expect(videoAOption).toBeDefined();
      fireEvent.click(videoAOption!);

      // Only Learning A should be visible
      expect(screen.getByText('Learning A')).toBeInTheDocument();
      expect(screen.queryByText('Learning B')).not.toBeInTheDocument();
    });

    it('filters by date range', () => {
      const now = new Date();
      const recentDate = new Date(
        now.getTime() - 3 * 24 * 60 * 60 * 1000,
      ).toISOString();
      const oldDate = new Date(
        now.getTime() - 60 * 24 * 60 * 60 * 1000,
      ).toISOString();

      const content = makeContentItem({
        learnings: [
          makeLearning({
            id: 'l-recent',
            text: 'Recent learning',
            dateAdded: recentDate,
          }),
          makeLearning({
            id: 'l-old',
            text: 'Old learning',
            dateAdded: oldDate,
          }),
        ],
      });
      mockContentHook([content]);
      render(<GlobalLearningsPage />);

      // Open date filter
      const dateFilter = screen.getByTestId('date-filter');
      fireEvent.pointerDown(dateFilter, {
        button: 0,
        ctrlKey: false,
        pointerType: 'mouse',
      });

      // Select "Last 7 days"
      const options = screen.getAllByRole('option');
      const last7Option = options.find(
        (o) => o.textContent === 'Last 7 days',
      );
      expect(last7Option).toBeDefined();
      fireEvent.click(last7Option!);

      // Only recent learning should be visible
      expect(screen.getByText('Recent learning')).toBeInTheDocument();
      expect(screen.queryByText('Old learning')).not.toBeInTheDocument();
    });

    it('shows no-results message when filters match nothing', () => {
      const content = makeContentItem({
        id: 'c1',
        title: 'Video A',
        learnings: [
          makeLearning({
            id: 'l1',
            text: 'A learning',
            dateAdded: '2020-01-01T00:00:00.000Z',
          }),
        ],
      });
      mockContentHook([content]);
      render(<GlobalLearningsPage />);

      // Open date filter and select Last 7 days
      const dateFilter = screen.getByTestId('date-filter');
      fireEvent.pointerDown(dateFilter, {
        button: 0,
        ctrlKey: false,
        pointerType: 'mouse',
      });
      const options = screen.getAllByRole('option');
      const last7Option = options.find(
        (o) => o.textContent === 'Last 7 days',
      );
      fireEvent.click(last7Option!);

      expect(
        screen.getByText('No learnings match the current filters.'),
      ).toBeInTheDocument();
    });

    it('clears all filters when clear button is clicked', async () => {
      const user = userEvent.setup();
      const now = new Date();
      const recentDate = new Date(
        now.getTime() - 3 * 24 * 60 * 60 * 1000,
      ).toISOString();
      const oldDate = new Date(
        now.getTime() - 60 * 24 * 60 * 60 * 1000,
      ).toISOString();

      const content = makeContentItem({
        learnings: [
          makeLearning({
            id: 'l-recent',
            text: 'Recent learning',
            dateAdded: recentDate,
          }),
          makeLearning({
            id: 'l-old',
            text: 'Old learning',
            dateAdded: oldDate,
          }),
        ],
      });
      mockContentHook([content]);
      render(<GlobalLearningsPage />);

      // Apply date filter
      const dateFilter = screen.getByTestId('date-filter');
      fireEvent.pointerDown(dateFilter, {
        button: 0,
        ctrlKey: false,
        pointerType: 'mouse',
      });
      const options = screen.getAllByRole('option');
      const last7Option = options.find(
        (o) => o.textContent === 'Last 7 days',
      );
      fireEvent.click(last7Option!);

      // Old learning should be hidden
      expect(screen.queryByText('Old learning')).not.toBeInTheDocument();

      // Click clear filters using userEvent for proper state updates
      const clearButton = screen.getByTestId('clear-filters');
      await user.click(clearButton);

      // Both learnings should be visible again
      expect(screen.getByText('Recent learning')).toBeInTheDocument();
      expect(screen.getByText('Old learning')).toBeInTheDocument();
    });
  });

  describe('read-only', () => {
    it('does not show add/edit/delete buttons', () => {
      const content = makeContentItem({
        learnings: [makeLearning()],
      });
      mockContentHook([content]);
      render(<GlobalLearningsPage />);

      expect(
        screen.queryByRole('button', { name: /add learning/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /edit/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /delete/i }),
      ).not.toBeInTheDocument();
    });
  });
});
