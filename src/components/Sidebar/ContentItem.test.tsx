import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ContentItem } from '@/components/Sidebar/ContentItem';

function renderContentItem(
  props: { id: string; title: string; status: 'draft' | 'published'; contentType?: 'video' | 'short' },
  initialPath = '/content',
) {
  const fullProps = { contentType: 'video' as const, ...props };
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/content" element={<ContentItem {...fullProps} />} />
        <Route path="/content/:contentId" element={<ContentItem {...fullProps} />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ContentItem', () => {
  it('renders title and status badge', () => {
    renderContentItem({ id: '1', title: 'My Video', status: 'draft' });

    expect(screen.getByText('My Video')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('navigates to /content/:id on click', async () => {
    const user = userEvent.setup();

    // We track navigation by checking if the component re-renders at the new route
    render(
      <MemoryRouter initialEntries={['/content']}>
        <Routes>
          <Route
            path="/content"
            element={<ContentItem id="abc" title="Test" status="draft" contentType="video" />}
          />
          <Route
            path="/content/:contentId"
            element={
              <div>
                <span data-testid="navigated">Navigated</span>
                <ContentItem id="abc" title="Test" status="draft" contentType="video" />
              </div>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByTestId('content-item-abc'));

    expect(screen.getByTestId('navigated')).toBeInTheDocument();
  });

  it('applies selected styling when URL matches item id', () => {
    renderContentItem(
      { id: 'abc', title: 'Selected Video', status: 'published' },
      '/content/abc',
    );

    const button = screen.getByTestId('content-item-abc');
    expect(button.className).toContain('bg-accent');
    expect(button.className).toContain('font-medium');
  });

  it('does not apply selected styling when URL does not match', () => {
    renderContentItem(
      { id: 'abc', title: 'Not Selected', status: 'draft' },
      '/content/other',
    );

    const button = screen.getByTestId('content-item-abc');
    expect(button.className).not.toContain('font-medium');
  });

  it('truncates long titles', () => {
    renderContentItem({
      id: '1',
      title: 'A very long title that should be truncated via CSS',
      status: 'draft',
    });

    const titleSpan = screen.getByText(
      'A very long title that should be truncated via CSS',
    );
    expect(titleSpan.className).toContain('truncate');
  });
});
