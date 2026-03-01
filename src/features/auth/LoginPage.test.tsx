import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext, type AuthContextValue } from '@/features/auth/AuthProvider';
import { LoginPage } from '@/features/auth/LoginPage';
import type { User } from '@/services/auth';

vi.mock('@/services/firebase', () => ({
  auth: { currentUser: null },
}));

function renderLoginPage(authValue?: Partial<AuthContextValue>) {
  const defaultValue: AuthContextValue = {
    user: null,
    loading: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
    ...authValue,
  };

  return render(
    <AuthContext.Provider value={defaultValue}>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('LoginPage', () => {
  it('renders the app name', () => {
    renderLoginPage();
    expect(screen.getByText('Content Board')).toBeInTheDocument();
  });

  it('renders the sign-in button', () => {
    renderLoginPage();
    expect(
      screen.getByRole('button', { name: /sign in with google/i }),
    ).toBeInTheDocument();
  });

  it('calls signIn when button is clicked', async () => {
    const mockSignIn = vi.fn().mockResolvedValue(undefined);
    renderLoginPage({ signIn: mockSignIn });

    const user = userEvent.setup();
    await user.click(
      screen.getByRole('button', { name: /sign in with google/i }),
    );

    expect(mockSignIn).toHaveBeenCalledOnce();
  });

  it('shows error message when sign-in fails', async () => {
    const mockSignIn = vi.fn().mockRejectedValue(new Error('Auth error'));
    renderLoginPage({ signIn: mockSignIn });

    const user = userEvent.setup();
    await user.click(
      screen.getByRole('button', { name: /sign in with google/i }),
    );

    expect(
      screen.getByText('Sign-in failed. Please try again.'),
    ).toBeInTheDocument();
  });

  it('redirects to / when user is already authenticated', () => {
    const mockUser = { email: 'gtangupta@gmail.com' } as User;
    renderLoginPage({ user: mockUser });

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Content Board')).not.toBeInTheDocument();
  });
});
