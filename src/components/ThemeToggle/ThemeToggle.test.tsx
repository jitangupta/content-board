import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from './ThemeToggle';

const setThemeMock = vi.fn();

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'system',
    resolvedTheme: 'light',
    setTheme: setThemeMock,
  }),
}));

beforeEach(() => {
  setThemeMock.mockClear();
});

describe('ThemeToggle', () => {
  it('renders the toggle button with aria-label', () => {
    render(<ThemeToggle />);

    expect(
      screen.getByRole('button', { name: 'Toggle theme' }),
    ).toBeInTheDocument();
  });

  it('shows Light, Dark, and System options in dropdown', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole('button', { name: 'Toggle theme' }));

    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('calls setTheme with "dark" when Dark is clicked', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole('button', { name: 'Toggle theme' }));
    await user.click(screen.getByText('Dark'));

    expect(setThemeMock).toHaveBeenCalledWith('dark');
  });

  it('calls setTheme with "light" when Light is clicked', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole('button', { name: 'Toggle theme' }));
    await user.click(screen.getByText('Light'));

    expect(setThemeMock).toHaveBeenCalledWith('light');
  });

  it('calls setTheme with "system" when System is clicked', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole('button', { name: 'Toggle theme' }));
    await user.click(screen.getByText('System'));

    expect(setThemeMock).toHaveBeenCalledWith('system');
  });
});
