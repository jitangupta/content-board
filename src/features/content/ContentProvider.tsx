import { useCallback, useEffect, useReducer } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { ContentContext } from '@/features/content/ContentContext';
import type { ContentContextValue } from '@/features/content/ContentContext';
import { contentReducer, initialContentState } from '@/features/content/contentReducer';
import {
  createContent as firestoreCreateContent,
  deleteContent as firestoreDeleteContent,
  reorderContents as firestoreReorderContents,
  subscribeToContents,
  updateContent as firestoreUpdateContent,
  updateContentStatus,
} from '@/services/firestore';
import { captureError } from '@/services/sentry';
import type { ContentItem, ContentStatus } from '@/types/content';

interface ContentProviderProps {
  children: ReactNode;
}

export function ContentProvider({ children }: ContentProviderProps) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(contentReducer, initialContentState);

  useEffect(() => {
    if (!user) {
      dispatch({ type: 'SET_CONTENTS', payload: [] });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    const unsubscribe = subscribeToContents(
      (contents) => {
        dispatch({ type: 'SET_CONTENTS', payload: contents });
      },
      (error) => {
        captureError(error, { operation: 'subscribeToContents' });
        dispatch({ type: 'SET_ERROR', payload: error.message });
      },
    );

    return unsubscribe;
  }, [user]);

  const createContent = useCallback(
    async (data: Partial<ContentItem>): Promise<string> => {
      return firestoreCreateContent(data);
    },
    [],
  );

  const updateContent = useCallback(
    async (id: string, updates: Partial<ContentItem>): Promise<void> => {
      await firestoreUpdateContent(id, updates);
    },
    [],
  );

  const deleteContent = useCallback(
    async (id: string): Promise<void> => {
      await firestoreDeleteContent(id);
    },
    [],
  );

  const updateStatus = useCallback(
    async (id: string, newStatus: ContentStatus): Promise<void> => {
      await updateContentStatus(id, newStatus);
    },
    [],
  );

  const reorderContents = useCallback(
    async (orderedIds: string[]): Promise<void> => {
      await firestoreReorderContents(orderedIds);
    },
    [],
  );

  const value: ContentContextValue = {
    contents: state.data,
    loading: state.loading,
    error: state.error,
    createContent,
    updateContent,
    deleteContent,
    updateStatus,
    reorderContents,
  };

  return (
    <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
  );
}
