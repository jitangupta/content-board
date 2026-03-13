import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { useContent } from '@/features/content/useContent';
import type { ContentContextValue } from '@/features/content/ContentContext';
import type { ContentItem } from '@/types/content';

vi.mock('@/features/content/useContent');

function makeItem(overrides: Partial<ContentItem>): ContentItem {
  return {
    id: '1',
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
      created: '2026-01-01',
      technicallyReady: null,
      shootingScriptReady: null,
      readyToRecord: null,
      recorded: null,
      edited: null,
      published: null,
      shortsExtracted: null,
      lifetimeValueEnds: null,
      updated: '2026-01-01',
    },
    ...overrides,
  };
}

function mockUseContent(overrides: Partial<ContentContextValue>): void {
  vi.mocked(useContent).mockReturnValue({
    contents: [],
    loading: false,
    error: null,
    createContent: vi.fn(),
    updateContent: vi.fn(),
    deleteContent: vi.fn(),
    updateStatus: vi.fn(),
    reorderContents: vi.fn(),
    ...overrides,
  });
}

function renderSidebar() {
  return render(
    <MemoryRouter>
      <Sidebar />
    </MemoryRouter>,
  );
}

describe('Sidebar', () => {
  it('shows skeleton when loading', () => {
    mockUseContent({ loading: true });

    renderSidebar();

    expect(screen.getByTestId('sidebar-skeleton')).toBeInTheDocument();
  });

  it('shows empty state when no content exists', () => {
    mockUseContent({ contents: [] });

    renderSidebar();

    expect(screen.getByTestId('sidebar-empty')).toBeInTheDocument();
    expect(screen.getByText('No content yet')).toBeInTheDocument();
    expect(
      screen.getByText('Click "+ New Content" to get started'),
    ).toBeInTheDocument();
  });

  it('shows error state', () => {
    mockUseContent({ error: 'Failed to load content' });

    renderSidebar();

    expect(screen.getByTestId('sidebar-error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load content')).toBeInTheDocument();
  });

  it('renders three phase groups', () => {
    mockUseContent({
      contents: [makeItem({ id: '1', status: 'draft' })],
    });

    renderSidebar();

    expect(screen.getByText('Pre-Production')).toBeInTheDocument();
    expect(screen.getByText('Production')).toBeInTheDocument();
    expect(screen.getByText('Post-Production')).toBeInTheDocument();
  });

  it('groups items under the correct phase', () => {
    mockUseContent({
      contents: [
        makeItem({ id: '1', title: 'Draft Video', status: 'draft' }),
        makeItem({ id: '2', title: 'Recorded Video', status: 'recorded' }),
        makeItem({ id: '3', title: 'Published Video', status: 'published' }),
      ],
    });

    renderSidebar();

    // All three items should be rendered
    expect(screen.getByText('Draft Video')).toBeInTheDocument();
    expect(screen.getByText('Recorded Video')).toBeInTheDocument();
    expect(screen.getByText('Published Video')).toBeInTheDocument();

    // The count badges should show 1 for each phase
    const preGroup = screen.getByTestId('phase-group-pre-production');
    expect(preGroup).toHaveTextContent('1');

    const prodGroup = screen.getByTestId('phase-group-production');
    expect(prodGroup).toHaveTextContent('1');

    const postGroup = screen.getByTestId('phase-group-post-production');
    expect(postGroup).toHaveTextContent('1');
  });

  it('shows correct count for multiple items in a phase', () => {
    mockUseContent({
      contents: [
        makeItem({ id: '1', title: 'Video 1', status: 'draft' }),
        makeItem({ id: '2', title: 'Video 2', status: 'technically-ready' }),
        makeItem({ id: '3', title: 'Video 3', status: 'ready-to-record' }),
      ],
    });

    renderSidebar();

    const preGroup = screen.getByTestId('phase-group-pre-production');
    expect(preGroup).toHaveTextContent('3');
  });
});
