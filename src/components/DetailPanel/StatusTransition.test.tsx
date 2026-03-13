import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { StatusTransition } from '@/components/DetailPanel/StatusTransition';
import { useContent } from '@/features/content/useContent';
import type { ContentContextValue } from '@/features/content/ContentContext';
import type { ContentItem } from '@/types/content';

vi.mock('@/features/content/useContent');
vi.mock('@/services/sentry', () => ({
  captureError: vi.fn(),
}));

function makeContentItem(overrides: Partial<ContentItem> = {}): ContentItem {
  return {
    id: 'abc123',
    title: 'Test Video',
    description: '',
    tags: [],
    status: 'recorded',
    phase: 'production',
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
      created: '2024-01-01',
      technicallyReady: '2024-01-05',
      shootingScriptReady: '2024-01-10',
      readyToRecord: '2024-01-15',
      recorded: '2024-01-20',
      edited: null,
      published: null,
      shortsExtracted: null,
      lifetimeValueEnds: null,
      updated: '2024-01-20',
    },
    ...overrides,
  };
}

function mockUseContent(overrides: Partial<ContentContextValue> = {}): ContentContextValue {
  const value: ContentContextValue = {
    contents: [],
    loading: false,
    error: null,
    createContent: vi.fn(),
    updateContent: vi.fn(),
    deleteContent: vi.fn(),
    updateStatus: vi.fn().mockResolvedValue(undefined),
    reorderContents: vi.fn(),
    ...overrides,
  };
  vi.mocked(useContent).mockReturnValue(value);
  return value;
}

function renderStatusTransition(content: ContentItem) {
  return render(
    <MemoryRouter>
      <StatusTransition content={content} />
    </MemoryRouter>,
  );
}

describe('StatusTransition', () => {
  it('shows the current status badge', () => {
    mockUseContent();
    renderStatusTransition(makeContentItem({ status: 'recorded' }));

    expect(screen.getByTestId('status-badge')).toHaveTextContent('Recorded');
  });

  it('shows advance button with next status label', () => {
    mockUseContent();
    renderStatusTransition(makeContentItem({ status: 'recorded' }));

    const advanceBtn = screen.getByTestId('advance-button');
    expect(advanceBtn).toHaveTextContent('Edited');
  });

  it('shows move-back button with previous status label', () => {
    mockUseContent();
    renderStatusTransition(makeContentItem({ status: 'recorded' }));

    const backBtn = screen.getByTestId('move-back-button');
    expect(backBtn).toHaveTextContent('Ready to Record');
  });

  it('hides move-back button when status is draft', () => {
    mockUseContent();
    renderStatusTransition(makeContentItem({ status: 'draft', phase: 'pre-production' }));

    expect(screen.queryByTestId('move-back-button')).not.toBeInTheDocument();
    expect(screen.getByTestId('advance-button')).toHaveTextContent('Technically Ready');
  });

  it('hides advance button when status is lifetime-value-ends', () => {
    mockUseContent();
    renderStatusTransition(
      makeContentItem({ status: 'lifetime-value-ends', phase: 'post-production' }),
    );

    expect(screen.queryByTestId('advance-button')).not.toBeInTheDocument();
    expect(screen.getByTestId('move-back-button')).toHaveTextContent('Extracted Shorts');
  });

  it('calls updateStatus with next status on advance click', async () => {
    const user = userEvent.setup();
    const ctx = mockUseContent();
    renderStatusTransition(makeContentItem({ status: 'recorded' }));

    await user.click(screen.getByTestId('advance-button'));

    expect(ctx.updateStatus).toHaveBeenCalledWith('abc123', 'edited');
  });

  it('shows confirmation dialog on move-back click', async () => {
    const user = userEvent.setup();
    mockUseContent();
    renderStatusTransition(makeContentItem({ status: 'recorded' }));

    await user.click(screen.getByTestId('move-back-button'));

    expect(screen.getByText(/Move back to Ready to Record\?/)).toBeInTheDocument();
    expect(screen.getByText(/revert the status/)).toBeInTheDocument();
  });

  it('calls updateStatus with previous status on move-back confirm', async () => {
    const user = userEvent.setup();
    const ctx = mockUseContent();
    renderStatusTransition(makeContentItem({ status: 'recorded' }));

    await user.click(screen.getByTestId('move-back-button'));
    await user.click(screen.getByRole('button', { name: 'Move back' }));

    expect(ctx.updateStatus).toHaveBeenCalledWith('abc123', 'ready-to-record');
  });

  it('does not call updateStatus when move-back is cancelled', async () => {
    const user = userEvent.setup();
    const ctx = mockUseContent();
    renderStatusTransition(makeContentItem({ status: 'recorded' }));

    await user.click(screen.getByTestId('move-back-button'));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(ctx.updateStatus).not.toHaveBeenCalled();
  });
});
