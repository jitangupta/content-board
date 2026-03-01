import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ContentItem } from '@/components/Sidebar/ContentItem';
import type { ContentItem as ContentItemType } from '@/types/content';

function createMockItem(overrides: Partial<ContentItemType> = {}): ContentItemType {
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

function renderContentItem(
  item: ContentItemType,
  route = '/content',
): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route
          path="/content"
          element={<ContentItem item={item} />}
        />
        <Route
          path="/content/:contentId"
          element={<ContentItem item={item} />}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ContentItem', () => {
  it('renders the item title', () => {
    renderContentItem(createMockItem({ title: 'My Video' }));
    expect(screen.getByText('My Video')).toBeInTheDocument();
  });

  it('shows "Untitled" when title is empty', () => {
    renderContentItem(createMockItem({ title: '' }));
    expect(screen.getByText('Untitled')).toBeInTheDocument();
  });

  it('renders a status badge', () => {
    renderContentItem(createMockItem({ status: 'draft' }));
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('navigates to /content/:id on click', async () => {
    const user = userEvent.setup();
    const item = createMockItem({ id: 'abc123' });

    const { container } = render(
      <MemoryRouter initialEntries={['/content']}>
        <Routes>
          <Route path="/content" element={<ContentItem item={item} />} />
          <Route
            path="/content/:contentId"
            element={<div>Detail view</div>}
          />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(container.querySelector('button')!);
    expect(screen.getByText('Detail view')).toBeInTheDocument();
  });

  it('applies selected styling when contentId matches', () => {
    const item = createMockItem({ id: 'item-1' });
    const { container } = renderContentItem(item, '/content/item-1');
    const button = container.querySelector('button');
    expect(button?.className).toContain('bg-accent');
  });
});
