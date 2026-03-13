import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { STATUS_ORDER, SHORT_STATUS_ORDER, getStatusLabel } from '@/utils/statusHelpers';
import type { ContentTypeFilter, FilterValue } from '@/features/content/useContentFilters';
import type { ContentStatus } from '@/types/content';

interface SidebarFilterProps {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
  contentTypeFilter: ContentTypeFilter;
}

function getStatusOptions(contentTypeFilter: ContentTypeFilter): ContentStatus[] {
  if (contentTypeFilter === 'short') {
    return SHORT_STATUS_ORDER;
  }
  return STATUS_ORDER;
}

export function SidebarFilter({ value, onChange, contentTypeFilter }: SidebarFilterProps) {
  const statusOptions = getStatusOptions(contentTypeFilter);

  return (
    <div data-testid="sidebar-filter">
      {/* Radix Select types value as string; our SelectItems only contain valid FilterValue values */}
      <Select value={value} onValueChange={(v) => onChange(v as FilterValue)}>
        <SelectTrigger size="sm" className="w-full text-sm" aria-label="Filter content">
          <SelectValue placeholder="Filter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Phase</SelectLabel>
            <SelectItem value="pre-production">Pre-Production</SelectItem>
            <SelectItem value="production">Production</SelectItem>
            <SelectItem value="post-production">Post-Production</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Status</SelectLabel>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {getStatusLabel(status)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
