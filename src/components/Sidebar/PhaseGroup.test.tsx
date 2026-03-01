import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { PhaseGroup } from '@/components/Sidebar/PhaseGroup';
import type { ContentItem } from '@/types/content';

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

function renderPhaseGroup(
  items: ContentItem[] = [],
): ReturnType<typeof render> {
  return render(
    <MemoryRouter>
      <PhaseGroup phase="pre-production" items={items} />
    </MemoryRouter>,
  );
}

describe('PhaseGroup', () => {
  it('renders the phase label', () => {
    renderPhaseGroup();
    expect(screen.getByText('Pre-Production')).toBeInTheDocument();
  });

  it('shows the item count badge', () => {
    const items = [
      createMockItem({ id: '1', title: 'Video 1' }),
      createMockItem({ id: '2', title: 'Video 2' }),
    ];
    renderPhaseGroup(items);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows zero count when no items', () => {
    renderPhaseGroup([]);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders content items when expanded (default)', () => {
    const items = [createMockItem({ id: '1', title: 'My Video' })];
    renderPhaseGroup(items);
    expect(screen.getByText('My Video')).toBeInTheDocument();
  });

  it('collapses and hides items on click', async () => {
    const user = userEvent.setup();
    const items = [createMockItem({ id: '1', title: 'My Video' })];
    renderPhaseGroup(items);

    const trigger = screen.getByText('Pre-Production');
    await user.click(trigger);

    expect(screen.queryByText('My Video')).not.toBeInTheDocument();
  });

  it('re-expands on second click', async () => {
    const user = userEvent.setup();
    const items = [createMockItem({ id: '1', title: 'My Video' })];
    renderPhaseGroup(items);

    const trigger = screen.getByText('Pre-Production');
    await user.click(trigger);
    await user.click(trigger);

    expect(screen.getByText('My Video')).toBeInTheDocument();
  });
});
