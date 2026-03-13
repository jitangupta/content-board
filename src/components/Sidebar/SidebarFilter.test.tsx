import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SidebarFilter } from '@/components/Sidebar/SidebarFilter';

beforeAll(() => {
  Element.prototype.hasPointerCapture = vi.fn();
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
});

describe('SidebarFilter', () => {
  it('renders filter select with "All" as default', () => {
    render(<SidebarFilter value="all" onChange={vi.fn()} contentTypeFilter="all" />);
    expect(screen.getByTestId('sidebar-filter')).toBeInTheDocument();
    expect(screen.getByText('All')).toBeInTheDocument();
  });

  it('opens dropdown and shows phase options', async () => {
    const user = userEvent.setup();

    render(<SidebarFilter value="all" onChange={vi.fn()} contentTypeFilter="all" />);

    await user.click(screen.getByRole('combobox', { name: 'Filter content' }));

    expect(screen.getByRole('option', { name: 'Pre-Production' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Production' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Post-Production' })).toBeInTheDocument();
  });

  it('opens dropdown and shows status options', async () => {
    const user = userEvent.setup();

    render(<SidebarFilter value="all" onChange={vi.fn()} contentTypeFilter="all" />);

    await user.click(screen.getByRole('combobox', { name: 'Filter content' }));

    expect(screen.getByRole('option', { name: 'Draft' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Technically Ready' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Published' })).toBeInTheDocument();
  });

  it('calls onChange when a filter option is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<SidebarFilter value="all" onChange={onChange} contentTypeFilter="all" />);

    await user.click(screen.getByRole('combobox', { name: 'Filter content' }));
    await user.click(screen.getByRole('option', { name: 'Draft' }));

    expect(onChange).toHaveBeenCalledWith('draft');
  });
});
