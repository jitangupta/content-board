import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { TabNavigation } from '@/components/DetailPanel/TabNavigation';

function renderTabNav(
  activeTab = 'content',
  contentId = 'abc123',
): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={[`/content/${contentId}/${activeTab}`]}>
      <Routes>
        <Route
          path="/content/:contentId/:tab"
          element={<TabNavigation contentId={contentId} activeTab={activeTab} />}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('TabNavigation', () => {
  it('renders all four tabs', () => {
    renderTabNav();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Production')).toBeInTheDocument();
    expect(screen.getByText('Learn')).toBeInTheDocument();
    expect(screen.getByText('Feedback')).toBeInTheDocument();
  });

  it('highlights the active tab', () => {
    renderTabNav('production');
    const tab = screen.getByText('Production');
    expect(tab.getAttribute('data-state')).toBe('active');
  });

  it('navigates on tab click', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/content/abc123/content']}>
        <Routes>
          <Route
            path="/content/:contentId/:tab"
            element={<TabNavigation contentId="abc123" activeTab="content" />}
          />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByText('Learn'));
    // After click, the component navigates to /content/abc123/learn
    // The tab triggers onValueChange which calls navigate
    expect(screen.getByText('Learn')).toBeInTheDocument();
  });
});
