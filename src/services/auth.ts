import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  type User,
  type Unsubscribe,
} from 'firebase/auth';
import { auth } from '@/services/firebase';
import {
  setUserContext,
  clearUserContext,
  addBreadcrumb,
  captureError,
} from '@/services/sentry';

export type { User, Unsubscribe };

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    setUserContext(result.user.email ?? 'unknown');
    addBreadcrumb('auth', 'User signed in', {
      email: result.user.email ?? 'unknown',
    });
    return result.user;
  } catch (error) {
    captureError(error, { operation: 'signInWithGoogle' });
    throw error;
  }
}

export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
    clearUserContext();
    addBreadcrumb('auth', 'User signed out');
  } catch (error) {
    captureError(error, { operation: 'signOut' });
    throw error;
  }
}

export function onAuthStateChanged(
  callback: (user: User | null) => void,
): Unsubscribe {
  return firebaseOnAuthStateChanged(auth, (user) => {
    if (user) {
      setUserContext(user.email ?? 'unknown');
    } else {
      clearUserContext();
    }
    callback(user);
  });
}
