import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ExternalLink } from 'lucide-react';
import { useGlobalLearnings } from '@/features/learn/useGlobalLearnings';
import { LearningsFilter } from '@/features/learn/LearningsFilter';
import type { DateRange } from '@/features/learn/LearningsFilter';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

function formatDate(dateString: string): string {
  return dateFormatter.format(new Date(dateString));
}

export function GlobalLearningsPage(): React.JSX.Element {
  const navigate = useNavigate();

  const [selectedContentId, setSelectedContentId] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange>('all');

  const {
    allLearnings,
    filteredLearnings,
    contentOptions,
    loading,
    error,
    getAppliedInTitle,
  } = useGlobalLearnings({ selectedContentId, dateRange });

  function handleClearFilters(): void {
    setSelectedContentId('all');
    setDateRange('all');
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (allLearnings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
        <BookOpen className="mb-4 h-12 w-12 opacity-40" />
        <p className="mb-1 text-sm">No learnings yet.</p>
        <p className="text-xs">
          Learnings you add to content items will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Learnings</h1>
        <p className="text-sm text-muted-foreground">
          Everything you&apos;ve learned across all content, in one place.
        </p>
      </div>

      <LearningsFilter
        contentOptions={contentOptions}
        selectedContentId={selectedContentId}
        dateRange={dateRange}
        onContentChange={setSelectedContentId}
        onDateRangeChange={setDateRange}
        onClearAll={handleClearFilters}
      />

      {filteredLearnings.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No learnings match the current filters.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLearnings.map((item) => (
            <div
              key={item.learning.id}
              className="rounded-lg border p-4 space-y-2"
            >
              <p className="text-sm whitespace-pre-wrap">
                {item.learning.text}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span>{formatDate(item.learning.dateAdded)}</span>

                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                  onClick={() =>
                    navigate(`/content/${item.contentId}/learn`)
                  }
                >
                  <ExternalLink className="h-3 w-3" />
                  {item.contentTitle || 'Untitled'}
                </button>

                {item.learning.appliedInContentId && (
                  <span className="inline-flex items-center gap-1">
                    Applied in{' '}
                    <button
                      type="button"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                      onClick={() =>
                        navigate(
                          `/content/${item.learning.appliedInContentId}/learn`,
                        )
                      }
                    >
                      {getAppliedInTitle(item.learning.appliedInContentId) ||
                        'Linked content'}
                    </button>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
