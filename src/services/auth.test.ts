import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { User, Unsubscribe } from '@/services/auth';

const mockSignInWithPopup = vi.fn();
const mockFirebaseSignOut = vi.fn();
const mockFirebaseOnAuthStateChanged = vi.fn();

vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: (...args: unknown[]) => mockSignInWithPopup(...args),
  signOut: (...args: unknown[]) => mockFirebaseSignOut(...args),
  onAuthStateChanged: (...args: unknown[]) =>
    mockFirebaseOnAuthStateChanged(...args),
}));

vi.mock('@/services/firebase', () => ({
  auth: { currentUser: null },
}));

const mockSetUserContext = vi.fn();
const mockClearUserContext = vi.fn();
const mockAddBreadcrumb = vi.fn();

vi.mock('@/services/sentry', () => ({
  setUserContext: (...args: unknown[]) => mockSetUserContext(...args),
  clearUserContext: (...args: unknown[]) => mockClearUserContext(...args),
  addBreadcrumb: (...args: unknown[]) => mockAddBreadcrumb(...args),
}));

describe('auth service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signInWithGoogle', () => {
    it('calls signInWithPopup and sets Sentry user context', async () => {
      const mockUser = { email: 'test@example.com' } as User;
      mockSignInWithPopup.mockResolvedValue({ user: mockUser });

      const { signInWithGoogle } = await import('@/services/auth');
      const result = await signInWithGoogle();

      expect(mockSignInWithPopup).toHaveBeenCalledOnce();
      expect(mockSetUserContext).toHaveBeenCalledWith('test@example.com');
      expect(mockAddBreadcrumb).toHaveBeenCalledWith(
        'auth',
        'User signed in',
        { email: 'test@example.com' },
      );
      expect(result).toBe(mockUser);
    });
  });

  describe('signOut', () => {
    it('calls Firebase signOut and clears Sentry user context', async () => {
      mockFirebaseSignOut.mockResolvedValue(undefined);

      const { signOut } = await import('@/services/auth');
      await signOut();

      expect(mockFirebaseSignOut).toHaveBeenCalledOnce();
      expect(mockClearUserContext).toHaveBeenCalledOnce();
      expect(mockAddBreadcrumb).toHaveBeenCalledWith(
        'auth',
        'User signed out',
      );
    });
  });

  describe('onAuthStateChanged', () => {
    it('sets user context when user is present', async () => {
      const mockUser = { email: 'test@example.com' } as User;
      const mockUnsubscribe: Unsubscribe = vi.fn();
      mockFirebaseOnAuthStateChanged.mockImplementation(
        (_auth: unknown, callback: (user: User | null) => void) => {
          callback(mockUser);
          return mockUnsubscribe;
        },
      );

      const { onAuthStateChanged } = await import('@/services/auth');
      const callback = vi.fn();
      const unsub = onAuthStateChanged(callback);

      expect(mockSetUserContext).toHaveBeenCalledWith('test@example.com');
      expect(callback).toHaveBeenCalledWith(mockUser);
      expect(unsub).toBe(mockUnsubscribe);
    });

    it('clears user context when user is null', async () => {
      const mockUnsubscribe: Unsubscribe = vi.fn();
      mockFirebaseOnAuthStateChanged.mockImplementation(
        (_auth: unknown, callback: (user: User | null) => void) => {
          callback(null);
          return mockUnsubscribe;
        },
      );

      const { onAuthStateChanged } = await import('@/services/auth');
      const callback = vi.fn();
      onAuthStateChanged(callback);

      expect(mockClearUserContext).toHaveBeenCalledOnce();
      expect(callback).toHaveBeenCalledWith(null);
    });
  });
});
