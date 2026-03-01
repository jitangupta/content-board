import { useContext } from 'react';
import {
  ContentContext,
  type ContentContextValue,
} from '@/features/content/ContentProvider.tsx';

export function useContent(): ContentContextValue {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}
