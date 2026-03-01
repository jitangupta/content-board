import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import {
  ContentContext,
  type ContentContextValue,
} from '@/features/content/ContentProvider';
import { StatusTransition } from '@/components/DetailPanel/StatusTransition';
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
      created: '2026-01-01T00:00:00Z',
      technicallyReady: null,
      shootingScriptReady: null,
      readyToRecord: null,
      recorded: null,
      edited: null,
      published: null,
      shortsExtracted: null,
      lifetimeValueEnds: null,
      updated: '2026-01-01T00:00:00Z',
    },
    ...overrides,
  };
}

function renderStatusTransition(
  item: ContentItem,
  contextOverrides: Partial<ContentContextValue> = {},
): ReturnType<typeof render> {
  const defaultContext: ContentContextValue = {
    contents: [item],
    loading: false,
    error: null,
    createContent: vi.fn(),
    updateContent: vi.fn(),
    deleteContent: vi.fn(),
    updateStatus: vi.fn().mockResolvedValue(undefined),
    ...contextOverrides,
  };

  return render(
    <ContentContext.Provider value={defaultContext}>
      <MemoryRouter>
        <StatusTransition item={item} />
      </MemoryRouter>
    </ContentContext.Provider>,
  );
}

describe('StatusTransition', () => {
  it('shows current status badge', () => {
    renderStatusTransition(createMockItem({ status: 'draft' }));
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('shows advance button with next status label for draft', () => {
    renderStatusTransition(createMockItem({ status: 'draft' }));
    expect(screen.getByText('Technically Ready')).toBeInTheDocument();
  });

  it('does not show move-back button for draft', () => {
    renderStatusTransition(createMockItem({ status: 'draft' }));
    // Only the advance button and status badge should exist
    expect(screen.queryByRole('button', { name: /chevron-left/i })).not.toBeInTheDocument();
    // Draft has no previous status, so there should be no button with a previous status label
    const buttons = screen.getAllByRole('button');
    // One advance button only
    expect(buttons).toHaveLength(1);
  });

  it('shows both buttons for middle status', () => {
    renderStatusTransition(createMockItem({ status: 'recorded', phase: 'production' }));
    expect(screen.getByText('Ready to Record')).toBeInTheDocument(); // move back
    expect(screen.getByText('Edited')).toBeInTheDocument(); // advance
  });

  it('does not show advance button for lifetime-value-ends', () => {
    renderStatusTransition(
      createMockItem({ status: 'lifetime-value-ends', phase: 'post-production' }),
    );
    expect(screen.getByText('Lifetime Value Ends')).toBeInTheDocument(); // status badge
    expect(screen.getByText('Extracted Shorts')).toBeInTheDocument(); // move back
    // Only the move-back trigger button should exist
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);
  });

  it('calls updateStatus with next status on advance click', async () => {
    const updateStatus = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderStatusTransition(createMockItem({ status: 'draft' }), { updateStatus });

    await user.click(screen.getByText('Technically Ready'));

    expect(updateStatus).toHaveBeenCalledWith('item-1', 'technically-ready');
  });

  it('shows success indicator after advance', async () => {
    const updateStatus = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderStatusTransition(createMockItem({ status: 'draft' }), { updateStatus });

    await user.click(screen.getByText('Technically Ready'));

    await waitFor(() => {
      expect(screen.getByText('Updated')).toBeInTheDocument();
    });
  });

  it('shows confirmation dialog on move-back click', async () => {
    const user = userEvent.setup();
    renderStatusTransition(createMockItem({ status: 'recorded', phase: 'production' }));

    await user.click(screen.getByText('Ready to Record'));

    expect(screen.getByText(/Move back to Ready to Record\?/)).toBeInTheDocument();
    expect(screen.getByText(/revert the status/)).toBeInTheDocument();
  });

  it('calls updateStatus with previous status on move-back confirm', async () => {
    const updateStatus = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderStatusTransition(
      createMockItem({ status: 'recorded', phase: 'production' }),
      { updateStatus },
    );

    await user.click(screen.getByText('Ready to Record'));
    await user.click(screen.getByText('Move Back'));

    expect(updateStatus).toHaveBeenCalledWith('item-1', 'ready-to-record');
  });

  it('shows error message when transition fails', async () => {
    const updateStatus = vi.fn().mockRejectedValue(new Error('fail'));
    const user = userEvent.setup();
    renderStatusTransition(createMockItem({ status: 'draft' }), { updateStatus });

    await user.click(screen.getByText('Technically Ready'));

    await waitFor(() => {
      expect(screen.getByText('Failed to advance status')).toBeInTheDocument();
    });
  });
});
