import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  ContentContext,
  type ContentContextValue,
} from '@/features/content/ContentProvider';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import type { ContentItem } from '@/types/content';

vi.mock('@/services/firebase', () => ({
  auth: { currentUser: null },
  db: {},
}));

function createMockItem(overrides: Partial<ContentItem> = {}): ContentItem {
  return {
    id: 'item-1',
    title: 'Test Video',
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

function renderSidebar(
  contextOverrides: Partial<ContentContextValue> = {},
): ReturnType<typeof render> {
  const defaultContext: ContentContextValue = {
    contents: [],
    loading: false,
    error: null,
    createContent: vi.fn(),
    updateContent: vi.fn(),
    deleteContent: vi.fn(),
    updateStatus: vi.fn(),
    ...contextOverrides,
  };

  return render(
    <ContentContext.Provider value={defaultContext}>
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    </ContentContext.Provider>,
  );
}

describe('Sidebar', () => {
  it('shows skeleton when loading', () => {
    const { container } = renderSidebar({ loading: true });
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows error message when error exists', () => {
    renderSidebar({ error: 'Failed to load' });
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });

  it('shows empty state when no content', () => {
    renderSidebar({ contents: [] });
    expect(screen.getByText('No content yet')).toBeInTheDocument();
  });

  it('renders all three phase groups', () => {
    const contents = [
      createMockItem({ id: '1', phase: 'pre-production', status: 'draft' }),
      createMockItem({ id: '2', phase: 'production', status: 'recorded' }),
      createMockItem({ id: '3', phase: 'post-production', status: 'published' }),
    ];
    renderSidebar({ contents });

    expect(screen.getByText('Pre-Production')).toBeInTheDocument();
    expect(screen.getByText('Production')).toBeInTheDocument();
    expect(screen.getByText('Post-Production')).toBeInTheDocument();
  });

  it('groups items under the correct phase', () => {
    const contents = [
      createMockItem({ id: '1', title: 'Draft Video', phase: 'pre-production', status: 'draft' }),
      createMockItem({ id: '2', title: 'Recording', phase: 'production', status: 'recorded' }),
      createMockItem({ id: '3', title: 'Published Video', phase: 'post-production', status: 'published' }),
    ];
    renderSidebar({ contents });

    expect(screen.getByText('Draft Video')).toBeInTheDocument();
    expect(screen.getByText('Recording')).toBeInTheDocument();
    expect(screen.getByText('Published Video')).toBeInTheDocument();
  });

  it('shows correct count per phase group', () => {
    const contents = [
      createMockItem({ id: '1', phase: 'pre-production', status: 'draft' }),
      createMockItem({ id: '2', phase: 'pre-production', status: 'technically-ready' }),
      createMockItem({ id: '3', phase: 'production', status: 'recorded' }),
    ];
    renderSidebar({ contents });

    // Pre-Production should show 2, Production 1, Post-Production 0
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
