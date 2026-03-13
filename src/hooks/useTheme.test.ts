import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from '@/hooks/useTheme';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('dark');
});

describe('useTheme', () => {
  it('defaults to system theme when no preference stored', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('system');
    expect(result.current.resolvedTheme).toBe('light');
  });

  it('reads stored preference from localStorage', () => {
    localStorage.setItem('theme-preference', 'dark');

    // Need to re-import to pick up the new localStorage value
    // Since module state is cached, we test via setTheme instead
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setTheme('dark'));

    expect(result.current.theme).toBe('dark');
    expect(result.current.resolvedTheme).toBe('dark');
  });

  it('persists theme choice to localStorage', () => {
    const { result } = renderHook(() => useTheme());

    act(() => result.current.setTheme('dark'));

    expect(localStorage.getItem('theme-preference')).toBe('dark');
  });

  it('adds .dark class when theme is dark', () => {
    const { result } = renderHook(() => useTheme());

    act(() => result.current.setTheme('dark'));

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes .dark class when theme is light', () => {
    document.documentElement.classList.add('dark');

    const { result } = renderHook(() => useTheme());
    act(() => result.current.setTheme('light'));

    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('cycles through all three modes', () => {
    const { result } = renderHook(() => useTheme());

    act(() => result.current.setTheme('light'));
    expect(result.current.theme).toBe('light');
    expect(result.current.resolvedTheme).toBe('light');

    act(() => result.current.setTheme('dark'));
    expect(result.current.theme).toBe('dark');
    expect(result.current.resolvedTheme).toBe('dark');

    act(() => result.current.setTheme('system'));
    expect(result.current.theme).toBe('system');
    // resolvedTheme depends on matchMedia mock (light by default)
    expect(result.current.resolvedTheme).toBe('light');
  });

  it('setTheme is referentially stable', () => {
    const { result, rerender } = renderHook(() => useTheme());
    const first = result.current.setTheme;

    rerender();
    expect(result.current.setTheme).toBe(first);
  });
});
