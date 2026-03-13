import { useMemo } from 'react';
import { useContent } from '@/features/content/useContent';
import type { Learning } from '@/types/content';
import type { DateRange } from '@/features/learn/LearningsFilter';

export interface AggregatedLearning {
  learning: Learning;
  contentId: string;
  contentTitle: string;
}

interface ContentOption {
  id: string;
  title: string;
}

interface UseGlobalLearningsParams {
  selectedContentId: string;
  dateRange: DateRange;
}

interface UseGlobalLearningsReturn {
  allLearnings: AggregatedLearning[];
  filteredLearnings: AggregatedLearning[];
  contentOptions: ContentOption[];
  loading: boolean;
  error: string | null;
  getAppliedInTitle: (contentId: string) => string | undefined;
}

function isWithinDays(dateString: string, days: number): boolean {
  const date = new Date(dateString);
  const now = new Date();
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return date >= cutoff;
}

export function useGlobalLearnings({
  selectedContentId,
  dateRange,
}: UseGlobalLearningsParams): UseGlobalLearningsReturn {
  const { contents, loading, error } = useContent();

  const allLearnings = useMemo<AggregatedLearning[]>(() => {
    const aggregated: AggregatedLearning[] = [];
    for (const content of contents) {
      for (const learning of content.learnings) {
        aggregated.push({
          learning,
          contentId: content.id,
          contentTitle: content.title,
        });
      }
    }
    aggregated.sort(
      (a, b) =>
        new Date(b.learning.dateAdded).getTime() -
        new Date(a.learning.dateAdded).getTime(),
    );
    return aggregated;
  }, [contents]);

  const filteredLearnings = useMemo<AggregatedLearning[]>(() => {
    let result = allLearnings;

    if (selectedContentId !== 'all') {
      result = result.filter((item) => item.contentId === selectedContentId);
    }

    if (dateRange !== 'all') {
      const days = Number(dateRange);
      result = result.filter((item) =>
        isWithinDays(item.learning.dateAdded, days),
      );
    }

    return result;
  }, [allLearnings, selectedContentId, dateRange]);

  const contentOptions = useMemo<ContentOption[]>(() => {
    const withLearnings = contents.filter((c) => c.learnings.length > 0);
    return withLearnings.map((c) => ({ id: c.id, title: c.title }));
  }, [contents]);

  function getAppliedInTitle(contentId: string): string | undefined {
    return contents.find((c) => c.id === contentId)?.title;
  }

  return {
    allLearnings,
    filteredLearnings,
    contentOptions,
    loading,
    error,
    getAppliedInTitle,
  };
}
