import { describe, it, expect, vi } from 'vitest';
import { render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import {
  ContentContext,
  type ContentContextValue,
} from '@/features/content/ContentProvider';
import { ContentTab } from '@/components/DetailPanel/tabs/ContentTab';
import type { ContentItem } from '@/types/content';

vi.mock('@/services/firebase', () => ({
  auth: { currentUser: null },
  db: {},
}));

vi.mock('@/services/firestore', () => ({
  addLinkedContent: vi.fn().mockResolvedValue(undefined),
  removeLinkedContent: vi.fn().mockResolvedValue(undefined),
  STATUS_ORDER: [
    'draft', 'technically-ready', 'shooting-script-ready', 'ready-to-record',
    'recorded', 'edited', 'published', 'extracted-shorts', 'lifetime-value-ends',
  ],
}));

function createMockItem(overrides: Partial<ContentItem> = {}): ContentItem {
  return {
    id: 'item-1',
    title: 'Test Video',
    description: 'A test description',
    tags: ['react', 'typescript'],
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

function renderContentTab(
  item: ContentItem,
  contextOverrides: Partial<ContentContextValue> = {},
): ReturnType<typeof render> {
  const defaultContext: ContentContextValue = {
    contents: [item],
    loading: false,
    error: null,
    createContent: vi.fn(),
    updateContent: vi.fn().mockResolvedValue(undefined),
    deleteContent: vi.fn().mockResolvedValue(undefined),
    updateStatus: vi.fn(),
    ...contextOverrides,
  };

  return render(
    <ContentContext.Provider value={defaultContext}>
      <MemoryRouter>
        <ContentTab item={item} />
      </MemoryRouter>
    </ContentContext.Provider>,
  );
}

describe('ContentTab', () => {
  it('renders title field', () => {
    renderContentTab(createMockItem());
    expect(screen.getByDisplayValue('Test Video')).toBeInTheDocument();
  });

  it('renders description field', () => {
    renderContentTab(createMockItem());
    expect(screen.getByDisplayValue('A test description')).toBeInTheDocument();
  });

  it('renders tags', () => {
    renderContentTab(createMockItem());
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it('renders status badge', () => {
    renderContentTab(createMockItem());
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('renders notes field', () => {
    renderContentTab(createMockItem());
    expect(screen.getByDisplayValue('Some notes')).toBeInTheDocument();
  });

  it('does not show YouTube URL field for draft status', () => {
    renderContentTab(createMockItem({ status: 'draft' }));
    expect(screen.queryByPlaceholderText(/youtube/i)).not.toBeInTheDocument();
  });

  it('shows YouTube URL field for published status', () => {
    renderContentTab(createMockItem({ status: 'published', phase: 'post-production' }));
    expect(screen.getByPlaceholderText(/youtube/i)).toBeInTheDocument();
  });

  it('calls updateContent on title blur', async () => {
    const updateContent = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderContentTab(createMockItem(), { updateContent });

    const titleInput = screen.getByDisplayValue('Test Video');
    await user.clear(titleInput);
    await user.type(titleInput, 'New Title');
    await user.tab();

    expect(updateContent).toHaveBeenCalledWith('item-1', { title: 'New Title' });
  });

  it('does not call updateContent if value unchanged on blur', async () => {
    const updateContent = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderContentTab(createMockItem(), { updateContent });

    const titleInput = screen.getByDisplayValue('Test Video');
    await user.click(titleInput);
    await user.tab();

    expect(updateContent).not.toHaveBeenCalled();
  });

  it('renders delete button', () => {
    renderContentTab(createMockItem());
    expect(screen.getByLabelText('Delete content')).toBeInTheDocument();
  });

  it('shows delete confirmation dialog', async () => {
    const user = userEvent.setup();
    renderContentTab(createMockItem());

    await user.click(screen.getByLabelText('Delete content'));

    expect(screen.getByText(/Delete "Test Video"\?/)).toBeInTheDocument();
    expect(screen.getByText(/permanently delete/)).toBeInTheDocument();
  });

  it('renders Add Link button', () => {
    renderContentTab(createMockItem());
    expect(screen.getByText('Add Link')).toBeInTheDocument();
  });

  it('shows link form when Add Link is clicked', async () => {
    const user = userEvent.setup();
    renderContentTab(createMockItem());

    await user.click(screen.getByText('Add Link'));

    expect(screen.getByPlaceholderText('https://...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Link label')).toBeInTheDocument();
  });

  it('renders existing linked content', () => {
    const item = createMockItem({
      linkedContent: [
        { id: 'link-1', platform: 'blog', url: 'https://example.com', label: 'My Blog Post' },
      ],
    });
    renderContentTab(item);
    expect(screen.getByText('My Blog Post')).toBeInTheDocument();
    expect(screen.getByText('blog')).toBeInTheDocument();
  });
});
