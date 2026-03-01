import type { ContentItem, ContentPhase } from '@/types/content';
import { useContent } from '@/features/content/useContent';
import { PhaseGroup } from '@/components/Sidebar/PhaseGroup';

const PHASE_ORDER: ContentPhase[] = [
  'pre-production',
  'production',
  'post-production',
];

function SidebarSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="space-y-2">
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-8 w-full rounded bg-muted" />
        <div className="h-8 w-full rounded bg-muted" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-1/2 rounded bg-muted" />
        <div className="h-8 w-full rounded bg-muted" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-2/3 rounded bg-muted" />
        <div className="h-8 w-full rounded bg-muted" />
      </div>
    </div>
  );
}

function SidebarError({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <p className="text-sm text-destructive">{message}</p>
    </div>
  );
}

function SidebarEmpty() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
      <p className="text-sm">No content yet</p>
      <p className="text-xs">Click &quot;+ New Content&quot; to get started</p>
    </div>
  );
}

function groupByPhase(
  contents: ContentItem[],
): Record<ContentPhase, ContentItem[]> {
  const groups: Record<ContentPhase, ContentItem[]> = {
    'pre-production': [],
    'production': [],
    'post-production': [],
  };

  for (const item of contents) {
    groups[item.phase].push(item);
  }

  return groups;
}

export function Sidebar() {
  const { contents, loading, error } = useContent();

  if (loading) return <SidebarSkeleton />;
  if (error) return <SidebarError message={error} />;
  if (contents.length === 0) return <SidebarEmpty />;

  const grouped = groupByPhase(contents);

  return (
    <nav className="flex flex-col gap-1 overflow-y-auto py-2">
      {PHASE_ORDER.map((phase) => (
        <PhaseGroup key={phase} phase={phase} items={grouped[phase]} />
      ))}
    </nav>
  );
}
