import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { EmptyStateDashboard } from '@/components/DetailPanel/EmptyStateDashboard';
import { useContent } from '@/features/content/useContent';
import type { ContentContextValue } from '@/features/content/ContentContext';
import type { ContentItem } from '@/types/content';

vi.mock('@/features/content/useContent');

vi.mock('@/utils/relativeTime', () => ({
  formatRelativeTime: (date: string) => `mocked-${date}`,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function makeContentItem(overrides: Partial<ContentItem> = {}): ContentItem {
  return {
    id: 'item-1',
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
      created: '2026-01-01T00:00:00Z',
      technicallyReady: null,
      shootingScriptReady: null,
      readyToRecord: null,
      recorded: null,
      edited: null,
      published: null,
      shortsExtracted: null,
      lifetimeValueEnds: null,
      updated: '2026-02-20T00:00:00Z',
    },
    ...overrides,
  };
}

function mockUseContent(overrides: Partial<ContentContextValue> = {}): void {
  vi.mocked(useContent).mockReturnValue({
    contents: [],
    loading: false,
    error: null,
    createContent: vi.fn().mockResolvedValue('new-id'),
    updateContent: vi.fn(),
    deleteContent: vi.fn(),
    updateStatus: vi.fn(),
    reorderContents: vi.fn(),
    ...overrides,
  });
}

function renderDashboard() {
  return render(
    <MemoryRouter>
      <EmptyStateDashboard />
    </MemoryRouter>,
  );
}

describe('EmptyStateDashboard', () => {
  it('shows friendly message when no content exists', () => {
    mockUseContent({ contents: [] });
    renderDashboard();

    expect(screen.getByText('No content yet. Create your first video idea!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create New/ })).toBeInTheDocument();
  });

  it('create button works in zero-content state', async () => {
    const user = userEvent.setup();
    const createFn = vi.fn().mockResolvedValue('new-id');
    mockUseContent({ contents: [], createContent: createFn });
    renderDashboard();

    // Open the dropdown then click "Video"
    await user.click(screen.getByRole('button', { name: /Create New/ }));
    await user.click(screen.getByRole('menuitem', { name: /Video/ }));

    expect(createFn).toHaveBeenCalledWith({ contentType: 'video' });
    expect(mockNavigate).toHaveBeenCalledWith('/content/new-id');
  });

  it('renders phase summary cards with correct counts', () => {
    const contents = [
      makeContentItem({ id: '1', status: 'draft' }),
      makeContentItem({ id: '2', status: 'technically-ready' }),
      makeContentItem({ id: '3', status: 'recorded' }),
      makeContentItem({ id: '4', status: 'published' }),
      makeContentItem({ id: '5', status: 'published' }),
    ];
    mockUseContent({ contents });
    renderDashboard();

    const preCard = screen.getByTestId('phase-card-pre-production');
    expect(within(preCard).getByText('2')).toBeInTheDocument();

    const prodCard = screen.getByTestId('phase-card-production');
    expect(within(prodCard).getByText('1')).toBeInTheDocument();

    const postCard = screen.getByTestId('phase-card-post-production');
    expect(within(postCard).getByText('2')).toBeInTheDocument();
  });

  it('renders recent items sorted by updated timestamp', () => {
    const contents = [
      makeContentItem({ id: '1', title: 'Oldest', timestamps: { ...makeContentItem().timestamps, updated: '2026-01-01T00:00:00Z' } }),
      makeContentItem({ id: '2', title: 'Newest', timestamps: { ...makeContentItem().timestamps, updated: '2026-02-24T00:00:00Z' } }),
      makeContentItem({ id: '3', title: 'Middle', timestamps: { ...makeContentItem().timestamps, updated: '2026-02-10T00:00:00Z' } }),
    ];
    mockUseContent({ contents });
    renderDashboard();

    const list = screen.getByTestId('recent-activity');
    const items = within(list).getAllByRole('button');

    expect(items[0]).toHaveTextContent('Newest');
    expect(items[1]).toHaveTextContent('Middle');
    expect(items[2]).toHaveTextContent('Oldest');
  });

  it('limits recent items to 5', () => {
    const contents = Array.from({ length: 8 }, (_, i) =>
      makeContentItem({
        id: `item-${i}`,
        title: `Video ${i}`,
        timestamps: { ...makeContentItem().timestamps, updated: `2026-02-${String(i + 10).padStart(2, '0')}T00:00:00Z` },
      }),
    );
    mockUseContent({ contents });
    renderDashboard();

    const list = screen.getByTestId('recent-activity');
    expect(within(list).getAllByRole('button')).toHaveLength(5);
  });

  it('clicking a recent item navigates to its detail page', async () => {
    const user = userEvent.setup();
    mockUseContent({ contents: [makeContentItem({ id: 'abc', title: 'Click Me' })] });
    renderDashboard();

    await user.click(screen.getByRole('button', { name: /Click Me/ }));

    expect(mockNavigate).toHaveBeenCalledWith('/content/abc');
  });

  it('shows status badge for each recent item', () => {
    mockUseContent({ contents: [makeContentItem({ status: 'draft' })] });
    renderDashboard();

    expect(screen.getByTestId('status-badge')).toHaveAttribute('data-status', 'draft');
  });

  it('shows "Untitled" for items without a title', () => {
    mockUseContent({ contents: [makeContentItem({ title: '' })] });
    renderDashboard();

    expect(screen.getByText('Untitled')).toBeInTheDocument();
  });
});
