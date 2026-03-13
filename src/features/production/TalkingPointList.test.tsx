import { beforeEach, describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TalkingPointList } from '@/features/production/TalkingPointList';
import type { TalkingPoint } from '@/types/content';

const addTalkingPointMock = vi.fn().mockResolvedValue(undefined);
const removeTalkingPointMock = vi.fn().mockResolvedValue(undefined);
const handleReorderTalkingPointsMock = vi.fn().mockResolvedValue(undefined);

vi.mock('@/features/production/useProduction', () => ({
  useProduction: () => ({
    talkingPointOp: { loading: false, error: null },
    demoItemOp: { loading: false, error: null },
    addTalkingPoint: addTalkingPointMock,
    updateTalkingPoint: vi.fn(),
    removeTalkingPoint: removeTalkingPointMock,
    addDemoItem: vi.fn(),
    updateDemoItem: vi.fn(),
    removeDemoItem: vi.fn(),
    handleReorderTalkingPoints: handleReorderTalkingPointsMock,
  }),
}));

vi.mock('@/services/sentry', () => ({
  captureError: vi.fn(),
}));

function makeTalkingPoint(
  overrides: Partial<TalkingPoint> = {},
): TalkingPoint {
  return {
    id: 'tp-1',
    text: 'Explain the hook pattern',
    category: 'technical',
    priority: 'must-say',
    order: 0,
    ...overrides,
  };
}

describe('TalkingPointList', () => {
  beforeEach(() => {
    addTalkingPointMock.mockClear();
    removeTalkingPointMock.mockClear();
    handleReorderTalkingPointsMock.mockClear();
  });

  it('renders empty state when no points', () => {
    render(<TalkingPointList contentId="c1" points={[]} />);

    expect(
      screen.getByText(/No talking points yet/),
    ).toBeInTheDocument();
  });

  it('renders talking points with order numbers, text, and category badges', () => {
    const points = [
      makeTalkingPoint({
        id: 'tp-1',
        text: 'Intro hook',
        category: 'engagement',
        order: 0,
      }),
      makeTalkingPoint({
        id: 'tp-2',
        text: 'Show code',
        category: 'technical',
        order: 1,
      }),
    ];
    render(<TalkingPointList contentId="c1" points={points} />);

    expect(screen.getByText('1.')).toBeInTheDocument();
    expect(screen.getByText('2.')).toBeInTheDocument();
    expect(screen.getByText('Intro hook')).toBeInTheDocument();
    expect(screen.getByText('Show code')).toBeInTheDocument();
    expect(screen.getByText('Engagement')).toBeInTheDocument();
    expect(screen.getByText('Technical')).toBeInTheDocument();
  });

  it('displays priority indicators', () => {
    const points = [
      makeTalkingPoint({ id: 'tp-1', priority: 'must-say', order: 0 }),
      makeTalkingPoint({ id: 'tp-2', priority: 'nice-to-have', order: 1 }),
    ];
    const { container } = render(
      <TalkingPointList contentId="c1" points={points} />,
    );

    const dots = container.querySelectorAll('span[title]');
    expect(dots[0]).toHaveAttribute('title', 'Must say');
    expect(dots[1]).toHaveAttribute('title', 'Nice to have');
  });

  it('shows inline form when Add Talking Point is clicked', async () => {
    const user = userEvent.setup();
    render(<TalkingPointList contentId="c1" points={[]} />);

    await user.click(screen.getByText('Add Talking Point'));

    expect(screen.getByLabelText('Talking Point')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Priority')).toBeInTheDocument();
  });

  it('calls addTalkingPoint with correct data on form submit', async () => {
    const user = userEvent.setup();
    render(<TalkingPointList contentId="c1" points={[]} />);

    await user.click(screen.getByText('Add Talking Point'));
    await user.type(screen.getByLabelText('Talking Point'), 'Subscribe CTA');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(addTalkingPointMock).toHaveBeenCalledWith(
      'c1',
      expect.objectContaining({
        text: 'Subscribe CTA',
        category: 'technical',
        priority: 'must-say',
        order: 0,
      }),
    );
  });

  it('shows delete confirmation and calls removeTalkingPoint', async () => {
    const user = userEvent.setup();
    const point = makeTalkingPoint({ id: 'tp-1' });
    render(<TalkingPointList contentId="c1" points={[point]} />);

    // Click the trash icon
    const deleteButtons = screen.getAllByRole('button');
    const trashButton = deleteButtons.find(
      (btn) => btn.querySelector('svg') !== null && btn.className.includes('p-0'),
    );
    expect(trashButton).toBeDefined();
    await user.click(trashButton!);

    expect(screen.getByText('Remove talking point?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Remove' }));

    expect(removeTalkingPointMock).toHaveBeenCalledWith('c1', 'tp-1');
  });

  it('hides form on Cancel click', async () => {
    const user = userEvent.setup();
    render(<TalkingPointList contentId="c1" points={[]} />);

    await user.click(screen.getByText('Add Talking Point'));
    expect(screen.getByLabelText('Talking Point')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(
      screen.queryByLabelText('Talking Point'),
    ).not.toBeInTheDocument();
  });

  it('sorts points by order', () => {
    const points = [
      makeTalkingPoint({ id: 'tp-2', text: 'Second', order: 1 }),
      makeTalkingPoint({ id: 'tp-1', text: 'First', order: 0 }),
    ];
    render(<TalkingPointList contentId="c1" points={points} />);

    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('First');
    expect(items[1]).toHaveTextContent('Second');
  });

  it('renders drag handles for each talking point', () => {
    render(
      <TalkingPointList
        contentId="abc"
        points={[
          makeTalkingPoint({ order: 0 }),
          makeTalkingPoint({ id: 'tp-2', order: 1, text: 'Second point' }),
        ]}
      />,
    );

    const dragHandles = screen.getAllByLabelText('Drag to reorder');
    expect(dragHandles).toHaveLength(2);
  });
});
