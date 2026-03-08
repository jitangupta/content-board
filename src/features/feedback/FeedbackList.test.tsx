import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeedbackList } from './FeedbackList';
import type { ContentItem, Feedback } from '@/types/content';
import * as firestoreService from '@/services/firestore';

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

function createMockFeedback(overrides: Partial<Feedback> = {}): Feedback {
  return {
    id: 'fb-1',
    source: 'self',
    text: 'Great pacing in this video',
    dateAdded: '2026-01-15T00:00:00.000Z',
    ...overrides,
  };
}

describe('FeedbackList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows empty state when no feedback exists', () => {
    render(<FeedbackList item={createMockItem()} />);
    expect(
      screen.getByText(
        'No feedback yet. Collect feedback from yourself, peers, or viewers.',
      ),
    ).toBeInTheDocument();
  });

  it('renders feedback items with source badge, text, and date', () => {
    const item = createMockItem({
      feedback: [createMockFeedback()],
    });
    render(<FeedbackList item={item} />);

    expect(screen.getByText('self')).toBeInTheDocument();
    expect(screen.getByText('Great pacing in this video')).toBeInTheDocument();
    expect(screen.getByText('Jan 15, 2026')).toBeInTheDocument();
  });

  it('renders Add Feedback button', () => {
    render(<FeedbackList item={createMockItem()} />);
    expect(screen.getByText('Add Feedback')).toBeInTheDocument();
  });

  it('shows add form when Add Feedback is clicked', async () => {
    const user = userEvent.setup();
    render(<FeedbackList item={createMockItem()} />);

    await user.click(screen.getByText('Add Feedback'));

    expect(screen.getByPlaceholderText('Enter feedback...')).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('adds feedback with source and text', async () => {
    const user = userEvent.setup();
    render(<FeedbackList item={createMockItem()} />);

    await user.click(screen.getByText('Add Feedback'));
    await user.type(
      screen.getByPlaceholderText('Enter feedback...'),
      'Needs better intro',
    );
    await user.click(screen.getByText('Add'));

    expect(firestoreService.addFeedback).toHaveBeenCalledWith(
      'item-1',
      expect.objectContaining({
        source: 'self',
        text: 'Needs better intro',
      }),
    );
  });

  it('does not add feedback with empty text', async () => {
    const user = userEvent.setup();
    render(<FeedbackList item={createMockItem()} />);

    await user.click(screen.getByText('Add Feedback'));
    await user.click(screen.getByText('Add'));

    expect(firestoreService.addFeedback).not.toHaveBeenCalled();
  });

  it('hides form and resets on cancel', async () => {
    const user = userEvent.setup();
    render(<FeedbackList item={createMockItem()} />);

    await user.click(screen.getByText('Add Feedback'));
    await user.type(
      screen.getByPlaceholderText('Enter feedback...'),
      'Some text',
    );
    await user.click(screen.getByText('Cancel'));

    expect(
      screen.queryByPlaceholderText('Enter feedback...'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Add Feedback')).toBeInTheDocument();
  });

  it('enters edit mode when edit button is clicked', async () => {
    const user = userEvent.setup();
    const item = createMockItem({
      feedback: [createMockFeedback()],
    });
    render(<FeedbackList item={item} />);

    await user.click(screen.getByLabelText('Edit feedback'));

    expect(screen.getByDisplayValue('Great pacing in this video')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('saves edited feedback', async () => {
    const user = userEvent.setup();
    const fb = createMockFeedback();
    const item = createMockItem({ feedback: [fb] });
    render(<FeedbackList item={item} />);

    await user.click(screen.getByLabelText('Edit feedback'));
    const textarea = screen.getByDisplayValue('Great pacing in this video');
    await user.clear(textarea);
    await user.type(textarea, 'Updated feedback text');
    await user.click(screen.getByText('Save'));

    expect(firestoreService.updateFeedback).toHaveBeenCalledWith(
      'item-1',
      expect.objectContaining({
        id: 'fb-1',
        text: 'Updated feedback text',
        source: 'self',
      }),
    );
  });

  it('cancels editing without saving', async () => {
    const user = userEvent.setup();
    const item = createMockItem({
      feedback: [createMockFeedback()],
    });
    render(<FeedbackList item={item} />);

    await user.click(screen.getByLabelText('Edit feedback'));
    // Click the Cancel button (in edit form, not add form)
    const cancelButtons = screen.getAllByText('Cancel');
    await user.click(cancelButtons[cancelButtons.length - 1]);

    expect(firestoreService.updateFeedback).not.toHaveBeenCalled();
    expect(screen.getByText('Great pacing in this video')).toBeInTheDocument();
  });

  it('shows delete confirmation dialog', async () => {
    const user = userEvent.setup();
    const item = createMockItem({
      feedback: [createMockFeedback()],
    });
    render(<FeedbackList item={item} />);

    await user.click(screen.getByLabelText('Delete feedback'));

    expect(screen.getByText('Delete feedback?')).toBeInTheDocument();
    expect(screen.getByText(/permanently remove/)).toBeInTheDocument();
  });

  it('deletes feedback after confirmation', async () => {
    const user = userEvent.setup();
    const item = createMockItem({
      feedback: [createMockFeedback()],
    });
    render(<FeedbackList item={item} />);

    await user.click(screen.getByLabelText('Delete feedback'));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(firestoreService.removeFeedback).toHaveBeenCalledWith(
      'item-1',
      'fb-1',
    );
  });

  describe('source badge colors', () => {
    it('renders self badge with blue color', () => {
      const item = createMockItem({
        feedback: [createMockFeedback({ source: 'self' })],
      });
      render(<FeedbackList item={item} />);
      const badge = screen.getByTestId('source-badge-self');
      expect(badge.className).toContain('bg-blue-100');
      expect(badge.className).toContain('text-blue-700');
    });

    it('renders peer badge with purple color', () => {
      const item = createMockItem({
        feedback: [createMockFeedback({ source: 'peer', id: 'fb-2' })],
      });
      render(<FeedbackList item={item} />);
      const badge = screen.getByTestId('source-badge-peer');
      expect(badge.className).toContain('bg-purple-100');
      expect(badge.className).toContain('text-purple-700');
    });

    it('renders family badge with green color', () => {
      const item = createMockItem({
        feedback: [createMockFeedback({ source: 'family', id: 'fb-3' })],
      });
      render(<FeedbackList item={item} />);
      const badge = screen.getByTestId('source-badge-family');
      expect(badge.className).toContain('bg-green-100');
      expect(badge.className).toContain('text-green-700');
    });

    it('renders comment badge with orange color', () => {
      const item = createMockItem({
        feedback: [createMockFeedback({ source: 'comment', id: 'fb-4' })],
      });
      render(<FeedbackList item={item} />);
      const badge = screen.getByTestId('source-badge-comment');
      expect(badge.className).toContain('bg-orange-100');
      expect(badge.className).toContain('text-orange-700');
    });
  });

  it('renders multiple feedback items', () => {
    const item = createMockItem({
      feedback: [
        createMockFeedback({ id: 'fb-1', source: 'self', text: 'First feedback' }),
        createMockFeedback({ id: 'fb-2', source: 'peer', text: 'Second feedback' }),
        createMockFeedback({ id: 'fb-3', source: 'family', text: 'Third feedback' }),
      ],
    });
    render(<FeedbackList item={item} />);

    expect(screen.getByText('First feedback')).toBeInTheDocument();
    expect(screen.getByText('Second feedback')).toBeInTheDocument();
    expect(screen.getByText('Third feedback')).toBeInTheDocument();
  });
});
