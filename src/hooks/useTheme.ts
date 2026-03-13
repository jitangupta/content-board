import { useCallback, useEffect, useSyncExternalStore } from 'react';

type ThemeChoice = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeState {
  theme: ThemeChoice;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeChoice) => void;
}

const STORAGE_KEY = 'theme-preference';

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function getStoredTheme(): ThemeChoice {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
}

function resolve(choice: ThemeChoice): ResolvedTheme {
  return choice === 'system' ? getSystemTheme() : choice;
}

function applyTheme(resolved: ResolvedTheme): void {
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

// Module-level state so all hook instances share the same value
let currentChoice: ThemeChoice = getStoredTheme();
let currentResolved: ResolvedTheme = resolve(currentChoice);
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): ThemeChoice {
  return currentChoice;
}

function getResolvedSnapshot(): ResolvedTheme {
  return currentResolved;
}

// Listen for OS theme changes (affects 'system' mode)
if (typeof window !== 'undefined') {
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', () => {
      if (currentChoice === 'system') {
        currentResolved = getSystemTheme();
        applyTheme(currentResolved);
        notify();
      }
    });
}

export function useTheme(): ThemeState {
  const theme = useSyncExternalStore(subscribe, getSnapshot);
  const resolvedTheme = useSyncExternalStore(subscribe, getResolvedSnapshot);

  // Apply theme class on mount and when resolved theme changes
  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback((next: ThemeChoice): void => {
    currentChoice = next;
    currentResolved = resolve(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(currentResolved);
    notify();
  }, []);

  return { theme, resolvedTheme, setTheme };
}
