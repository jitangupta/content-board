import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import {
  ContentContext,
  type ContentContextValue,
} from '@/features/content/ContentProvider';
import { LearningList } from '@/features/learn/LearningList';
import type { ContentItem, Learning } from '@/types/content';
import {
  addLearning,
  updateLearning,
  removeLearning,
} from '@/services/firestore';

vi.mock('@/services/firebase', () => ({
  auth: { currentUser: null },
  db: {},
}));

vi.mock('@/services/firestore', () => ({
  addLearning: vi.fn().mockResolvedValue(undefined),
  updateLearning: vi.fn().mockResolvedValue(undefined),
  removeLearning: vi.fn().mockResolvedValue(undefined),
}));

function createMockLearning(overrides: Partial<Learning> = {}): Learning {
  return {
    id: 'learn-1',
    text: 'Always test edge cases',
    dateAdded: '2026-01-15T10:00:00.000Z',
    appliedInContentId: null,
    ...overrides,
  };
}

function createMockItem(overrides: Partial<ContentItem> = {}): ContentItem {
  return {
    id: 'item-1',
    title: 'Test Video',
    description: 'A test description',
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

function renderLearningList(
  item: ContentItem,
  additionalContents: ContentItem[] = [],
): ReturnType<typeof render> {
  const contextValue: ContentContextValue = {
    contents: [item, ...additionalContents],
    loading: false,
    error: null,
    createContent: vi.fn(),
    updateContent: vi.fn().mockResolvedValue(undefined),
    deleteContent: vi.fn().mockResolvedValue(undefined),
    updateStatus: vi.fn(),
  };

  return render(
    <ContentContext.Provider value={contextValue}>
      <MemoryRouter>
        <LearningList item={item} />
      </MemoryRouter>
    </ContentContext.Provider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LearningList', () => {
  it('shows empty state when no learnings', () => {
    renderLearningList(createMockItem());
    expect(
      screen.getByText(
        'No learnings yet. Capture what you learned while creating this video.',
      ),
    ).toBeInTheDocument();
  });

  it('renders Add Learning button', () => {
    renderLearningList(createMockItem());
    expect(screen.getByText('Add Learning')).toBeInTheDocument();
  });

  it('shows add form when Add Learning is clicked', async () => {
    const user = userEvent.setup();
    renderLearningList(createMockItem());

    await user.click(screen.getByText('Add Learning'));

    expect(
      screen.getByPlaceholderText('What did you learn?'),
    ).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('hides add form when Cancel is clicked', async () => {
    const user = userEvent.setup();
    renderLearningList(createMockItem());

    await user.click(screen.getByText('Add Learning'));
    await user.click(screen.getByText('Cancel'));

    expect(
      screen.queryByPlaceholderText('What did you learn?'),
    ).not.toBeInTheDocument();
  });

  it('calls addLearning when saving a new learning', async () => {
    const user = userEvent.setup();
    renderLearningList(createMockItem());

    await user.click(screen.getByText('Add Learning'));
    await user.type(
      screen.getByPlaceholderText('What did you learn?'),
      'Use mocks sparingly',
    );
    await user.click(screen.getByText('Save'));

    expect(addLearning).toHaveBeenCalledWith(
      'item-1',
      expect.objectContaining({
        text: 'Use mocks sparingly',
        appliedInContentId: null,
      }),
    );
  });

  it('does not call addLearning when text is empty', async () => {
    const user = userEvent.setup();
    renderLearningList(createMockItem());

    await user.click(screen.getByText('Add Learning'));
    await user.click(screen.getByText('Save'));

    expect(addLearning).not.toHaveBeenCalled();
  });

  it('renders a learning with text and date', () => {
    const learning = createMockLearning();
    renderLearningList(createMockItem({ learnings: [learning] }));

    expect(screen.getByText('Always test edge cases')).toBeInTheDocument();
    expect(screen.getByText('Jan 15, 2026')).toBeInTheDocument();
  });

  it('shows edit form when edit button is clicked', async () => {
    const user = userEvent.setup();
    const learning = createMockLearning();
    renderLearningList(createMockItem({ learnings: [learning] }));

    await user.click(screen.getByLabelText('Edit learning'));

    const textarea = screen.getByDisplayValue('Always test edge cases');
    expect(textarea).toBeInTheDocument();
  });

  it('calls updateLearning when saving an edit', async () => {
    const user = userEvent.setup();
    const learning = createMockLearning();
    renderLearningList(createMockItem({ learnings: [learning] }));

    await user.click(screen.getByLabelText('Edit learning'));
    const textarea = screen.getByDisplayValue('Always test edge cases');
    await user.clear(textarea);
    await user.type(textarea, 'Updated learning text');
    await user.click(screen.getByText('Save'));

    expect(updateLearning).toHaveBeenCalledWith(
      'item-1',
      expect.objectContaining({
        id: 'learn-1',
        text: 'Updated learning text',
      }),
    );
  });

  it('cancels edit without calling updateLearning', async () => {
    const user = userEvent.setup();
    const learning = createMockLearning();
    renderLearningList(createMockItem({ learnings: [learning] }));

    await user.click(screen.getByLabelText('Edit learning'));
    await user.click(screen.getByText('Cancel'));

    expect(updateLearning).not.toHaveBeenCalled();
    expect(screen.getByText('Always test edge cases')).toBeInTheDocument();
  });

  it('shows delete confirmation dialog', async () => {
    const user = userEvent.setup();
    const learning = createMockLearning();
    renderLearningList(createMockItem({ learnings: [learning] }));

    await user.click(screen.getByLabelText('Delete learning'));

    expect(screen.getByText('Delete this learning?')).toBeInTheDocument();
    expect(screen.getByText(/permanently remove/)).toBeInTheDocument();
  });

  it('calls removeLearning when delete is confirmed', async () => {
    const user = userEvent.setup();
    const learning = createMockLearning();
    renderLearningList(createMockItem({ learnings: [learning] }));

    await user.click(screen.getByLabelText('Delete learning'));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(removeLearning).toHaveBeenCalledWith('item-1', 'learn-1');
  });

  it('shows "Applied in" dropdown with other content items', async () => {
    // Radix Select sets pointer-events: none on inner span
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const learning = createMockLearning();
    const otherItem = createMockItem({
      id: 'item-2',
      title: 'Another Video',
    });
    renderLearningList(createMockItem({ learnings: [learning] }), [otherItem]);

    await user.click(screen.getByText('Applied in...'));

    expect(screen.getByText('Another Video')).toBeInTheDocument();
  });

  it('calls updateLearning when "Applied in" is selected', async () => {
    // Radix Select sets pointer-events: none on inner span
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const learning = createMockLearning();
    const otherItem = createMockItem({
      id: 'item-2',
      title: 'Another Video',
    });
    renderLearningList(createMockItem({ learnings: [learning] }), [otherItem]);

    await user.click(screen.getByText('Applied in...'));
    await user.click(screen.getByText('Another Video'));

    expect(updateLearning).toHaveBeenCalledWith(
      'item-1',
      expect.objectContaining({
        id: 'learn-1',
        appliedInContentId: 'item-2',
      }),
    );
  });

  it('shows applied-in link when appliedInContentId is set', () => {
    const learning = createMockLearning({ appliedInContentId: 'item-2' });
    const otherItem = createMockItem({
      id: 'item-2',
      title: 'Another Video',
    });
    renderLearningList(createMockItem({ learnings: [learning] }), [otherItem]);

    expect(screen.getByText('Applied in:')).toBeInTheDocument();
    expect(screen.getByText('Another Video')).toBeInTheDocument();
  });

  it('can clear applied-in link', async () => {
    const user = userEvent.setup();
    const learning = createMockLearning({ appliedInContentId: 'item-2' });
    const otherItem = createMockItem({
      id: 'item-2',
      title: 'Another Video',
    });
    renderLearningList(createMockItem({ learnings: [learning] }), [otherItem]);

    await user.click(screen.getByLabelText('Remove applied-in link'));

    expect(updateLearning).toHaveBeenCalledWith(
      'item-1',
      expect.objectContaining({
        id: 'learn-1',
        appliedInContentId: null,
      }),
    );
  });
});
