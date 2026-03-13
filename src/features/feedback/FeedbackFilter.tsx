import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SOURCE_LABELS } from '@/features/feedback/feedbackConstants';
import type { FeedbackSource } from '@/types/content';

export type DateRange = 'all' | '7' | '30';

const ALL_SOURCES: FeedbackSource[] = ['self', 'peer', 'family', 'comment'];

interface FeedbackFilterProps {
  contentOptions: { id: string; title: string }[];
  selectedContentId: string;
  selectedSources: FeedbackSource[];
  dateRange: DateRange;
  onContentChange: (contentId: string) => void;
  onSourceToggle: (source: FeedbackSource) => void;
  onDateRangeChange: (range: DateRange) => void;
  onClearAll: () => void;
}

function getActiveFilterCount(
  selectedContentId: string,
  selectedSources: FeedbackSource[],
  dateRange: DateRange,
): number {
  let count = 0;
  if (selectedContentId !== 'all') count++;
  if (selectedSources.length > 0) count++;
  if (dateRange !== 'all') count++;
  return count;
}

export function FeedbackFilter({
  contentOptions,
  selectedContentId,
  selectedSources,
  dateRange,
  onContentChange,
  onSourceToggle,
  onDateRangeChange,
  onClearAll,
}: FeedbackFilterProps): React.JSX.Element {
  const activeCount = getActiveFilterCount(
    selectedContentId,
    selectedSources,
    dateRange,
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={selectedContentId} onValueChange={onContentChange}>
          <SelectTrigger
            className="h-9 w-[200px] text-sm"
            data-testid="content-filter"
          >
            <SelectValue placeholder="All content" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All content</SelectItem>
            {contentOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.title || 'Untitled'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={dateRange} onValueChange={onDateRangeChange}>
          <SelectTrigger
            className="h-9 w-[160px] text-sm"
            data-testid="date-filter"
          >
            <SelectValue placeholder="All time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
          </SelectContent>
        </Select>

        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-9 gap-1.5 text-sm text-muted-foreground"
            data-testid="clear-filters"
          >
            <X className="h-3.5 w-3.5" />
            Clear filters ({activeCount})
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Source:</span>
        {ALL_SOURCES.map((source) => {
          const isActive = selectedSources.includes(source);
          return (
            <button
              key={source}
              type="button"
              onClick={() => onSourceToggle(source)}
              data-testid={`source-filter-${source}`}
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {SOURCE_LABELS[source]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
