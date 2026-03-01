import { useState } from 'react';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import type { ContentItem, ContentStatus } from '@/types/content';
import { useContent } from '@/features/content/useContent';
import { STATUS_ORDER, getStatusLabel } from '@/utils/statusHelpers';
import { StatusBadge } from '@/components/common/StatusBadge';
import { TimestampTimeline } from '@/components/DetailPanel/TimestampTimeline';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

function getNextStatus(status: ContentStatus): ContentStatus | null {
  const index = STATUS_ORDER.indexOf(status);
  return STATUS_ORDER[index + 1] ?? null;
}

function getPrevStatus(status: ContentStatus): ContentStatus | null {
  const index = STATUS_ORDER.indexOf(status);
  return STATUS_ORDER[index - 1] ?? null;
}

interface StatusTransitionProps {
  item: ContentItem;
}

export function StatusTransition({ item }: StatusTransitionProps) {
  const { updateStatus } = useContent();
  const [transitioning, setTransitioning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const nextStatus = getNextStatus(item.status);
  const prevStatus = getPrevStatus(item.status);

  async function handleAdvance(): Promise<void> {
    if (!nextStatus || transitioning) return;
    setTransitioning(true);
    setError('');
    try {
      await updateStatus(item.id, nextStatus);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch {
      setError('Failed to advance status');
    } finally {
      setTransitioning(false);
    }
  }

  async function handleMoveBack(): Promise<void> {
    if (!prevStatus || transitioning) return;
    setTransitioning(true);
    setError('');
    try {
      await updateStatus(item.id, prevStatus);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch {
      setError('Failed to move status back');
    } finally {
      setTransitioning(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <StatusBadge status={item.status} />

        {showSuccess && (
          <span className="inline-flex items-center gap-1 text-xs text-green-600">
            <Check className="h-3.5 w-3.5" />
            Updated
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {prevStatus && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                disabled={transitioning}
                className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent disabled:opacity-50"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                {getStatusLabel(prevStatus)}
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Move back to {getStatusLabel(prevStatus)}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will revert the status from &quot;{getStatusLabel(item.status)}&quot; to
                  &quot;{getStatusLabel(prevStatus)}&quot; and clear the timestamp for the current stage.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleMoveBack} disabled={transitioning}>
                  Move Back
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {nextStatus && (
          <button
            onClick={handleAdvance}
            disabled={transitioning}
            className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {getStatusLabel(nextStatus)}
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      <TimestampTimeline timestamps={item.timestamps} />
    </div>
  );
}
