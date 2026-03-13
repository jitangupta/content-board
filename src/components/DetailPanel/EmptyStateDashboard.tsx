import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Plus, FileText, Clapperboard, Rocket, Video } from 'lucide-react';
import { useContent } from '@/features/content/useContent';
import { captureError } from '@/services/sentry';
import { StatusBadge } from '@/components/common/StatusBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatRelativeTime } from '@/utils/relativeTime';
import { getPhaseForStatus } from '@/utils/statusHelpers';
import type { ContentItem, ContentPhase, ContentType } from '@/types/content';

const PHASE_CONFIG: Record<ContentPhase, { label: string; icon: typeof FileText; card: string; icon_color: string }> = {
  'pre-production': { label: 'Pre-Production', icon: FileText, card: 'border-l-blue-400 dark:border-l-blue-500', icon_color: 'text-blue-500 dark:text-blue-400' },
  'production': { label: 'Production', icon: Clapperboard, card: 'border-l-amber-400 dark:border-l-amber-500', icon_color: 'text-amber-500 dark:text-amber-400' },
  'post-production': { label: 'Post-Production', icon: Rocket, card: 'border-l-green-400 dark:border-l-green-500', icon_color: 'text-green-500 dark:text-green-400' },
};

function computePhaseCounts(contents: ContentItem[]): Record<ContentPhase, number> {
  const counts: Record<ContentPhase, number> = {
    'pre-production': 0,
    'production': 0,
    'post-production': 0,
  };

  for (const item of contents) {
    const phase = getPhaseForStatus(item.status);
    counts[phase]++;
  }

  return counts;
}

function getRecentItems(contents: ContentItem[], limit: number): ContentItem[] {
  return [...contents]
    .sort((a, b) => new Date(b.timestamps.updated).getTime() - new Date(a.timestamps.updated).getTime())
    .slice(0, limit);
}

interface CreateButtonProps {
  onCreateContent: (contentType: ContentType) => void;
  creating: boolean;
}

function CreateButton({ onCreateContent, creating }: CreateButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={creating}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Create New
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => onCreateContent('video')}>
          <Video className="mr-2 h-4 w-4" />
          Video
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onCreateContent('short')}>
          <Film className="mr-2 h-4 w-4" />
          Short
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function EmptyStateDashboard() {
  const { contents, createContent } = useContent();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  async function handleCreateContent(contentType: ContentType = 'video'): Promise<void> {
    if (creating) return;
    setCreating(true);
    try {
      setCreateError(null);
      const newId = await createContent({ contentType });
      navigate(`/content/${newId}`);
    } catch (error: unknown) {
      setCreateError('Failed to create content');
      captureError(error, { operation: 'createContent' });
    } finally {
      setCreating(false);
    }
  }

  if (contents.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center" data-testid="empty-dashboard-zero">
        <p className="text-muted-foreground">No content yet. Create your first video idea!</p>
        {createError && <p className="text-xs text-destructive">{createError}</p>}
        <CreateButton onCreateContent={handleCreateContent} creating={creating} />
      </div>
    );
  }

  const phaseCounts = computePhaseCounts(contents);
  const recentItems = getRecentItems(contents, 5);

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-4 md:p-6" data-testid="empty-dashboard">
      <h2 className="text-lg font-semibold">Pipeline Overview</h2>

      {/* Phase Summary Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {(Object.keys(PHASE_CONFIG) as ContentPhase[]).map((phase) => {
          const { label, icon: Icon, card, icon_color } = PHASE_CONFIG[phase];
          return (
            <div
              key={phase}
              className={`flex items-center gap-3 rounded-lg border border-border border-l-4 bg-card p-4 ${card}`}
              data-testid={`phase-card-${phase}`}
            >
              <Icon className={`h-5 w-5 shrink-0 ${icon_color}`} />
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-semibold">{phaseCounts[phase]}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Recent Activity</h3>
        <ul className="space-y-1" data-testid="recent-activity">
          {recentItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => navigate(`/content/${item.id}`)}
                className="flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
              >
                <span className="min-w-0 truncate">{item.title || 'Untitled'}</span>
                <span className="flex shrink-0 items-center gap-2">
                  <StatusBadge status={item.status} />
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(item.timestamps.updated)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Quick Action */}
      <div className="pt-2">
        {createError && <p className="mb-2 text-xs text-destructive">{createError}</p>}
        <CreateButton onCreateContent={handleCreateContent} creating={creating} />
      </div>
    </div>
  );
}
