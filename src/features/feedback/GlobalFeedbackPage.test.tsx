import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GlobalFeedbackPage } from '@/features/feedback/GlobalFeedbackPage';
import { useContent } from '@/features/content/useContent';
import type { ContentItem, Feedback } from '@/types/content';

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

function makeFeedback(overrides: Partial<Feedback> = {}): Feedback {
  return {
    id: 'fb-1',
    source: 'self',
    text: 'Great pacing in the intro',
    dateAdded: '2026-01-15T10:00:00.000Z',
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

describe('GlobalFeedbackPage', () => {
  describe('loading state', () => {
    it('shows spinner while content is loading', () => {
      mockContentHook([], { loading: true });
      render(<GlobalFeedbackPage />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(screen.queryByText('No feedback yet.')).not.toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('shows error message when content fails to load', () => {
      mockContentHook([], { error: 'Failed to load content' });
      render(<GlobalFeedbackPage />);

      expect(
        screen.getByText('Failed to load content'),
      ).toBeInTheDocument();
      expect(screen.queryByText('No feedback yet.')).not.toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows empty message when no feedback exist', () => {
      mockContentHook([makeContentItem()]);
      render(<GlobalFeedbackPage />);

      expect(screen.getByText('No feedback yet.')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Feedback you add to content items will appear here.',
        ),
      ).toBeInTheDocument();
    });

    it('shows empty message when no content exists', () => {
      mockContentHook([]);
      render(<GlobalFeedbackPage />);

      expect(screen.getByText('No feedback yet.')).toBeInTheDocument();
    });
  });

  describe('displaying feedback', () => {
    it('renders feedback from multiple content items', () => {
      const content1 = makeContentItem({
        id: 'c1',
        title: 'Video A',
        feedback: [
          makeFeedback({ id: 'fb1', text: 'Feedback from Video A' }),
        ],
      });
      const content2 = makeContentItem({
        id: 'c2',
        title: 'Video B',
        feedback: [
          makeFeedback({ id: 'fb2', text: 'Feedback from Video B' }),
        ],
      });
      mockContentHook([content1, content2]);
      render(<GlobalFeedbackPage />);

      expect(
        screen.getByText('Feedback from Video A'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Feedback from Video B'),
      ).toBeInTheDocument();
    });

    it('shows source badge for each feedback', () => {
      const content = makeContentItem({
        feedback: [
          makeFeedback({ id: 'fb1', source: 'peer' }),
          makeFeedback({ id: 'fb2', source: 'family' }),
        ],
      });
      mockContentHook([content]);
      render(<GlobalFeedbackPage />);

      expect(screen.getByTestId('source-badge-peer')).toBeInTheDocument();
      expect(screen.getByTestId('source-badge-family')).toBeInTheDocument();
    });

    it('shows source content title for each feedback', () => {
      const content = makeContentItem({
        id: 'c1',
        title: 'My Video',
        feedback: [makeFeedback()],
      });
      mockContentHook([content]);
      render(<GlobalFeedbackPage />);

      expect(screen.getByText('My Video')).toBeInTheDocument();
    });

    it('shows formatted date for each feedback', () => {
      const content = makeContentItem({
        feedback: [
          makeFeedback({ dateAdded: '2026-01-15T10:00:00.000Z' }),
        ],
      });
      mockContentHook([content]);
      render(<GlobalFeedbackPage />);

      expect(screen.getByText('Jan 15, 2026')).toBeInTheDocument();
    });

    it('sorts feedback by date, most recent first', () => {
      const content = makeContentItem({
        feedback: [
          makeFeedback({
            id: 'fb-old',
            text: 'Old feedback',
            dateAdded: '2026-01-01T10:00:00.000Z',
          }),
          makeFeedback({
            id: 'fb-new',
            text: 'New feedback',
            dateAdded: '2026-02-01T10:00:00.000Z',
          }),
        ],
      });
      mockContentHook([content]);
      render(<GlobalFeedbackPage />);

      const items = screen.getAllByText(/feedback$/);
      expect(items[0].textContent).toBe('New feedback');
      expect(items[1].textContent).toBe('Old feedback');
    });
  });

  describe('navigation', () => {
    it('navigates to content feedback tab when source title is clicked', () => {
      const content = makeContentItem({
        id: 'c1',
        title: 'My Video',
        feedback: [makeFeedback()],
      });
      mockContentHook([content]);
      render(<GlobalFeedbackPage />);

      const link = screen.getByText('My Video');
      link.click();

      expect(mockNavigate).toHaveBeenCalledWith('/content/c1/feedback');
    });
  });

  describe('filtering', () => {
    it('filters by content item', () => {
      const content1 = makeContentItem({
        id: 'c1',
        title: 'Video A',
        feedback: [
          makeFeedback({ id: 'fb1', text: 'Feedback A' }),
        ],
      });
      const content2 = makeContentItem({
        id: 'c2',
        title: 'Video B',
        feedback: [
          makeFeedback({ id: 'fb2', text: 'Feedback B' }),
        ],
      });
      mockContentHook([content1, content2]);
      render(<GlobalFeedbackPage />);

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

      // Only Feedback A should be visible
      expect(screen.getByText('Feedback A')).toBeInTheDocument();
      expect(screen.queryByText('Feedback B')).not.toBeInTheDocument();
    });

    it('filters by feedback source', async () => {
      const user = userEvent.setup();
      const content = makeContentItem({
        feedback: [
          makeFeedback({ id: 'fb1', text: 'Self note', source: 'self' }),
          makeFeedback({ id: 'fb2', text: 'Peer review', source: 'peer' }),
        ],
      });
      mockContentHook([content]);
      render(<GlobalFeedbackPage />);

      // Click "Self" source filter button
      const selfButton = screen.getByTestId('source-filter-self');
      await user.click(selfButton);

      // Only Self feedback should be visible
      expect(screen.getByText('Self note')).toBeInTheDocument();
      expect(screen.queryByText('Peer review')).not.toBeInTheDocument();
    });

    it('allows multi-select for source filters', async () => {
      const user = userEvent.setup();
      const content = makeContentItem({
        feedback: [
          makeFeedback({ id: 'fb1', text: 'Self note', source: 'self' }),
          makeFeedback({ id: 'fb2', text: 'Peer review', source: 'peer' }),
          makeFeedback({ id: 'fb3', text: 'Family thought', source: 'family' }),
        ],
      });
      mockContentHook([content]);
      render(<GlobalFeedbackPage />);

      // Select both Self and Peer
      await user.click(screen.getByTestId('source-filter-self'));
      await user.click(screen.getByTestId('source-filter-peer'));

      expect(screen.getByText('Self note')).toBeInTheDocument();
      expect(screen.getByText('Peer review')).toBeInTheDocument();
      expect(screen.queryByText('Family thought')).not.toBeInTheDocument();
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
        feedback: [
          makeFeedback({
            id: 'fb-recent',
            text: 'Recent feedback',
            dateAdded: recentDate,
          }),
          makeFeedback({
            id: 'fb-old',
            text: 'Old feedback',
            dateAdded: oldDate,
          }),
        ],
      });
      mockContentHook([content]);
      render(<GlobalFeedbackPage />);

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

      // Only recent feedback should be visible
      expect(screen.getByText('Recent feedback')).toBeInTheDocument();
      expect(screen.queryByText('Old feedback')).not.toBeInTheDocument();
    });

    it('combines content and source filters', async () => {
      const user = userEvent.setup();
      const content1 = makeContentItem({
        id: 'c1',
        title: 'Video A',
        feedback: [
          makeFeedback({ id: 'fb1', text: 'Self on A', source: 'self' }),
          makeFeedback({ id: 'fb2', text: 'Peer on A', source: 'peer' }),
        ],
      });
      const content2 = makeContentItem({
        id: 'c2',
        title: 'Video B',
        feedback: [
          makeFeedback({ id: 'fb3', text: 'Self on B', source: 'self' }),
        ],
      });
      mockContentHook([content1, content2]);
      render(<GlobalFeedbackPage />);

      // Filter by content = Video A
      const contentFilter = screen.getByTestId('content-filter');
      fireEvent.pointerDown(contentFilter, {
        button: 0,
        ctrlKey: false,
        pointerType: 'mouse',
      });
      const options = screen.getAllByRole('option');
      const videoAOption = options.find((o) => o.textContent === 'Video A');
      fireEvent.click(videoAOption!);

      // Filter by source = Self
      await user.click(screen.getByTestId('source-filter-self'));

      // Only "Self on A" should be visible
      expect(screen.getByText('Self on A')).toBeInTheDocument();
      expect(screen.queryByText('Peer on A')).not.toBeInTheDocument();
      expect(screen.queryByText('Self on B')).not.toBeInTheDocument();
    });

    it('shows no-results message when filters match nothing', () => {
      const content = makeContentItem({
        id: 'c1',
        title: 'Video A',
        feedback: [
          makeFeedback({
            id: 'fb1',
            text: 'Some feedback',
            dateAdded: '2020-01-01T00:00:00.000Z',
          }),
        ],
      });
      mockContentHook([content]);
      render(<GlobalFeedbackPage />);

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
        screen.getByText('No feedback matches the current filters.'),
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
        feedback: [
          makeFeedback({
            id: 'fb-recent',
            text: 'Recent feedback',
            dateAdded: recentDate,
          }),
          makeFeedback({
            id: 'fb-old',
            text: 'Old feedback',
            dateAdded: oldDate,
          }),
        ],
      });
      mockContentHook([content]);
      render(<GlobalFeedbackPage />);

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

      // Old feedback should be hidden
      expect(screen.queryByText('Old feedback')).not.toBeInTheDocument();

      // Click clear filters
      const clearButton = screen.getByTestId('clear-filters');
      await user.click(clearButton);

      // Both feedback should be visible again
      expect(screen.getByText('Recent feedback')).toBeInTheDocument();
      expect(screen.getByText('Old feedback')).toBeInTheDocument();
    });
  });

  describe('read-only', () => {
    it('does not show add/edit/delete buttons', () => {
      const content = makeContentItem({
        feedback: [makeFeedback()],
      });
      mockContentHook([content]);
      render(<GlobalFeedbackPage />);

      expect(
        screen.queryByRole('button', { name: /add feedback/i }),
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
