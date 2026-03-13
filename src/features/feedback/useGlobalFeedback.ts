import { useMemo } from 'react';
import { useContent } from '@/features/content/useContent';
import type { AggregatedFeedback, FeedbackSource } from '@/types/content';
import type { DateRange } from '@/features/feedback/FeedbackFilter';

interface ContentOption {
  id: string;
  title: string;
}

interface UseGlobalFeedbackParams {
  selectedContentId: string;
  selectedSources: FeedbackSource[];
  dateRange: DateRange;
}

interface UseGlobalFeedbackReturn {
  allFeedback: AggregatedFeedback[];
  filteredFeedback: AggregatedFeedback[];
  contentOptions: ContentOption[];
  loading: boolean;
  error: string | null;
}

function isWithinDays(dateString: string, days: number): boolean {
  const date = new Date(dateString);
  const now = new Date();
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return date >= cutoff;
}

export function useGlobalFeedback({
  selectedContentId,
  selectedSources,
  dateRange,
}: UseGlobalFeedbackParams): UseGlobalFeedbackReturn {
  const { contents, loading, error } = useContent();

  const allFeedback = useMemo<AggregatedFeedback[]>(() => {
    const aggregated: AggregatedFeedback[] = [];
    for (const content of contents) {
      for (const fb of content.feedback) {
        aggregated.push({
          feedback: fb,
          contentId: content.id,
          contentTitle: content.title,
        });
      }
    }
    aggregated.sort(
      (a, b) =>
        new Date(b.feedback.dateAdded).getTime() -
        new Date(a.feedback.dateAdded).getTime(),
    );
    return aggregated;
  }, [contents]);

  const filteredFeedback = useMemo<AggregatedFeedback[]>(() => {
    let result = allFeedback;

    if (selectedContentId !== 'all') {
      result = result.filter((item) => item.contentId === selectedContentId);
    }

    if (selectedSources.length > 0) {
      result = result.filter((item) =>
        selectedSources.includes(item.feedback.source),
      );
    }

    if (dateRange !== 'all') {
      const days = Number(dateRange);
      result = result.filter((item) =>
        isWithinDays(item.feedback.dateAdded, days),
      );
    }

    return result;
  }, [allFeedback, selectedContentId, selectedSources, dateRange]);

  const contentOptions = useMemo<ContentOption[]>(() => {
    const withFeedback = contents.filter((c) => c.feedback.length > 0);
    return withFeedback.map((c) => ({ id: c.id, title: c.title }));
  }, [contents]);

  return {
    allFeedback,
    filteredFeedback,
    contentOptions,
    loading,
    error,
  };
}
