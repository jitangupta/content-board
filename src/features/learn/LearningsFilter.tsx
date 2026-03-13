import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type DateRange = 'all' | '7' | '30';

interface LearningsFilterProps {
  contentOptions: { id: string; title: string }[];
  selectedContentId: string;
  dateRange: DateRange;
  onContentChange: (contentId: string) => void;
  onDateRangeChange: (range: DateRange) => void;
  onClearAll: () => void;
}

function getActiveFilterCount(
  selectedContentId: string,
  dateRange: DateRange,
): number {
  let count = 0;
  if (selectedContentId !== 'all') count++;
  if (dateRange !== 'all') count++;
  return count;
}

export function LearningsFilter({
  contentOptions,
  selectedContentId,
  dateRange,
  onContentChange,
  onDateRangeChange,
  onClearAll,
}: LearningsFilterProps): React.JSX.Element {
  const activeCount = getActiveFilterCount(selectedContentId, dateRange);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={selectedContentId} onValueChange={onContentChange}>
        <SelectTrigger className="h-9 w-[200px] text-sm" data-testid="content-filter">
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
        <SelectTrigger className="h-9 w-[160px] text-sm" data-testid="date-filter">
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
  );
}
