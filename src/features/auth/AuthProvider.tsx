import { useEffect, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { AuthAction, AuthContextValue, AuthState, AuthUser } from '@/types/auth';
import {
  onAuthStateChanged,
  signInWithGoogle,
  signOut,
} from '@/services/auth';
import { AuthContext } from '@/features/auth/AuthContext';

const initialState: AuthState = {
  user: null,
  loading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
  }
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        const user: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        };
        dispatch({ type: 'SET_USER', payload: user });
      } else {
        dispatch({ type: 'SET_USER', payload: null });
      }
    });

    return unsubscribe;
  }, []);

  const value: AuthContextValue = {
    user: state.user,
    loading: state.loading,
    signIn: signInWithGoogle,
    signOut: signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
