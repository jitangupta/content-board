import { describe, it, expect } from 'vitest';
import type { ContentItem } from '@/types/content';
import type { DataState } from '@/types/common';
import { contentReducer, initialContentState } from '@/features/content/contentReducer';

const mockContent: ContentItem = {
  id: 'c1',
  title: 'Test Video',
  description: 'A test video',
  tags: ['test'],
  status: 'draft',
  phase: 'pre-production',
  order: 0,
  contentType: 'video',
  parentVideoId: null,
  script: null,
  platformVersions: [],
  youtubeUrl: null,
  demoItems: [],
  talkingPoints: [],
  shootingScript: null,
  thumbnailIdeas: null,
  linkedContent: [],
  notes: null,
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
};

describe('contentReducer', () => {
  describe('initialContentState', () => {
    it('starts with empty data, loading true, no error', () => {
      expect(initialContentState).toEqual({
        data: [],
        loading: true,
        error: null,
      });
    });
  });

  describe('SET_CONTENTS', () => {
    it('sets data, clears loading and error', () => {
      const state: DataState<ContentItem[]> = {
        data: [],
        loading: true,
        error: 'old error',
      };

      const result = contentReducer(state, {
        type: 'SET_CONTENTS',
        payload: [mockContent],
      });

      expect(result.data).toEqual([mockContent]);
      expect(result.loading).toBe(false);
      expect(result.error).toBeNull();
    });
  });

  describe('SET_LOADING', () => {
    it('sets loading state', () => {
      const result = contentReducer(initialContentState, {
        type: 'SET_LOADING',
        payload: false,
      });

      expect(result.loading).toBe(false);
    });
  });

  describe('SET_ERROR', () => {
    it('sets error and clears loading', () => {
      const result = contentReducer(initialContentState, {
        type: 'SET_ERROR',
        payload: 'Something went wrong',
      });

      expect(result.error).toBe('Something went wrong');
      expect(result.loading).toBe(false);
    });
  });

  describe('UPDATE_CONTENT', () => {
    it('replaces the matching content item', () => {
      const state: DataState<ContentItem[]> = {
        data: [mockContent],
        loading: false,
        error: null,
      };
      const updated = { ...mockContent, title: 'Updated Title' };

      const result = contentReducer(state, {
        type: 'UPDATE_CONTENT',
        payload: updated,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe('Updated Title');
    });

    it('does not modify items with different id', () => {
      const other: ContentItem = { ...mockContent, id: 'c2', title: 'Other' };
      const state: DataState<ContentItem[]> = {
        data: [mockContent, other],
        loading: false,
        error: null,
      };
      const updated = { ...mockContent, title: 'Updated' };

      const result = contentReducer(state, {
        type: 'UPDATE_CONTENT',
        payload: updated,
      });

      expect(result.data[0].title).toBe('Updated');
      expect(result.data[1].title).toBe('Other');
    });
  });

  describe('REMOVE_CONTENT', () => {
    it('removes the content item by id', () => {
      const state: DataState<ContentItem[]> = {
        data: [mockContent],
        loading: false,
        error: null,
      };

      const result = contentReducer(state, {
        type: 'REMOVE_CONTENT',
        payload: 'c1',
      });

      expect(result.data).toHaveLength(0);
    });

    it('does not remove items with different id', () => {
      const other: ContentItem = { ...mockContent, id: 'c2' };
      const state: DataState<ContentItem[]> = {
        data: [mockContent, other],
        loading: false,
        error: null,
      };

      const result = contentReducer(state, {
        type: 'REMOVE_CONTENT',
        payload: 'c1',
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('c2');
    });
  });
});
