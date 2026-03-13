import { beforeEach, describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ContentTab } from '@/components/DetailPanel/tabs/ContentTab';
import { useContent } from '@/features/content/useContent';
import type { ContentContextValue } from '@/features/content/ContentContext';
import type { ContentItem } from '@/types/content';

vi.mock('@/features/content/useContent');
vi.mock('@/services/sentry', () => ({
  captureError: vi.fn(),
}));
vi.mock('@/services/firestore', () => ({
  addLinkedContent: vi.fn(),
  removeLinkedContent: vi.fn(),
  addPlatformVersion: vi.fn(),
  updatePlatformVersion: vi.fn(),
  removePlatformVersion: vi.fn(),
}));

function makeContentItem(overrides: Partial<ContentItem> = {}): ContentItem {
  return {
    id: 'abc123',
    title: 'Test Video',
    description: 'A test description',
    tags: ['react', 'testing'],
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
    notes: 'Some notes',
    learnings: [],
    feedback: [],
    timestamps: {
      created: '2024-01-01',
      technicallyReady: null,
      shootingScriptReady: null,
      readyToRecord: null,
      recorded: null,
      edited: null,
      published: null,
      shortsExtracted: null,
      lifetimeValueEnds: null,
      updated: '2024-01-01',
    },
    ...overrides,
  };
}

const updateContentMock = vi.fn().mockResolvedValue(undefined);

function mockUseContent(): void {
  vi.mocked(useContent).mockReturnValue({
    contents: [],
    loading: false,
    error: null,
    createContent: vi.fn(),
    updateContent: updateContentMock,
    deleteContent: vi.fn(),
    updateStatus: vi.fn(),
    reorderContents: vi.fn(),
  } satisfies ContentContextValue);
}

function renderContentTab(content: ContentItem) {
  return render(
    <MemoryRouter>
      <ContentTab content={content} />
    </MemoryRouter>,
  );
}

describe('ContentTab', () => {
  beforeEach(() => {
    mockUseContent();
    updateContentMock.mockClear();
  });

  it('renders all form fields', () => {
    const content = makeContentItem();
    renderContentTab(content);

    expect(screen.getByLabelText('Title')).toHaveValue('Test Video');
    expect(screen.getByLabelText('Description')).toHaveValue(
      'A test description',
    );
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('testing')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByLabelText('Notes')).toHaveValue('Some notes');
  });

  it('does not show YouTube URL for draft status', () => {
    const content = makeContentItem({ status: 'draft' });
    renderContentTab(content);

    expect(screen.queryByLabelText('YouTube URL')).not.toBeInTheDocument();
  });

  it('shows YouTube URL for published status', () => {
    const content = makeContentItem({
      status: 'published',
      phase: 'post-production',
    });
    renderContentTab(content);

    expect(screen.getByLabelText('YouTube URL')).toBeInTheDocument();
  });

  it('does not show Save/Discard when no changes are made', () => {
    const content = makeContentItem();
    renderContentTab(content);

    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Discard' })).not.toBeInTheDocument();
  });

  it('shows Save/Discard buttons when title is edited', async () => {
    const user = userEvent.setup();
    const content = makeContentItem();
    renderContentTab(content);

    const titleInput = screen.getByLabelText('Title');
    await user.clear(titleInput);
    await user.type(titleInput, 'New Title');

    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Discard' })).toBeInTheDocument();
  });

  it('calls updateContent on Save click with changed title', async () => {
    const user = userEvent.setup();
    const content = makeContentItem();
    renderContentTab(content);

    const titleInput = screen.getByLabelText('Title');
    await user.clear(titleInput);
    await user.type(titleInput, 'New Title');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(updateContentMock).toHaveBeenCalledWith('abc123', {
      title: 'New Title',
    });
  });

  it('calls updateContent on Save click with changed description', async () => {
    const user = userEvent.setup();
    const content = makeContentItem();
    renderContentTab(content);

    const descInput = screen.getByLabelText('Description');
    await user.clear(descInput);
    await user.type(descInput, 'New description');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(updateContentMock).toHaveBeenCalledWith('abc123', {
      description: 'New description',
    });
  });

  it('discards changes when Discard is clicked', async () => {
    const user = userEvent.setup();
    const content = makeContentItem();
    renderContentTab(content);

    const titleInput = screen.getByLabelText('Title');
    await user.clear(titleInput);
    await user.type(titleInput, 'New Title');

    expect(screen.getByRole('button', { name: 'Discard' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Discard' }));

    expect(screen.getByLabelText('Title')).toHaveValue('Test Video');
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    expect(updateContentMock).not.toHaveBeenCalled();
  });

  it('calls updateContent when tags change (immediate save)', async () => {
    const user = userEvent.setup();
    const content = makeContentItem();
    renderContentTab(content);

    // Get the generic textbox that is the tag input (not title, description, or notes)
    const inputs = screen.getAllByRole('textbox');
    const chipInput = inputs.find(
      (input) =>
        !input.id ||
        (!input.id.includes('title') &&
          !input.id.includes('description') &&
          !input.id.includes('notes')),
    );
    expect(chipInput).toBeDefined();
    await user.type(chipInput!, 'newtag{Enter}');

    expect(updateContentMock).toHaveBeenCalledWith('abc123', {
      tags: ['react', 'testing', 'newtag'],
    });
  });

  it('shows linked content section', () => {
    const content = makeContentItem();
    renderContentTab(content);

    expect(screen.getByText('Linked Content')).toBeInTheDocument();
    expect(screen.getByText('No linked content yet')).toBeInTheDocument();
  });
});
