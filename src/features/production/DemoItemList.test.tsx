import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DemoItemList } from './DemoItemList';
import type { DemoItem, DemoItemType } from '@/types/content';

function createDefaultProps(overrides: Record<string, unknown> = {}) {
  return {
    items: [] as DemoItem[],
    showForm: false,
    setShowForm: vi.fn(),
    demoType: 'repo' as DemoItemType,
    setDemoType: vi.fn(),
    demoDescription: '',
    setDemoDescription: vi.fn(),
    demoError: '',
    onAdd: vi.fn().mockResolvedValue(undefined),
    onToggleVerified: vi.fn().mockResolvedValue(undefined),
    onRemove: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('DemoItemList', () => {
  it('renders empty state when no items', () => {
    render(<DemoItemList {...createDefaultProps()} />);
    expect(screen.getByText(/No demo items yet/)).toBeInTheDocument();
  });

  it('renders Add Demo Item button', () => {
    render(<DemoItemList {...createDefaultProps()} />);
    expect(screen.getByText('Add Demo Item')).toBeInTheDocument();
  });

  it('calls setShowForm when Add Demo Item is clicked', async () => {
    const setShowForm = vi.fn();
    const user = userEvent.setup();
    render(<DemoItemList {...createDefaultProps({ setShowForm })} />);

    await user.click(screen.getByText('Add Demo Item'));
    expect(setShowForm).toHaveBeenCalledWith(true);
  });

  it('renders inline form when showForm is true', () => {
    render(<DemoItemList {...createDefaultProps({ showForm: true })} />);
    expect(screen.getByPlaceholderText('Describe the demo item...')).toBeInTheDocument();
  });

  it('shows error message when demoError is set', () => {
    render(<DemoItemList {...createDefaultProps({ showForm: true, demoError: 'Description is required' })} />);
    expect(screen.getByText('Description is required')).toBeInTheDocument();
  });

  it('calls onAdd when Add button is clicked', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<DemoItemList {...createDefaultProps({ showForm: true, onAdd })} />);

    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(onAdd).toHaveBeenCalled();
  });

  it('renders demo items with type badge and description', () => {
    const items: DemoItem[] = [
      { id: '1', type: 'repo', description: 'Clone the sample repo', verified: false },
      { id: '2', type: 'live-coding', description: 'Code the feature live', verified: true },
    ];
    render(<DemoItemList {...createDefaultProps({ items })} />);

    expect(screen.getByText('Clone the sample repo')).toBeInTheDocument();
    expect(screen.getByText('Repo')).toBeInTheDocument();
    expect(screen.getByText('Code the feature live')).toBeInTheDocument();
    expect(screen.getByText('Live Coding')).toBeInTheDocument();
  });

  it('renders verified badge for verified items', () => {
    const items: DemoItem[] = [
      { id: '1', type: 'repo', description: 'Verified item', verified: true },
    ];
    render(<DemoItemList {...createDefaultProps({ items })} />);
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });

  it('calls onToggleVerified when checkbox is clicked', async () => {
    const onToggleVerified = vi.fn().mockResolvedValue(undefined);
    const items: DemoItem[] = [
      { id: '1', type: 'repo', description: 'Test item', verified: false },
    ];
    const user = userEvent.setup();
    render(<DemoItemList {...createDefaultProps({ items, onToggleVerified })} />);

    await user.click(screen.getByLabelText('Mark "Test item" as verified'));
    expect(onToggleVerified).toHaveBeenCalledWith(items[0]);
  });

  it('shows delete confirmation dialog when delete button is clicked', async () => {
    const items: DemoItem[] = [
      { id: '1', type: 'repo', description: 'Item to delete', verified: false },
    ];
    const user = userEvent.setup();
    render(<DemoItemList {...createDefaultProps({ items })} />);

    await user.click(screen.getByLabelText('Delete "Item to delete"'));
    expect(screen.getByText('Delete demo item?')).toBeInTheDocument();
    expect(screen.getByText(/permanently delete/)).toBeInTheDocument();
  });

  it('calls onRemove when delete is confirmed', async () => {
    const onRemove = vi.fn().mockResolvedValue(undefined);
    const items: DemoItem[] = [
      { id: '1', type: 'repo', description: 'Item to delete', verified: false },
    ];
    const user = userEvent.setup();
    render(<DemoItemList {...createDefaultProps({ items, onRemove })} />);

    await user.click(screen.getByLabelText('Delete "Item to delete"'));
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onRemove).toHaveBeenCalledWith('1');
  });

  it('hides empty state when form is shown', () => {
    render(<DemoItemList {...createDefaultProps({ showForm: true })} />);
    expect(screen.queryByText(/No demo items yet/)).not.toBeInTheDocument();
  });
});
