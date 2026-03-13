import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { useAuth } from '@/features/auth/useAuth';
import type { AuthContextValue } from '@/types/auth';

vi.mock('@/features/auth/useAuth');

function renderWithRouter() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<AuthGuard />}>
          <Route path="/" element={<div>Protected content</div>} />
        </Route>
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('AuthGuard', () => {
  it('shows spinner when loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: true,
      signIn: vi.fn(),
      signOut: vi.fn(),
    } satisfies AuthContextValue);

    renderWithRouter();

    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
    expect(screen.queryByText('Login page')).not.toBeInTheDocument();
  });

  it('redirects to /login when not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    } satisfies AuthContextValue);

    renderWithRouter();

    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('shows access denied for unauthorized email', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        uid: '123',
        email: 'wrong@example.com',
        displayName: 'Wrong User',
        photoURL: null,
      },
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    } satisfies AuthContextValue);

    renderWithRouter();

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText(/wrong@example.com/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
  });

  it('renders protected content for authorized user', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        uid: '123',
        email: 'gtangupta@gmail.com',
        displayName: 'GT',
        photoURL: null,
      },
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    } satisfies AuthContextValue);

    renderWithRouter();

    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });
});
