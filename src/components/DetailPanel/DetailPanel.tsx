import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Film, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { StatusTransition } from '@/components/DetailPanel/StatusTransition';
import { TabNavigation } from '@/components/DetailPanel/TabNavigation';
import { ContentTab } from '@/components/DetailPanel/tabs/ContentTab';
import { ProductionTab } from '@/components/DetailPanel/tabs/ProductionTab';
import { LearnTab } from '@/components/DetailPanel/tabs/LearnTab';
import { FeedbackTab } from '@/components/DetailPanel/tabs/FeedbackTab';
import { ShortsTab } from '@/components/DetailPanel/tabs/ShortsTab';
import { useContent } from '@/features/content/useContent';
import { captureError } from '@/services/sentry';
import type { ContentItem } from '@/types/content';

function NotFoundState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
      <p className="text-sm font-medium">Content not found</p>
      <p className="text-xs">The content item may have been deleted.</p>
    </div>
  );
}

interface ActiveTabProps {
  tab: string;
  content: ContentItem;
}

function ActiveTab({ tab, content }: ActiveTabProps) {
  switch (tab) {
    case 'content':
      return <ContentTab content={content} />;
    case 'production':
      return <ProductionTab content={content} />;
    case 'learn':
      return <LearnTab content={content} />;
    case 'feedback':
      return <FeedbackTab content={content} />;
    case 'shorts':
      return content.contentType === 'video' ? <ShortsTab content={content} /> : <ContentTab content={content} />;
    default:
      return <ContentTab content={content} />;
  }
}

export function DetailPanel() {
  const { contentId, tab = 'content' } = useParams<{
    contentId: string;
    tab?: string;
  }>();
  const { contents, loading, deleteContent } = useContent();
  const navigate = useNavigate();

  if (!contentId) {
    return null;
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 p-4 md:p-6">
        <div className="h-6 w-1/3 rounded bg-muted" />
        <div className="h-8 w-full rounded bg-muted" />
        <div className="h-4 w-2/3 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
      </div>
    );
  }

  const content = contents.find((c) => c.id === contentId);

  if (!content) {
    return <NotFoundState />;
  }

  const safeContentId = contentId;
  const parentVideo = content.parentVideoId
    ? contents.find((c) => c.id === content.parentVideoId) ?? null
    : null;

  async function handleDelete(): Promise<void> {
    try {
      await deleteContent(safeContentId);
      navigate('/content');
    } catch (error: unknown) {
      captureError(error, {
        operation: 'deleteContent',
        contentId: safeContentId,
      });
    }
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4 md:p-6">
      {/* Parent video breadcrumb */}
      {content.contentType === 'short' && parentVideo && (
        <button
          onClick={() => navigate(`/content/${parentVideo.id}/shorts`)}
          className="mb-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          <span className="truncate">{parentVideo.title || 'Untitled video'}</span>
        </button>
      )}
      {content.contentType === 'short' && content.parentVideoId && !parentVideo && (
        <p className="mb-1 text-xs text-muted-foreground">Parent video was deleted</p>
      )}

      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => navigate('/content')}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
            aria-label="Back to sidebar"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-lg font-semibold truncate">
            {content.title || 'Untitled'}
          </h1>
          {content.contentType === 'short' && (
            <Badge variant="secondary" className="shrink-0 gap-1">
              <Film className="h-3 w-3" />
              Short
            </Badge>
          )}
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 shrink-0 p-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete &quot;{content.title || 'Untitled'}&quot;?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This cannot be undone. All data for this content item will be
                permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Status Transition */}
      <div className="mb-4">
        <StatusTransition content={content} />
      </div>

      {/* Tab Navigation */}
      <TabNavigation contentId={contentId} activeTab={tab} contentType={content.contentType} />

      {/* Active Tab Content */}
      <ActiveTab tab={tab} content={content} />
    </div>
  );
}
