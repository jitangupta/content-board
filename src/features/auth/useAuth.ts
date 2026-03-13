import { useContext } from 'react';
import type { AuthContextValue } from '@/types/auth';
import { AuthContext } from '@/features/auth/AuthContext';

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
