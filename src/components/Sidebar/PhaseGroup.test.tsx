import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { PhaseGroup } from '@/components/Sidebar/PhaseGroup';
import type { ContentItem, ContentPhase } from '@/types/content';

vi.mock('@/features/content/useContent', () => ({
  useContent: () => ({
    contents: [],
    loading: false,
    error: null,
    createContent: vi.fn(),
    updateContent: vi.fn(),
    deleteContent: vi.fn(),
    updateStatus: vi.fn(),
    reorderContents: vi.fn(),
  }),
}));

function makeItem(overrides: Partial<ContentItem> = {}): ContentItem {
  return {
    id: '1',
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

function renderPhaseGroup(phase: ContentPhase, items: ContentItem[]) {
  return render(
    <MemoryRouter>
      <PhaseGroup phase={phase} items={items} />
    </MemoryRouter>,
  );
}

describe('PhaseGroup', () => {
  it('renders the phase label', () => {
    renderPhaseGroup('pre-production', []);

    expect(screen.getByText('Pre-Production')).toBeInTheDocument();
  });

  it('shows the correct item count', () => {
    const items = [
      makeItem({ id: '1', title: 'Video 1' }),
      makeItem({ id: '2', title: 'Video 2' }),
    ];

    renderPhaseGroup('pre-production', items);

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders all content items when expanded', () => {
    const items = [
      makeItem({ id: '1', title: 'Video A' }),
      makeItem({ id: '2', title: 'Video B' }),
    ];

    renderPhaseGroup('production', items);

    expect(screen.getByText('Video A')).toBeInTheDocument();
    expect(screen.getByText('Video B')).toBeInTheDocument();
  });

  it('collapses and hides items on click', async () => {
    const user = userEvent.setup();
    const items = [makeItem({ id: '1', title: 'Hidden Video' })];

    renderPhaseGroup('pre-production', items);

    expect(screen.getByText('Hidden Video')).toBeInTheDocument();

    await user.click(screen.getByText('Pre-Production'));

    expect(screen.queryByText('Hidden Video')).not.toBeInTheDocument();
  });

  it('expands again on second click', async () => {
    const user = userEvent.setup();
    const items = [makeItem({ id: '1', title: 'Toggle Video' })];

    renderPhaseGroup('pre-production', items);

    // Collapse
    await user.click(screen.getByText('Pre-Production'));
    expect(screen.queryByText('Toggle Video')).not.toBeInTheDocument();

    // Expand
    await user.click(screen.getByText('Pre-Production'));
    expect(screen.getByText('Toggle Video')).toBeInTheDocument();
  });

  it('starts expanded by default', () => {
    const items = [makeItem({ id: '1', title: 'Visible Video' })];

    renderPhaseGroup('post-production', items);

    expect(screen.getByText('Visible Video')).toBeVisible();
  });

  it('adds sortable attributes to pre-production items', () => {
    const items = [makeItem({ id: 'sortable-1', title: 'Sortable Item' })];

    render(
      <MemoryRouter>
        <PhaseGroup phase="pre-production" items={items} />
      </MemoryRouter>,
    );

    const button = screen.getByRole('button', { name: /Sortable Item/i });
    expect(button).toHaveAttribute('role', 'button');
    // useSortable adds aria-describedby for keyboard instructions
    expect(button).toHaveAttribute('aria-describedby');
  });

  it('does not add sortable attributes to production items', () => {
    const items = [makeItem({ id: 'p-1', title: 'Production Item', phase: 'production', status: 'recorded' })];

    render(
      <MemoryRouter>
        <PhaseGroup phase="production" items={items} />
      </MemoryRouter>,
    );

    const button = screen.getByRole('button', { name: /Production Item/i });
    // Non-sortable items should not have aria-describedby from useSortable
    expect(button).not.toHaveAttribute('aria-describedby');
  });
});
