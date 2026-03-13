import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, MessageSquare } from 'lucide-react';
import { useGlobalFeedback } from '@/features/feedback/useGlobalFeedback';
import { FeedbackFilter } from '@/features/feedback/FeedbackFilter';
import { SOURCE_LABELS, SOURCE_COLORS } from '@/features/feedback/feedbackConstants';
import type { DateRange } from '@/features/feedback/FeedbackFilter';
import type { FeedbackSource } from '@/types/content';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

function formatDate(dateString: string): string {
  return dateFormatter.format(new Date(dateString));
}

export function GlobalFeedbackPage(): React.JSX.Element {
  const navigate = useNavigate();

  const [selectedContentId, setSelectedContentId] = useState('all');
  const [selectedSources, setSelectedSources] = useState<FeedbackSource[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>('all');

  const { allFeedback, filteredFeedback, contentOptions, loading, error } =
    useGlobalFeedback({ selectedContentId, selectedSources, dateRange });

  function handleSourceToggle(source: FeedbackSource): void {
    setSelectedSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source],
    );
  }

  function handleClearFilters(): void {
    setSelectedContentId('all');
    setSelectedSources([]);
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

  if (allFeedback.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
        <MessageSquare className="mb-4 h-12 w-12 opacity-40" />
        <p className="mb-1 text-sm">No feedback yet.</p>
        <p className="text-xs">
          Feedback you add to content items will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Feedback</h1>
        <p className="text-sm text-muted-foreground">
          All feedback across your content, in one place.
        </p>
      </div>

      <FeedbackFilter
        contentOptions={contentOptions}
        selectedContentId={selectedContentId}
        selectedSources={selectedSources}
        dateRange={dateRange}
        onContentChange={setSelectedContentId}
        onSourceToggle={handleSourceToggle}
        onDateRangeChange={setDateRange}
        onClearAll={handleClearFilters}
      />

      {filteredFeedback.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No feedback matches the current filters.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFeedback.map((item) => (
            <div
              key={item.feedback.id}
              className="rounded-lg border p-4 space-y-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${SOURCE_COLORS[item.feedback.source]}`}
                  data-testid={`source-badge-${item.feedback.source}`}
                >
                  {SOURCE_LABELS[item.feedback.source]}
                </span>
              </div>

              <p className="text-sm whitespace-pre-wrap">
                {item.feedback.text}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span>{formatDate(item.feedback.dateAdded)}</span>

                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                  onClick={() =>
                    navigate(`/content/${item.contentId}/feedback`)
                  }
                >
                  <ExternalLink className="h-3 w-3" />
                  {item.contentTitle || 'Untitled'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
