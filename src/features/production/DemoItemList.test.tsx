import { beforeEach, describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DemoItemList } from '@/features/production/DemoItemList';
import type { DemoItem } from '@/types/content';

const addDemoItemMock = vi.fn().mockResolvedValue(undefined);
const updateDemoItemMock = vi.fn().mockResolvedValue(undefined);
const removeDemoItemMock = vi.fn().mockResolvedValue(undefined);

vi.mock('@/features/production/useProduction', () => ({
  useProduction: () => ({
    demoItemOp: { loading: false, error: null },
    talkingPointOp: { loading: false, error: null },
    addDemoItem: addDemoItemMock,
    updateDemoItem: updateDemoItemMock,
    removeDemoItem: removeDemoItemMock,
    addTalkingPoint: vi.fn(),
    updateTalkingPoint: vi.fn(),
    removeTalkingPoint: vi.fn(),
    handleReorderTalkingPoints: vi.fn(),
  }),
}));

vi.mock('@/services/sentry', () => ({
  captureError: vi.fn(),
}));

function makeDemoItem(overrides: Partial<DemoItem> = {}): DemoItem {
  return {
    id: 'demo-1',
    type: 'repo',
    description: 'Example repo',
    verified: false,
    ...overrides,
  };
}

describe('DemoItemList', () => {
  beforeEach(() => {
    addDemoItemMock.mockClear();
    updateDemoItemMock.mockClear();
    removeDemoItemMock.mockClear();
  });

  it('renders empty state when no items', () => {
    render(<DemoItemList contentId="c1" items={[]} />);

    expect(
      screen.getByText(/No demo items yet/),
    ).toBeInTheDocument();
  });

  it('renders demo items with type badge and description', () => {
    const items = [
      makeDemoItem({ id: 'd1', type: 'repo', description: 'My repo' }),
      makeDemoItem({
        id: 'd2',
        type: 'live-coding',
        description: 'Code demo',
      }),
    ];
    render(<DemoItemList contentId="c1" items={items} />);

    expect(screen.getByText('My repo')).toBeInTheDocument();
    expect(screen.getByText('Code demo')).toBeInTheDocument();
    expect(screen.getByText('Repo')).toBeInTheDocument();
    expect(screen.getByText('Live Coding')).toBeInTheDocument();
  });

  it('shows inline form when Add Demo Item is clicked', async () => {
    const user = userEvent.setup();
    render(<DemoItemList contentId="c1" items={[]} />);

    await user.click(screen.getByText('Add Demo Item'));

    expect(screen.getByLabelText('Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('calls addDemoItem with correct data on form submit', async () => {
    const user = userEvent.setup();
    render(<DemoItemList contentId="c1" items={[]} />);

    await user.click(screen.getByText('Add Demo Item'));
    await user.type(screen.getByLabelText('Description'), 'New demo');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(addDemoItemMock).toHaveBeenCalledWith(
      'c1',
      expect.objectContaining({
        type: 'repo',
        description: 'New demo',
        verified: false,
      }),
    );
  });

  it('toggles verified checkbox', async () => {
    const user = userEvent.setup();
    const item = makeDemoItem({ id: 'd1', verified: false });
    render(<DemoItemList contentId="c1" items={[item]} />);

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(updateDemoItemMock).toHaveBeenCalledWith(
      'c1',
      expect.objectContaining({ id: 'd1', verified: true }),
    );
  });

  it('shows delete confirmation dialog and calls removeDemoItem', async () => {
    const user = userEvent.setup();
    const item = makeDemoItem({ id: 'd1', description: 'Test item' });
    render(<DemoItemList contentId="c1" items={[item]} />);

    // Click the trash icon button
    const deleteButtons = screen.getAllByRole('button');
    const trashButton = deleteButtons.find(
      (btn) => btn.querySelector('svg') !== null && btn.className.includes('p-0'),
    );
    expect(trashButton).toBeDefined();
    await user.click(trashButton!);

    // Confirm dialog appears
    expect(screen.getByText('Remove demo item?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Remove' }));

    expect(removeDemoItemMock).toHaveBeenCalledWith('c1', 'd1');
  });

  it('hides form on Cancel click', async () => {
    const user = userEvent.setup();
    render(<DemoItemList contentId="c1" items={[]} />);

    await user.click(screen.getByText('Add Demo Item'));
    expect(screen.getByLabelText('Description')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByLabelText('Description')).not.toBeInTheDocument();
  });
});
