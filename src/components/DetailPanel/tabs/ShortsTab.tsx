import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useContent } from '@/features/content/useContent';
import { captureError } from '@/services/sentry';
import type { ContentItem } from '@/types/content';

interface ShortsTabProps {
  content: ContentItem;
}

export function ShortsTab({ content }: ShortsTabProps) {
  const { contents, createContent } = useContent();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  const linkedShorts = contents.filter(
    (item) => item.contentType === 'short' && item.parentVideoId === content.id,
  );

  async function handleCreateShort(): Promise<void> {
    if (creating) return;
    setCreating(true);
    try {
      const newId = await createContent({
        contentType: 'short',
        parentVideoId: content.id,
      });
      navigate(`/content/${newId}`);
    } catch (error: unknown) {
      captureError(error, {
        operation: 'createContent',
        parentVideoId: content.id,
      });
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          Linked Shorts ({linkedShorts.length})
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCreateShort}
          disabled={creating}
          className="gap-1"
        >
          <Plus className="h-3.5 w-3.5" />
          New Short
        </Button>
      </div>

      {linkedShorts.length > 0 ? (
        <ul className="space-y-1">
          {linkedShorts.map((short) => (
            <li key={short.id}>
              <button
                onClick={() => navigate(`/content/${short.id}`)}
                className="flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
              >
                <span className="flex items-center gap-1.5 min-w-0">
                  <Film className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{short.title || 'Untitled'}</span>
                </span>
                <StatusBadge status={short.status} className="shrink-0" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          No shorts extracted from this video yet. Click &quot;New Short&quot; to create one.
        </p>
      )}
    </div>
  );
}
