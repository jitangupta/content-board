import { useMemo, useState } from 'react';
import { useContent } from '@/features/content/useContent';
import { useContentFilters } from '@/features/content/useContentFilters';
import { getPhaseForStatus } from '@/utils/statusHelpers';
import { PhaseGroup } from '@/components/Sidebar/PhaseGroup';
import { SidebarSearch } from '@/components/Sidebar/SidebarSearch';
import { SidebarFilter } from '@/components/Sidebar/SidebarFilter';
import { ContentTypeToggle } from '@/components/Sidebar/ContentTypeToggle';
import type { ContentItem, ContentPhase } from '@/types/content';
import type { ContentTypeFilter, FilterValue } from '@/features/content/useContentFilters';

const PHASES: ContentPhase[] = ['pre-production', 'production', 'post-production'];

function SidebarSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-4" data-testid="sidebar-skeleton">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 rounded bg-muted w-2/3" />
          <div className="space-y-1.5 pl-2">
            <div className="h-3 rounded bg-muted w-full" />
            <div className="h-3 rounded bg-muted w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground" data-testid="sidebar-empty">
      <p className="text-sm mb-2">No content yet</p>
      <p className="text-xs">Click &quot;+ New Content&quot; to get started</p>
    </div>
  );
}

function groupByPhase(contents: ContentItem[]): Record<ContentPhase, ContentItem[]> {
  const groups: Record<ContentPhase, ContentItem[]> = {
    'pre-production': [],
    'production': [],
    'post-production': [],
  };

  for (const item of contents) {
    const phase = getPhaseForStatus(item.status);
    groups[phase].push(item);
  }

  return groups;
}

interface SidebarProps {
  onItemSelect?: () => void;
}

export function Sidebar({ onItemSelect }: SidebarProps) {
  const { contents, loading, error } = useContent();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValue, setFilterValue] = useState<FilterValue>('all');
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentTypeFilter>('all');

  const filtered = useContentFilters({ contents, searchQuery, filterValue, contentTypeFilter });
  const grouped = useMemo(() => groupByPhase(filtered), [filtered]);

  const hasActiveFilters = searchQuery.trim() !== '' || filterValue !== 'all' || contentTypeFilter !== 'all';
  const noResults = hasActiveFilters && filtered.length === 0;

  if (loading) {
    return <SidebarSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center" data-testid="sidebar-error">
        <p className="text-sm text-destructive mb-3">{error}</p>
      </div>
    );
  }

  if (contents.length === 0) {
    return <EmptyState />;
  }

  return (
    <nav className="flex flex-col gap-1 p-2" data-testid="sidebar">
      <div className="flex flex-col gap-2 px-1 pb-2">
        <SidebarSearch value={searchQuery} onChange={setSearchQuery} />
        <ContentTypeToggle value={contentTypeFilter} onChange={setContentTypeFilter} />
        <SidebarFilter value={filterValue} onChange={setFilterValue} contentTypeFilter={contentTypeFilter} />
      </div>
      {noResults ? (
        <div className="px-3 py-6 text-center text-sm text-muted-foreground" data-testid="sidebar-no-results">
          {searchQuery.trim()
            ? <>No results for &ldquo;{searchQuery.trim()}&rdquo;</>
            : 'No matching content'}
        </div>
      ) : (
        PHASES.map((phase) => (
          <PhaseGroup key={phase} phase={phase} items={grouped[phase]} onItemSelect={onItemSelect} />
        ))
      )}
    </nav>
  );
}
