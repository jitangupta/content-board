import { createContext, useEffect, useReducer, type ReactNode } from 'react';
import type { ContentItem, ContentStatus } from '@/types/content.ts';
import {
  createContent as firestoreCreateContent,
  deleteContent as firestoreDeleteContent,
  subscribeToContents,
  updateContent as firestoreUpdateContent,
  updateContentStatus as firestoreUpdateContentStatus,
} from '@/services/firestore.ts';
import { useAuth } from '@/features/auth/useAuth.ts';
import {
  contentReducer,
  initialContentState,
} from './contentReducer.ts';

export interface ContentContextValue {
  contents: ContentItem[];
  loading: boolean;
  error: string | null;
  createContent: (data: Partial<ContentItem>) => Promise<string>;
  updateContent: (
    id: string,
    updates: Partial<Omit<ContentItem, 'id' | 'timestamps' | 'phase' | 'status'>>,
  ) => Promise<void>;
  deleteContent: (id: string) => Promise<void>;
  updateStatus: (id: string, newStatus: ContentStatus) => Promise<void>;
}

export const ContentContext = createContext<ContentContextValue | null>(null);

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
      (contents) => dispatch({ type: 'SET_CONTENTS', payload: contents }),
      (error) => dispatch({ type: 'SET_ERROR', payload: error.message }),
    );

    return unsubscribe;
  }, [user]);

  async function handleCreateContent(
    data: Partial<ContentItem>,
  ): Promise<string> {
    return firestoreCreateContent(data);
  }

  async function handleUpdateContent(
    id: string,
    updates: Partial<Omit<ContentItem, 'id' | 'timestamps' | 'phase' | 'status'>>,
  ): Promise<void> {
    return firestoreUpdateContent(id, updates);
  }

  async function handleDeleteContent(id: string): Promise<void> {
    return firestoreDeleteContent(id);
  }

  async function handleUpdateStatus(
    id: string,
    newStatus: ContentStatus,
  ): Promise<void> {
    return firestoreUpdateContentStatus(id, newStatus);
  }

  return (
    <ContentContext.Provider
      value={{
        contents: state.data,
        loading: state.loading,
        error: state.error,
        createContent: handleCreateContent,
        updateContent: handleUpdateContent,
        deleteContent: handleDeleteContent,
        updateStatus: handleUpdateStatus,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}
