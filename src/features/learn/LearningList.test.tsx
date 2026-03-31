import { beforeAll, describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LearningList } from '@/features/learn/LearningList';
import { useContent } from '@/features/content/useContent';
import { useLearnings } from '@/features/learn/useLearnings';
import type { ContentItem, Learning } from '@/types/content';

vi.mock('@/services/firebase', () => ({ auth: {}, db: {} }));
vi.mock('@/features/content/useContent');
vi.mock('@/features/learn/useLearnings');

// Radix Select requires these APIs that jsdom doesn't provide
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.HTMLElement.prototype.hasPointerCapture = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
  window.HTMLElement.prototype.setPointerCapture = vi.fn();

  // Radix uses ResizeObserver
  window.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});

const mockAdd = vi.fn();
const mockUpdate = vi.fn();
const mockRemove = vi.fn();
const mockNavigate = vi.fn();

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

function setup(content?: ContentItem, otherContents: ContentItem[] = []) {
  const contentItem = content ?? makeContentItem();
  const allContents = [contentItem, ...otherContents];

  vi.mocked(useContent).mockReturnValue({
    contents: allContents,
    loading: false,
    error: null,
    createContent: vi.fn(),
    updateContent: vi.fn(),
    deleteContent: vi.fn(),
    updateStatus: vi.fn(),
    reorderContents: vi.fn(),
  });

  vi.mocked(useLearnings).mockReturnValue({
    add: mockAdd,
    update: mockUpdate,
    remove: mockRemove,
  });

  return render(
    <LearningList content={contentItem} onNavigateToContent={mockNavigate} />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockAdd.mockResolvedValue(undefined);
  mockUpdate.mockResolvedValue(undefined);
  mockRemove.mockResolvedValue(undefined);
});

