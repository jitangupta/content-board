import { beforeEach, describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeedbackList } from '@/features/feedback/FeedbackList';
import type { Feedback } from '@/types/content';

const addFeedbackMock = vi.fn().mockResolvedValue(undefined);
const updateFeedbackMock = vi.fn().mockResolvedValue(undefined);
const removeFeedbackMock = vi.fn().mockResolvedValue(undefined);

vi.mock('@/features/feedback/useFeedback', () => ({
  useFeedback: () => ({
    addFeedback: addFeedbackMock,
    updateFeedback: updateFeedbackMock,
    removeFeedback: removeFeedbackMock,
  }),
}));

vi.mock('@/services/sentry', () => ({
  captureError: vi.fn(),
}));

function makeFeedback(overrides: Partial<Feedback> = {}): Feedback {
  return {
    id: 'fb-1',
    source: 'self',
    text: 'Good pacing throughout',
    dateAdded: '2026-01-15T12:00:00.000Z',
    ...overrides,
  };
}

function renderFeedbackList(feedback: Feedback[] = []) {
  return render(
    <FeedbackList contentId="abc123" feedback={feedback} />,
  );
}

describe('FeedbackList', () => {
  beforeEach(() => {
    addFeedbackMock.mockClear();
    updateFeedbackMock.mockClear();
    removeFeedbackMock.mockClear();
  });

  it('shows empty state when no feedback', () => {
    renderFeedbackList();

    expect(
      screen.getByText(
        'No feedback yet. Collect feedback from yourself, peers, or viewers.',
      ),
    ).toBeInTheDocument();
  });

  it('renders feedback items with source badge and date', () => {
    const items = [
      makeFeedback(),
      makeFeedback({
        id: 'fb-2',
        source: 'peer',
        text: 'Needs better intro',
        dateAdded: '2026-02-10T12:00:00.000Z',
      }),
    ];
    renderFeedbackList(items);

    expect(screen.getByText('Good pacing throughout')).toBeInTheDocument();
    expect(screen.getByText('Needs better intro')).toBeInTheDocument();
    expect(screen.getByText('Self')).toBeInTheDocument();
    expect(screen.getByText('Peer')).toBeInTheDocument();
    expect(screen.getByText('Jan 15, 2026')).toBeInTheDocument();
    expect(screen.getByText('Feb 10, 2026')).toBeInTheDocument();
  });

  it('shows source badges with correct colors', () => {
    const items = [
      makeFeedback({ id: 'fb-1', source: 'self' }),
      makeFeedback({ id: 'fb-2', source: 'peer' }),
      makeFeedback({ id: 'fb-3', source: 'family' }),
      makeFeedback({ id: 'fb-4', source: 'comment' }),
    ];
    renderFeedbackList(items);

    const selfBadge = screen.getByTestId('source-badge-self');
    const peerBadge = screen.getByTestId('source-badge-peer');
    const familyBadge = screen.getByTestId('source-badge-family');
    const commentBadge = screen.getByTestId('source-badge-comment');

    expect(selfBadge.className).toContain('bg-blue-100');
    expect(peerBadge.className).toContain('bg-purple-100');
    expect(familyBadge.className).toContain('bg-green-100');
    expect(commentBadge.className).toContain('bg-orange-100');
  });

  it('shows add form when Add Feedback is clicked', async () => {
    const user = userEvent.setup();
    renderFeedbackList();

    await user.click(screen.getByText('Add Feedback'));

    expect(screen.getByLabelText('Source')).toBeInTheDocument();
    expect(screen.getByLabelText('Feedback')).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('adds feedback with source and text', async () => {
    const user = userEvent.setup();
    renderFeedbackList();

    await user.click(screen.getByText('Add Feedback'));
    await user.type(
      screen.getByLabelText('Feedback'),
      'Great thumbnail',
    );
    await user.click(screen.getByText('Add'));

    expect(addFeedbackMock).toHaveBeenCalledWith(
      'abc123',
      'self',
      'Great thumbnail',
    );
  });

  it('does not add feedback with empty text', async () => {
    const user = userEvent.setup();
    renderFeedbackList();

    await user.click(screen.getByText('Add Feedback'));
    await user.click(screen.getByText('Add'));

    expect(addFeedbackMock).not.toHaveBeenCalled();
  });

  it('hides add form on cancel', async () => {
    const user = userEvent.setup();
    renderFeedbackList();

    await user.click(screen.getByText('Add Feedback'));
    expect(screen.getByLabelText('Feedback')).toBeInTheDocument();

    await user.click(screen.getByText('Cancel'));
    expect(screen.queryByLabelText('Feedback')).not.toBeInTheDocument();
  });

  it('enters edit mode when edit button is clicked', async () => {
    const user = userEvent.setup();
    const item = makeFeedback();
    renderFeedbackList([item]);

    // Click the edit button (pencil icon)
    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find(
      (btn) => btn.querySelector('svg.lucide-pencil') !== null,
    );
    expect(editButton).toBeDefined();
    await user.click(editButton!);

    // Should show edit form with current values
    expect(screen.getByLabelText('Feedback')).toHaveValue(
      'Good pacing throughout',
    );
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('saves edited feedback', async () => {
    const user = userEvent.setup();
    const item = makeFeedback();
    renderFeedbackList([item]);

    // Enter edit mode
    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find(
      (btn) => btn.querySelector('svg.lucide-pencil') !== null,
    );
    await user.click(editButton!);

    // Change text
    const textarea = screen.getByLabelText('Feedback');
    await user.clear(textarea);
    await user.type(textarea, 'Updated feedback');
    await user.click(screen.getByText('Save'));

    expect(updateFeedbackMock).toHaveBeenCalledWith('abc123', {
      ...item,
      text: 'Updated feedback',
    });
  });

  it('cancels editing without saving', async () => {
    const user = userEvent.setup();
    const item = makeFeedback();
    renderFeedbackList([item]);

    // Enter edit mode
    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find(
      (btn) => btn.querySelector('svg.lucide-pencil') !== null,
    );
    await user.click(editButton!);

    // Cancel
    await user.click(screen.getByText('Cancel'));

    expect(updateFeedbackMock).not.toHaveBeenCalled();
    // Should show the original text again
    expect(screen.getByText('Good pacing throughout')).toBeInTheDocument();
  });

  it('deletes feedback after confirmation', async () => {
    const user = userEvent.setup();
    const item = makeFeedback();
    renderFeedbackList([item]);

    // Click delete button (trash icon)
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(
      (btn) => btn.querySelector('svg.lucide-trash-2') !== null,
    );
    expect(deleteButton).toBeDefined();
    await user.click(deleteButton!);

    // Confirm in the alert dialog
    await user.click(screen.getByText('Delete'));

    expect(removeFeedbackMock).toHaveBeenCalledWith('abc123', 'fb-1');
  });
});
