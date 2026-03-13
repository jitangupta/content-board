import { useMemo } from 'react';
import { getPhaseForStatus } from '@/utils/statusHelpers';
import type { ContentItem, ContentPhase, ContentStatus, ContentType } from '@/types/content';

export type FilterValue = 'all' | ContentPhase | ContentStatus;
export type ContentTypeFilter = 'all' | ContentType;

interface UseContentFiltersParams {
  contents: ContentItem[];
  searchQuery: string;
  filterValue: FilterValue;
  contentTypeFilter: ContentTypeFilter;
}

function matchesSearch(item: ContentItem, query: string): boolean {
  const lower = query.toLowerCase();
  if (item.title.toLowerCase().includes(lower)) {
    return true;
  }
  return item.tags.some((tag) => tag.toLowerCase().includes(lower));
}

function matchesFilter(item: ContentItem, filterValue: FilterValue): boolean {
  if (filterValue === 'all') {
    return true;
  }
  if (
    filterValue === 'pre-production' ||
    filterValue === 'production' ||
    filterValue === 'post-production'
  ) {
    return getPhaseForStatus(item.status) === filterValue;
  }
  return item.status === filterValue;
}

function matchesContentType(item: ContentItem, contentTypeFilter: ContentTypeFilter): boolean {
  if (contentTypeFilter === 'all') {
    return true;
  }
  return item.contentType === contentTypeFilter;
}

export function useContentFilters({
  contents,
  searchQuery,
  filterValue,
  contentTypeFilter,
}: UseContentFiltersParams): ContentItem[] {
  return useMemo(() => {
    const trimmed = searchQuery.trim();
    return contents.filter((item) => {
      if (trimmed && !matchesSearch(item, trimmed)) {
        return false;
      }
      if (!matchesContentType(item, contentTypeFilter)) {
        return false;
      }
      return matchesFilter(item, filterValue);
    });
  }, [contents, searchQuery, filterValue, contentTypeFilter]);
}
