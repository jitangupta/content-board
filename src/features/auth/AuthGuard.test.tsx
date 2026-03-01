import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext, type AuthContextValue } from '@/features/auth/AuthProvider';
import { AuthGuard } from '@/features/auth/AuthGuard';
import type { User } from '@/services/auth';

vi.mock('@/services/firebase', () => ({
  auth: { currentUser: null },
}));

function renderWithAuth(authValue: AuthContextValue, route = '/') {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route element={<AuthGuard />}>
            <Route path="/" element={<div>Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('AuthGuard', () => {
  it('shows spinner when loading', () => {
    renderWithAuth({
      user: null,
      loading: true,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  it('redirects to /login when not authenticated', () => {
    renderWithAuth({
      user: null,
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('shows access denied for unauthorized email', () => {
    const unauthorizedUser = {
      email: 'wrong@example.com',
    } as User;

    renderWithAuth({
      user: unauthorizedUser,
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    expect(screen.getByText('Access denied')).toBeInTheDocument();
    expect(
      screen.getByText(/wrong@example\.com/),
    ).toBeInTheDocument();
  });

  it('renders children for authorized user', () => {
    const authorizedUser = {
      email: 'gtangupta@gmail.com',
    } as User;

    renderWithAuth({
      user: authorizedUser,
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
