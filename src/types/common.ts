import type { ContentItem } from '@/types/content';

export interface DataState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

export type ContentAction =
  | { type: 'SET_CONTENTS'; payload: ContentItem[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'UPDATE_CONTENT'; payload: ContentItem }
  | { type: 'REMOVE_CONTENT'; payload: string };
