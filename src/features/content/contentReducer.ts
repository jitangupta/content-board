import type { ContentAction, DataState } from '@/types/common';
import type { ContentItem } from '@/types/content';

export const initialContentState: DataState<ContentItem[]> = {
  data: [],
  loading: true,
  error: null,
};

export function contentReducer(
  state: DataState<ContentItem[]>,
  action: ContentAction,
): DataState<ContentItem[]> {
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
