import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from '@/features/auth/LoginPage';
import { useAuth } from '@/features/auth/useAuth';
import type { AuthContextValue } from '@/types/auth';

vi.mock('@/features/auth/useAuth');

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  it('renders sign-in button', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    } satisfies AuthContextValue);

    renderLoginPage();

    expect(screen.getByRole('button', { name: 'Sign in with Google' })).toBeInTheDocument();
    expect(screen.getByText('Content Board')).toBeInTheDocument();
  });

  it('calls signIn when button is clicked', async () => {
    const mockSignIn = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      signIn: mockSignIn,
      signOut: vi.fn(),
    } satisfies AuthContextValue);

    renderLoginPage();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Sign in with Google' }));

    expect(mockSignIn).toHaveBeenCalledOnce();
  });

  it('shows error message when sign-in fails', async () => {
    const mockSignIn = vi.fn().mockRejectedValue(new Error('popup closed'));
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      signIn: mockSignIn,
      signOut: vi.fn(),
    } satisfies AuthContextValue);

    renderLoginPage();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Sign in with Google' }));

    expect(screen.getByText('Sign-in failed: popup closed')).toBeInTheDocument();
  });

  it('shows spinner when loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: true,
      signIn: vi.fn(),
      signOut: vi.fn(),
    } satisfies AuthContextValue);

    renderLoginPage();

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
