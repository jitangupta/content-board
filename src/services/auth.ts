import {
  GoogleAuthProvider,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import type { User, Unsubscribe } from 'firebase/auth';
import { auth } from '@/services/firebase';
import {
  addBreadcrumb,
  captureError,
  clearUserContext,
  setUserContext,
} from '@/services/sentry';

export const ALLOWED_EMAIL = 'gtangupta@gmail.com';

const googleProvider = new GoogleAuthProvider();

export function isAuthorizedUser(email: string | null): boolean {
  return email === ALLOWED_EMAIL;
}

export async function signInWithGoogle(): Promise<void> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const email = result.user.email ?? 'unknown';
    setUserContext(email);
    addBreadcrumb('auth', 'User signed in with Google', { email });
  } catch (error: unknown) {
    captureError(error, { action: 'sign-in' });
    throw error;
  }
}

export async function signOut(): Promise<void> {
  try {
    addBreadcrumb('auth', 'User signed out');
    clearUserContext();
    await firebaseSignOut(auth);
  } catch (error: unknown) {
    captureError(error, { action: 'sign-out' });
    throw error;
  }
}

export function onAuthStateChanged(
  callback: (user: User | null) => void,
): Unsubscribe {
  return firebaseOnAuthStateChanged(auth, callback);
}
