import type { ContentAction } from '@/types/common.ts';
import type { ContentItem } from '@/types/content.ts';
import type { DataState } from '@/types/common.ts';

export type ContentState = DataState<ContentItem[]>;

export const initialContentState: ContentState = {
  data: [],
  loading: true,
  error: null,
};

export function contentReducer(
  state: ContentState,
  action: ContentAction,
): ContentState {
  switch (action.type) {
    case 'SET_CONTENTS':
      return { data: action.payload, loading: false, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'UPDATE_CONTENT':
      return {
        ...state,
        data: state.data.map((item) =>
          item.id === action.payload.id ? action.payload : item,
        ),
      };
    case 'REMOVE_CONTENT':
      return {
        ...state,
        data: state.data.filter((item) => item.id !== action.payload),
      };
  }
}
