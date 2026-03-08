import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import {
  ContentContext,
  type ContentContextValue,
} from '@/features/content/ContentProvider';
import { DetailPanel } from '@/components/DetailPanel/DetailPanel';
import type { ContentItem } from '@/types/content';

vi.mock('@/services/firebase', () => ({
  auth: { currentUser: null },
  db: {},
}));

vi.mock('@/services/firestore', () => ({
  addFeedback: vi.fn().mockResolvedValue(undefined),
  updateFeedback: vi.fn().mockResolvedValue(undefined),
  removeFeedback: vi.fn().mockResolvedValue(undefined),
}));

function createMockItem(overrides: Partial<ContentItem> = {}): ContentItem {
  return {
    id: 'item-1',
    title: 'Test Video',
    description: 'A test description',
    tags: ['react'],
    status: 'draft',
    phase: 'pre-production',
    order: 0,
    youtubeUrl: null,
    demoItems: [],
    talkingPoints: [],
    shootingScript: '',
    thumbnailIdeas: [],
    linkedContent: [],
    notes: 'Some notes',
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

function renderDetailPanel(
  route: string,
  contextOverrides: Partial<ContentContextValue> = {},
): ReturnType<typeof render> {
  const defaultContext: ContentContextValue = {
    contents: [createMockItem()],
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
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/content" element={<DetailPanel />} />
          <Route path="/content/:contentId" element={<DetailPanel />} />
          <Route path="/content/:contentId/:tab" element={<DetailPanel />} />
        </Routes>
      </MemoryRouter>
    </ContentContext.Provider>,
  );
}

describe('DetailPanel', () => {
  it('shows empty state when no contentId', () => {
    renderDetailPanel('/content');
    expect(screen.getByText('Select a content item or create a new one')).toBeInTheDocument();
  });

  it('shows loading skeleton when loading', () => {
    const { container } = renderDetailPanel('/content/item-1', { loading: true });
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows not found when contentId does not match', () => {
    renderDetailPanel('/content/nonexistent');
    expect(screen.getByText('Content not found')).toBeInTheDocument();
  });

  it('renders content when item exists', () => {
    renderDetailPanel('/content/item-1');
    expect(screen.getByDisplayValue('Test Video')).toBeInTheDocument();
  });

  it('renders tab navigation with four tabs', () => {
    renderDetailPanel('/content/item-1');
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Production')).toBeInTheDocument();
    expect(screen.getByText('Learn')).toBeInTheDocument();
    expect(screen.getByText('Feedback')).toBeInTheDocument();
  });

  it('defaults to content tab when no tab in URL', () => {
    renderDetailPanel('/content/item-1');
    // Content tab shows fields like title, description
    expect(screen.getByDisplayValue('Test Video')).toBeInTheDocument();
  });

  it('shows production placeholder for production tab', () => {
    renderDetailPanel('/content/item-1/production');
    expect(screen.getByText('Production tab coming soon')).toBeInTheDocument();
  });

  it('shows learn placeholder for learn tab', () => {
    renderDetailPanel('/content/item-1/learn');
    expect(screen.getByText('Learn tab coming soon')).toBeInTheDocument();
  });

  it('shows feedback tab content for feedback tab', () => {
    renderDetailPanel('/content/item-1/feedback');
    expect(screen.getByText('Add Feedback')).toBeInTheDocument();
  });

  it('falls back to content tab for invalid tab name', () => {
    renderDetailPanel('/content/item-1/invalid');
    expect(screen.getByDisplayValue('Test Video')).toBeInTheDocument();
  });
});
