import { useContext } from 'react';
import { ContentContext } from '@/features/content/ContentContext';
import type { ContentContextValue } from '@/features/content/ContentContext';

export function useContent(): ContentContextValue {
  const context = useContext(ContentContext);
  if (context === null) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}
