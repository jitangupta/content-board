import { cn } from '@/lib/utils';
import type { ContentTypeFilter } from '@/features/content/useContentFilters';

interface ContentTypeToggleProps {
  value: ContentTypeFilter;
  onChange: (value: ContentTypeFilter) => void;
}

const OPTIONS: { value: ContentTypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'video', label: 'Videos' },
  { value: 'short', label: 'Shorts' },
];

export function ContentTypeToggle({ value, onChange }: ContentTypeToggleProps) {
  return (
    <div
      className="inline-flex w-full rounded-md border border-border bg-muted p-0.5"
      data-testid="content-type-toggle"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'flex-1 rounded-sm px-2 py-1 text-xs font-medium transition-colors',
            value === option.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
