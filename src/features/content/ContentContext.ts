import { createContext } from 'react';
import type { ContentItem, ContentStatus } from '@/types/content';

export interface ContentContextValue {
  contents: ContentItem[];
  loading: boolean;
  error: string | null;
  createContent: (data: Partial<ContentItem>) => Promise<string>;
  updateContent: (id: string, updates: Partial<ContentItem>) => Promise<void>;
  deleteContent: (id: string) => Promise<void>;
  updateStatus: (id: string, newStatus: ContentStatus) => Promise<void>;
  reorderContents: (orderedIds: string[]) => Promise<void>;
}

export const ContentContext = createContext<ContentContextValue | null>(null);
