import { createContext, useEffect, useReducer, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithGoogle,
  signOut,
  type User,
} from '@/services/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
}

type AuthAction =
  | { type: 'SET_USER'; user: User | null }
  | { type: 'SET_LOADING'; loading: boolean };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return { user: action.user, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
  }
}

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    loading: true,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      dispatch({ type: 'SET_USER', user });
    });
    return unsubscribe;
  }, []);

  async function handleSignIn(): Promise<void> {
    await signInWithGoogle();
  }

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        loading: state.loading,
        signIn: handleSignIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
