import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useContentFilters } from '@/features/content/useContentFilters';
import type { ContentItem } from '@/types/content';
import type { FilterValue } from '@/features/content/useContentFilters';

function makeItem(overrides: Partial<ContentItem>): ContentItem {
  return {
    id: '1',
    title: 'Test Video',
    description: '',
    tags: [],
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
    ...overrides,
  };
}

const ITEMS: ContentItem[] = [
  makeItem({ id: '1', title: 'React Hooks Tutorial', tags: ['react', 'hooks'], status: 'draft' }),
  makeItem({ id: '2', title: 'Vue 3 Composition API', tags: ['vue', 'composition'], status: 'technically-ready' }),
  makeItem({ id: '3', title: 'Node.js Streams', tags: ['node', 'backend'], status: 'recorded' }),
  makeItem({ id: '4', title: 'CSS Grid Layout', tags: ['css', 'layout'], status: 'published' }),
];

function renderFilter(searchQuery: string, filterValue: FilterValue, contentTypeFilter: 'all' | 'video' | 'short' = 'all') {
  return renderHook(() =>
    useContentFilters({ contents: ITEMS, searchQuery, filterValue, contentTypeFilter }),
  );
}

describe('useContentFilters', () => {
  it('returns all items when no search or filter is applied', () => {
    const { result } = renderFilter('', 'all');
    expect(result.current).toHaveLength(4);
  });

  it('filters by title substring (case-insensitive)', () => {
    const { result } = renderFilter('react', 'all');
    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe('1');
  });

  it('filters by title with different casing', () => {
    const { result } = renderFilter('REACT', 'all');
    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe('1');
  });

  it('matches against tags', () => {
    const { result } = renderFilter('backend', 'all');
    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe('3');
  });

  it('matches tags case-insensitively', () => {
    const { result } = renderFilter('HOOKS', 'all');
    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe('1');
  });

  it('filters by phase: pre-production', () => {
    const { result } = renderFilter('', 'pre-production');
    expect(result.current).toHaveLength(2);
    expect(result.current.map((i) => i.id)).toEqual(['1', '2']);
  });

  it('filters by phase: production', () => {
    const { result } = renderFilter('', 'production');
    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe('3');
  });

  it('filters by phase: post-production', () => {
    const { result } = renderFilter('', 'post-production');
    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe('4');
  });

  it('filters by individual status', () => {
    const { result } = renderFilter('', 'technically-ready');
    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe('2');
  });

  it('combines search and filter with AND logic', () => {
    const { result } = renderFilter('react', 'pre-production');
    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe('1');
  });

  it('returns empty array when search + filter match nothing', () => {
    const { result } = renderFilter('react', 'production');
    expect(result.current).toHaveLength(0);
  });

  it('trims whitespace from search query', () => {
    const { result } = renderFilter('  react  ', 'all');
    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe('1');
  });

  it('returns all items when search is only whitespace', () => {
    const { result } = renderFilter('   ', 'all');
    expect(result.current).toHaveLength(4);
  });
});
