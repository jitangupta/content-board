import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFormDraft } from '@/hooks/useFormDraft';

const updateContentMock = vi.fn().mockResolvedValue(undefined);

vi.mock('@/features/content/useContent', () => ({
  useContent: () => ({
    contents: [],
    loading: false,
    error: null,
    createContent: vi.fn(),
    updateContent: updateContentMock,
    deleteContent: vi.fn(),
    updateStatus: vi.fn(),
    reorderContents: vi.fn(),
  }),
}));

vi.mock('@/services/sentry', () => ({
  captureError: vi.fn(),
}));

describe('useFormDraft', () => {
  beforeEach(() => {
    updateContentMock.mockClear();
    updateContentMock.mockResolvedValue(undefined);
  });

  it('starts with initial values and not dirty', () => {
    const { result } = renderHook(() =>
      useFormDraft({
        contentId: 'c1',
        initialValues: { title: 'Hello', description: 'World' },
      }),
    );

    expect(result.current.values).toEqual({ title: 'Hello', description: 'World' });
    expect(result.current.isDirty).toBe(false);
    expect(result.current.saving).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('tracks dirty state when a value changes', () => {
    const { result } = renderHook(() =>
      useFormDraft({
        contentId: 'c1',
        initialValues: { title: 'Hello' },
      }),
    );

    act(() => {
      result.current.setValue('title', 'Changed');
    });

    expect(result.current.isDirty).toBe(true);
    expect(result.current.values.title).toBe('Changed');
  });

  it('is not dirty when value is changed back to initial', () => {
    const { result } = renderHook(() =>
      useFormDraft({
        contentId: 'c1',
        initialValues: { title: 'Hello' },
      }),
    );

    act(() => {
      result.current.setValue('title', 'Changed');
    });
    expect(result.current.isDirty).toBe(true);

    act(() => {
      result.current.setValue('title', 'Hello');
    });
    expect(result.current.isDirty).toBe(false);
  });

  it('save sends only changed fields', async () => {
    const { result } = renderHook(() =>
      useFormDraft({
        contentId: 'c1',
        initialValues: { title: 'Hello', description: 'World' },
      }),
    );

    act(() => {
      result.current.setValue('title', 'New Title');
    });

    await act(async () => {
      await result.current.save();
    });

    expect(updateContentMock).toHaveBeenCalledWith('c1', { title: 'New Title' });
  });

  it('save converts nullable empty strings to null', async () => {
    const { result } = renderHook(() =>
      useFormDraft({
        contentId: 'c1',
        initialValues: { notes: 'Some notes' },
        nullableFields: ['notes'],
      }),
    );

    act(() => {
      result.current.setValue('notes', '');
    });

    await act(async () => {
      await result.current.save();
    });

    expect(updateContentMock).toHaveBeenCalledWith('c1', { notes: null });
  });

  it('save converts nullable whitespace-only strings to null', async () => {
    const { result } = renderHook(() =>
      useFormDraft({
        contentId: 'c1',
        initialValues: { notes: 'Some notes' },
        nullableFields: ['notes'],
      }),
    );

    act(() => {
      result.current.setValue('notes', '   ');
    });

    await act(async () => {
      await result.current.save();
    });

    expect(updateContentMock).toHaveBeenCalledWith('c1', { notes: null });
  });

  it('save does nothing when not dirty', async () => {
    const { result } = renderHook(() =>
      useFormDraft({
        contentId: 'c1',
        initialValues: { title: 'Hello' },
      }),
    );

    await act(async () => {
      await result.current.save();
    });

    expect(updateContentMock).not.toHaveBeenCalled();
  });

  it('discard resets values to initial', () => {
    const { result } = renderHook(() =>
      useFormDraft({
        contentId: 'c1',
        initialValues: { title: 'Hello', description: 'World' },
      }),
    );

    act(() => {
      result.current.setValue('title', 'Changed');
      result.current.setValue('description', 'Also changed');
    });
    expect(result.current.isDirty).toBe(true);

    act(() => {
      result.current.discard();
    });

    expect(result.current.values).toEqual({ title: 'Hello', description: 'World' });
    expect(result.current.isDirty).toBe(false);
  });

  it('handles save errors', async () => {
    updateContentMock.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() =>
      useFormDraft({
        contentId: 'c1',
        initialValues: { title: 'Hello' },
      }),
    );

    act(() => {
      result.current.setValue('title', 'Changed');
    });

    await act(async () => {
      await result.current.save();
    });

    expect(result.current.error).toBe('Failed to save changes');
    expect(result.current.saving).toBe(false);
  });

  it('resyncs values when contentId changes', () => {
    const { result, rerender } = renderHook(
      ({ contentId, initialValues }) =>
        useFormDraft({ contentId, initialValues }),
      {
        initialProps: {
          contentId: 'c1',
          initialValues: { title: 'First' },
        },
      },
    );

    act(() => {
      result.current.setValue('title', 'Modified');
    });
    expect(result.current.isDirty).toBe(true);

    rerender({
      contentId: 'c2',
      initialValues: { title: 'Second' },
    });

    expect(result.current.values.title).toBe('Second');
    expect(result.current.isDirty).toBe(false);
  });
});
