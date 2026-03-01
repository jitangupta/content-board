import { describe, it, expect } from 'vitest';
import type { ContentAction } from '@/types/common.ts';
import type { ContentItem } from '@/types/content.ts';
import {
  contentReducer,
  initialContentState,
  type ContentState,
} from './contentReducer.ts';

function makeContent(overrides: Partial<ContentItem> = {}): ContentItem {
  return {
    id: 'test-1',
    title: 'Test Video',
    description: '',
    tags: [],
    status: 'draft',
    phase: 'pre-production',
    order: 0,
    youtubeUrl: null,
    demoItems: [],
    talkingPoints: [],
    shootingScript: '',
    thumbnailIdeas: [],
    linkedContent: [],
    notes: '',
    learnings: [],
    feedback: [],
    timestamps: {
      created: '2026-01-01',
      technicallyReady: null,
      shootingScriptReady: null,
      readyToRecord: null,
      recorded: null,
      edited: null,
      published: null,
      shortsExtracted: null,
      lifetimeValueEnds: null,
      updated: '2026-01-01',
    },
    ...overrides,
  };
}

describe('contentReducer', () => {
  describe('initial state', () => {
    it('has empty data, loading true, and no error', () => {
      expect(initialContentState).toEqual({
        data: [],
        loading: true,
        error: null,
      });
    });
  });

  describe('SET_CONTENTS', () => {
    it('sets data, clears loading and error', () => {
      const state: ContentState = {
        data: [],
        loading: true,
        error: 'previous error',
      };
      const contents = [makeContent()];
      const action: ContentAction = {
        type: 'SET_CONTENTS',
        payload: contents,
      };

      const result = contentReducer(state, action);

      expect(result).toEqual({
        data: contents,
        loading: false,
        error: null,
      });
    });
  });

  describe('SET_LOADING', () => {
    it('sets loading to true', () => {
      const state: ContentState = {
        data: [],
        loading: false,
        error: null,
      };
      const action: ContentAction = { type: 'SET_LOADING', payload: true };

      const result = contentReducer(state, action);

      expect(result.loading).toBe(true);
    });

    it('sets loading to false', () => {
      const state: ContentState = {
        data: [],
        loading: true,
        error: null,
      };
      const action: ContentAction = { type: 'SET_LOADING', payload: false };

      const result = contentReducer(state, action);

      expect(result.loading).toBe(false);
    });

    it('preserves existing data', () => {
      const contents = [makeContent()];
      const state: ContentState = {
        data: contents,
        loading: false,
        error: null,
      };
      const action: ContentAction = { type: 'SET_LOADING', payload: true };

      const result = contentReducer(state, action);

      expect(result.data).toBe(contents);
    });
  });

  describe('SET_ERROR', () => {
    it('sets error and clears loading', () => {
      const state: ContentState = {
        data: [],
        loading: true,
        error: null,
      };
      const action: ContentAction = {
        type: 'SET_ERROR',
        payload: 'Something went wrong',
      };

      const result = contentReducer(state, action);

      expect(result).toEqual({
        data: [],
        loading: false,
        error: 'Something went wrong',
      });
    });
  });

  describe('UPDATE_CONTENT', () => {
    it('replaces the matching content item by id', () => {
      const original = makeContent({ id: 'c1', title: 'Original' });
      const updated = makeContent({ id: 'c1', title: 'Updated' });
      const other = makeContent({ id: 'c2', title: 'Other' });
      const state: ContentState = {
        data: [original, other],
        loading: false,
        error: null,
      };
      const action: ContentAction = {
        type: 'UPDATE_CONTENT',
        payload: updated,
      };

      const result = contentReducer(state, action);

      expect(result.data).toEqual([updated, other]);
    });

    it('does not modify state if id not found', () => {
      const existing = makeContent({ id: 'c1' });
      const state: ContentState = {
        data: [existing],
        loading: false,
        error: null,
      };
      const action: ContentAction = {
        type: 'UPDATE_CONTENT',
        payload: makeContent({ id: 'nonexistent' }),
      };

      const result = contentReducer(state, action);

      expect(result.data).toEqual([existing]);
    });
  });

  describe('REMOVE_CONTENT', () => {
    it('removes the content item by id', () => {
      const keep = makeContent({ id: 'c1' });
      const remove = makeContent({ id: 'c2' });
      const state: ContentState = {
        data: [keep, remove],
        loading: false,
        error: null,
      };
      const action: ContentAction = { type: 'REMOVE_CONTENT', payload: 'c2' };

      const result = contentReducer(state, action);

      expect(result.data).toEqual([keep]);
    });

    it('returns unchanged state if id not found', () => {
      const existing = makeContent({ id: 'c1' });
      const state: ContentState = {
        data: [existing],
        loading: false,
        error: null,
      };
      const action: ContentAction = {
        type: 'REMOVE_CONTENT',
        payload: 'nonexistent',
      };

      const result = contentReducer(state, action);

      expect(result.data).toEqual([existing]);
    });
  });
});
