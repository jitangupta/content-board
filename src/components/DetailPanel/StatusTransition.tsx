import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { StatusBadge } from '@/components/common/StatusBadge';
import { TimestampTimeline } from '@/components/DetailPanel/TimestampTimeline';
import { useContent } from '@/features/content/useContent';
import { captureError } from '@/services/sentry';
import { getNextStatusForType, getPreviousStatusForType, getStatusLabel } from '@/utils/statusHelpers';
import type { ContentItem } from '@/types/content';

interface StatusTransitionProps {
  content: ContentItem;
}

export function StatusTransition({ content }: StatusTransitionProps) {
  const { updateStatus } = useContent();
  const [transitioning, setTransitioning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const nextStatus = getNextStatusForType(content.status, content.contentType);
  const prevStatus = getPreviousStatusForType(content.status, content.contentType);

  async function handleAdvance(): Promise<void> {
    if (!nextStatus || transitioning) return;
    setTransitioning(true);
    try {
      await updateStatus(content.id, nextStatus);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
    } catch (error: unknown) {
      captureError(error, {
        operation: 'statusTransition',
        contentId: content.id,
        from: content.status,
        to: nextStatus,
      });
    } finally {
      setTransitioning(false);
    }
  }

  async function handleMoveBack(): Promise<void> {
    if (!prevStatus || transitioning) return;
    setTransitioning(true);
    try {
      await updateStatus(content.id, prevStatus);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
    } catch (error: unknown) {
      captureError(error, {
        operation: 'statusTransition',
        contentId: content.id,
        from: content.status,
        to: prevStatus,
      });
    } finally {
      setTransitioning(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2" data-testid="status-transition">
      <div className="flex items-center gap-2">
        <StatusBadge status={content.status} />

        <Popover>
          <PopoverTrigger asChild>
            <button
              className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="View timeline"
            >
              <Clock className="h-3.5 w-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-3">
            <TimestampTimeline timestamps={content.timestamps} contentType={content.contentType} />
          </PopoverContent>
        </Popover>

        {showSuccess && (
          <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400" data-testid="success-indicator">
            <Check className="h-3 w-3" />
            Updated
          </span>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        {prevStatus && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={transitioning}
                data-testid="move-back-button"
              >
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                {getStatusLabel(prevStatus)}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Move back to {getStatusLabel(prevStatus)}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will revert the status from &quot;{getStatusLabel(content.status)}&quot; back
                  to &quot;{getStatusLabel(prevStatus)}&quot; and clear the timestamp for the current
                  stage.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleMoveBack}>
                  Move back
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {nextStatus && (
          <Button
            size="sm"
            disabled={transitioning}
            onClick={handleAdvance}
            data-testid="advance-button"
          >
            {getStatusLabel(nextStatus)}
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
