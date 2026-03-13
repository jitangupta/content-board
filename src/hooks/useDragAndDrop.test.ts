import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import type { DragEndEvent } from '@dnd-kit/core';

describe('useDragAndDrop', () => {
  let onReorder: (orderedIds: string[]) => Promise<void>;

  beforeEach(() => {
    vi.clearAllMocks();
    onReorder = vi.fn<(orderedIds: string[]) => Promise<void>>().mockResolvedValue(undefined);
  });

  it('returns sensors and handleDragEnd', () => {
    const { result } = renderHook(() =>
      useDragAndDrop({ items: ['a', 'b', 'c'], onReorder }),
    );

    expect(result.current.sensors).toBeDefined();
    expect(result.current.handleDragEnd).toBeInstanceOf(Function);
    expect(result.current.operationState).toEqual({ loading: false, error: null });
  });

  it('does nothing when dragged to same position', () => {
    const { result } = renderHook(() =>
      useDragAndDrop({ items: ['a', 'b', 'c'], onReorder }),
    );

    act(() => {
      result.current.handleDragEnd({
        active: { id: 'a' },
        over: { id: 'a' },
      } as DragEndEvent);
    });

    expect(onReorder).not.toHaveBeenCalled();
  });

  it('does nothing when no over target', () => {
    const { result } = renderHook(() =>
      useDragAndDrop({ items: ['a', 'b', 'c'], onReorder }),
    );

    act(() => {
      result.current.handleDragEnd({
        active: { id: 'a' },
        over: null,
      } as DragEndEvent);
    });

    expect(onReorder).not.toHaveBeenCalled();
  });

  it('calls onReorder with reordered ids', async () => {
    const { result } = renderHook(() =>
      useDragAndDrop({ items: ['a', 'b', 'c'], onReorder }),
    );

    await act(async () => {
      result.current.handleDragEnd({
        active: { id: 'a' },
        over: { id: 'c' },
      } as DragEndEvent);
      // Wait for the promise to resolve
      await onReorder;
    });

    expect(onReorder).toHaveBeenCalledWith(['b', 'c', 'a']);
  });

  it('sets error state when onReorder rejects', async () => {
    onReorder = vi.fn<(orderedIds: string[]) => Promise<void>>().mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() =>
      useDragAndDrop({ items: ['a', 'b', 'c'], onReorder }),
    );

    await act(async () => {
      result.current.handleDragEnd({
        active: { id: 'a' },
        over: { id: 'b' },
      } as DragEndEvent);
      // Let the rejected promise settle
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.operationState).toEqual({
      loading: false,
      error: 'Failed to reorder items',
    });
  });
});
