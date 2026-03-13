import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import {
  signInWithGoogle,
  signOut,
  onAuthStateChanged,
  isAuthorizedUser,
  ALLOWED_EMAIL,
} from '@/services/auth';

vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

vi.mock('@/services/firebase', () => ({
  auth: {},
}));

vi.mock('@/services/sentry', () => ({
  setUserContext: vi.fn(),
  clearUserContext: vi.fn(),
  addBreadcrumb: vi.fn(),
  captureError: vi.fn(),
}));

import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged as firebaseOnAuthStateChanged } from 'firebase/auth';
import { setUserContext, clearUserContext, addBreadcrumb, captureError } from '@/services/sentry';

describe('auth service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isAuthorizedUser', () => {
    it('returns true for allowed email', () => {
      expect(isAuthorizedUser(ALLOWED_EMAIL)).toBe(true);
    });

    it('returns false for other emails', () => {
      expect(isAuthorizedUser('other@example.com')).toBe(false);
    });

    it('returns false for null', () => {
      expect(isAuthorizedUser(null)).toBe(false);
    });
  });

  describe('signInWithGoogle', () => {
    it('calls signInWithPopup and sets user context', async () => {
      (signInWithPopup as Mock).mockResolvedValue({
        user: { email: 'test@example.com' },
      });

      await signInWithGoogle();

      expect(signInWithPopup).toHaveBeenCalledOnce();
      expect(setUserContext).toHaveBeenCalledWith('test@example.com');
      expect(addBreadcrumb).toHaveBeenCalledWith(
        'auth',
        'User signed in with Google',
        { email: 'test@example.com' },
      );
    });

    it('captures error and re-throws on failure', async () => {
      const error = new Error('popup closed');
      (signInWithPopup as Mock).mockRejectedValue(error);

      await expect(signInWithGoogle()).rejects.toThrow('popup closed');
      expect(captureError).toHaveBeenCalledWith(error, { action: 'sign-in' });
    });
  });

  describe('signOut', () => {
    it('clears user context and calls firebaseSignOut', async () => {
      (firebaseSignOut as Mock).mockResolvedValue(undefined);

      await signOut();

      expect(addBreadcrumb).toHaveBeenCalledWith('auth', 'User signed out');
      expect(clearUserContext).toHaveBeenCalledOnce();
      expect(firebaseSignOut).toHaveBeenCalledOnce();
    });

    it('captures error and re-throws on failure', async () => {
      const error = new Error('sign-out failed');
      (firebaseSignOut as Mock).mockRejectedValue(error);

      await expect(signOut()).rejects.toThrow('sign-out failed');
      expect(captureError).toHaveBeenCalledWith(error, { action: 'sign-out' });
    });
  });

  describe('onAuthStateChanged', () => {
    it('wraps Firebase onAuthStateChanged and returns unsubscribe', () => {
      const mockUnsubscribe = vi.fn();
      (firebaseOnAuthStateChanged as Mock).mockReturnValue(mockUnsubscribe);
      const callback = vi.fn();

      const unsubscribe = onAuthStateChanged(callback);

      expect(firebaseOnAuthStateChanged).toHaveBeenCalledOnce();
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });
});
