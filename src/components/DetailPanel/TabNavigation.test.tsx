import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { TabNavigation } from '@/components/DetailPanel/TabNavigation';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderTabNavigation(activeTab = 'content', contentType: 'video' | 'short' = 'video') {
  return render(
    <MemoryRouter>
      <TabNavigation contentId="abc123" activeTab={activeTab} contentType={contentType} />
    </MemoryRouter>,
  );
}

describe('TabNavigation', () => {
  it('renders all five tabs for video content', () => {
    renderTabNavigation();

    expect(screen.getByRole('tab', { name: 'Content' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Production' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Learn' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Feedback' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Shorts' })).toBeInTheDocument();
  });

  it('does not render Shorts tab for short content', () => {
    renderTabNavigation('content', 'short');

    expect(screen.getByRole('tab', { name: 'Content' })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Shorts' })).not.toBeInTheDocument();
  });

  it('marks the active tab as selected', () => {
    renderTabNavigation('production');

    expect(screen.getByRole('tab', { name: 'Production' })).toHaveAttribute(
      'data-state',
      'active',
    );
  });

  it('navigates to the correct URL on tab click', async () => {
    const user = userEvent.setup();
    renderTabNavigation();

    await user.click(screen.getByRole('tab', { name: 'Learn' }));

    expect(mockNavigate).toHaveBeenCalledWith('/content/abc123/learn');
  });
});