describe('LearningList', () => {
  describe('empty state', () => {
    it('shows empty message when no learnings exist', () => {
      setup();

      expect(screen.getByText('No learnings yet.')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Capture what you learned while creating this video.',
        ),
      ).toBeInTheDocument();
    });

    it('shows Add Learning button in empty state', () => {
      setup();

      expect(
        screen.getByRole('button', { name: /add learning/i }),
      ).toBeInTheDocument();
    });
  });

  describe('displaying learnings', () => {
    it('shows learning text and formatted date', () => {
      const content = makeContentItem({
        learnings: [makeLearning()],
      });
      setup(content);

      expect(
        screen.getByText('Always test error boundaries'),
      ).toBeInTheDocument();
      expect(screen.getByText('Jan 15, 2026')).toBeInTheDocument();
    });

    it('shows multiple learnings', () => {
      const content = makeContentItem({
        learnings: [
          makeLearning({ id: 'l1', text: 'First learning' }),
          makeLearning({ id: 'l2', text: 'Second learning' }),
        ],
      });
      setup(content);

      expect(screen.getByText('First learning')).toBeInTheDocument();
      expect(screen.getByText('Second learning')).toBeInTheDocument();
    });
  });

  describe('adding a learning', () => {
    it('shows inline form when Add Learning is clicked', async () => {
      const user = userEvent.setup();
      setup();

      await user.click(
        screen.getByRole('button', { name: /add learning/i }),
      );

      expect(
        screen.getByPlaceholderText('What did you learn?'),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Cancel' }),
      ).toBeInTheDocument();
    });

    it('calls add with learning data on save', async () => {
      const user = userEvent.setup();
      setup();

      await user.click(
        screen.getByRole('button', { name: /add learning/i }),
      );
      await user.type(
        screen.getByPlaceholderText('What did you learn?'),
        'New insight about testing',
      );
      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(mockAdd).toHaveBeenCalledOnce();
      expect(mockAdd).toHaveBeenCalledWith(
        'content-1',
        expect.objectContaining({
          text: 'New insight about testing',
          appliedInContentId: null,
        }),
      );
    });

    it('disables save button when text is empty', async () => {
      const user = userEvent.setup();
      setup();

      await user.click(
        screen.getByRole('button', { name: /add learning/i }),
      );

      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    });

    it('hides form when cancel is clicked', async () => {
      const user = userEvent.setup();
      setup();

      await user.click(
        screen.getByRole('button', { name: /add learning/i }),
      );
      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(
        screen.queryByPlaceholderText('What did you learn?'),
      ).not.toBeInTheDocument();
    });
  });

  describe('editing a learning', () => {
    it('shows edit form when edit button is clicked', async () => {
      const user = userEvent.setup();
      const content = makeContentItem({
        learnings: [makeLearning()],
      });
      setup(content);

      const editButtons = screen.getAllByRole('button');
      const editButton = editButtons.find(
        (btn) => btn.querySelector('svg.lucide-pencil') !== null,
      );
      expect(editButton).toBeDefined();
      await user.click(editButton!);

      // Should show textarea with current text
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('Always test error boundaries');
    });

    it('calls update with new text on save', async () => {
      const user = userEvent.setup();
      const learning = makeLearning();
      const content = makeContentItem({ learnings: [learning] });
      setup(content);

      // Click edit button
      const editButtons = screen.getAllByRole('button');
      const editButton = editButtons.find(
        (btn) => btn.querySelector('svg.lucide-pencil') !== null,
      );
      await user.click(editButton!);

      // Clear and type new text
      const textarea = screen.getByRole('textbox');
      await user.clear(textarea);
      await user.type(textarea, 'Updated learning text');
      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(mockUpdate).toHaveBeenCalledOnce();
      expect(mockUpdate).toHaveBeenCalledWith('content-1', {
        ...learning,
        text: 'Updated learning text',
      });
    });
  });

  describe('deleting a learning', () => {
    it('shows confirmation dialog before deleting', async () => {
      const user = userEvent.setup();
      const content = makeContentItem({
        learnings: [makeLearning()],
      });
      setup(content);

      // Click delete button (trash icon)
      const deleteButtons = screen.getAllByRole('button');
      const deleteButton = deleteButtons.find(
        (btn) => btn.querySelector('svg.lucide-trash2') !== null,
      );
      expect(deleteButton).toBeDefined();
      await user.click(deleteButton!);

      // Confirmation dialog should appear
      expect(screen.getByText('Delete learning?')).toBeInTheDocument();
      expect(
        screen.getByText('This learning will be permanently removed.'),
      ).toBeInTheDocument();
    });

    it('calls remove when confirmed', async () => {
      const user = userEvent.setup();
      const content = makeContentItem({
        learnings: [makeLearning({ id: 'learn-1' })],
      });
      setup(content);

      // Click delete, then confirm
      const deleteButtons = screen.getAllByRole('button');
      const deleteButton = deleteButtons.find(
        (btn) => btn.querySelector('svg.lucide-trash2') !== null,
      );
      await user.click(deleteButton!);

      const dialog = screen.getByRole('alertdialog');
      await user.click(
        within(dialog).getByRole('button', { name: 'Delete' }),
      );

      expect(mockRemove).toHaveBeenCalledOnce();
      expect(mockRemove).toHaveBeenCalledWith('content-1', 'learn-1');
    });
  });

  describe('Applied in dropdown', () => {
    it('shows other content items in dropdown', async () => {
      const content = makeContentItem({
        learnings: [makeLearning()],
      });
      const otherContent = makeContentItem({
        id: 'content-2',
        title: 'Other Video',
      });
      setup(content, [otherContent]);

      // Radix Select requires pointerDown to open
      const trigger = screen.getByRole('combobox');
      fireEvent.pointerDown(trigger, {
        button: 0,
        ctrlKey: false,
        pointerType: 'mouse',
      });

      // Options appear as role="option" in the Radix listbox
      const options = screen.getAllByRole('option');
      const optionTexts = options.map((o) => o.textContent);
      expect(optionTexts).toContain('Not applied');
      expect(optionTexts).toContain('Other Video');
    });

    it('calls update when a content item is selected', async () => {
      const learning = makeLearning();
      const content = makeContentItem({ learnings: [learning] });
      const otherContent = makeContentItem({
        id: 'content-2',
        title: 'Other Video',
      });
      setup(content, [otherContent]);

      // Open the dropdown
      const trigger = screen.getByRole('combobox');
      fireEvent.pointerDown(trigger, {
        button: 0,
        ctrlKey: false,
        pointerType: 'mouse',
      });

      // Select the option from the listbox
      const options = screen.getAllByRole('option');
      const otherVideoOption = options.find(
        (o) => o.textContent === 'Other Video',
      );
      expect(otherVideoOption).toBeDefined();
      fireEvent.click(otherVideoOption!);

      expect(mockUpdate).toHaveBeenCalledOnce();
      expect(mockUpdate).toHaveBeenCalledWith('content-1', {
        ...learning,
        appliedInContentId: 'content-2',
      });
    });

    it('shows linked content as clickable link', () => {
      const content = makeContentItem({
        learnings: [makeLearning({ appliedInContentId: 'content-2' })],
      });
      const otherContent = makeContentItem({
        id: 'content-2',
        title: 'Other Video',
      });
      setup(content, [otherContent]);

      // "Other Video" appears in both the link button and the select value
      const matches = screen.getAllByText('Other Video');
      expect(matches.length).toBeGreaterThanOrEqual(1);
      // Verify the link button specifically exists
      const linkButton = matches.find(
        (el) => el.closest('button[type="button"]') !== null,
      );
      expect(linkButton).toBeDefined();
    });

    it('navigates when Applied in link is clicked', async () => {
      const user = userEvent.setup();
      const content = makeContentItem({
        learnings: [makeLearning({ appliedInContentId: 'content-2' })],
      });
      const otherContent = makeContentItem({
        id: 'content-2',
        title: 'Linked Video',
      });
      setup(content, [otherContent]);

      // Find the link button (has ExternalLink icon)
      const linkButton = screen.getByRole('button', {
        name: /linked video/i,
      });
      await user.click(linkButton);

      expect(mockNavigate).toHaveBeenCalledWith('content-2');
    });
  });
});
