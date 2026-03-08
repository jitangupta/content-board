import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TalkingPointList } from './TalkingPointList';
import type { TalkingPoint, TalkingPointCategory, TalkingPointPriority } from '@/types/content';

function createDefaultProps(overrides: Record<string, unknown> = {}) {
  return {
    points: [] as TalkingPoint[],
    showForm: false,
    setShowForm: vi.fn(),
    text: '',
    setText: vi.fn(),
    category: 'technical' as TalkingPointCategory,
    setCategory: vi.fn(),
    priority: 'must-say' as TalkingPointPriority,
    setPriority: vi.fn(),
    error: '',
    onAdd: vi.fn().mockResolvedValue(undefined),
    onRemove: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('TalkingPointList', () => {
  it('renders empty state when no points', () => {
    render(<TalkingPointList {...createDefaultProps()} />);
    expect(screen.getByText(/No talking points yet/)).toBeInTheDocument();
  });

  it('renders Add Talking Point button', () => {
    render(<TalkingPointList {...createDefaultProps()} />);
    expect(screen.getByText('Add Talking Point')).toBeInTheDocument();
  });

  it('calls setShowForm when Add Talking Point is clicked', async () => {
    const setShowForm = vi.fn();
    const user = userEvent.setup();
    render(<TalkingPointList {...createDefaultProps({ setShowForm })} />);

    await user.click(screen.getByText('Add Talking Point'));
    expect(setShowForm).toHaveBeenCalledWith(true);
  });

  it('renders inline form when showForm is true', () => {
    render(<TalkingPointList {...createDefaultProps({ showForm: true })} />);
    expect(screen.getByPlaceholderText('What do you want to say?')).toBeInTheDocument();
  });

  it('shows error message when error is set', () => {
    render(<TalkingPointList {...createDefaultProps({ showForm: true, error: 'Text is required' })} />);
    expect(screen.getByText('Text is required')).toBeInTheDocument();
  });

  it('calls onAdd when Add button is clicked', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<TalkingPointList {...createDefaultProps({ showForm: true, onAdd })} />);

    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(onAdd).toHaveBeenCalled();
  });

  it('renders talking points with order numbers, category badges, and text', () => {
    const points: TalkingPoint[] = [
      { id: '1', text: 'Introduce the topic', category: 'engagement', priority: 'must-say', order: 0 },
      { id: '2', text: 'Show the code', category: 'technical', priority: 'nice-to-have', order: 1 },
    ];
    render(<TalkingPointList {...createDefaultProps({ points })} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Introduce the topic')).toBeInTheDocument();
    expect(screen.getByText('Engagement')).toBeInTheDocument();
    expect(screen.getByText('Show the code')).toBeInTheDocument();
    expect(screen.getByText('Technical')).toBeInTheDocument();
  });

  it('sorts talking points by order', () => {
    const points: TalkingPoint[] = [
      { id: '2', text: 'Second point', category: 'technical', priority: 'must-say', order: 1 },
      { id: '1', text: 'First point', category: 'engagement', priority: 'must-say', order: 0 },
    ];
    render(<TalkingPointList {...createDefaultProps({ points })} />);

    const orderNumbers = screen.getAllByText(/^[12]$/);
    expect(orderNumbers[0]).toHaveTextContent('1');
    expect(orderNumbers[1]).toHaveTextContent('2');
  });

  it('shows delete confirmation dialog when delete button is clicked', async () => {
    const points: TalkingPoint[] = [
      { id: '1', text: 'Point to delete', category: 'technical', priority: 'must-say', order: 0 },
    ];
    const user = userEvent.setup();
    render(<TalkingPointList {...createDefaultProps({ points })} />);

    await user.click(screen.getByLabelText('Delete talking point "Point to delete"'));
    expect(screen.getByText('Delete talking point?')).toBeInTheDocument();
  });

  it('calls onRemove when delete is confirmed', async () => {
    const onRemove = vi.fn().mockResolvedValue(undefined);
    const points: TalkingPoint[] = [
      { id: '1', text: 'Point to delete', category: 'technical', priority: 'must-say', order: 0 },
    ];
    const user = userEvent.setup();
    render(<TalkingPointList {...createDefaultProps({ points, onRemove })} />);

    await user.click(screen.getByLabelText('Delete talking point "Point to delete"'));
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onRemove).toHaveBeenCalledWith('1');
  });

  it('hides empty state when form is shown', () => {
    render(<TalkingPointList {...createDefaultProps({ showForm: true })} />);
    expect(screen.queryByText(/No talking points yet/)).not.toBeInTheDocument();
  });
});
